---
phase: 03-writeback-actions
plan: "04"
subsystem: questions-queue
tags: [questions, writeback, optimistic-ui, server-action]
dependency_graph:
  requires: [03-03]
  provides: [updateQuestionStatus, updateQuestionStatusAction, QuestionsQueue, ConceptQuestionGroup, QuestionItem]
  affects: [progress.json, /questions]
tech_stack:
  added: []
  patterns: [optimistic-state-map, server-action-thin-wrapper, grouped-server-data-to-client-island]
key_files:
  created:
    - src/lib/actions/update-question-status.ts
    - src/components/question-item.tsx
    - src/components/concept-question-group.tsx
    - src/components/questions-queue.tsx
  modified:
    - src/lib/progress.ts
    - src/app/questions/page.tsx
decisions:
  - QuestionsQueue holds a flat statuses map keyed by questionId for O(1) optimistic updates across all groups
  - Empty state links to /concepts using next/link for navigation consistency
  - ConceptQuestionGroup is not a client component; it receives onStatusChange from QuestionsQueue and passes it to QuestionItem
metrics:
  duration: "~10 minutes"
  completed: "2026-04-20T22:19:56Z"
  tasks_completed: 2
  files_changed: 6
---

# Phase 03 Plan 04: Questions Queue Summary

Questions queue page ships, replacing the ComingSoon stub with real grouped data and Park/Answer/Reopen write actions backed by progress.json.

## What Was Built

`updateQuestionStatus` added to `src/lib/progress.ts` reads progress.json, finds the question by id (throws if missing), sets the new status, and writes back. The server action `updateQuestionStatusAction` wraps it and calls `revalidatePath("/questions")`.

The /questions page is a server component that loads progress, concepts, and modules in parallel, groups questions by conceptId, resolves concept slug/title/moduleLabel, and passes the grouped array to the `QuestionsQueue` client island.

`QuestionsQueue` holds a flat `Record<string, QuestionStatus>` initialized from the groups prop. On action click it updates the map optimistically, awaits the server action, and on failure reverts the id and sets the error string. The error renders below all groups as `text-destructive`.

`ConceptQuestionGroup` splits questions into open/parked/answered lists. The open list renders directly; the secondary block (parked + answered) renders below at `opacity-70` with count labels ("1 parked", "2 answered").

`QuestionItem` tracks its own status in `useState` so the badge updates instantly. The buttons shown are conditional on status: Park + Answer for open, Reopen for parked/answered.

## Deviations from Plan

None - plan executed exactly as written.

The empty state adds a `/concepts` link inside the message ("Add one from any concept page.") which uses `next/link` for in-app navigation. The plan specified the text but not the link; adding the link is consistent with the plan's intent and the UI-SPEC note about linking to /concepts.

## Self-Check: PASSED

Files created/modified:
- FOUND: src/lib/progress.ts (updateQuestionStatus added)
- FOUND: src/lib/actions/update-question-status.ts
- FOUND: src/components/question-item.tsx
- FOUND: src/components/concept-question-group.tsx
- FOUND: src/components/questions-queue.tsx
- FOUND: src/app/questions/page.tsx (stub replaced)

Commits:
- 200ddb2: feat(03-04): add updateQuestionStatus to progress.ts and server action
- c2383ca: feat(03-04): build questions queue page with grouped concept view

TSC: exits 0 (no errors)
ComingSoon stub: removed from /questions page
