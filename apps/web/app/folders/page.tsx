import Link from "next/link";
import { countDocuments, listFolders } from "../../components/mvp-data";

export default function FoldersPage() {
  const folders = listFolders();

  return (
    <section className="stack-lg">
      <div className="title-row">
        <h1>Folders</h1>
        <Link href="/search" className="btn">
          Open Search
        </Link>
      </div>

      <p className="muted">
        Single-user MVP workspace. Pick a folder to manage sections, documents, and
        attachments.
      </p>

      <div className="grid-cards">
        {folders.map((folder) => (
          <article key={folder.id} className="surface-card folder-card">
            <div className="stack-sm">
              <h3>{folder.name}</h3>
              <div className="meta-row">
                {folder.number ? <span className="chip">#{folder.number}</span> : null}
                <span className="chip">{folder.sections.length} sections</span>
                <span className="chip">{countDocuments(folder)} documents</span>
              </div>
            </div>
            <Link href={`/folders/${folder.id}`} className="btn">
              Open Folder
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
