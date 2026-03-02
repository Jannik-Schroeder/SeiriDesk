export interface Attachment {
  id: string;
  name: string;
  uploadedAt: string;
  ocrText?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  summary: string;
  retentionDate?: string | null;
  attachments: Attachment[];
}

export interface Section {
  id: string;
  name: string;
  sortIndex: number;
  documents: DocumentItem[];
}

export interface Folder {
  id: string;
  name: string;
  number?: string;
  sections: Section[];
}

const folders: Folder[] = [
  {
    id: "insurance",
    name: "Insurance",
    number: "A-12",
    sections: [
      {
        id: "contracts",
        name: "Contracts",
        sortIndex: 1,
        documents: [
          {
            id: "car-policy-2025",
            title: "Car Policy 2025",
            summary: "Annual policy overview and payment confirmation.",
            retentionDate: "2028-12-31",
            attachments: [
              {
                id: "att-1",
                name: "car-policy-scan.pdf",
                uploadedAt: "2025-01-06T10:00:00.000Z",
                ocrText:
                  "Vehicle insurance contract with premium details and damage coverage.",
              },
            ],
          },
          {
            id: "home-policy-2024",
            title: "Home Insurance Policy",
            summary: "Coverage statement for household and liability.",
            retentionDate: "2027-06-01",
            attachments: [
              {
                id: "att-2",
                name: "home-policy.pdf",
                uploadedAt: "2024-06-15T09:15:00.000Z",
                ocrText:
                  "Home insurance terms with deductible amounts and emergency hotline.",
              },
            ],
          },
        ],
      },
      {
        id: "claims",
        name: "Claims",
        sortIndex: 2,
        documents: [
          {
            id: "claim-berlin-2023",
            title: "Water Damage Claim",
            summary: "Claim documents and payout communication.",
            retentionDate: "2025-09-30",
            attachments: [
              {
                id: "att-3",
                name: "claim-mail.eml",
                uploadedAt: "2023-11-22T16:44:00.000Z",
                ocrText:
                  "Claim accepted after review. Payout approved. Keep this notice for legal retention.",
              },
              {
                id: "att-4",
                name: "invoice-repair.jpg",
                uploadedAt: "2023-11-23T09:12:00.000Z",
                ocrText:
                  "Repair invoice for kitchen cabinet and wall paint due to water damage.",
              },
            ],
          },
        ],
      },
      {
        id: "invoices",
        name: "Invoices",
        sortIndex: 3,
        documents: [
          {
            id: "premium-q1-2026",
            title: "Premium Payment Q1 2026",
            summary: "Quarterly premium transfer and confirmation PDF.",
            retentionDate: "2026-12-31",
            attachments: [
              {
                id: "att-5",
                name: "premium-q1-2026.pdf",
                uploadedAt: "2026-01-04T11:03:00.000Z",
                ocrText: "SEPA transfer confirmation for policy premiums in quarter one.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "employment",
    name: "Employment",
    number: "B-03",
    sections: [
      {
        id: "contracts-employment",
        name: "Contracts",
        sortIndex: 1,
        documents: [
          {
            id: "employment-contract",
            title: "Employment Contract",
            summary: "Signed contract and appendix documents.",
            retentionDate: "2030-01-01",
            attachments: [
              {
                id: "att-6",
                name: "employment-contract.pdf",
                uploadedAt: "2022-05-01T08:00:00.000Z",
                ocrText:
                  "Employment agreement including salary details and confidentiality clauses.",
              },
            ],
          },
        ],
      },
      {
        id: "tax",
        name: "Tax",
        sortIndex: 2,
        documents: [
          {
            id: "salary-2024",
            title: "Salary Statement 2024",
            summary: "Year-end salary statement for tax filing.",
            retentionDate: "2025-01-15",
            attachments: [
              {
                id: "att-7",
                name: "salary-2024.pdf",
                uploadedAt: "2025-01-10T07:30:00.000Z",
                ocrText:
                  "Annual salary statement with gross income and social contribution data.",
              },
            ],
          },
        ],
      },
    ],
  },
];

export interface SearchHit {
  folder: Folder;
  section: Section;
  document: DocumentItem;
  matchedIn: Array<"title" | "ocr">;
  snippet?: string;
}

export function listFolders(): Folder[] {
  return folders;
}

export function countDocuments(folder: Folder): number {
  return folder.sections.reduce((sum, section) => sum + section.documents.length, 0);
}

export function getFolderById(folderId: string): Folder | undefined {
  return folders.find((folder) => folder.id === folderId);
}

export function getSectionById(
  folder: Folder,
  sectionId: string,
): Section | undefined {
  return folder.sections.find((section) => section.id === sectionId);
}

export function getDocumentById(
  section: Section,
  documentId: string,
): DocumentItem | undefined {
  return section.documents.find((document) => document.id === documentId);
}

export function documentPath(
  folderId: string,
  sectionId: string,
  documentId: string,
): string {
  return `/folders/${folderId}/sections/${sectionId}/documents/${documentId}`;
}

function makeSnippet(content: string, query: string): string | undefined {
  const normalized = query.toLowerCase();
  const index = content.toLowerCase().indexOf(normalized);
  if (index === -1) {
    return undefined;
  }

  const start = Math.max(0, index - 36);
  const end = Math.min(content.length, index + normalized.length + 64);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < content.length ? "..." : "";
  return `${prefix}${content.slice(start, end)}${suffix}`;
}

export function searchDocuments(query: string): SearchHit[] {
  const term = query.trim().toLowerCase();
  if (!term) {
    return [];
  }

  const hits: SearchHit[] = [];

  for (const folder of folders) {
    for (const section of folder.sections) {
      for (const document of section.documents) {
        const matchedIn: Array<"title" | "ocr"> = [];
        let snippet: string | undefined;

        if (document.title.toLowerCase().includes(term)) {
          matchedIn.push("title");
        }

        for (const attachment of document.attachments) {
          if (!attachment.ocrText) {
            continue;
          }
          if (attachment.ocrText.toLowerCase().includes(term)) {
            if (!matchedIn.includes("ocr")) {
              matchedIn.push("ocr");
            }
            snippet = snippet ?? makeSnippet(attachment.ocrText, term);
          }
        }

        if (matchedIn.length > 0) {
          hits.push({ folder, section, document, matchedIn, snippet });
        }
      }
    }
  }

  return hits;
}
