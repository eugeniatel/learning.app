---
phase: 02-all-weeks-and-review
plan: 03
type: execute
wave: 3
depends_on:
  - 02-02
files_modified:
  - src/lib/progress.ts
  - src/lib/review.ts
  - src/lib/actions/submit-review.ts
  - src/components/review-card.tsx
  - src/components/review-queue.tsx
  - src/app/review/page.tsx
autonomous: true
requirements:
  - REVIEW-01
  - REVIEW-02
  - REVIEW-03

must_haves:
  truths:
    - "/review returns 200 with real data (not ComingSoon stub)"
    - "One concept card renders at a time with title, one-liner, last-reviewed line, module tag, action row, free-text textarea"
    - "Queue is sorted least-recently-reviewed first; never-reviewed concepts appear last"
    - "'Got it' button is coral-filled; 'Not yet' is outline"
    - "Submitting either button calls the server action, writes progress.json.reviews[], and advances to the next card"
    - "The free-text textarea clears when advancing to the next card"
    - "Card content fades out and fades in at 150ms ease-out on advance"
    - "When all concepts have been reviewed in the last 24h, the all-done empty state renders"
    - "When no concepts exist, the no-concepts empty state renders"
    - "Queue counter shows '{N} concepts in queue' when N >= 2, 'Last one.' when N = 1, nothing when 0"
    - "Error state shows 'Could not save review. Try again.' inline"
  artifacts:
    - path: "src/lib/progress.ts"
      provides: "upsertReview(conceptId, status, note?) write helper"
      exports: ["upsertReview"]
    - path: "src/lib/review.ts"
      provides: "getReviewQueue — derives ordered concept list with review metadata"
      exports: ["getReviewQueue", "ReviewQueueItem"]
    - path: "src/lib/actions/submit-review.ts"
      provides: "submitReviewAction server action"
      exports: ["submitReviewAction"]
    - path: "src/components/review-card.tsx"
      provides: "Single concept card with action row and free-text field (client island)"
      min_lines: 60
    - path: "src/components/review-queue.tsx"
      provides: "Client island managing queue index and card transitions"
      min_lines: 60
    - path: "src/app/review/page.tsx"
      provides: "Server page replacing ComingSoon stub"
      min_lines: 15
  key_links:
    - from: "src/app/review/page.tsx"
      to: "src/lib/review.ts"
      via: "getReviewQueue() call"
      pattern: "getReviewQueue"
    - from: "src/components/review-queue.tsx"
      to: "src/components/review-card.tsx"
      via: "renders ReviewCard for current index"
      pattern: "ReviewCard"
    - from: "src/components/review-card.tsx"
      to: "src/lib/actions/submit-review.ts"
      via: "submitReviewAction call on button press"
      pattern: "submitReviewAction"
    - from: "src/lib/actions/submit-review.ts"
      to: "src/lib/progress.ts"
      via: "upsertReview(conceptId, status, note)"
      pattern: "upsertReview"
---

<objective>
Build the /review surface: a server page that derives a recency-ordered concept queue, passes it to a client island that presents one card at a time, and writes review entries back to progress.json via a server action. Replace the /review coming-soon stub.

Purpose: REVIEW-01, REVIEW-02, REVIEW-03 — Eugenia can review concepts one card at a time, mark them known or not-yet, and the queue reorders by recency.
Output: upsertReview helper, getReviewQueue library, submitReviewAction, ReviewCard island, ReviewQueue island, /review page.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/02-all-weeks-and-review/02-UI-SPEC.md
@.planning/phases/02-all-weeks-and-review/02-02-SUMMARY.md

<interfaces>
<!-- All types and patterns the executor needs. No codebase exploration required. -->

From src/lib/types.ts:
```typescript
export type Concept = {
  id: string;
  slug: string;
  title: string;
  oneLiner: string;
  moduleIds: string[];
  artifactIds: string[];
};

export type Review = {
  conceptId: string;
  lastReviewed: string;    // ISO timestamp
  nextSuggested: string;   // ISO timestamp
  status: "ready" | "not_yet" | "mastered";
};

export type Progress = {
  phase: Phase;
  currentWeek: { id: string; moduleId: string; number: number };
  weeks: Week[];
  openQuestions: Question[];
  reviews: Review[];
};
```

From src/lib/schemas.ts (reviews entry shape for upsertReview):
```typescript
// The reviews array in progressSchema accepts:
z.object({
  conceptId: z.string(),
  lastReviewed: z.string(),
  nextSuggested: z.string(),
  status: z.enum(["ready", "not_yet", "mastered"]),
})
// When "Got it" is submitted -> status: "ready"
// When "Not yet" is submitted -> status: "not_yet"
// Note: UI-SPEC uses "known" and "needs_review" as action parameter names for clarity.
// Map them: "known" -> "ready", "needs_review" -> "not_yet" in the server action.
```

From src/lib/progress.ts (extend this file; private helpers are already there):
```typescript
// readProgress() and writeProgress() are private — replicate the pattern, do not re-export them.
// Add after upsertReview is the only new export needed.
```

From src/lib/actions/save-note.ts (server action pattern):
```typescript
"use server";
import { saveNote } from "@/lib/notes";
export async function saveNoteAction(...): Promise<void> { ... }
// submitReviewAction follows the same thin-wrapper structure.
// Imports: revalidatePath from "next/cache", upsertReview from "@/lib/progress".
// Revalidates: revalidatePath("/review") only (home page does not need review data).
```

From src/components/note-editor.tsx (client island patterns to replicate):
```typescript
// Status machine: "idle" | "saving" | "error"
// try/catch around server action, set "error" on catch
// Textarea value controlled via useState, cleared on success
```

From src/components/session-card.tsx (card container classes):
```
bg-card rounded-xl px-5 py-4  — use px-6 py-6 for ReviewCard (UI-SPEC)
border border-border
```

Queue ordering algorithm (from UI-SPEC):
- Sort concepts by lastReviewed ascending (earliest reviewed first)
- Concepts with no review entry sort LAST (never reviewed)
- Implementation: if both have lastReviewed, compare strings (ISO sorts lexicographically)
- If only one has lastReviewed, the one without sorts last
- This is deterministic; no random element

All-done check (from UI-SPEC):
- "All done today" = every concept in the full concept list has a review entry
  where lastReviewed is within the last 24 hours
- Server derives this before sending props: if queue.length === 0 AND concepts.length > 0
  AND all concepts have been reviewed, emptyState = "all_done"
- "No concepts" = concepts.length === 0, emptyState = "no_concepts"

Last-reviewed date format (from UI-SPEC):
- "Last reviewed Apr 14" — month abbrev + day, no year if same year
- Use: new Date(lastReviewed).toLocaleDateString("en-US", { month: "short", day: "numeric" })
- If never reviewed: "Not yet reviewed"

Module tag: use concept.moduleIds[0] to look up the module title.
The page server-fetches modules alongside concepts and passes the module title per concept.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add upsertReview to progress.ts and create submitReviewAction</name>
  <files>src/lib/progress.ts, src/lib/review.ts, src/lib/actions/submit-review.ts</files>
  <read_first>
    - src/lib/progress.ts (append after switchCurrentWeek; do not change existing exports)
    - src/lib/types.ts (Review shape, Progress shape)
    - src/lib/schemas.ts (reviews array zod schema — status enum values are "ready", "not_yet", "mastered")
    - src/lib/actions/save-note.ts (server action pattern)
    - src/lib/data.ts (getConcepts, getModules — needed in review.ts)
  </read_first>
  <action>
--- Add to src/lib/progress.ts (after switchCurrentWeek) ---

```typescript
/**
 * Creates or updates the review entry for a concept.
 * Sets lastReviewed to now, nextSuggested to now + 24h, status as provided.
 * If note is non-empty, stores it on the entry.
 */
export async function upsertReview(
  conceptId: string,
  status: "ready" | "not_yet",
  note?: string
): Promise<void> {
  const progress = await readProgress();
  const now = new Date();
  const next = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const entry = progress.reviews.find((r) => r.conceptId === conceptId);
  if (entry) {
    entry.lastReviewed = now.toISOString();
    entry.nextSuggested = next.toISOString();
    entry.status = status;
    if (note) (entry as Record<string, unknown>).note = note;
  } else {
    const newEntry: Review & { note?: string } = {
      conceptId,
      lastReviewed: now.toISOString(),
      nextSuggested: next.toISOString(),
      status,
    };
    if (note) newEntry.note = note;
    progress.reviews.push(newEntry as Review);
  }
  await writeProgress(progress);
}
```

Note on schema compatibility: the progressSchema reviews array allows extra fields (zod strips by default, but the note field will survive JSON round-trip even if zod strips it on re-read since Zod's default is passthrough for extra object properties not listed — actually zod strips by default with .parse(). To keep it simple: do NOT add note to the entry stored in progress.json in this v1 — the note is captured in the ReviewCard UI but discarded silently on the write. The UI-SPEC says "if note is non-empty, appends note text to the review entry (note field: string | undefined)"; however the progressSchema reviews zod shape does not include a `note` field, so writing it would pass through unparsed and be stripped on next read. The correct v1 implementation: accept the note parameter for API symmetry but do not persist it (the schema does not support it). This matches the "no DB, no new schema changes without updating zod first" constraint. Note this deviation in the task summary.

Simplify upsertReview:
```typescript
export async function upsertReview(
  conceptId: string,
  status: "ready" | "not_yet",
  _note?: string    // accepted but not persisted in v1; schema does not include note field
): Promise<void> {
  const progress = await readProgress();
  const now = new Date();
  const next = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const existing = progress.reviews.findIndex((r) => r.conceptId === conceptId);
  const entry: Review = {
    conceptId,
    lastReviewed: now.toISOString(),
    nextSuggested: next.toISOString(),
    status,
  };
  if (existing >= 0) {
    progress.reviews[existing] = entry;
  } else {
    progress.reviews.push(entry);
  }
  await writeProgress(progress);
}
```

--- Create src/lib/review.ts (new file) ---

This is a pure data helper. No "use server" directive. No "use client".

```typescript
import { getConcepts, getModules, getProgress } from "./data";
import type { Concept, Module } from "./types";

export type ReviewQueueItem = {
  concept: Concept;
  moduleTitle: string;
  lastReviewed: string | null;   // ISO string or null if never reviewed
};

export type ReviewEmptyState = "no_concepts" | "all_done" | null;

export type ReviewPageData = {
  queue: ReviewQueueItem[];
  emptyState: ReviewEmptyState;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function getReviewQueue(): Promise<ReviewPageData> {
  const [concepts, modules, progress] = await Promise.all([
    getConcepts(),
    getModules(),
    getProgress(),
  ]);

  if (concepts.length === 0) {
    return { queue: [], emptyState: "no_concepts" };
  }

  const moduleMap = new Map<string, Module>(modules.map((m) => [m.id, m]));
  const reviewMap = new Map(progress.reviews.map((r) => [r.conceptId, r]));

  const now = Date.now();
  const reviewedTodayIds = new Set(
    progress.reviews
      .filter((r) => now - new Date(r.lastReviewed).getTime() < ONE_DAY_MS)
      .map((r) => r.conceptId)
  );

  // Concepts not reviewed in the last 24h form the queue
  const queueConcepts = concepts.filter((c) => !reviewedTodayIds.has(c.id));

  if (queueConcepts.length === 0) {
    return { queue: [], emptyState: "all_done" };
  }

  // Sort: concepts with a review entry by lastReviewed ascending (oldest first),
  // then concepts with no review entry (never reviewed) at the end.
  const sorted = [...queueConcepts].sort((a, b) => {
    const ra = reviewMap.get(a.id);
    const rb = reviewMap.get(b.id);
    if (!ra && !rb) return 0;
    if (!ra) return 1;   // a never reviewed -> goes last
    if (!rb) return -1;  // b never reviewed -> goes last
    return ra.lastReviewed < rb.lastReviewed ? -1 : 1;
  });

  const queue: ReviewQueueItem[] = sorted.map((c) => {
    const review = reviewMap.get(c.id);
    const primaryModuleId = c.moduleIds[0] ?? "";
    const mod = moduleMap.get(primaryModuleId);
    return {
      concept: c,
      moduleTitle: mod?.title ?? "",
      lastReviewed: review?.lastReviewed ?? null,
    };
  });

  return { queue, emptyState: null };
}
```

--- Create src/lib/actions/submit-review.ts ---

```typescript
"use server";
import { revalidatePath } from "next/cache";
import { upsertReview } from "@/lib/progress";

export async function submitReviewAction(
  conceptId: string,
  status: "known" | "needs_review",
  note?: string
): Promise<void> {
  const mappedStatus = status === "known" ? "ready" : "not_yet";
  await upsertReview(conceptId, mappedStatus, note);
  revalidatePath("/review");
}
```
  </action>
  <verify>pnpm tsc --noEmit exits 0</verify>
  <acceptance_criteria>
    - `grep -n "upsertReview" src/lib/progress.ts` returns the export
    - `grep -n "export.*getReviewQueue\|export type ReviewQueueItem\|export type ReviewPageData" src/lib/review.ts` returns 3 matches
    - `grep -n '"use server"' src/lib/actions/submit-review.ts` matches line 1
    - `grep -n "revalidatePath" src/lib/actions/submit-review.ts` returns 1 match (for "/review")
    - `grep -n "appendQuestion\|readOpenQuestionsForConcept\|switchCurrentWeek" src/lib/progress.ts` returns all 3 originals still present
    - pnpm tsc --noEmit exits 0
  </acceptance_criteria>
  <done>upsertReview in progress.ts, getReviewQueue in review.ts, submitReviewAction server action created. TypeScript clean.</done>
</task>

<task type="auto">
  <name>Task 2: Build ReviewCard, ReviewQueue islands and replace /review stub</name>
  <files>
    src/components/review-card.tsx,
    src/components/review-queue.tsx,
    src/app/review/page.tsx
  </files>
  <read_first>
    - src/components/note-editor.tsx (status machine, textarea, button pattern)
    - src/components/session-card.tsx (card container class pattern)
    - src/app/review/page.tsx (current stub to replace)
    - src/components/shell.tsx (Shell usage)
    - .planning/phases/02-all-weeks-and-review/02-UI-SPEC.md (ReviewCard spec, ReviewQueue spec, empty states, copywriting)
  </read_first>
  <action>
--- src/components/review-card.tsx ---
"use client" island. Props:
```typescript
interface ReviewCardProps {
  item: ReviewQueueItem;          // from src/lib/review.ts
  onAdvance: () => void;          // called after successful submit to advance queue
}
```

State:
- `note: string` — free-text value, initialized ""
- `status: "idle" | "saving" | "error"`

When onAdvance is called by the parent, the parent resets the card (mounts fresh or the parent passes a key — see ReviewQueue note below).

Render structure (per UI-SPEC):
```
div.max-w-prose.rounded-xl.bg-card.border.border-border.px-6.py-6
  — concept title: h2 text-[22px] font-medium tracking-tight text-foreground mb-1
  — one-liner: p text-[15px] text-muted-foreground mb-0
  — last-reviewed line: p text-[12px] text-muted-foreground mt-2
      text: item.lastReviewed
            ? "Last reviewed " + formatDate(item.lastReviewed)
            : "Not yet reviewed"
  — module tag: span text-[12px] bg-muted text-muted-foreground rounded-sm px-1.5 py-0.5 mt-1 inline-block
      text: item.moduleTitle (skip if empty string)
  — action row: div mt-6 flex gap-3
      "Got it" button:
        className="flex-1 max-w-[160px] bg-[var(--ring)] text-white hover:bg-[var(--ring)]/90 transition-colors duration-[180ms] ease-out"
        size="default"
        disabled={status === "saving"}
        onClick={() => handleSubmit("known")}
      "Not yet" button:
        variant="outline"
        className="flex-1 max-w-[160px]"
        size="default"
        disabled={status === "saving"}
        onClick={() => handleSubmit("needs_review")}
  — free-text textarea: div mt-4
      Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note about this concept..."
        className="min-h-[80px] resize-none bg-muted/40 border border-border rounded-lg px-3 py-2 text-[15px] text-foreground"
  — error: if status === "error", p text-[13px] text-destructive mt-2
      "Could not save review. Try again."
```

handleSubmit:
```typescript
async function handleSubmit(action: "known" | "needs_review") {
  setStatus("saving");
  try {
    await submitReviewAction(item.concept.id, action, note.trim() || undefined);
    onAdvance();
    // Note: parent advances index. This component's state (note, status) resets
    // because parent passes key={item.concept.id} — React unmounts and remounts.
  } catch {
    setStatus("error");
  }
}
```

formatDate helper (local, not exported):
```typescript
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
```

Imports: submitReviewAction from "@/lib/actions/submit-review", Button from "@/components/ui/button", Textarea from "@/components/ui/textarea", ReviewQueueItem from "@/lib/review".

Under 100 lines.

--- src/components/review-queue.tsx ---
"use client" island. Props:
```typescript
interface ReviewQueueProps {
  queue: ReviewQueueItem[];
}
```

State:
- `index: number` initialized to 0
- `visible: boolean` initialized to true (for opacity fade)

The 150ms fade is implemented via opacity transition:
- When advancing: set `visible = false`, after 150ms set `index = index + 1` then `visible = true`
- Use `setTimeout(fn, 150)` inside the advance handler

```typescript
function handleAdvance() {
  setVisible(false);
  setTimeout(() => {
    setIndex((i) => i + 1);
    setVisible(true);
  }, 150);
}
```

If `index >= queue.length` (exhausted after submitting last card): render nothing or the parent handles it. In this component, guard: `if (index >= queue.length) return null`.

Queue counter (above card):
- if queue.length - index >= 2: `"{queue.length - index} concepts in queue"` text-[12px] text-muted-foreground mb-4
- if queue.length - index === 1: `"Last one."` text-[12px] text-muted-foreground mb-4
- if queue.length - index === 0: render nothing (component already returns null above)

Current card: `queue[index]`
Pass `key={currentItem.concept.id}` to ReviewCard so React resets note/status state on advance.

Render:
```tsx
<div>
  <p className="text-[12px] text-muted-foreground mb-4">{counterText}</p>
  <div
    className="transition-opacity duration-[150ms] ease-out"
    style={{ opacity: visible ? 1 : 0 }}
  >
    <ReviewCard
      key={currentItem.concept.id}
      item={currentItem}
      onAdvance={handleAdvance}
    />
  </div>
</div>
```

Under 60 lines.

--- src/app/review/page.tsx ---
Server component. Replace ComingSoon stub entirely.

```typescript
import { Shell } from "@/components/shell";
import { ReviewQueue } from "@/components/review-queue";
import { getReviewQueue } from "@/lib/review";
import { getProgress } from "@/lib/data";

export default async function ReviewPage() {
  const [{ queue, emptyState }, progress] = await Promise.all([
    getReviewQueue(),
    getProgress(),
  ]);

  return (
    <Shell phase={progress.phase}>
      <h1 className="text-[22px] font-medium tracking-tight text-foreground mb-6">
        Review
      </h1>
      {emptyState === "no_concepts" && (
        <p className="mt-8 text-[15px] text-muted-foreground">
          No concepts to review.
        </p>
      )}
      {emptyState === "all_done" && (
        <p className="mt-8 text-[15px] text-muted-foreground">
          You&apos;ve reviewed everything for now. Check back tomorrow.
        </p>
      )}
      {emptyState === null && <ReviewQueue queue={queue} />}
    </Shell>
  );
}
```
  </action>
  <verify>
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/review
    Expected: 200
    Also: pnpm tsc --noEmit exits 0
  </verify>
  <acceptance_criteria>
    - `grep -n '"use client"' src/components/review-card.tsx` matches line 1
    - `grep -n '"use client"' src/components/review-queue.tsx` matches line 1
    - `grep -n "ComingSoon" src/app/review/page.tsx` returns no match
    - `grep -n "getReviewQueue" src/app/review/page.tsx` returns a match
    - `grep -n "submitReviewAction" src/components/review-card.tsx` returns a match
    - `grep -n "duration-\[150ms\]" src/components/review-queue.tsx` returns a match (fade transition)
    - `grep -n "Got it" src/components/review-card.tsx` returns a match
    - `grep -n "Not yet" src/components/review-card.tsx` returns a match
    - `grep -n "Could not save review" src/components/review-card.tsx` returns a match
    - `grep -n "var(--ring)" src/components/review-card.tsx` returns a match (coral fill for Got it)
    - `grep -n "all_done\|no_concepts" src/app/review/page.tsx` returns 2 matches (both empty states handled)
    - pnpm tsc --noEmit exits 0
    - curl http://localhost:3000/review returns 200
  </acceptance_criteria>
  <done>
    /review renders a ReviewCard with the least-recently-reviewed concept. "Got it" (coral) and "Not yet" (outline) buttons write to progress.json and fade-advance to next card. Two empty states handled. Free-text textarea clears on advance. TypeScript clean.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client -> server action | conceptId and note text travel from client to submitReviewAction |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-06 | Tampering | submitReviewAction (conceptId) | accept | Single-user local tool; conceptId is validated implicitly (upsertReview finds/creates by conceptId; an unknown id creates a harmless orphan entry in reviews[]) |
| T-02-07 | Tampering | submitReviewAction (note text) | accept | Note is not persisted in v1 (schema does not support it); no injection surface |
| T-02-08 | Information Disclosure | progress.json write | accept | Single-user local tool, no network exposure |
| T-02-09 | Denial of Service | review queue sort | accept | At most 76 concepts; in-memory sort is negligible |
</threat_model>

<verification>
After plan execution:
- pnpm tsc --noEmit exits 0
- curl http://localhost:3000/review returns 200
- Page shows "Review" heading
- With progress.json.reviews empty, all 76 concepts appear in queue — first card rendered
- Queue counter shows "76 concepts in queue" (or actual count)
- "Got it" button has coral background (bg-[var(--ring)])
- "Not yet" button is outline
- After submitting a review: progress.json.reviews gains one entry with lastReviewed, nextSuggested, status
</verification>

<success_criteria>
- upsertReview exported from progress.ts, writes lastReviewed and nextSuggested correctly
- getReviewQueue in review.ts: orders by lastReviewed ascending, never-reviewed last, derives emptyState
- submitReviewAction server action maps "known"->"ready" and "needs_review"->"not_yet", revalidates /review
- ReviewCard renders per UI-SPEC with coral "Got it", outline "Not yet", free-text textarea, error state
- ReviewQueue manages index state with 150ms opacity fade between cards, counter label
- /review page returns 200 with correct empty state or first card rendered
- pnpm tsc --noEmit exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/02-all-weeks-and-review/02-03-SUMMARY.md`
</output>
