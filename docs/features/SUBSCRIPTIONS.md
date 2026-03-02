# SUBSCRIPTIONS.md

## 1. Purpose
This document is the production onboarding guide for the MVP feature set implemented in this branch:
- OCR status workflow for attachments
- Basic search over document title and OCR text
- Retention "review due" query logic (no auto-delete)

Target: a new engineer should be able to understand the design, run it locally, validate behavior, and extend safely within 30 minutes.

## 2. Feature Summary
### 2.1 Business Outcome
The feature set enables a complete retrieval loop:
1. Attach a scanned file to a document.
2. Track OCR extraction state and failures.
3. Search documents by title and extracted OCR text.
4. Surface documents whose retention date is due for review.

### 2.2 MVP Scope (Implemented)
- OCR states: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`
- Search query over:
  - `Document.title`
  - `Attachment.ocrText`
- Retention due detection by `Document.retentionDate <= asOf`
- No external search engine
- No Redis requirement
- No automatic deletion

### 2.3 Explicit Non-Goals (Current)
- No ranking engine beyond simple DB filtering
- No policy-driven retention workflows
- No automatic purge/delete flow
- No async queue orchestration requirement

## 3. Code Map
### 3.1 API Modules
- `apps/api/src/modules/search`
  - `search.controller.ts`
  - `search.service.ts`
  - `dto/search-query.dto.ts`
  - `search.types.ts`
- `apps/api/src/modules/ocr`
  - `ocr.controller.ts`
  - `ocr.service.ts`
  - `dto/complete-ocr.dto.ts`
  - `dto/fail-ocr.dto.ts`
  - `ocr.types.ts`
- `apps/api/src/modules/retention`
  - `retention.controller.ts`
  - `retention.service.ts`
  - `dto/review-due-query.dto.ts`
  - `retention.types.ts`
- Shared DB adapter:
  - `apps/api/src/common/prisma/prisma.module.ts`
  - `apps/api/src/common/prisma/prisma.service.ts`

### 3.2 Data Model Dependencies (Prisma)
Source of truth: `apps/api/prisma/schema.prisma`

Relevant fields:
- `Attachment`
  - `ocrStatus AttachmentOcrStatus`
  - `ocrText String?`
  - `ocrError String?`
- `Document`
  - `title String`
  - `retentionDate DateTime?`
  - `retentionStatus RetentionStatus`
- Household scoping chain:
  - `Document -> Section -> Folder -> householdId`

## 4. API Contracts

## 4.1 Search
### Endpoint
`GET /search?householdId=<id>&q=<query>&limit=<n>`

### Query DTO
- `householdId` (required, non-empty)
- `q` (required, non-empty)
- `limit` (optional, default `25`, max `100`)

### Behavior
- Case-insensitive contains search on:
  - `Document.title`
  - `Attachment.ocrText`
- Returns document-level results with matching attachment snippets.
- Scoped to one household via relation filter on `Document.section.folder.householdId`.

### Example Response
```json
{
  "query": "insurance",
  "count": 1,
  "results": [
    {
      "documentId": "doc_123",
      "title": "Health Insurance 2025",
      "sectionId": "sec_1",
      "sectionName": "Policies",
      "folderId": "fld_1",
      "folderName": "Family",
      "matchedInTitle": true,
      "matchedInOcr": true,
      "matchingAttachments": [
        {
          "attachmentId": "att_1",
          "filename": "scan.pdf",
          "ocrStatus": "COMPLETED",
          "snippet": "...insurance contract number..."
        }
      ]
    }
  ]
}
```

## 4.2 OCR Workflow
### Endpoints
- `GET /ocr/attachments/:attachmentId`
- `POST /ocr/attachments/:attachmentId/start`
- `POST /ocr/attachments/:attachmentId/complete`
- `POST /ocr/attachments/:attachmentId/fail`

### DTOs
- `complete` body:
```json
{ "ocrText": "...extracted text..." }
```
- `fail` body:
```json
{ "error": "OCR engine timeout" }
```

### Allowed Status Transitions
- `PENDING -> PROCESSING`
- `PROCESSING -> COMPLETED`
- `PROCESSING -> FAILED`
- `FAILED -> PROCESSING` (retry)

### Transition Enforcement
- Invalid transition: `400 Bad Request`
- Missing attachment: `404 Not Found`
- Concurrent status update detected: `409 Conflict`

### Failure Handling
- On failure, `ocrStatus=FAILED`, `ocrError` is stored.
- Retry uses `/start` from `FAILED`.
- Retry start clears `ocrError` and old `ocrText` to prevent stale search hits.

## 4.3 Retention Review Due
### Endpoint
`GET /retention/review-due?householdId=<id>&asOf=<ISO8601>&limit=<n>&offset=<n>`

### Query DTO
- `householdId` (required, non-empty)
- `asOf` (optional ISO-8601, default now)
- `limit` (optional, default `50`, max `200`)
- `offset` (optional, default `0`)

### Behavior
Request performs two steps:
1. Sync retention statuses for the household.
2. Return due documents (`retentionDate <= asOf` and `retentionStatus=REVIEW_DUE`).

### Sync Rules
- `retentionDate IS NULL` and status in `(ACTIVE, REVIEW_DUE)` -> `NONE`
- `retentionDate > asOf` and status in `(NONE, REVIEW_DUE)` -> `ACTIVE`
- `retentionDate <= asOf` and status in `(NONE, ACTIVE)` -> `REVIEW_DUE`

### Important Boundary
No automatic deletion is performed. This endpoint is for visibility and review queues only.

## 5. Local Setup

## 5.1 Prerequisites
- PostgreSQL available locally
- Node.js + package manager used by your team setup
- Prisma CLI available through project scripts or local tooling

## 5.2 Environment
Set `DATABASE_URL` to a PostgreSQL database.

Example:
```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/seiridesk"
```

## 5.3 Database Preparation
From repository root:
```bash
cd apps/api
# generate client
pnpm prisma generate
# apply migrations (or create initial schema in dev)
pnpm prisma migrate dev
```

## 5.4 Seed Minimum Test Data
Ensure you have:
- At least one household
- Folder/Section/Document records in that household
- At least one attachment linked to a document

Recommended state for fast checks:
- one attachment in `PENDING`
- one attachment in `COMPLETED` with non-empty `ocrText`
- one document with `retentionDate` in the past

## 6. Validation Checklist

## 6.1 OCR Flow
1. `POST /ocr/attachments/:id/start` on `PENDING` attachment -> expect `PROCESSING`.
2. `POST /ocr/attachments/:id/complete` with text -> expect `COMPLETED` + persisted `ocrText`.
3. Invalid transition (e.g. complete twice) -> expect `400`.
4. Retry path: fail then start -> expect `FAILED -> PROCESSING`.

## 6.2 Search
1. Query by title term -> document returned.
2. Query by OCR term -> document returned with attachment snippet.
3. Query with wrong householdId -> no cross-household results.

## 6.3 Retention
1. Set document retention date in past.
2. Call `GET /retention/review-due`.
3. Verify status sync and due list inclusion.
4. Verify no deletion side effects.

## 7. Operational Notes

## 7.1 Performance Characteristics
- Search currently uses case-insensitive `contains` filters.
- For large OCR corpora this will degrade without indexing/FTS.
- Retention endpoint performs write operations (`updateMany`) before read.

## 7.2 Security/Access Boundaries
- Household scoping is enforced in search and retention queries.
- Authentication/authorization integration is expected at higher layers (controller guards/middleware).

## 7.3 Observability Recommendations
Track at minimum:
- OCR transition counts per status
- OCR failures by error category
- Search latency and result counts
- Retention sync update counts per request

## 8. Safe Extension Guide

## 8.1 Extend OCR Safely
- Keep transitions explicit in one map (`ALLOWED_TRANSITIONS`).
- Add status transitions with migration + API contract update.
- Preserve concurrency guard (`updateMany` with previous status condition).

## 8.2 Extend Search Safely
- Keep existing response keys backward-compatible.
- Add optional filters (date/folder/section) as additive query params.
- If introducing ranking/FTS, keep endpoint contract stable.

## 8.3 Extend Retention Safely
- Do not add auto-delete in same endpoint.
- If policy workflows are added, separate evaluation from destructive actions.
- Keep `REVIEWED_*` statuses protected from accidental overwrite.

## 9. Known Limitations
- No external search index
- No async job queue orchestration in current MVP path
- Retention sync is request-driven, not scheduled
- No built-in auth guard integration in these modules yet

## 10. Ownership and Next Steps
Current implementation is intentionally boring and MVP-first.
Recommended next iteration sequence:
1. Add automated tests for transition matrix and retention sync rules.
2. Add API module integration tests with seeded Prisma data.
3. Introduce optional background scheduler for retention sync.
4. Evaluate PostgreSQL FTS as a non-breaking search backend upgrade.
