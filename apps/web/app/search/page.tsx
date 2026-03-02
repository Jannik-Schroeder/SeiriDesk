import Link from "next/link";
import { MvpBreadcrumbs } from "../../components/mvp-breadcrumbs";
import { documentPath, searchDocuments } from "../../components/mvp-data";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }> | { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;
  const query = typeof resolved?.q === "string" ? resolved.q.trim() : "";
  const hits = query ? searchDocuments(query) : [];

  return (
    <section className="stack-lg">
      <MvpBreadcrumbs
        items={[
          { label: "Folders", href: "/folders" },
          { label: "Search" },
        ]}
      />

      <div className="title-row">
        <h1>Search</h1>
        <span className="chip">Title + OCR text</span>
      </div>

      <form action="/search" method="GET" className="search-form">
        <input
          className="text-input"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search title or OCR text..."
          aria-label="Search documents"
        />
        <button type="submit" className="btn">
          Search
        </button>
      </form>

      {!query ? (
        <div className="empty-state">
          Enter a term to search through document titles and OCR attachment text.
        </div>
      ) : (
        <div className="stack-md">
          <p className="muted">
            {hits.length} result(s) for "<strong>{query}</strong>"
          </p>

          {hits.length === 0 ? (
            <div className="empty-state">No matching documents found.</div>
          ) : (
            <div className="stack-sm">
              {hits.map((hit) => (
                <article
                  key={`${hit.folder.id}-${hit.section.id}-${hit.document.id}`}
                  className="search-result-card"
                >
                  <div className="title-row">
                    <h3 style={{ margin: 0 }}>{hit.document.title}</h3>
                    <div className="meta-row">
                      {hit.matchedIn.map((target) => (
                        <span className="chip chip-hit" key={target}>
                          {target === "title" ? "title match" : "ocr match"}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="muted">
                    {hit.folder.name} / {hit.section.name}
                  </div>

                  <p className="search-snippet">
                    {hit.snippet ?? "No OCR snippet available for this title match."}
                  </p>

                  <Link
                    href={documentPath(hit.folder.id, hit.section.id, hit.document.id)}
                    className="btn-link"
                  >
                    Open document
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
