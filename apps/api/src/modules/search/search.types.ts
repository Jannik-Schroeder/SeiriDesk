import { AttachmentOcrStatus } from '@prisma/client';

export interface SearchResultAttachment {
  attachmentId: string;
  filename: string;
  ocrStatus: AttachmentOcrStatus;
  snippet: string;
}

export interface SearchResultDocument {
  documentId: string;
  title: string;
  sectionId: string;
  sectionName: string;
  folderId: string;
  folderName: string;
  matchedInTitle: boolean;
  matchedInOcr: boolean;
  matchingAttachments: SearchResultAttachment[];
}

export interface SearchResponse {
  query: string;
  count: number;
  results: SearchResultDocument[];
}
