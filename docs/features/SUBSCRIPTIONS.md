# SUBSCRIPTIONS Feature Handbook

## 1. What This Is
`SUBSCRIPTIONS` is the onboarding and engineering runbook for the current SeiriDesk MVP feature surface:

- Core hierarchy CRUD: `Folder -> Section -> Document -> Attachment`
- Section reorder semantics
- OCR lifecycle for attachments
- Search over title + OCR text
- Retention review-due view
- Minimal web navigation flow for these features

This document is designed so a new engineer can reach productive context in about 30 minutes, run the feature locally, and extend it safely.

## 2. 30-Minute Onboarding Path
1. Read sections `3` to `7` in this file.
2. Open Prisma schema: `apps/api/prisma/schema.prisma`.
3. Read services in this order:
   - `apps/api/src/modules/sections/sections.service.ts`
   - `apps/api/src/modules/documents/documents.service.ts`
   - `apps/api/src/modules/attachments/attachments.service.ts`
   - `apps/api/src/modules/ocr/ocr.service.ts`
   - `apps/api/src/modules/search/search.service.ts`
   - `apps/api/src/modules/retention/retention.service.ts`
4. Read web MVP entry points:
   - `apps/web/app/folders/page.tsx`
   - `apps/web/app/folders/[folderId]/page.tsx`
   - `apps/web/app/folders/[folderId]/sections/[sectionId]/page.tsx`
   - `apps/web/app/folders/[folderId]/sections/[sectionId]/documents/[documentId]/page.tsx`
   - `apps/web/app/search/page.tsx`
5. Execute the validation checklist in section `12`.

## 3. Scope and Non-Goals
### In scope (MVP)
- Single-user oriented workflow.
- Strong hierarchy consistency.
- Reliable section ordering.
- Basic OCR status handling.
- Basic text search.
- Retention due visibility.

### Explicitly out of scope
- Multi-user invites and ACL authorization UX.
- Policy-based auto-deletion.
- Advanced search ranking/filter DSL.
- Event outbox and integrations.
- Mobile clients.

## 4. Architecture Overview
### Backend
- Framework pattern: NestJS modules/controllers/services.
- ORM: Prisma.
- DB: PostgreSQL (via `DATABASE_URL`).
- Domain modules:
  - `folders`
  - `sections`
  - `documents`
  - `attachments`
  - `ocr`
  - `search`
  - `retention`

### Frontend
- Next.js App Router style structure in `apps/web/app`.
- Components in `apps/web/components`.
- In-memory/mock data for MVP navigation UI.
- Local UI persistence for section reorder in `localStorage`.

## 5. Source of Truth and Data Invariants
Schema: `apps/api/prisma/schema.prisma`.

### Core entity invariants
- `Folder`
  - required: `householdId`, `name`
  - optional: `number`
  - ordered by `position`
- `Section`
  - required: `folderId`, `name`
  - ordered by `position`
  - uniqueness: `@@unique([folderId, position])`
- `Document`
  - required: `sectionId`, `title`
  - optional: `retentionDate`
  - derived lifecycle: `retentionStatus`
- `Attachment`
  - required: `documentId`, `originalFilename`, `mimeType`, `sizeBytes`, `storageKey`
  - OCR fields: `ocrStatus`, `ocrText`, `ocrError`
  - uniqueness: `@@unique([documentId, storageKey])`

### Important enums
- `RetentionStatus`: `NONE`, `ACTIVE`, `REVIEW_DUE`, `REVIEWED_KEEP`, `REVIEWED_DELETE`
- `AttachmentOcrStatus`: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`

## 6. API Contract (Current)
All endpoints are JSON unless noted.

### Folder
- `POST /folders`
- `GET /folders?householdId=...`
- `GET /folders/:id`
- `PATCH /folders/:id`
- `DELETE /folders/:id`

### Section
- `POST /sections`
- `GET /sections?folderId=...`
- `GET /sections/:id`
- `PATCH /sections/:id`
- `POST /sections/:id/reorder`
- `DELETE /sections/:id`

### Document
- `POST /documents`
- `GET /documents?sectionId=...`
- `GET /documents/:id`
- `PATCH /documents/:id`
- `DELETE /documents/:id`

### Attachment
- `POST /attachments`
- `GET /attachments?documentId=...`
- `GET /attachments/:id`
- `PATCH /attachments/:id`
- `DELETE /attachments/:id`

### OCR
- `GET /ocr/attachments/:attachmentId`
- `POST /ocr/attachments/:attachmentId/start`
- `POST /ocr/attachments/:attachmentId/complete`
- `POST /ocr/attachments/:attachmentId/fail`

### Search
- `GET /search?householdId=...&q=...&limit=...`

### Retention
- `GET /retention/review-due?householdId=...&asOf=...&limit=...&offset=...`

## 7. Behavioral Details You Must Preserve
### Section reorder
- Reorder is explicit and canonicalized.
- Final sequence must always be contiguous `0..n-1` inside folder.
- Constraint safety is achieved by temporary offset update, then final writes.

### OCR status machine
- Allowed transitions:
  - `PENDING -> PROCESSING`
  - `PROCESSING -> COMPLETED`
  - `PROCESSING -> FAILED`
  - `FAILED -> PROCESSING`
- Invalid transitions must fail with `400`.
- Concurrency must not silently violate the state machine.

### Retention
- `retentionStatus` derives from `retentionDate` and comparison date (`asOf`).
- MVP must not auto-delete documents.
- Review-due query must reliably return due documents with folder/section context.

### Search
- Search currently uses case-insensitive `contains`.
- Search matches title and OCR text.
- Results are document-centric with matching attachment snippets.

## 8. Frontend MVP Flow
Expected click-path:
1. `/folders` (folder list)
2. `/folders/[folderId]` (folder detail + section reorder controls)
3. `/folders/[folderId]/sections/[sectionId]` (document list in section)
4. `/folders/[folderId]/sections/[sectionId]/documents/[documentId]` (document + attachments)
5. `/search` (title + OCR search)

Retention must be visible at document level with explicit due indicators.

## 9. Local Setup
This repository snapshot currently contains feature code and schema, but does not include package manager manifests (`package.json` / workspace config). Setup therefore has two tracks.

### Track A: If manifests exist in your branch
1. Install dependencies:
   - `pnpm install` or `npm install` (based on workspace standard)
2. Set env:
   - `export DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/seiridesk"`
3. Generate Prisma client and migrate:
   - `pnpm --filter api prisma generate`
   - `pnpm --filter api prisma migrate dev`
4. Start services:
   - `pnpm --filter api dev`
   - `pnpm --filter web dev`

### Track B: If manifests are missing (current snapshot)
1. Coordinate with repo owners to pull the baseline workspace scaffolding commit.
2. Do not guess dependency versions ad hoc in feature branches.
3. After scaffold sync, execute Track A exactly.

### Preflight checks
- DB reachable via `DATABASE_URL`.
- Prisma schema parses.
- API boots with module registration.
- Web routes render.

## 10. Safe Extension Rules
### Rule 1: Evolve schema and API together
- Every schema field change requires:
  - Prisma migration
  - DTO validation updates
  - Service mapping updates
  - API contract note update

### Rule 2: Keep ordering operations transactional
- Never split reorder writes across independent transactions.
- Preserve conflict-safe behavior for `@@unique([folderId, position])`.

### Rule 3: Keep OCR transitions explicit
- Do not allow direct arbitrary status updates in generic update endpoints.
- Keep state machine guardrails centralized in OCR service.

### Rule 4: Protect query endpoints from write amplification
- Avoid expensive global updates on every read path.
- If synchronization is needed, consider background jobs for scale.

### Rule 5: Preserve household boundaries
- New list/search/report endpoints must include household scoping.
- Prefer explicit household constraints in `where` clauses.

## 11. Security, Privacy, and Reliability Checklist
- Validate all external input with DTOs.
- Enforce strict `limit` and pagination caps.
- Avoid returning internal error details to clients.
- Keep OCR text handling bounded (size and truncation where needed).
- Add authz checks before production multi-user rollout.

## 12. Manual Verification Checklist
Run these scenarios after any meaningful change:

1. Core flow:
   - create folder -> create section -> create document -> create attachment
2. Reorder:
   - move section up/down repeatedly
   - refresh and verify order persistence
3. OCR:
   - `start` -> `complete` path
   - invalid transition and ensure `400`
   - concurrent transition behavior
4. Search:
   - title hit
   - OCR hit
   - no-hit path
5. Retention:
   - document with past date appears in review due
   - future date does not appear as due

## 13. Testing Strategy
### Unit
- Reorder algorithms and edge cases.
- OCR transition validator.
- Retention status derivation.
- Search snippet creation.

### Integration
- End-to-end CRUD hierarchy.
- OCR + search integration.
- Retention due listing with household scope.

### Concurrency
- Simultaneous section reorders.
- Simultaneous OCR updates on same attachment.

## 14. Known Gaps and Recommended Next Steps
1. Add package/workspace scaffolding to make this feature runnable end-to-end in CI.
2. Add API authentication and request-scoped authorization.
3. Add load-aware search strategy (indexes/FTS) once dataset grows.
4. Move retention sync from read path to controlled background process if write load rises.

## 15. Ownership and Change Control
- Primary ownership: API core team.
- Shared ownership: Web MVP team for route/component integration.
- Required review before merge:
  - Any schema migration
  - Any API contract change
  - Any reorder/OCR state machine logic change
