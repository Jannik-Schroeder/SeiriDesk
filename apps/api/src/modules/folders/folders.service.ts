import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Folder } from '@prisma/client';

import {
  getPrismaUniqueFields,
  isPrismaNotFoundError,
  isPrismaUniqueConstraintError,
} from '../../common/errors/prisma-error.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { ListFoldersDto } from './dto/list-folders.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFolderDto): Promise<Folder> {
    return this.prisma.$transaction(async (tx) => {
      const siblingCount = await tx.folder.count({
        where: { householdId: dto.householdId },
      });

      const targetPosition = this.clampPosition(dto.position, siblingCount);
      if (targetPosition < siblingCount) {
        await tx.folder.updateMany({
          where: {
            householdId: dto.householdId,
            position: { gte: targetPosition },
          },
          data: {
            position: { increment: 1 },
          },
        });
      }

      try {
        return await tx.folder.create({
          data: {
            householdId: dto.householdId,
            name: dto.name,
            number: dto.number ?? null,
            position: targetPosition,
          },
        });
      } catch (error) {
        this.handleWriteError(error);
        throw error;
      }
    });
  }

  async findAll(query: ListFoldersDto): Promise<Folder[]> {
    return this.prisma.folder.findMany({
      where: { householdId: query.householdId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string): Promise<Folder> {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });

    if (!folder) {
      throw new NotFoundException(`Folder ${id} not found`);
    }

    return folder;
  }

  async update(id: string, dto: UpdateFolderDto): Promise<Folder> {
    try {
      return await this.prisma.folder.update({
        where: { id },
        data: {
          name: dto.name,
          number: dto.number,
        },
      });
    } catch (error) {
      this.handleWriteError(error, id);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const folder = await tx.folder.findUnique({
        where: { id },
        select: {
          id: true,
          householdId: true,
          position: true,
        },
      });

      if (!folder) {
        throw new NotFoundException(`Folder ${id} not found`);
      }

      await tx.folder.delete({
        where: { id: folder.id },
      });

      await tx.folder.updateMany({
        where: {
          householdId: folder.householdId,
          position: { gt: folder.position },
        },
        data: {
          position: { decrement: 1 },
        },
      });
    });
  }

  private clampPosition(position: number | undefined, siblingCount: number): number {
    if (position === undefined) {
      return siblingCount;
    }

    return Math.min(Math.max(position, 0), siblingCount);
  }

  private handleWriteError(error: unknown, id?: string): never | void {
    if (isPrismaNotFoundError(error)) {
      if (id) {
        throw new NotFoundException(`Folder ${id} not found`);
      }

      throw new NotFoundException('Folder not found');
    }

    if (isPrismaUniqueConstraintError(error)) {
      const fields = getPrismaUniqueFields(error);
      const suffix = fields.length > 0 ? ` (${fields.join(', ')})` : '';
      throw new ConflictException(`Folder constraint violated${suffix}`);
    }
  }
}
