import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { SearchResponse } from './search.types';

const SNIPPET_PADDING = 45;
const SNIPPET_MAX_LENGTH = 140;

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchDocuments(
    householdId: string,
    query: string,
    limit: number,
  ): Promise<SearchResponse> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return {
        query: normalizedQuery,
        count: 0,
        results: [],
      };
    }

    const documents = await this.prisma.document.findMany({
      where: {
        section: {
          folder: {
            householdId,
          },
        },
        OR: [
          {
            title: {
              contains: normalizedQuery,
              mode: 'insensitive',
            },
          },
          {
            attachments: {
              some: {
                ocrText: {
                  contains: normalizedQuery,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
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
        attachments: {
          where: {
            ocrText: {
              contains: normalizedQuery,
              mode: 'insensitive',
            },
          },
          select: {
            id: true,
            originalFilename: true,
            ocrStatus: true,
            ocrText: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    const results = documents.map((document) => {
      const matchedInTitle = this.includesIgnoreCase(document.title, normalizedQuery);

      const matchingAttachments = document.attachments.map((attachment) => ({
        attachmentId: attachment.id,
        filename: attachment.originalFilename,
        ocrStatus: attachment.ocrStatus,
        snippet: this.createSnippet(attachment.ocrText ?? '', normalizedQuery),
      }));

      return {
        documentId: document.id,
        title: document.title,
        sectionId: document.section.id,
        sectionName: document.section.name,
        folderId: document.section.folder.id,
        folderName: document.section.folder.name,
        matchedInTitle,
        matchedInOcr: matchingAttachments.length > 0,
        matchingAttachments,
      };
    });

    return {
      query: normalizedQuery,
      count: results.length,
      results,
    };
  }

  private includesIgnoreCase(text: string, query: string): boolean {
    return text.toLocaleLowerCase().includes(query.toLocaleLowerCase());
  }

  private createSnippet(text: string, query: string): string {
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    if (!normalizedText) {
      return '';
    }

    const lowerText = normalizedText.toLocaleLowerCase();
    const lowerQuery = query.toLocaleLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);

    if (matchIndex === -1) {
      return normalizedText.slice(0, SNIPPET_MAX_LENGTH);
    }

    const start = Math.max(0, matchIndex - SNIPPET_PADDING);
    const end = Math.min(normalizedText.length, matchIndex + query.length + SNIPPET_PADDING);

    let snippet = normalizedText.slice(start, end);

    if (start > 0) {
      snippet = `...${snippet}`;
    }

    if (end < normalizedText.length) {
      snippet = `${snippet}...`;
    }

    return snippet;
  }
}
