import { Injectable } from '@nestjs/common';
import { RetentionStatus } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import {
  ReviewDueResponse,
  RetentionSyncResult,
} from './retention.types';

interface ReviewDueQuery {
  householdId: string;
  asOf: Date;
  limit: number;
  offset: number;
}

@Injectable()
export class RetentionService {
  constructor(private readonly prisma: PrismaService) {}

  async getReviewDueDocuments(query: ReviewDueQuery): Promise<ReviewDueResponse> {
    // Read-only GET endpoint: no bulk status mutation in request path.
    const sync: RetentionSyncResult = {
      markedNone: 0,
      markedActive: 0,
      markedReviewDue: 0,
    };

    const [total, documents] = await this.prisma.$transaction([
      this.prisma.document.count({
        where: {
          ...this.householdScope(query.householdId),
          retentionDate: {
            lte: query.asOf,
          },
          retentionStatus: {
            notIn: [RetentionStatus.REVIEWED_KEEP, RetentionStatus.REVIEWED_DELETE],
          },
        },
      }),
      this.prisma.document.findMany({
        where: {
          ...this.householdScope(query.householdId),
          retentionDate: {
            lte: query.asOf,
          },
          retentionStatus: {
            notIn: [RetentionStatus.REVIEWED_KEEP, RetentionStatus.REVIEWED_DELETE],
          },
        },
        include: {
          section: {
            select: {
              id: true,
              name: true,
              folder: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [{ retentionDate: 'asc' }, { updatedAt: 'desc' }],
        take: query.limit,
        skip: query.offset,
      }),
    ]);

    return {
      asOf: query.asOf.toISOString(),
      total,
      count: documents.length,
      sync,
      results: documents.map((document) => ({
        documentId: document.id,
        title: document.title,
        retentionDate: (document.retentionDate ?? query.asOf).toISOString(),
        retentionStatus: RetentionStatus.REVIEW_DUE,
        sectionId: document.section.id,
        sectionName: document.section.name,
        folderId: document.section.folder.id,
        folderName: document.section.folder.name,
      })),
    };
  }

  private householdScope(householdId: string): {
    section: {
      folder: {
        householdId: string;
      };
    };
  } {
    return {
      section: {
        folder: {
          householdId,
        },
      },
    };
  }
}
