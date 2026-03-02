# SeiriDesk - Prisma Schema and Monorepo Structure

## Ziel dieses Dokuments
- Ein Prisma-Datenmodell, das den **strikten MVP** trägt.
- Gleichzeitig Vorbereitung für **Phase 2 (Scanning/Search Ausbau)** und **Phase 3 (Multi-User/Permissions)**.
- Eine klare, boring Monorepo-Struktur ohne frühe Komplexität.

## Prisma-Schema Status
- Datei: `apps/api/prisma/schema.prisma`
- Datenbank: PostgreSQL
- ORM: Prisma

## MVP-aktive Modelle (Phase 1)
- `Folder`
- `Section` (mit `position` für Reorder)
- `Document` (mit `retentionDate`/`retentionStatus`)
- `Attachment` (mit OCR-Feldern)

## Vorbereitete Modelle für Phase 2/3
- `Job` für OCR/Search/Retention Background Jobs.
- `User`, `Household`, `Membership` für späteres Multi-User-Modell.
- `PermissionEntry` für späteres rollen-/ressourcenbasiertes Access-Control.
- `AuditLog` für spätere Nachvollziehbarkeit sensibler Änderungen.
- `Location`, `Shelf` als optionale physische Hierarchie-Erweiterung.

## Wichtige Modellentscheidungen
### Section Reorder
- `Section.position` ist verpflichtend.
- `@@unique([folderId, position])` verhindert doppelte Positionen im selben Folder.

### Folder Number
- `Folder.number` ist optional.
- Kein harter globaler Unique-Constraint im MVP, um einfache Nutzung zu priorisieren.
- Echte Scope-Unique-Validierung kann in Phase 2/3 pro Hierarchie-Scope ergänzt werden.

### Retention
- `Document.retentionDate` als primäres Feld.
- `Document.retentionStatus` als expliziter Status für UI/Filter.
- Keine automatische Löschung im MVP.

### OCR/Search
- `Attachment.ocrStatus` + `ocrText` bilden die Basis für Suche.
- Erste Suche kann direkt über Titel + OCR-Text laufen (Postgres FTS/LIKE-Strategie je Implementierung).

## Monorepo-Struktur (angelegt)
```text
/apps
  /api
    /prisma
      schema.prisma
    /src
      /common
      /modules
  /web
    /app
    /components
/packages
  /config
  /types
    /src
  /ui
    /src
/infra
  /docker
  /scripts
/docs
  /adr
```

## Verantwortlichkeiten pro Bereich
- `apps/api`: NestJS API, Domain-Logik, Prisma-Anbindung, Jobs.
- `apps/web`: Next.js App Router UI.
- `packages/types`: geteilte Domain-/API-Typen.
- `packages/ui`: wiederverwendbare UI-Komponenten.
- `packages/config`: gemeinsame Tooling-Konfigurationen.
- `infra`: lokale Betriebs- und Deployment-Helfer.
- `docs/adr`: Architekturentscheidungen versioniert dokumentieren.

## Sequenz für die nächsten Schritte
1. Prisma-Schema in konkrete MVP-Migration überführen.
2. API-Module nur für MVP-Modelle implementieren (`Folder/Section/Document/Attachment`).
3. Jobs/Permissions-Modelle zunächst ungenutzt lassen, aber im Schema belassen.
4. Phase 2/3 Features erst aktivieren, wenn v0.1 stabil genutzt wird.
