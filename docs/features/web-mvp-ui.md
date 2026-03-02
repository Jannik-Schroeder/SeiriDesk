# Web MVP UI Overview

## Scope
- Minimal, single-user MVP UI for the document hierarchy:
  - Folder list + folder detail
  - Sections inside folders with reorder interaction
  - Documents inside sections
  - Document detail with attachment upload UI
  - Basic search over title + OCR text
  - Retention date display with `review due` flag

## Routes
- `/folders`
  - Folder list entry point.
- `/folders/[folderId]`
  - Folder detail and section reorder UI.
- `/folders/[folderId]/sections/[sectionId]`
  - Documents in selected section.
- `/folders/[folderId]/sections/[sectionId]/documents/[documentId]`
  - Document details, retention panel, attachment upload interaction.
- `/search`
  - Basic search view over document title and OCR text.

## Interaction Notes
- Section reorder is implemented with accessible up/down controls.
- Reordered section order is saved in `localStorage` per folder for MVP persistence.
- Attachment upload is UI-only:
  - File picker with "Add attachment" action.
  - New files appear immediately with placeholder OCR status.
- Retention labels:
  - `review due` if date is in the past
  - `review today` if date is today
  - `review in Xd` if date is in the future

## Visual Direction
- Clean/minimal interface.
- White/light surfaces with subtle green accents for active and confirm states.
- Amber warning styling for retention due states.
