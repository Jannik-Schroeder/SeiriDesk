# Search + OCR + Retention (MVP Technical Note)

## Scope
Diese Notiz beschreibt die MVP-Implementierung fuer:
- OCR-Status-Workflow auf `Attachment`
- Basis-Suche ueber `Document.title` + `Attachment.ocrText`
- Retention-`review due`-Logik ohne Auto-Delete

Basis sind:
- `docs/planning/02_Feature_Specification_MVP.md`
- `docs/planning/08_Phase1_Migration_Strategy.md`

## Neue API-Module
- `apps/api/src/modules/search`
- `apps/api/src/modules/ocr`
- `apps/api/src/modules/retention`
- `apps/api/src/common/prisma`

## OCR Workflow
### Endpoints
- `GET /ocr/attachments/:attachmentId`
- `POST /ocr/attachments/:attachmentId/start`
- `POST /ocr/attachments/:attachmentId/complete`
- `POST /ocr/attachments/:attachmentId/fail`

### Erlaubte Status-Transitions
- `PENDING -> PROCESSING`
- `PROCESSING -> COMPLETED`
- `PROCESSING -> FAILED`
- `FAILED -> PROCESSING` (Retry)

Nicht erlaubte Transitions werden mit `400 Bad Request` abgelehnt.

### Failure Handling
- Bei Fehlern kann `POST .../fail` mit `error`-Text gesetzt werden.
- Ein Retry startet ueber `POST .../start` aus `FAILED` erneut.
- Beim Start werden `ocrError` und vorhandener `ocrText` zurueckgesetzt, um keine veralteten Suchtreffer zu behalten.

## Search
### Endpoint
- `GET /search?householdId=<id>&q=<query>&limit=<n>`

### Verhalten
- Nutzt einfache Prisma-Filter (kein Redis, keine externe Search Engine):
  - Scope immer auf `householdId`
  - `Document.title CONTAINS query (insensitive)`
  - `Attachment.ocrText CONTAINS query (insensitive)`
- Gibt dokumentzentrierte Treffer zurueck, inklusive:
  - Folder/Section Kontext
  - Flag ob der Treffer im Titel und/oder OCR-Text liegt
  - Liste matchender Attachments mit OCR-Snippet

### MVP Limits
- `limit` default `25`, max `100`
- Keine Ranking-Tuning-Logik, keine erweiterten Filter

## Retention Review Due
### Endpoint
- `GET /retention/review-due?householdId=<id>&asOf=<ISO8601>&limit=<n>&offset=<n>`

### Verhalten
Vor der Abfrage wird ein Status-Sync ausgefuehrt:
- Scope immer auf `householdId`
- `retentionDate IS NULL` und Status in `(ACTIVE, REVIEW_DUE)` -> `NONE`
- `retentionDate > asOf` und Status in `(NONE, REVIEW_DUE)` -> `ACTIVE`
- `retentionDate <= asOf` und Status in `(NONE, ACTIVE)` -> `REVIEW_DUE`

Danach werden nur `REVIEW_DUE`-Dokumente mit `retentionDate <= asOf` geliefert.

### Wichtige MVP-Grenze
- Keine automatische Loeschung.
- Endpoint ist rein fuer Sichtbarkeit/Inbox-Logik von faelligen Dokumenten.

## Architekturentscheidungen
- Boring architecture: synchroner Service-Layer + Prisma, keine Queue-/Redis-Abhaengigkeit.
- Erweiterbarkeit vorbereitet:
  - OCR-Service enthaelt `runExtraction(...)` fuer spaetere Worker-Integration.
  - Search/Retention bleiben als eigenstaendige Module mit klaren API-Grenzen.
