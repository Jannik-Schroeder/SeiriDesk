import Link from "next/link";
import { notFound } from "next/navigation";
import { MvpBreadcrumbs } from "../../../components/mvp-breadcrumbs";
import { countDocuments, getFolderById } from "../../../components/mvp-data";
import { SectionReorderPanel } from "../../../components/section-reorder-panel";

interface FolderPageProps {
  params: Promise<{ folderId: string }> | { folderId: string };
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { folderId } = await params;
  const folder = getFolderById(folderId);

  if (!folder) {
    notFound();
  }

  const latestSection =
    [...folder.sections].sort((left, right) => left.sortIndex - right.sortIndex)[0] ??
    null;

  return (
    <section className="stack-lg">
      <MvpBreadcrumbs
        items={[
          { label: "Folders", href: "/folders" },
          { label: folder.name },
        ]}
      />

      <div className="title-row">
        <h1>{folder.name}</h1>
        <div className="meta-row">
          {folder.number ? <span className="chip">#{folder.number}</span> : null}
          <span className="chip">{folder.sections.length} sections</span>
          <span className="chip">{countDocuments(folder)} documents</span>
        </div>
      </div>

      <div className="folder-layout">
        <article className="surface-card">
          <SectionReorderPanel folderId={folder.id} sections={folder.sections} />
        </article>

        <article className="surface-card stack-md">
          <div className="title-row">
            <h2>Folder Detail</h2>
            <Link href="/search" className="btn-subtle btn">
              Search docs
            </Link>
          </div>
          <p className="muted">
            Navigate from folder to section, then to document detail for attachment
            management.
          </p>

          {latestSection ? (
            <div className="surface-soft stack-sm">
              <span className="label">Suggested next step</span>
              <strong>Open section "{latestSection.name}"</strong>
              <Link
                href={`/folders/${folder.id}/sections/${latestSection.id}`}
                className="btn-link"
              >
                Continue to section
              </Link>
            </div>
          ) : (
            <div className="empty-state">This folder has no sections yet.</div>
          )}

          <div className="stack-sm">
            <h3 style={{ margin: 0 }}>Section overview</h3>
            {folder.sections.map((section) => (
              <div key={section.id} className="section-item">
                <div className="section-row">
                  <span className="section-title">{section.name}</span>
                  <span className="chip">{section.documents.length} docs</span>
                </div>
                <Link
                  href={`/folders/${folder.id}/sections/${section.id}`}
                  className="btn-link"
                >
                  Open section
                </Link>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
