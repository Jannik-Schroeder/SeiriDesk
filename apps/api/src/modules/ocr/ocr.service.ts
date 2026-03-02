import {
  Attachment,
  AttachmentOcrStatus,
} from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { OcrExtractor, OcrStatusResponse } from './ocr.types';

const ALLOWED_TRANSITIONS: Record<AttachmentOcrStatus, AttachmentOcrStatus[]> = {
  PENDING: [AttachmentOcrStatus.PROCESSING],
  PROCESSING: [AttachmentOcrStatus.COMPLETED, AttachmentOcrStatus.FAILED],
  COMPLETED: [],
  FAILED: [AttachmentOcrStatus.PROCESSING],
};

@Injectable()
export class OcrService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(attachmentId: string): Promise<OcrStatusResponse> {
    const attachment = await this.findAttachmentOrThrow(attachmentId);

    return this.toResponse(attachment);
  }

  async startProcessing(attachmentId: string): Promise<OcrStatusResponse> {
    const attachment = await this.transitionStatus(attachmentId, AttachmentOcrStatus.PROCESSING, {
      ocrError: null,
      ocrText: null,
    });

    return this.toResponse(attachment);
  }

  async markCompleted(attachmentId: string, ocrText: string): Promise<OcrStatusResponse> {
    const attachment = await this.transitionStatus(attachmentId, AttachmentOcrStatus.COMPLETED, {
      ocrError: null,
      ocrText,
    });

    return this.toResponse(attachment);
  }

  async markFailed(attachmentId: string, error: string): Promise<OcrStatusResponse> {
    const attachment = await this.transitionStatus(attachmentId, AttachmentOcrStatus.FAILED, {
      ocrError: error,
      ocrText: null,
    });

    return this.toResponse(attachment);
  }

  async runExtraction(attachmentId: string, extractor: OcrExtractor): Promise<OcrStatusResponse> {
    await this.startProcessing(attachmentId);

    try {
      const text = await extractor(attachmentId);
      return await this.markCompleted(attachmentId, text);
    } catch (error) {
      const failureMessage = this.errorToMessage(error);
      await this.markFailed(attachmentId, failureMessage);
      throw new InternalServerErrorException('OCR extraction failed');
    }
  }

  private async transitionStatus(
    attachmentId: string,
    nextStatus: AttachmentOcrStatus,
    payload: { ocrError?: string | null; ocrText?: string | null },
  ): Promise<Attachment> {
    const current = await this.findAttachmentOrThrow(attachmentId);
    this.assertAllowedTransition(current.ocrStatus, nextStatus);

    const updateResult = await this.prisma.attachment.updateMany({
      where: {
        id: attachmentId,
        ocrStatus: current.ocrStatus,
      },
      data: {
        ocrStatus: nextStatus,
        ocrError: payload.ocrError,
        ocrText: payload.ocrText,
      },
    });

    if (updateResult.count === 0) {
      const latest = await this.findAttachmentOrThrow(attachmentId);
      throw new ConflictException(
        `OCR status changed concurrently from ${current.ocrStatus} to ${latest.ocrStatus}`,
      );
    }

    return this.findAttachmentOrThrow(attachmentId);
  }

  private async findAttachmentOrThrow(attachmentId: string): Promise<Attachment> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment ${attachmentId} was not found`);
    }

    return attachment;
  }

  private assertAllowedTransition(
    currentStatus: AttachmentOcrStatus,
    nextStatus: AttachmentOcrStatus,
  ): void {
    const transitions = ALLOWED_TRANSITIONS[currentStatus];

    if (transitions.includes(nextStatus)) {
      return;
    }

    throw new BadRequestException(
      `Invalid OCR transition from ${currentStatus} to ${nextStatus}`,
    );
  }

  private toResponse(attachment: Attachment): OcrStatusResponse {
    return {
      attachmentId: attachment.id,
      status: attachment.ocrStatus,
      ocrText: attachment.ocrText,
      ocrError: attachment.ocrError,
      updatedAt: attachment.updatedAt.toISOString(),
    };
  }

  private errorToMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message.slice(0, 1000);
    }

    return 'Unknown OCR error';
  }
}
