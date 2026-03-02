# SeiriDesk - Roadmap and Phases

## Delivery Strategy
- Release early with a narrow, working core.
- Keep architecture intentionally simple in early versions.
- Move non-essential features to later phases by default.

## Phase 0: Planning
### Goals
- Freeze strict MVP scope.
- Confirm the simplest architecture for fast delivery.
- Define only the required data model.

### Deliverables
- Final MVP specification (scope lock).
- Data model draft for Folder, Section, Document, Attachment.
- Basic UX wireframes for list/detail and intake flow.
- Setup documentation for local self-hosted development.

## Phase 1: Core Structure
### Goals
- Ship SeiriDesk v0.1 in about 4 weeks as a single-user product.
- Validate physical-first structure with real usage.

### Deliverables
- Folder CRUD (`name` required, `number` optional).
- Section CRUD inside folders + section reorder.
- Document CRUD inside sections.
- Optional attachment upload per document.
- Retention date per document (`review due` indicator).
- OCR extraction and basic search (title + OCR text).
- Clean minimal UI (desktop-first, responsive baseline).

## Phase 2: Scanning + Search
### Goals
- Improve scanning reliability and retrieval quality.
- Remove friction in daily intake.

### Deliverables
- Better OCR queue handling and retry behavior.
- Improved search UX (highlighting, better relevance, quick filters).
- Faster scan-to-document assignment workflows.
- Duplicate detection based on file checksum.

## Phase 3: Permissions
### Goals
- Introduce family/multi-user support after core workflow is stable.
- Add privacy boundaries without overcomplicating first release.

### Deliverables
- Multi-user accounts and household concept.
- Basic roles (Owner/Admin/Member/Viewer).
- Structure-level access rules (start simple, no complex ACL matrix).
- Essential audit events for sensitive actions.

## Phase 4: Polishing
### Goals
- Prepare for wider FOSS adoption and contributor growth.
- Harden operations and UX quality.

### Deliverables
- Accessibility pass (keyboard, screen readers, contrast).
- Performance tuning for larger datasets and OCR-heavy usage.
- Backup/restore workflow documentation.
- Docker Compose production profile and ops guides.
- Improved onboarding docs and contribution guides.

## Long-Term Ideas
- Location and Shelf hierarchy levels (optional).
- Advanced retention policies and reminder automations.
- External search backend option (OpenSearch/Meilisearch).
- Mobile companion app for camera-first capture.
- Integrations with home server ecosystems.
- Plugin/events ecosystem for extensions.

## Exit Criteria by Phase
- Each phase should end with:
  - tagged release
  - migration-safe schema changes
  - updated user/admin docs
  - regression test coverage for added workflows
