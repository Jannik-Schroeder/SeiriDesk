import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Attachment, Prisma } from '@prisma/client';

import {
  getPrismaUniqueFields,
  isPrismaForeignKeyError,
  isPrismaNotFoundError,
  isPrismaUniqueConstraintError,
} from '../../common/errors/prisma-error.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { ListAttachmentsDto } from './dto/list-attachments.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttachmentDto): Promise<Attachment> {
    try {
      await this.ensureDocumentExists(dto.documentId);

      const data: Prisma.AttachmentUncheckedCreateInput = {
        documentId: dto.documentId,
        originalFilename: dto.originalFilename,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        storageKey: dto.storageKey,
        checksum: dto.checksum ?? null,
      };

      return await this.prisma.attachment.create({ data });
    } catch (error) {
      this.handleWriteError(error);
      throw error;
    }
  }

  async findAll(query: ListAttachmentsDto): Promise<Attachment[]> {
    return this.prisma.attachment.findMany({
      where: { documentId: query.documentId },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findOne(id: string): Promise<Attachment> {
    const attachment = await this.prisma.attachment.findUnique({ where: { id } });

    if (!attachment) {
      throw new NotFoundException(`Attachment ${id} not found`);
    }

    return attachment;
  }

  async update(id: string, dto: UpdateAttachmentDto): Promise<Attachment> {
    try {
      const data: Prisma.AttachmentUncheckedUpdateInput = {};

      if (dto.documentId !== undefined) {
        await this.ensureDocumentExists(dto.documentId);
        data.documentId = dto.documentId;
      }

      if (dto.originalFilename !== undefined) {
        data.originalFilename = dto.originalFilename;
      }

      if (dto.mimeType !== undefined) {
        data.mimeType = dto.mimeType;
      }

      if (dto.sizeBytes !== undefined) {
        data.sizeBytes = dto.sizeBytes;
      }

      if (dto.storageKey !== undefined) {
        data.storageKey = dto.storageKey;
      }

      if (dto.checksum !== undefined) {
        data.checksum = dto.checksum;
      }

      if (dto.ocrStatus !== undefined) {
        data.ocrStatus = dto.ocrStatus;
      }

      if (dto.ocrText !== undefined) {
        data.ocrText = dto.ocrText;
      }

      if (dto.ocrError !== undefined) {
        data.ocrError = dto.ocrError;
      }

      return await this.prisma.attachment.update({
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
      await this.prisma.attachment.delete({ where: { id } });
    } catch (error) {
      this.handleWriteError(error, id);
      throw error;
    }
  }

  private async ensureDocumentExists(documentId: string): Promise<void> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true },
    });

    if (!document) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }
  }

  private handleWriteError(error: unknown, attachmentId?: string): never | void {
    if (isPrismaNotFoundError(error)) {
      if (attachmentId) {
        throw new NotFoundException(`Attachment ${attachmentId} not found`);
      }

      throw new NotFoundException('Attachment not found');
    }

    if (isPrismaForeignKeyError(error)) {
      throw new NotFoundException('Related document not found');
    }

    if (isPrismaUniqueConstraintError(error)) {
      const fields = getPrismaUniqueFields(error);
      const isStorageConflict = fields.includes('documentId') && fields.includes('storageKey');

      if (isStorageConflict) {
        throw new ConflictException('storageKey must be unique within a document');
      }

      const suffix = fields.length > 0 ? ` (${fields.join(', ')})` : '';
      throw new ConflictException(`Attachment constraint violated${suffix}`);
    }
  }
}
