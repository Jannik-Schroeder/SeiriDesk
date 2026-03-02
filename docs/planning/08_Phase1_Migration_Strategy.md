# SeiriDesk - Phase 1 Initial Migration Strategy

## Ziel
Eine stabile, einfache Initial-Migration für v0.1 (Single-User MVP), die bereits sauber für Phase 2/3 erweiterbar bleibt.

## Grundsatz
- Ein gemeinsames Schema ist erlaubt, aber nur MVP-Tabellen werden in Phase 1 aktiv genutzt.
- Keine komplexen DB-Optimierungen zu früh.
- Migrations sollen deterministisch und rückverfolgbar sein.

## Phase-1 Aktive Domäne
- `Folder`
- `Section`
- `Document`
- `Attachment`

## Vorbereitete, aber nicht aktiv genutzte Tabellen
- `User`, `Household`, `Membership`
- `Location`, `Shelf`
- `PermissionEntry`
- `AuditLog`
- `Job`

## Migrationsreihenfolge (empfohlen)
1. `User`, `Household`
2. `Membership`
3. `Location`, `Shelf`, `Folder`
4. `Section`
5. `Document`
6. `Attachment`
7. `PermissionEntry`, `AuditLog`, `Job`

Begründung:
- Reihenfolge folgt Fremdschlüssel-Abhängigkeiten.
- Frühe Tabellen schaffen stabile IDs für spätere Phasen ohne Breaking Migrations.

## Konkrete Phase-1 Constraints
### Muss
- `Folder.name` non-null.
- `Section` unique Position je Folder (`folderId + position`).
- `Document` an genau eine `Section` gebunden.
- `Attachment` an genau ein `Document` gebunden.

### Soll (für Performance)
- Indexe auf:
  - `Section.folderId`
  - `Document.sectionId`
  - `Document.retentionDate`
  - `Attachment.documentId`
  - `Attachment.ocrStatus`

## Seed-Strategie (minimal)
Für lokale Entwicklung:
- 1 Test-Haushalt
- 1 Test-User
- 1 Membership (`OWNER`)
- 2 Folder mit je 2 Sections
- 3-5 Documents mit gemischten Retention-Daten
- 1-2 Attachments mit OCR-Status `COMPLETED`

Hinweis:
- Auch wenn MVP Single-User ist, bleibt die Haushaltsstruktur intern konsistent für spätere Erweiterung.

## Search/OCR in Phase 1
- OCR schreibt in `Attachment.ocrText`.
- Suche kombiniert:
  - `Document.title`
  - `Attachment.ocrText`
- Keine externe Search Engine in Phase 1.

## Rollout-Checkliste für Migration
1. Migration lokal ausführen.
2. Seed erfolgreich einspielen.
3. CRUD-Flows für Folder/Section/Document/Attachment manuell testen.
4. Section-Reorder mit mehreren Einträgen testen (Positions-Unique beachten).
5. Retention-Datum setzen und `review due`-Anzeige verifizieren.

## Risiken und Gegenmaßnahmen
- Risiko: Reorder-Kollisionen bei konkurrierenden Updates.
  - Gegenmaßnahme: Reorder-Operation in DB-Transaktion kapseln.
- Risiko: OCR-Text wächst stark.
  - Gegenmaßnahme: Text-Limits + spätere FTS-Optimierung in Phase 2.
- Risiko: Zu frühe Aktivierung von Permission-Tabellen.
  - Gegenmaßnahme: In Phase 1 nicht im API-Pfad referenzieren.

## Definition of Done (Phase 1)
- Initial-Migration läuft sauber auf leerer DB.
- Seed erzeugt nutzbare Beispieldaten.
- End-to-End MVP-Flow ist möglich:
  - Folder -> Section -> Document -> Attachment -> Search.
