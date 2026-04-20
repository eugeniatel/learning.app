---
phase: 02-all-weeks-and-review
plan: "01"
subsystem: weeks-index
tags: [weeks, data-layer, server-component, client-island]
dependency_graph:
  requires: []
  provides: [getAllWeeksWithModules, WeekRow, WeeksList, /weeks-page]
  affects: [src/lib/data.ts, src/app/weeks/page.tsx]
tech_stack:
  added: []
  patterns: [server-component-data-fetch, client-island-state, grouped-list]
key_files:
  created:
    - src/components/week-row.tsx
    - src/components/weeks-list.tsx
  modified:
    - src/lib/data.ts
    - src/app/weeks/page.tsx
decisions:
  - getAllWeeksWithModules returns only the grouped array; currentWeekId is sourced separately from getProgress() in the page
  - WeekRow is a server component; WeeksList holds client state for confirming row (wave 2 wiring)
  - formatRange copied locally into week-row.tsx (not exported from week-header.tsx)
metrics:
  duration: ~10 min
  completed: 2026-04-20
  tasks: 2
  files: 4
---

# Phase 2 Plan 01: Weeks Index Summary

Replaced the /weeks ComingSoon stub with a real grouped weeks list: `getAllWeeksWithModules` helper in data.ts, `WeekRow` server component, `WeeksList` client island, and the /weeks page server component.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Add getAllWeeksWithModules to data.ts | f925948 |
| 2 | Build WeekRow, WeeksList, replace /weeks stub | c0d4b9d |

## What Was Built

`getAllWeeksWithModules` in `src/lib/data.ts`: fetches progress and modules in parallel, groups weeks by moduleId, sorts weeks within each group by startDate descending, filters out empty groups, sorts groups by most-recent week first.

`WeekRow` (`src/components/week-row.tsx`): server component showing week number, date range (via local formatRange copy), module title, session done/total count, and a "Current" badge inline when isCurrent is true. Accepts an onClick prop for wave 2 confirmation wiring.

`WeeksList` (`src/components/weeks-list.tsx`): client island that manages `confirmingWeekId` state (declared for wave 2, unused in this plan). Renders "All weeks" heading, module group labels with uppercase tracking, WeekRow list per group, and the empty state "No weeks recorded yet."

`/weeks page` (`src/app/weeks/page.tsx`): server component that fetches groups and progress in parallel, passes to WeeksList with currentWeekId.

## Verification

- `pnpm exec tsc --noEmit` exits 0
- `curl http://localhost:3000/weeks` returns 200
- Week 1 renders under module group label
- "Current" badge appears on week 1 (w1 matches progress.currentWeek.id)
- "1/4 sessions done" visible in row

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

`confirmingWeekId` state in WeeksList is declared but produces no UI effect. The onClick handler sets it but no confirmation strip is rendered. This is intentional: the confirmation strip (WeekSwitchConfirm) is wave 2 work, planned in a separate plan.

## Threat Surface Scan

No new network endpoints, auth paths, or schema changes introduced. /weeks reads the same local files (progress.json, module markdown) as other pages. No new threat surface beyond what was already accepted in the plan's threat model (T-02-01, T-02-02).

## Self-Check: PASSED

- src/components/week-row.tsx: FOUND
- src/components/weeks-list.tsx: FOUND
- src/lib/data.ts (getAllWeeksWithModules): FOUND
- src/app/weeks/page.tsx: FOUND
- Commit f925948: FOUND
- Commit c0d4b9d: FOUND
