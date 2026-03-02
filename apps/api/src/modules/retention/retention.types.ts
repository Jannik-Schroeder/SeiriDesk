import { RetentionStatus } from '@prisma/client';

export interface RetentionSyncResult {
  markedNone: number;
  markedActive: number;
  markedReviewDue: number;
}

export interface ReviewDueDocument {
  documentId: string;
  title: string;
  retentionDate: string;
  retentionStatus: RetentionStatus;
  sectionId: string;
  sectionName: string;
  folderId: string;
  folderName: string;
}

export interface ReviewDueResponse {
  asOf: string;
  total: number;
  count: number;
  sync: RetentionSyncResult;
  results: ReviewDueDocument[];
}
