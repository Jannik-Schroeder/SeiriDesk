# SeiriDesk - UI/UX Concept

## Visual Direction
- Minimal, document-focused interface with strong whitespace.
- Primary palette:
  - Background: white and light neutral surfaces.
  - Accent: subtle green for active states and highlights.
  - Text: high-contrast dark neutral.
- Avoid ornamental styling; emphasize clarity and hierarchy.

## Interaction Patterns
- Structure-first interactions: users navigate physical hierarchy before document details.
- Progressive disclosure:
  - Show essentials first (name, section, date, retention flag).
  - Expand for metadata/history/details only when needed.
- Fast capture flow:
  - "Add Scan" should require minimal input and support later classification.

## Navigation Model
- Primary nav by hierarchy:
  - Household -> Location (optional) -> Shelf (optional) -> Folder -> Section.
- Breadcrumbs always visible to preserve spatial context.
- Folder-level workspace as primary screen:
  - section list (left)
  - document list (center)
  - document detail panel (right or modal)

## Drag and Drop Behavior
- Drag-and-drop enabled for:
  - moving documents between sections in same folder
  - optionally between folders (with confirmation)
  - reordering sections
- During drag:
  - clear drop targets
  - keyboard alternative for accessibility
  - conflict-safe updates (server authoritative order write)

## Section Reorder Behavior
- Reordering is explicit and immediate with optimistic UI.
- Persist order as stable `sort_index` sequence.
- On collision/conflict:
  - server returns canonical order
  - client refreshes without losing user intent.
- Audit reorder operations for traceability.

## Minimal Design Principles
- One primary action per view.
- Avoid dense toolbars and multi-column clutter.
- Use consistent spacing scale and typography rhythm.
- Limit color semantics:
  - green: active/confirm
  - amber: retention review
  - red: destructive action

## Accessibility Considerations
- Full keyboard navigation for core CRUD and reordering alternatives.
- Visible focus indicators (never removed).
- Contrast ratios at WCAG AA minimum.
- Screen-reader-friendly hierarchy labels (location/shelf/folder/section context).
- Drag-and-drop alternatives:
  - "Move to..." command
  - "Move up/down" controls for section ordering.
- Clear status text for OCR processing, retention alerts, and permission errors.

