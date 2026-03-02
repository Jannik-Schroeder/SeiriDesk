# SeiriDesk - System Architecture

## Monorepo Structure
Recommended monorepo layout (NestJS + Next.js + shared packages):

```text
/apps
  /api              # NestJS backend
  /web              # Next.js App Router frontend
/packages
  /ui               # shared UI primitives (shadcn wrappers)
  /config           # shared ts/eslint/prettier/tailwind config
  /types            # shared domain types and event contracts
  /utils            # cross-app utilities
/infra
  /docker           # compose, local infra setup
  /migrations       # DB bootstrap and operational scripts
/docs               # optional additional architecture docs
```

## Backend Module Breakdown (NestJS)
- `auth` module: login/session/token lifecycle.
- `households` module: household/workspace lifecycle.
- `users-memberships` module: users, invites, role assignment.
- `locations-shelves` module: optional physical containers.
- `folders` module: required anchor entity; numbering logic.
- `sections` module: ordering and drag/drop persistence.
- `documents` module: metadata and retention fields.
- `attachments` module: file metadata + storage adapter.
- `ocr` module: OCR job orchestration and status updates.
- `search` module: indexing and query API.
- `permissions` module: RBAC + optional ACL evaluation.
- `audit` module: immutable action log.
- `events` module: internal event bus + outbox integration.

## API Layering
### Presentation Layer
- REST endpoints (versioned, e.g. `/api/v1`).
- DTO validation and serialization.

### Application Layer
- Use-case services orchestrating business operations.
- Transaction boundaries and permission checks.

### Domain Layer
- Core entities/value objects and invariants.
- Domain events emitted on state transitions.

### Infrastructure Layer
- Prisma repositories, storage providers, queue adapters, search adapters.

## Job Processing (OCR, Indexing)
- Queue backend:
  - Preferred: Redis + BullMQ for async processing.
  - Fallback: in-process queue for minimal deployments.
- Job types:
  - `ocr.extract_text`
  - `search.reindex_document`
  - `retention.evaluate_due`
- Reliability:
  - Retry policy with exponential backoff.
  - Dead-letter queue for repeated failures.
  - Idempotency key based on attachment/document ID + version hash.

## Search Architecture
### MVP Recommendation
- PostgreSQL full-text search for metadata + OCR text.
- Indexed fields:
  - document title
  - notes
  - folder/section names
  - OCR extracted text
- Query behavior:
  - ranked relevance
  - household-scoped filtering
  - permission-aware result filtering before response.

### Future Upgrade Path
- Abstract search service to allow migration to OpenSearch/Meilisearch without API break.

## Storage and File Handling
- Attachment binary storage abstraction:
  - Local filesystem driver for self-hosting default.
  - S3-compatible driver for larger deployments.
- Store only path/object key in database, never full binary blobs in primary tables.

## Future Extensibility
- Event-driven seams ready for:
  - automations and notifications
  - external connectors
  - retention policy engines
  - analytics dashboards
- Outbox pattern ensures reliable downstream processing.
- Keep contracts in shared package (`packages/types`) to avoid drift.

## Operational Notes
- Default deployment target: Docker Compose for single-host installations.
- Stateless web/API services with persistent PostgreSQL volume.
- Optional Redis service can be enabled when OCR and indexing load increases.

