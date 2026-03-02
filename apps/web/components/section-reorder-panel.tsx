"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Section } from "./mvp-data";

interface SectionReorderPanelProps {
  folderId: string;
  sections: Section[];
}

function applyStoredOrder(sections: Section[], orderedIds: string[]): Section[] {
  const byId = new Map(sections.map((section) => [section.id, section]));
  const sorted: Section[] = [];

  for (const id of orderedIds) {
    const section = byId.get(id);
    if (section) {
      sorted.push(section);
      byId.delete(id);
    }
  }

  const remaining = Array.from(byId.values()).sort(
    (left, right) => left.sortIndex - right.sortIndex,
  );
  return [...sorted, ...remaining];
}

export function SectionReorderPanel({
  folderId,
  sections,
}: SectionReorderPanelProps) {
  const storageKey = useMemo(
    () => `seiridesk:mvp:section-order:${folderId}`,
    [folderId],
  );
  const [orderedSections, setOrderedSections] = useState<Section[]>(
    [...sections].sort((left, right) => left.sortIndex - right.sortIndex),
  );
  const hydratedStorageKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const sorted = [...sections].sort((left, right) => left.sortIndex - right.sortIndex);
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      setOrderedSections(sorted);
      hydratedStorageKeyRef.current = storageKey;
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setOrderedSections(sorted);
        hydratedStorageKeyRef.current = storageKey;
        return;
      }
      const ids = parsed.filter((value) => typeof value === "string");
      if (ids.length === 0) {
        setOrderedSections(sorted);
        hydratedStorageKeyRef.current = storageKey;
        return;
      }
      setOrderedSections(applyStoredOrder(sorted, ids));
    } catch {
      setOrderedSections(sorted);
    }
    hydratedStorageKeyRef.current = storageKey;
  }, [sections, storageKey]);

  useEffect(() => {
    if (hydratedStorageKeyRef.current !== storageKey) {
      return;
    }
    const ids = orderedSections.map((section) => section.id);
    window.localStorage.setItem(storageKey, JSON.stringify(ids));
  }, [orderedSections, storageKey]);

  const moveSection = (index: number, delta: -1 | 1) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= orderedSections.length) {
      return;
    }
    const next = [...orderedSections];
    const [entry] = next.splice(index, 1);
    next.splice(targetIndex, 0, entry);
    setOrderedSections(next);
  };

  return (
    <div className="stack-md">
      <div className="title-row">
        <h2>Sections</h2>
        <span className="muted">{orderedSections.length} total</span>
      </div>

      <p className="muted">
        Reorder per up/down controls. Order is persisted locally for this MVP UI.
      </p>

      <div className="section-list">
        {orderedSections.map((section, index) => (
          <article className="section-item" key={section.id}>
            <div className="section-row">
              <div>
                <div className="section-title">{section.name}</div>
                <div className="muted">
                  Position {index + 1} • {section.documents.length} docs
                </div>
              </div>
              <div className="reorder-controls" aria-label={`Reorder ${section.name}`}>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${section.name} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => moveSection(index, 1)}
                  disabled={index === orderedSections.length - 1}
                  aria-label={`Move ${section.name} down`}
                >
                  ↓
                </button>
              </div>
            </div>
            <Link
              href={`/folders/${folderId}/sections/${section.id}`}
              className="btn-link"
            >
              Open section
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
