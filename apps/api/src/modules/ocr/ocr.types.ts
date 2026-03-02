import { AttachmentOcrStatus } from '@prisma/client';

export interface OcrStatusResponse {
  attachmentId: string;
  status: AttachmentOcrStatus;
  ocrText: string | null;
  ocrError: string | null;
  updatedAt: string;
}

export type OcrExtractor = (attachmentId: string) => Promise<string>;
