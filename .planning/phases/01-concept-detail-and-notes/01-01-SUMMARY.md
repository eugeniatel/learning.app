---
phase: 01-concept-detail-and-notes
plan: 01
subsystem: concepts-index
tags: [concepts, index, filter, client-island]
dependency_graph:
  requires: []
  provides: [concepts-index-route, ConceptCard, ConceptIndex, getConceptsGroupedByModule]
  affects: [src/lib/data.ts, src/app/concepts/page.tsx]
tech_stack:
  added: []
  patterns: [server-page-with-client-island, grouped-data-fetch]
key_files:
  created:
    - src/components/concept-card.tsx
    - src/components/concept-index.tsx
  modified:
    - src/lib/data.ts
    - src/app/concepts/page.tsx
decisions:
  - ConceptIndex is the sole client component; ConceptCard stays a Server Component (no interactivity needed)
  - Filter is in-memory client state, no URL params, no debounce (76 items is fast enough)
  - Shell width unchanged at max-w-3xl; no override needed for index layout
metrics:
  duration: ~5 minutes
  completed: 2026-04-20
  tasks_completed: 2
  files_changed: 4
---

# Phase 1 Plan 01: Concepts Index Summary

Concepts index page with client-side title filter and grouped-by-module layout replacing the coming-soon stub.

## What Was Built

- `getConceptsGroupedByModule()` added to `src/lib/data.ts`: fetches all 76 concepts and all modules in parallel, groups concepts under their module, filters out empty groups, returns in module order (main track ascending, interpretability ascending)
- `ConceptCard` (server component): full-width link row with concept title (15px 500) and truncated one-liner (13px muted)
- `ConceptIndex` (client island): `useState` filter input, case-insensitive title match, module group headers, no-results state, renders `ConceptCard` per concept
- `src/app/concepts/page.tsx`: server page fetching `getProgress` + `getConceptsGroupedByModule` in parallel, passes groups to `ConceptIndex`, `ComingSoon` stub removed

## Verification

- `pnpm tsc --noEmit` exits 0
- `curl http://localhost:3000/concepts` returns 200
- All 76 concepts render grouped under module headings
- Filter input narrows results case-insensitively
- "No concepts match that title." renders when filter has no matches

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 9db0eea | feat(01-01): add getConceptsGroupedByModule and ConceptCard |
| 2 | bd12d69 | feat(01-01): build ConceptIndex client island, replace concepts stub |

## Self-Check: PASSED

- src/lib/data.ts: modified, getConceptsGroupedByModule present
- src/components/concept-card.tsx: created, Server Component, links to /concepts/[slug]
- src/components/concept-index.tsx: created, "use client" on line 1, useState filter
- src/app/concepts/page.tsx: ComingSoon removed, getConceptsGroupedByModule wired
- Commits 9db0eea and bd12d69 present in git log
