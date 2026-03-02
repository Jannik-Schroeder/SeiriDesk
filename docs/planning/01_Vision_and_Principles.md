# SeiriDesk - Vision and Principles

## Product Vision
SeiriDesk is a self-hosted, open-source document management system that mirrors how families organize paper in the real world.  
It is designed to make physical storage understandable digitally, so users can quickly find, manage, and retain documents without adopting enterprise-style complexity.

## Problem Statement
Most document tools are built around generic files (upload, tag, search), not real-life household organization.

- Families think in physical structures: "living room shelf, blue folder, insurance section."
- Existing tools often flatten this structure into folders/tags, creating cognitive mismatch.
- Household users need quick scan capture and reliable retrieval, but not heavy business workflows.
- Permission needs are light but essential (shared household with personal/private records).

## Target Audience
- Families and shared households managing personal and legal paperwork.
- Individuals who maintain a physical archive and want a digital mirror.
- Privacy-conscious users who prefer self-hosted infrastructure.
- FOSS users who value local control, transparent data models, and portability.

## Core Differentiation (USP)
- **Physical-first domain model**: Location -> Shelf -> Folder -> Section -> Document -> Attachment.
- **Household-native permissions**: simple family-oriented role and access controls.
- **Scan-first flow**: rapid intake from scanner/mobile scans to sortable document entries.
- **Retention-aware records**: retention period tracked per document with review workflows.
- **Minimal, calm interface**: clean UI optimized for fast sorting and retrieval.

## Design Philosophy
### 1. Mirror Reality, Do Not Abstract It Away
- Digital model should behave like physical storage habits.
- Optional levels (Location, Shelf) reduce forced complexity.
- Folder is the anchor entity and must always be named.

### 2. Simple on the Surface, Structured Underneath
- UI remains minimal and predictable.
- Data model remains strict and explicit for long-term consistency.

### 3. Self-Hosted by Default
- Runs on commodity hardware.
- No cloud dependency for core functionality.
- Clear backup/restore and migration path.

### 4. Open and Extensible
- Event-ready architecture to enable future automations and integrations.
- Vendor-neutral stack and transparent schema evolution.

### 5. Household Trust and Privacy
- Access is explicit, least-privilege by default.
- Auditability for sensitive document operations.

