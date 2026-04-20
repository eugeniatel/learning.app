---
phase: 02-all-weeks-and-review
plan: "03"
subsystem: review
tags: [review, server-action, client-island, progress-json]
dependency_graph:
  requires: [02-02]
  provides: [review-surface, upsertReview, getReviewQueue, submitReviewAction]
  affects: [progress.json, /review]
tech_stack:
  added: []
  patterns: [server-action-thin-wrapper, client-island-with-key-reset, opacity-fade-transition]
key_files:
  created:
    - src/lib/review.ts
    - src/lib/actions/submit-review.ts
    - src/components/review-card.tsx
    - src/components/review-queue.tsx
  modified:
    - src/lib/progress.ts
    - src/app/review/page.tsx
decisions:
  - "note param accepted by upsertReview and submitReviewAction but not persisted in v1 — progressSchema reviews array has no note field; schema-first constraint means no persistence without schema update"
  - "key={item.concept.id} on ReviewCard causes React to unmount/remount on advance, resetting note and status state automatically without extra reset logic"
  - "revalidatePath('/') added to submitReviewAction per key_constraints (in addition to /review)"
metrics:
  duration: ~25 minutes
  completed: 2026-04-20T16:22:05Z
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 2
---

# Phase 02 Plan 03: Review Surface Summary

Review surface ships as a server page with two client islands. /review returns real data, replaces the ComingSoon stub, and writes back to progress.json on every card submission.

## What Was Built

Task 1: Data layer

- `upsertReview` added to `src/lib/progress.ts`: creates or updates a review entry with `lastReviewed` (now), `nextSuggested` (now + 24h), and `status`. Note param accepted for API symmetry but not persisted (see Deviations).
- `src/lib/review.ts` (new): `getReviewQueue` fetches concepts, modules, and progress in parallel, filters out concepts reviewed in the last 24h, sorts remaining by `lastReviewed` ascending with never-reviewed concepts at the end, derives `emptyState` ("no_concepts" or "all_done" or null).
- `src/lib/actions/submit-review.ts` (new): thin server action, maps "known" -> "ready" and "needs_review" -> "not_yet", calls `upsertReview`, revalidates `/review` and `/`.

Task 2: UI

- `ReviewCard` client island: coral-filled "Got it" button (`bg-[var(--ring)]`), outline "Not yet", free-text textarea (not submitted to server in v1, cleared on advance via key reset), error state inline.
- `ReviewQueue` client island: manages index and 150ms opacity fade between cards using `setTimeout` + `setVisible`, queue counter ("N concepts in queue" / "Last one." / nothing).
- `/review` page: server component, calls `getReviewQueue`, renders empty state or `ReviewQueue` with real data.

## Deviations from Plan

### Note field not persisted (per plan spec)

The plan itself specifies this behavior: the `_note` parameter is accepted for API symmetry but not written to `progress.json` because `progressSchema` reviews array does not include a `note` field. Zod would strip it on re-read. This is documented with a code comment in `progress.ts`. Not a deviation — plan directed this explicitly.

### revalidatePath('/') added

Key constraints specified `revalidatePath('/review') + revalidatePath('/')` after each submit. The plan's interfaces section mentioned only `/review`. Added `/` per key_constraints (higher authority). Tracked as minor alignment.

## Known Stubs

None. The free-text textarea is intentionally not persisted in v1 (schema constraint, documented). The UI still renders the textarea and accepts input — it is not a display stub.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| src/lib/review.ts exists | FOUND |
| src/lib/actions/submit-review.ts exists | FOUND |
| src/components/review-card.tsx exists | FOUND |
| src/components/review-queue.tsx exists | FOUND |
| src/lib/progress.ts exists | FOUND |
| src/app/review/page.tsx exists | FOUND |
| Commit 306766f (Task 1) | FOUND |
| Commit a771a23 (Task 2) | FOUND |
| pnpm tsc --noEmit | PASS |
| curl /review HTTP status | 200 |
