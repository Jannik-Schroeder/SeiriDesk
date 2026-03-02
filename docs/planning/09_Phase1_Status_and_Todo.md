# SeiriDesk - Phase 1 Status and To-Do Alignment

## Purpose
This document aligns current implementation status with Phase 1 goals from:
- `docs/planning/02_Feature_Specification_MVP.md`
- `docs/planning/06_Roadmap_and_Phases.md`
- `docs/planning/08_Phase1_Migration_Strategy.md`

## Snapshot
- Date: 2026-03-02
- Branch baseline: `master` and all `codex/*` branches aligned to commit `6c930f2`.

## Phase 1 Deliverables: Status

### 1. Folder CRUD (`name` required, `number` optional)
Status: **Partially done**
- API module exists (`folders.controller/service/dto`).
- Schema supports required/optional fields.
- Missing: executable API app bootstrap and verified runtime integration.

### 2. Section CRUD + reorder
Status: **Partially done**
- API module and transactional reorder logic exist.
- Unique index strategy is implemented in schema (`folderId + position`).
- Missing: runtime validation under real concurrent load and automated tests.

### 3. Document CRUD
Status: **Partially done**
- API module exists with DTO/service/controller structure.
- Missing: executable runtime and integration tests.

### 4. Optional attachment upload per document
Status: **Partially done**
- Attachment metadata CRUD exists in API.
- UI supports local placeholder upload behavior.
- Missing: real file upload pipeline (multipart handling + persistent storage backend wiring).

### 5. Retention date + review due
Status: **Partially done**
- Schema fields present (`retentionDate`, `retentionStatus`).
- Retention endpoint exists and returns due items.
- UI shows due indicator.
- Missing: migration + seed + end-to-end runtime verification.

### 6. OCR extraction + basic search (title + OCR text)
Status: **Partially done**
- OCR status workflow endpoint set exists.
- Search endpoint exists and queries title + OCR text.
- Missing: real OCR worker integration and runtime tests.

### 7. Clean minimal UI
Status: **Partially done**
- Next.js route/component structure and MVP screens exist.
- Design direction is clean/minimal.
- Missing: integration with backend APIs (current UI uses in-memory data for core flow).

## Critical Gaps Blocking "Phase 1 Done"
1. **API runtime bootstrap missing**
- No NestJS app entrypoint/module wiring yet (`main.ts`, `app.module.ts`, real startup pipeline).

2. **Web runtime bootstrap missing**
- No full Next.js project bootstrap artifacts/config validation yet.

3. **Dependencies/tooling are placeholders**
- Workspace manifests exist, but scripts currently echo placeholder text.

4. **No Prisma migration files and no seed script in repo**
- Schema exists, but migration execution artifacts and repeatable seed are missing.

5. **No test suite for MVP contracts**
- No unit/integration/concurrency tests for reorder, OCR transitions, retention queries, and search.

## Ordered To-Do Plan (Execution Backlog)

### Priority A: Make project runnable
1. Add real NestJS bootstrap (`apps/api/src/main.ts`, root app module, module registration).
2. Add real Next.js bootstrap/config (`next.config`, tsconfig, app startup scripts).
3. Replace placeholder workspace scripts with actual commands.
4. Install dependencies and verify:
   - `npm run dev:api`
   - `npm run dev:web`

### Priority B: Data lifecycle
1. Create initial Prisma migration from `schema.prisma`.
2. Add deterministic seed script (household/user/folder/section/document/attachment sample).
3. Verify migration + seed from empty DB.

### Priority C: Connect UI to API
1. Replace `apps/web/components/mvp-data.ts` static data path with API-backed data fetches.
2. Wire section reorder UI to section reorder API.
3. Wire attachment uploader to real attachment endpoint.
4. Wire search page to `/search` endpoint.

### Priority D: Validate MVP behavior
1. Add unit tests for section reorder and OCR state machine.
2. Add integration tests for core flow:
   - Folder -> Section -> Document -> Attachment
   - OCR -> Search
   - Retention review-due
3. Add manual smoke checklist to CI docs and PR template.

## Definition of Done Check (Phase 1)
Phase 1 is complete only if all points are true:
- Real API and Web apps boot locally.
- Prisma migration and seed run on empty DB.
- End-to-end MVP flow works against real backend (no mock-only path).
- Section reorder persists through API and survives refresh.
- OCR text is persisted and searchable.
- Retention due indicator matches backend due query.
- Minimum test coverage exists for critical invariants.
