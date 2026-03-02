import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Document, Prisma, RetentionStatus } from '@prisma/client';

import {
  getPrismaUniqueFields,
  isPrismaForeignKeyError,
  isPrismaNotFoundError,
  isPrismaUniqueConstraintError,
} from '../../common/errors/prisma-error.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ListDocumentsDto } from './dto/list-documents.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDocumentDto): Promise<Document> {
    try {
      await this.ensureSectionExists(dto.sectionId);

      const retentionDate = this.parseOptionalDate(dto.retentionDate);

      const data: Prisma.DocumentUncheckedCreateInput = {
        sectionId: dto.sectionId,
        title: dto.title,
        documentDate: this.parseOptionalDate(dto.documentDate),
        notes: dto.notes ?? null,
        retentionDate,
        retentionStatus: this.resolveRetentionStatus(retentionDate),
      };

      return await this.prisma.document.create({ data });
    } catch (error) {
      this.handleWriteError(error);
      throw error;
    }
  }

  async findAll(query: ListDocumentsDto): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { sectionId: query.sectionId },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.prisma.document.findUnique({ where: { id } });

    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return document;
  }

  async update(id: string, dto: UpdateDocumentDto): Promise<Document> {
    try {
      const data: Prisma.DocumentUncheckedUpdateInput = {};

      if (dto.sectionId !== undefined) {
        await this.ensureSectionExists(dto.sectionId);
        data.sectionId = dto.sectionId;
      }

      if (dto.title !== undefined) {
        data.title = dto.title;
      }

      if (dto.documentDate !== undefined) {
        data.documentDate = this.parseOptionalDate(dto.documentDate);
      }

      if (dto.notes !== undefined) {
        data.notes = dto.notes;
      }

      if (dto.retentionDate !== undefined) {
        const retentionDate = this.parseOptionalDate(dto.retentionDate);
        data.retentionDate = retentionDate;
        data.retentionStatus = this.resolveRetentionStatus(retentionDate);
      }

      return await this.prisma.document.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleWriteError(error, id);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.document.delete({ where: { id } });
    } catch (error) {
      this.handleWriteError(error, id);
      throw error;
    }
  }

  private parseOptionalDate(value: string | null | undefined): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    return new Date(value);
  }

  private resolveRetentionStatus(retentionDate: Date | null | undefined): RetentionStatus {
    if (!retentionDate) {
      return RetentionStatus.NONE;
    }

    return retentionDate.getTime() <= Date.now() ? RetentionStatus.REVIEW_DUE : RetentionStatus.ACTIVE;
  }

  private async ensureSectionExists(sectionId: string): Promise<void> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { id: true },
    });

    if (!section) {
      throw new NotFoundException(`Section ${sectionId} not found`);
    }
  }

  private handleWriteError(error: unknown, documentId?: string): never | void {
    if (isPrismaNotFoundError(error)) {
      if (documentId) {
        throw new NotFoundException(`Document ${documentId} not found`);
      }

      throw new NotFoundException('Document not found');
    }

    if (isPrismaForeignKeyError(error)) {
      throw new NotFoundException('Related section not found');
    }

    if (isPrismaUniqueConstraintError(error)) {
      const fields = getPrismaUniqueFields(error);
      const suffix = fields.length > 0 ? ` (${fields.join(', ')})` : '';
      throw new ConflictException(`Document constraint violated${suffix}`);
    }
  }
}
