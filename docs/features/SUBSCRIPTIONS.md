# SUBSCRIPTIONS Feature Guide

## Purpose
This document is the onboarding guide for developers working on the `SUBSCRIPTIONS` feature area.
It maps the current project structure, data model, and implementation priorities so contributors can start quickly.

## Important Note About Git Staged Changes
At the time this file was created, this workspace is not a Git repository (`.git` directory missing), so no staged diff could be inspected directly.
This guide is based on the current files present in the workspace.

## Current Scope Alignment
The current project direction is a strict v0.1 MVP:
- Single-user first
- Physical-first structure:
  - Folder -> Section -> Document -> Attachment (optional)
- OCR text extraction
- Search over title + OCR text
- Retention date per document

Non-MVP items (multi-user permissions, advanced hierarchy, advanced search) are intentionally deferred.

## Where to Read First
Planning documents are in:
- `docs/planning/01_Vision_and_Principles.md`
- `docs/planning/02_Feature_Specification_MVP.md`
- `docs/planning/03_Data_Model_Architecture.md`
- `docs/planning/04_System_Architecture.md`
- `docs/planning/05_UI_UX_Concept.md`
- `docs/planning/06_Roadmap_and_Phases.md`
- `docs/planning/07_Prisma_Schema_and_Monorepo_Structure.md`
- `docs/planning/08_Phase1_Migration_Strategy.md`

## Monorepo Structure
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
  /ui
/infra
  /docker
  /scripts
/docs
  /adr
  /planning
  /features
```

## Data Model Source of Truth
- Main schema: `apps/api/prisma/schema.prisma`

### MVP-relevant models
- `Folder`
- `Section` (`position` controls reorder)
- `Document` (`retentionDate`, `retentionStatus`)
- `Attachment` (`ocrStatus`, `ocrText`)

### Phase 2/3 prepared models
- `Job`
- `User`, `Household`, `Membership`
- `PermissionEntry`
- `AuditLog`
- `Location`, `Shelf`

## Development Priorities
1. Build stable CRUD for Folder, Section, Document, Attachment.
2. Implement reliable section reorder persistence.
3. Implement attachment upload and OCR status updates.
4. Implement search endpoint (title + OCR text).
5. Surface retention date and review-due state in UI.

## API Module Plan (apps/api/src/modules)
- `folders`
- `sections`
- `documents`
- `attachments`
- `search`
- `retention`

Defer for later:
- `permissions`
- `households`
- `memberships`
- advanced `audit`

## Frontend Module Plan (apps/web)
- App Router pages for:
  - folder list
  - folder detail with section list
  - document detail panel/form
  - upload interaction for attachment
  - simple search view

## Suggested First Tasks for New Developers
1. Read all docs in `docs/planning/`.
2. Review `apps/api/prisma/schema.prisma`.
3. Create first API vertical slice:
   - Folder create/list/update/delete
4. Add section ordering endpoint and persistence.
5. Add minimal search endpoint against title + OCR text.

## Definition of Ready for Contributions
- Feature has a clear MVP boundary.
- Data changes have migration impact documented.
- API contract and acceptance criteria are listed before coding.

## Definition of Done for this Feature Area
- End-to-end flow works:
  - create folder -> create section -> create document -> upload attachment -> find via search.
- Retention date can be set and shown as due when expired.
- No Phase 2/3 complexity introduced into MVP APIs.
