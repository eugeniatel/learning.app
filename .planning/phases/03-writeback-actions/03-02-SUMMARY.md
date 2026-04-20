---
phase: 03-writeback-actions
plan: "02"
subsystem: artifact-read-status
tags: [client-component, server-action, optimistic-ui, artifact-toggle]
dependency_graph:
  requires: []
  provides: [artifact-read-status-toggle]
  affects: [artifact-chip, artifact-list, session-card]
tech_stack:
  added: []
  patterns: [optimistic-useState, server-action-fire-and-forget, atomic-json-write]
key_files:
  created:
    - src/lib/artifacts.ts
    - src/lib/actions/toggle-artifact-status.ts
  modified:
    - src/components/artifact-chip.tsx
decisions:
  - "Placed writeArtifactStatus in new src/lib/artifacts.ts (not data.ts) to keep read and write concerns separate"
  - "toggle button is a sibling to the anchor inside a div wrapper, not inside the anchor, to allow separate hit targets"
  - "optimistic flip is fire-and-forget with no visible revert on failure per UI-SPEC (single-user local tool)"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-19"
  tasks_completed: 2
  files_changed: 3
---

# Phase 03 Plan 02: Artifact Read-Status Toggle Summary

Optimistic read-status toggle on ArtifactChip: clients track local state, server action writes back to artifacts.json. Tri-state cycle (unread, in_progress, read) using grayscale lucide icons.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create artifacts.ts write helper and toggle server action | 85056c6 | src/lib/artifacts.ts, src/lib/actions/toggle-artifact-status.ts |
| 2 | Refactor ArtifactChip to client component with toggle button | 320b930 | src/components/artifact-chip.tsx |

## What Was Built

`src/lib/artifacts.ts` exports `writeArtifactStatus(artifactId, newStatus)`. It reads artifacts.json, locates the artifact by id (throws if missing), mutates readStatus, and writes back with `fs.writeFile`.

`src/lib/actions/toggle-artifact-status.ts` is a thin "use server" wrapper that calls `writeArtifactStatus` then revalidates `/` and `/concepts` layout so both the This Week view and concept detail pages reflect the new status after the next server render.

`src/components/artifact-chip.tsx` is now a client component. It tracks `readStatus` in `useState` initialized from `artifact.readStatus`. The outer container is a `<div>` flex row with two interactive zones: a `<button>` on the left (toggle) and an `<a>` on the right (link out). The toggle button calls `e.stopPropagation()` and `e.preventDefault()` so clicking it never fires the anchor. Clicking the anchor text opens `artifact.url` in a new tab as before.

Icons follow the UI-SPEC exactly: `Circle` (unread, text-muted-foreground/50, strokeWidth 1), `CircleDot` (in_progress, text-muted-foreground, strokeWidth 1.5), `CheckCircle2` (read, text-foreground/70, strokeWidth 1.5), all size-3.5 with 180ms ease-out color transition.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. The toggle wires directly to artifacts.json; no placeholder data.

## Threat Flags

No new threat surface beyond what the plan's threat model already covers (single-user local tool, no PII, no external network access).

## Self-Check: PASSED

- src/lib/artifacts.ts: exists
- src/lib/actions/toggle-artifact-status.ts: exists
- src/components/artifact-chip.tsx: updated with "use client" and toggle button
- Commit 85056c6: exists (Task 1)
- Commit 320b930: exists (Task 2)
- pnpm tsc --noEmit: exits 0 after both tasks
