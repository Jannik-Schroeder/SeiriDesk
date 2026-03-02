# SeiriDesk - Data Model Architecture

## Entity Definitions
### Household
- Represents one family workspace.
- Key fields: `id`, `name`, `created_at`.

### User
- Authenticated person with access to one or more households.
- Key fields: `id`, `email`, `display_name`, `status`.

### Membership
- Joins User to Household with a role.
- Key fields: `id`, `household_id`, `user_id`, `role`.

### Location (optional)
- Highest physical grouping (e.g., "Basement", "Office").
- Key fields: `id`, `household_id`, `name`, `description`.

### Shelf (optional)
- Child of Location or root-level within Household when Location not used.
- Key fields: `id`, `household_id`, `location_id (nullable)`, `name`.

### Folder (required anchor)
- Required container for sections and documents.
- Key fields: `id`, `household_id`, `shelf_id (nullable)`, `name`, `number (nullable)`.

### Section
- Ordered subdivisions inside a folder.
- Key fields: `id`, `folder_id`, `name`, `sort_index`.

### Document
- Metadata record for a paper document.
- Key fields:
  - `id`, `section_id`, `title`
  - `document_date (nullable)`
  - `retention_until (nullable)`
  - `retention_policy_label (nullable)`
  - `notes (nullable)`

### Attachment
- File linked to a document (scan/image/pdf).
- Key fields:
  - `id`, `document_id`, `storage_path`, `mime_type`, `size_bytes`
  - `ocr_status`, `ocr_text (nullable)`, `checksum`

### Permission Override (optional in MVP, recommended schema-ready)
- Fine-grained ACL entry for explicit allow/deny.
- Key fields: `id`, `resource_type`, `resource_id`, `subject_type`, `subject_id`, `effect`.

### Audit Log
- Immutable record for high-risk actions.
- Key fields: `id`, `actor_user_id`, `action`, `resource_type`, `resource_id`, `timestamp`, `metadata_json`.

## Relationships
- Household `1:N` Membership, Location, Shelf, Folder.
- User `1:N` Membership.
- Location `1:N` Shelf.
- Shelf `1:N` Folder.
- Folder `1:N` Section.
- Section `1:N` Document.
- Document `1:N` Attachment.
- Resource entities `1:N` Permission Override.

## Constraints
- Folder `name` is required and must be non-empty.
- Folder `number` is optional; if provided, enforce uniqueness within folder sibling scope.
- Section `sort_index` unique per `folder_id`.
- Deleting a folder is restricted if child sections/documents exist unless explicit cascade workflow is used.
- Attachment checksum can be unique per household to identify duplicate uploads.
- All entities are tenant-scoped by `household_id` for strong isolation.

## Retention Logic Concept
- Retention is document-centric and policy-light in MVP.
- States:
  - `NO_RETENTION`: no date set.
  - `ACTIVE_RETENTION`: date in the future.
  - `REVIEW_DUE`: current date >= `retention_until`.
  - `ARCHIVED_RETAINED`: manually reviewed and kept.
- System behavior:
  - Daily job marks `REVIEW_DUE` candidates.
  - UI surfaces due items in a retention inbox.
  - No automatic deletion in MVP; all destructive actions remain manual and auditable.

## Permission Model Overview
- Baseline model: role-based access control (RBAC) at household level.
- Roles:
  - `OWNER`: full control, household settings, member management.
  - `ADMIN`: structure/document management, cannot transfer ownership.
  - `MEMBER`: create/edit within granted scopes.
  - `VIEWER`: read-only access to granted scopes.
- Optional ACL overrides:
  - Enable private folders/sections/documents for selected users.
  - Evaluation order: explicit deny > explicit allow > inherited role.

## Event Concepts
SeiriDesk should emit domain events for decoupling and future extensions.

### Core Domain Events
- `folder.created`
- `folder.renumbered`
- `section.reordered`
- `document.created`
- `document.updated`
- `attachment.uploaded`
- `attachment.ocr.completed`
- `retention.review_due`
- `permission.changed`

### Event Handling Strategy
- Internal event bus in backend modules for in-process handlers.
- Outbox pattern recommended for reliable external integration in later phases.
- Idempotent consumers required for OCR/indexing jobs.

