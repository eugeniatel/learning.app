---
phase: "02"
plan: "04"
subsystem: weeks-detail
tags: [routing, navigation, week-switching]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [weeks-detail-route, link-based-week-navigation]
  affects: [weeks-list, week-row, week-switch-confirm]
tech_stack:
  added: []
  patterns: [next-app-router-dynamic-segment, optional-callback-props, server-component-404]
key_files:
  created:
    - src/app/weeks/[id]/page.tsx
  modified:
    - src/components/week-row.tsx
    - src/components/weeks-list.tsx
    - src/components/week-switch-confirm.tsx
decisions:
  - WeekSwitchConfirm callbacks made optional so the same component works in both list (inline) and detail page (standalone) contexts; router.push("/weeks") is the fallback for both cancel and success on the detail page
  - WeekRow onClick/confirmingWeekId state fully removed; row is a plain Link, simplifying WeeksList to a pure server-renderable component (no "use client" needed)
  - Inline type used for params in page.tsx rather than PageProps<"/weeks/[id]"> because the route was not yet in the generated types at creation time; next typegen was run after file creation and tsc passed clean
metrics:
  duration_minutes: 12
  completed: "2026-04-19"
  tasks_completed: 2
  files_changed: 4
---

# Phase 02 Plan 04: Per-week detail page and repositioned switch action - Summary

Per-week detail route at `/weeks/[id]` showing sessions read-only, with the "Switch to this week" confirmation moved from the list to the detail page; rows on /weeks are now real Next.js Links.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build /weeks/[id]/page.tsx and switch affordance | d755847 | src/app/weeks/[id]/page.tsx, src/components/week-switch-confirm.tsx |
| 2 | Convert WeekRow to Link and simplify WeeksList | b74b0ca | src/components/week-row.tsx, src/components/weeks-list.tsx |

## Verification Results

- `/weeks/w1` returns 200 with sessions rendered and "This is your current week." copy
- `/weeks/w999` returns 404 via notFound()
- `/weeks` rows contain `href="/weeks/w1"` (confirmed via curl grep)
- tsc --noEmit exits 0 (clean)
- /, /concepts, /review all return 200 (no regressions)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] WeekSwitchConfirm had required onCancel/onSuccess props**
- Found during: Task 1
- Issue: The component required both callbacks, which assumed a parent-managed state machine. On the detail page there is no parent state to call back into.
- Fix: Made both props optional. When absent, success routes to `/weeks` via router.push + router.refresh, cancel routes to `/weeks` via router.push.
- Files modified: src/components/week-switch-confirm.tsx
- Commit: d755847

**2. [Rule 3 - Blocking issue] PageProps<"/weeks/[id]"> unresolved before typegen**
- Found during: Task 1
- Issue: The route wasn't registered in .next/types/routes.d.ts until the file existed.
- Fix: Used an inline params type in page.tsx, then ran `next typegen` to register the route. tsc passed clean after typegen.
- Files modified: src/app/weeks/[id]/page.tsx

## Known Stubs

None. All data is wired from progress.json via getProgress() and getArtifacts().

## Threat Flags

None. This plan adds a read-only detail page and a navigation refactor. No new network endpoints or auth paths introduced. The switch action was already in place from 02-02.

## Self-Check: PASSED

- src/app/weeks/[id]/page.tsx: FOUND
- src/components/week-row.tsx: FOUND (Link import confirmed)
- src/components/weeks-list.tsx: FOUND (no confirmingWeekId)
- src/components/week-switch-confirm.tsx: FOUND (optional callbacks)
- Commit d755847: FOUND
- Commit b74b0ca: FOUND
