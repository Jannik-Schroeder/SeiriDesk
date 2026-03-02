import Link from "next/link";
import { notFound } from "next/navigation";
import { AttachmentUploader } from "../../../../../../../components/attachment-uploader";
import { MvpBreadcrumbs } from "../../../../../../../components/mvp-breadcrumbs";
import {
  getDocumentById,
  getFolderById,
  getSectionById,
} from "../../../../../../../components/mvp-data";
import {
  getRetentionMeta,
  RetentionBadge,
} from "../../../../../../../components/retention-badge";

interface DocumentPageProps {
  params:
    | Promise<{ folderId: string; sectionId: string; documentId: string }>
    | { folderId: string; sectionId: string; documentId: string };
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { folderId, sectionId, documentId } = await params;

  const folder = getFolderById(folderId);
  if (!folder) {
    notFound();
  }

  const section = getSectionById(folder, sectionId);
  if (!section) {
    notFound();
  }

  const document = getDocumentById(section, documentId);
  if (!document) {
    notFound();
  }

  const retention = getRetentionMeta(document.retentionDate);

  return (
    <section className="stack-lg">
      <MvpBreadcrumbs
        items={[
          { label: "Folders", href: "/folders" },
          { label: folder.name, href: `/folders/${folder.id}` },
          { label: section.name, href: `/folders/${folder.id}/sections/${section.id}` },
          { label: document.title },
        ]}
      />

      <div className="title-row">
        <h1>{document.title}</h1>
        <RetentionBadge retentionDate={document.retentionDate} />
      </div>

      <div className="document-layout">
        <article className="surface-card stack-md">
          <h2 style={{ margin: 0 }}>Document Detail</h2>
          <div className="stack-sm">
            <span className="label">Summary</span>
            <p style={{ margin: 0 }}>{document.summary}</p>
          </div>

          <div className="stack-sm">
            <span className="label">Retention date</span>
            <strong>{retention.formattedDate}</strong>
          </div>

          {retention.isDue ? (
            <div className="callout-warning">
              Retention review due. This document should be reviewed now.
            </div>
          ) : null}

          <div className="stack-sm">
            <span className="label">Quick navigation</span>
            <Link
              href={`/folders/${folder.id}/sections/${section.id}`}
              className="btn-link"
            >
              Back to section
            </Link>
            <Link href="/search" className="btn-link">
              Open search view
            </Link>
          </div>
        </article>

        <article className="surface-card">
          <AttachmentUploader
            documentId={document.id}
            initialAttachments={document.attachments}
          />
        </article>
      </div>
    </section>
  );
}
