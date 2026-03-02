# API Core (MVP): Folder / Section / Document / Attachment

Diese Doku beschreibt den implementierten Backend-Kern für den Single-User-MVP.
Quelle der Datenstruktur ist `apps/api/prisma/schema.prisma`.

## Scope
- `Folder` CRUD
- `Section` CRUD + robustes Reorder über `position`
- `Document` CRUD (inkl. `retentionDate`)
- `Attachment` CRUD (Metadaten + Upload-Referenz über `storageKey`)

## Allgemeines
- Alle Payloads sind als JSON erwartet.
- Validierung erfolgt über DTOs (`class-validator`).
- Fehlercodes (typisch):
  - `404` bei fehlender Ressource
  - `409` bei Constraint-Konflikten (z. B. Unique)

## Folder Endpoints
### `POST /folders`
Create Folder.

Body:
```json
{
  "householdId": "string",
  "name": "Versicherungen",
  "number": "F-001",
  "position": 0
}
```
Hinweise:
- `householdId` und `name` sind Pflicht.
- `number` ist optional.
- `position` ist optional (Default: ans Ende).

### `GET /folders?householdId=...`
Listet Folder eines Haushalts, sortiert nach `position`.

### `GET /folders/:id`
Lädt einen Folder.

### `PATCH /folders/:id`
Update von `name` und/oder `number`.

### `DELETE /folders/:id`
Löscht Folder.

## Section Endpoints
### `POST /sections`
Create Section.

Body:
```json
{
  "folderId": "string",
  "name": "Steuer",
  "position": 1
}
```
Hinweise:
- `folderId`, `name` Pflicht.
- `position` optional (Default: ans Ende).
- Beim Einfügen wird danach innerhalb des Folders neu indiziert.

### `GET /sections?folderId=...`
Listet Sections eines Folders, sortiert nach `position`.

### `GET /sections/:id`
Lädt eine Section.

### `PATCH /sections/:id`
Update von `name`.

### `POST /sections/:id/reorder`
Reorder einer Section im selben Folder.

Body:
```json
{
  "targetPosition": 0
}
```
Response:
- gibt die kanonisch sortierte Section-Liste des Folders zurück.

### `DELETE /sections/:id`
Löscht Section und reindiziert verbleibende Geschwister.

## Document Endpoints
### `POST /documents`
Create Document.

Body:
```json
{
  "sectionId": "string",
  "title": "Rechnung 2026-01",
  "documentDate": "2026-01-14T00:00:00.000Z",
  "notes": "Optional",
  "retentionDate": "2036-01-14T00:00:00.000Z"
}
```
Hinweise:
- `sectionId`, `title` Pflicht.
- `retentionStatus` wird serverseitig aus `retentionDate` berechnet:
  - kein Datum -> `NONE`
  - Datum in der Zukunft -> `ACTIVE`
  - Datum erreicht/überschritten -> `REVIEW_DUE`

### `GET /documents?sectionId=...`
Listet Documents einer Section.

### `GET /documents/:id`
Lädt ein Document.

### `PATCH /documents/:id`
Update von `sectionId`, `title`, `documentDate`, `notes`, `retentionDate`.

### `DELETE /documents/:id`
Löscht Document.

## Attachment Endpoints
### `POST /attachments`
Create Attachment (nur Metadaten + Upload-Referenz).

Body:
```json
{
  "documentId": "string",
  "originalFilename": "scan.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 245760,
  "storageKey": "uploads/2026/03/scan.pdf",
  "checksum": "optional"
}
```
Hinweise:
- `storageKey` repräsentiert die Upload-Referenz.
- `(documentId, storageKey)` ist eindeutig.

### `GET /attachments?documentId=...`
Listet Attachments eines Documents.

### `GET /attachments/:id`
Lädt ein Attachment.

### `PATCH /attachments/:id`
Update von Metadaten und OCR-Feldern (`ocrStatus`, `ocrText`, `ocrError`) möglich.

### `DELETE /attachments/:id`
Löscht Attachment.

## Reorder-Implementierung (Section)
Die Reorder-Logik ist transaktional und robust gegenüber Positionskollisionen:
1. komplette Geschwisterliste im Folder bestimmen
2. Zielreihenfolge im Speicher berechnen
3. in derselben DB-Transaktion alle Positionen temporär per Offset nach oben schieben
4. finale Positionen (`0..n-1`) nacheinander zurückschreiben

Dadurch wird die Unique-Constraint `@@unique([folderId, position])` zuverlässig eingehalten.
