# SeiriDesk - Feature Specification (MVP)

## MVP Scope
This MVP is intentionally narrow: a first usable release that one developer can ship in about 4 weeks.
It validates the physical-first core flow only.

### Included Capabilities
- Single-user application (no invites, no family roles yet).
- Core hierarchy:
  - Folder (required; name required, number optional)
  - Section (inside Folder, reorderable)
  - Document (inside Section)
  - Attachment (optional scan/file)
- CRUD for Folder, Section, Document, Attachment.
- Section reordering inside a folder (simple and reliable).
- Retention date per document (`retentionDate`, optional).
- Basic OCR extraction for attachments.
- Basic search over:
  - document title
  - OCR extracted text
- Clean, minimal web UI for quick sorting and retrieval.

## Explicitly Out of MVP
- Multi-user support, invitations, household workspaces.
- Role-based permissions and ACL overrides.
- Location and Shelf levels in the hierarchy.
- Folder renumbering workflows beyond manual edit.
- Advanced retention workflows (policy templates, automatic deletion).
- Advanced search (filters, ranking tuning, external search engines).
- Event outbox/integration mechanisms.
- Audit trail module.
- Mobile apps and external integrations.

## User Stories
- As a user, I can create folders with a required name and optional number.
- As a user, I can create sections inside a folder and reorder them.
- As a user, I can create documents inside sections.
- As a user, I can attach a scan/file to a document.
- As a user, I can search documents by title and scan text.
- As a user, I can set a retention date on a document.

## Data Behavior Rules
### Hierarchy and Integrity
- Folder is required for every document path.
- Folder `name` is mandatory and non-empty.
- Folder `number` is optional.
- Section belongs to exactly one folder.
- Document belongs to exactly one section.
- Attachment belongs to exactly one document and is optional.

### Ordering
- Section order is explicit and stored as an ordered index.
- Reordering sections updates only sibling order, not document ownership.

### Retention
- Each document can define `retentionDate` (optional).
- If `retentionDate` is in the past, document is flagged as "review due."
- No automatic deletion in MVP.

## MVP Acceptance Criteria
- A user can complete end-to-end flow:
  - create folder -> create section -> create document -> upload attachment.
- OCR text is stored and searchable.
- Search returns relevant matches from title and OCR text.
- Section reorder persists after refresh.
- Retention date can be set, edited, and shown as due when expired.
