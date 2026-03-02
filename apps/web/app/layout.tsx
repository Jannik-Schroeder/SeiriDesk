import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeiriDesk MVP",
  description: "Minimal UI for folder, section, document, and attachment workflows.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <div className="topbar-inner">
              <Link href="/folders" className="brand">
                SeiriDesk <span className="badge">MVP</span>
              </Link>
              <nav className="topnav" aria-label="Primary">
                <Link href="/folders" className="topnav-link">
                  Folders
                </Link>
                <Link href="/search" className="topnav-link">
                  Search
                </Link>
              </nav>
            </div>
          </header>
          <main className="page-container">{children}</main>
        </div>
      </body>
    </html>
  );
}
