---
phase: 02-all-weeks-and-review
plan: "02"
subsystem: week-switching
tags: [progress, server-action, client-island, inline-confirmation]
dependency_graph:
  requires: [02-01]
  provides: [switchCurrentWeek, switchWeekAction, WeekSwitchConfirm, WeeksList-wired]
  affects: [src/lib/progress.ts, src/lib/actions/switch-week.ts, src/components/week-switch-confirm.tsx, src/components/weeks-list.tsx, src/components/week-row.tsx]
tech_stack:
  added: []
  patterns: [server-action-thin-wrapper, client-island-status-machine, escape-keydown-effect]
key_files:
  created:
    - src/lib/actions/switch-week.ts
    - src/components/week-switch-confirm.tsx
  modified:
    - src/lib/progress.ts
    - src/components/weeks-list.tsx
    - src/components/week-row.tsx
decisions:
  - Inline confirmation strip below the row (not a Dialog) — reversible low-stakes operation, matches add-question precedent
  - router.refresh() on success (no optimistic UI) — operation is infrequent, delay acceptable
  - cursor-default on current-week row via undefined onClick — no prop drilling needed, WeekRow already handled undefined onClick
metrics:
  duration: "~10 min"
  completed: "2026-04-20T16:18:57Z"
  tasks_completed: 2
  files_changed: 5
---

# Phase 02 Plan 02: Week Switch Confirmation Summary

Inline week-switching confirmation: switchCurrentWeek write helper, thin switchWeekAction server action with dual revalidation, WeekSwitchConfirm client island with idle/saving/error status machine, and WeeksList wired with Escape collapse and router.refresh on success.

## Tasks Completed

| # | Name | Commit | Key files |
|---|------|--------|-----------|
| 1 | Add switchCurrentWeek + switchWeekAction | 49d23d8 | src/lib/progress.ts, src/lib/actions/switch-week.ts |
| 2 | Build WeekSwitchConfirm + wire WeeksList | 6b60ef4 | src/components/week-switch-confirm.tsx, src/components/weeks-list.tsx, src/components/week-row.tsx |

## What Was Built

- `switchCurrentWeek(weekId)` in progress.ts: reads progress.json, validates weekId exists in weeks array, updates currentWeek object, writes back.
- `switchWeekAction` in src/lib/actions/switch-week.ts: thin "use server" wrapper, calls switchCurrentWeek, revalidates "/" and "/weeks".
- `WeekSwitchConfirm` client island: renders confirmation strip (bg-muted/60, rounded-b-xl) with "Switch to this week?" prompt, "Yes, switch" (variant default) and "Keep current" (variant ghost) buttons. Manages idle/saving/error status. Error copy: "Could not switch week. Try again."
- `WeeksList` updated: imports WeekSwitchConfirm and useRouter, adds Escape keydown handler via useEffect, wraps each week row + strip in a flex-col div, passes undefined onClick to current week (prevents confirmation on self-click), calls router.refresh() on success.
- `WeekRow` updated: cursor class is conditional — cursor-pointer when onClick is defined, cursor-default otherwise.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All data paths are wired to real progress.json reads/writes.

## Threat Surface Scan

No new network endpoints or auth paths introduced. switchWeekAction validates weekId server-side against progress.weeks before writing (T-02-03 mitigation in place).

## Self-Check

- [x] src/lib/progress.ts contains `switchCurrentWeek` export
- [x] src/lib/actions/switch-week.ts exists with `"use server"` on line 1 and two revalidatePath calls
- [x] src/components/week-switch-confirm.tsx exists with `"use client"`, `switchWeekAction` import, error copy
- [x] src/components/weeks-list.tsx imports WeekSwitchConfirm, useRouter, useEffect
- [x] pnpm tsc --noEmit passes
- [x] Commits 49d23d8 and 6b60ef4 exist

## Self-Check: PASSED
