import Link from "next/link";
import { notFound } from "next/navigation";
import { MvpBreadcrumbs } from "../../../../../components/mvp-breadcrumbs";
import {
  documentPath,
  getFolderById,
  getSectionById,
} from "../../../../../components/mvp-data";
import { RetentionBadge } from "../../../../../components/retention-badge";

interface SectionPageProps {
  params:
    | Promise<{ folderId: string; sectionId: string }>
    | { folderId: string; sectionId: string };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { folderId, sectionId } = await params;
  const folder = getFolderById(folderId);

  if (!folder) {
    notFound();
  }

  const section = getSectionById(folder, sectionId);
  if (!section) {
    notFound();
  }

  return (
    <section className="stack-lg">
      <MvpBreadcrumbs
        items={[
          { label: "Folders", href: "/folders" },
          { label: folder.name, href: `/folders/${folder.id}` },
          { label: section.name },
        ]}
      />

      <div className="title-row">
        <h1>{section.name}</h1>
        <span className="chip">{section.documents.length} documents</span>
      </div>

      <div className="two-up">
        <article className="surface-card stack-sm">
          <h2 style={{ margin: 0 }}>Documents</h2>
          {section.documents.length === 0 ? (
            <div className="empty-state">No documents in this section.</div>
          ) : (
            <div className="docs-list">
              {section.documents.map((document) => (
                <article key={document.id} className="doc-card">
                  <div className="title-row">
                    <h3 style={{ margin: 0 }}>{document.title}</h3>
                    <RetentionBadge retentionDate={document.retentionDate} />
                  </div>
                  <p className="search-snippet">{document.summary}</p>
                  <div className="meta-row">
                    <span className="chip">{document.attachments.length} attachments</span>
                  </div>
                  <Link
                    href={documentPath(folder.id, section.id, document.id)}
                    className="btn-link"
                  >
                    Open document
                  </Link>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="surface-card stack-sm">
          <h2 style={{ margin: 0 }}>Actions</h2>
          <Link href={`/folders/${folder.id}`} className="btn-link">
            Back to folder and reorder sections
          </Link>
          <Link href="/search" className="btn-link">
            Search in title and OCR text
          </Link>
        </article>
      </div>
    </section>
  );
}
