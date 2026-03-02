import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CompleteOcrDto } from './dto/complete-ocr.dto';
import { FailOcrDto } from './dto/fail-ocr.dto';
import { OcrService } from './ocr.service';
import { OcrStatusResponse } from './ocr.types';

@Controller('ocr/attachments')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Get(':attachmentId')
  async getStatus(@Param('attachmentId') attachmentId: string): Promise<OcrStatusResponse> {
    return this.ocrService.getStatus(attachmentId);
  }

  @Post(':attachmentId/start')
  async startProcessing(
    @Param('attachmentId') attachmentId: string,
  ): Promise<OcrStatusResponse> {
    return this.ocrService.startProcessing(attachmentId);
  }

  @Post(':attachmentId/complete')
  async completeProcessing(
    @Param('attachmentId') attachmentId: string,
    @Body() body: CompleteOcrDto,
  ): Promise<OcrStatusResponse> {
    return this.ocrService.markCompleted(attachmentId, body.ocrText);
  }

  @Post(':attachmentId/fail')
  async markFailed(
    @Param('attachmentId') attachmentId: string,
    @Body() body: FailOcrDto,
  ): Promise<OcrStatusResponse> {
    return this.ocrService.markFailed(attachmentId, body.error);
  }
}
