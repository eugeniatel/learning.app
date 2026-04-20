---
phase: 01-concept-detail-and-notes
plan: "03"
subsystem: notes
tags: [notes, server-action, client-component, fs]
dependency_graph:
  requires: [01-02]
  provides: [note-persistence, note-editor-ui]
  affects: [src/app/concepts/[slug]/page.tsx]
tech_stack:
  added: []
  patterns: [server-action-wrapper, client-island, gray-matter-frontmatter]
key_files:
  created:
    - src/lib/notes.ts
    - src/lib/actions/save-note.ts
    - src/components/note-editor.tsx
  modified:
    - src/app/concepts/[slug]/page.tsx
decisions:
  - "Server action split: saveNote() in notes.ts (testable, no directive), saveNoteAction() in actions/save-note.ts (use server file)"
  - "Slug validation added in saveNote() per threat model T-03-03: /^[a-z0-9-]+$/ guard before fs.writeFile"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-19"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
---

# Phase 01 Plan 03: Per-Concept Note Saving Summary

Per-concept markdown notes with gray-matter frontmatter, client textarea island, and Next.js server action write path.

## What Was Built

- `src/lib/notes.ts`: two exports: `readNote(slug)` returns the note body (empty string if file missing), `saveNote(slug, conceptId, body)` writes `notes/<slug>.md` with `conceptId` and `updatedAt` frontmatter. Slug validated against `/^[a-z0-9-]+$/` before any path construction.
- `src/lib/actions/save-note.ts`: thin `"use server"` file exporting `saveNoteAction`. Keeps `notes.ts` free of the server directive so it stays testable.
- `src/components/note-editor.tsx`: client island under 70 lines. State machine: `idle / saving / saved / error`. Dirty flag drives button variant (default=coral when dirty, outline when clean). "Saved" label for 2 seconds post-save then reverts.
- `src/app/concepts/[slug]/page.tsx`: `readNote(slug)` added to the `Promise.all` fetch block; `NoteEditor` replaces the Plan 03 placeholder comment. Plan 04 placeholder comment preserved.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Security] Slug validation in saveNote**
- Found during: Task 1 (threat model T-03-03 marked `mitigate`)
- Issue: plan noted slug validation as a mitigation but did not include it in the code snippet
- Fix: added `if (!SLUG_RE.test(slug)) throw new Error(...)` guard before `fs.mkdir` and `fs.writeFile`
- Files modified: src/lib/notes.ts
- Commit: a5aa0e9

## Known Stubs

None. NoteEditor reads and writes real data; no placeholders.

## Threat Flags

None. No new network endpoints or trust boundaries introduced beyond what the plan's threat model already covered.

## Self-Check: PASSED

Files exist:
- src/lib/notes.ts: FOUND
- src/lib/actions/save-note.ts: FOUND
- src/components/note-editor.tsx: FOUND

Commits exist:
- a5aa0e9: FOUND (notes.ts + save-note.ts)
- 43265f5: FOUND (note-editor.tsx + page.tsx)

TypeScript: passes with zero errors.
