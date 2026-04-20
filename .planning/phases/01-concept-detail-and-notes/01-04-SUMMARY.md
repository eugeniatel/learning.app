---
phase: 01-concept-detail-and-notes
plan: "04"
subsystem: open-question-capture
tags: [progress, questions, server-action, client-island]
dependency_graph:
  requires: [01-02, 01-03]
  provides: [open-question-capture, progress-write-helpers]
  affects: [src/app/concepts/[slug]/page.tsx]
tech_stack:
  added: []
  patterns: [optimistic-update, server-action, fs-read-write]
key_files:
  created:
    - src/lib/progress.ts
    - src/lib/actions/add-question.ts
    - src/components/open-question-capture.tsx
  modified:
    - src/app/concepts/[slug]/page.tsx
decisions:
  - Used z.infer<typeof progressSchema> as explicit type alias for writeProgress parameter instead of relying on inference, for clarity
  - Sequential readOpenQuestionsForConcept call after notFound() guard, added into a post-guard Promise.all alongside pre-computed arrays
  - Optimistic append with fire-and-forget server action call (void), no error handling in phase 1 per plan spec
metrics:
  duration_minutes: 10
  completed_at: "2026-04-20T03:51:58Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 1
---

# Phase 01 Plan 04: Open Question Capture Summary

One-liner: Progress.json read/write helpers plus an optimistic client island for parking open questions per concept.

## Tasks Completed

| Task | Name | Commit |
|------|------|--------|
| 1 | Create progress.ts helpers and addQuestionAction server action | a42bcee |
| 2 | Create OpenQuestionCapture component and wire into concept detail page | 12c9324 |

## What Was Built

`src/lib/progress.ts` provides two exports: `readOpenQuestionsForConcept(conceptId)` filters the openQuestions array from progress.json by conceptId, and `appendQuestion(question)` reads the full progress object, pushes the new question, then writes back atomically via `fs.writeFile`.

`src/lib/actions/add-question.ts` is a `"use server"` thin wrapper that calls `appendQuestion`. It receives a fully-formed `Question` object from the client (id and createdAt generated client-side via `crypto.randomUUID()` and `new Date().toISOString()`).

`src/components/open-question-capture.tsx` is a client island that accepts `conceptId` and `initialQuestions` as props. State holds the current list and the input value. On submit (button click or Enter), it builds a new Question, appends it optimistically, clears the input, and fires the server action without awaiting. The list renders above the input; when empty, only the input is shown with no empty-state message.

`src/app/concepts/[slug]/page.tsx` now imports both the component and `readOpenQuestionsForConcept`. After the `notFound()` guard, a Promise.all fetches questions alongside the pre-filtered artifacts and related concepts. The placeholder comment is replaced with `<OpenQuestionCapture conceptId={concept.id} initialQuestions={conceptQuestions} />`.

## Deviations from Plan

None. Plan executed exactly as written.

## Known Stubs

None. The component is fully wired: data flows from progress.json on load and writes back on submit.

## Threat Flags

None. No new network endpoints or trust boundaries introduced beyond what the plan's threat model covers (T-04-01 through T-04-03 all accepted).

## Self-Check: PASSED

- src/lib/progress.ts: FOUND
- src/lib/actions/add-question.ts: FOUND
- src/components/open-question-capture.tsx: FOUND
- Commit a42bcee: FOUND
- Commit 12c9324: FOUND
- pnpm tsc --noEmit: exits 0
