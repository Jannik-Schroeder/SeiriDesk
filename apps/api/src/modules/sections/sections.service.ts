import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Section } from '@prisma/client';

import {
  getPrismaUniqueFields,
  isPrismaNotFoundError,
  isPrismaUniqueConstraintError,
} from '../../common/errors/prisma-error.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { ListSectionsDto } from './dto/list-sections.dto';
import { ReorderSectionDto } from './dto/reorder-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSectionDto): Promise<Section> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.ensureFolderExists(tx, dto.folderId);

        const siblings = await tx.section.findMany({
          where: { folderId: dto.folderId },
          orderBy: { position: 'asc' },
          select: {
            id: true,
            position: true,
          },
        });

        const targetPosition = this.clampToRange(dto.position ?? siblings.length, 0, siblings.length);
        const lastSibling = siblings[siblings.length - 1];
        const appendPosition = (lastSibling?.position ?? -1) + 1;

        const created = await tx.section.create({
          data: {
            folderId: dto.folderId,
            name: dto.name,
            position: appendPosition,
          },
        });

        const orderedIds = siblings.map((section) => section.id);
        orderedIds.splice(targetPosition, 0, created.id);

        await this.reindexFolderSections(tx, dto.folderId, orderedIds);

        return tx.section.findUniqueOrThrow({
          where: { id: created.id },
        });
      });
    } catch (error) {
      this.handleWriteError(error);
      throw error;
    }
  }

  async findAll(query: ListSectionsDto): Promise<Section[]> {
    return this.prisma.section.findMany({
      where: { folderId: query.folderId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string): Promise<Section> {
    const section = await this.prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException(`Section ${id} not found`);
    }

    return section;
  }

  async update(id: string, dto: UpdateSectionDto): Promise<Section> {
    try {
      return await this.prisma.section.update({
        where: { id },
        data: {
          name: dto.name,
        },
      });
    } catch (error) {
      this.handleWriteError(error, id);
      throw error;
    }
  }

  async reorder(id: string, dto: ReorderSectionDto): Promise<Section[]> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const currentSection = await tx.section.findUnique({
          where: { id },
          select: {
            id: true,
            folderId: true,
          },
        });

        if (!currentSection) {
          throw new NotFoundException(`Section ${id} not found`);
        }

        const siblings = await tx.section.findMany({
          where: { folderId: currentSection.folderId },
          orderBy: { position: 'asc' },
          select: {
            id: true,
          },
        });

        const orderedIds = siblings.map((section) => section.id);
        const currentIndex = orderedIds.indexOf(id);
        if (currentIndex < 0) {
          throw new NotFoundException(`Section ${id} not found`);
        }

        const targetPosition = this.clampToRange(dto.targetPosition, 0, orderedIds.length - 1);
        if (targetPosition === currentIndex) {
          return tx.section.findMany({
            where: { folderId: currentSection.folderId },
            orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
          });
        }

        orderedIds.splice(currentIndex, 1);
        orderedIds.splice(targetPosition, 0, id);

        await this.reindexFolderSections(tx, currentSection.folderId, orderedIds);

        return tx.section.findMany({
          where: { folderId: currentSection.folderId },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        });
      });
    } catch (error) {
      this.handleWriteError(error, id);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const section = await tx.section.findUnique({
          where: { id },
          select: {
            id: true,
            folderId: true,
          },
        });

        if (!section) {
          throw new NotFoundException(`Section ${id} not found`);
        }

        await tx.section.delete({
          where: { id: section.id },
        });

        const remainingSiblings = await tx.section.findMany({
          where: { folderId: section.folderId },
          orderBy: { position: 'asc' },
          select: { id: true },
        });

        await this.reindexFolderSections(
          tx,
          section.folderId,
          remainingSiblings.map((sibling) => sibling.id),
        );
      });
    } catch (error) {
      this.handleWriteError(error, id);
      throw error;
    }
  }

  private async ensureFolderExists(tx: Prisma.TransactionClient, folderId: string): Promise<void> {
    const folder = await tx.folder.findUnique({
      where: { id: folderId },
      select: { id: true },
    });

    if (!folder) {
      throw new NotFoundException(`Folder ${folderId} not found`);
    }
  }

  private async reindexFolderSections(
    tx: Prisma.TransactionClient,
    folderId: string,
    orderedSectionIds: string[],
  ): Promise<void> {
    const totalSections = await tx.section.count({
      where: { folderId },
    });

    if (totalSections !== orderedSectionIds.length) {
      throw new ConflictException('Section order conflict detected. Please retry.');
    }

    if (orderedSectionIds.length === 0) {
      return;
    }

    const offset = orderedSectionIds.length + 10;

    await tx.section.updateMany({
      where: { folderId },
      data: {
        position: { increment: offset },
      },
    });

    for (const [position, sectionId] of orderedSectionIds.entries()) {
      await tx.section.update({
        where: { id: sectionId },
        data: { position },
      });
    }
  }

  private clampToRange(value: number, min: number, max: number): number {
    if (max < min) {
      return min;
    }

    return Math.min(Math.max(value, min), max);
  }

  private handleWriteError(error: unknown, sectionId?: string): never | void {
    if (isPrismaNotFoundError(error)) {
      if (sectionId) {
        throw new NotFoundException(`Section ${sectionId} not found`);
      }

      throw new NotFoundException('Section not found');
    }

    if (isPrismaUniqueConstraintError(error)) {
      const fields = getPrismaUniqueFields(error);
      const isPositionConflict = fields.includes('folderId') && fields.includes('position');

      if (isPositionConflict) {
        throw new ConflictException('Section order conflict detected. Please retry.');
      }

      const suffix = fields.length > 0 ? ` (${fields.join(', ')})` : '';
      throw new ConflictException(`Section constraint violated${suffix}`);
    }
  }
}
