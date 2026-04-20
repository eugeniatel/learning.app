---
phase: 03-writeback-actions
plan: 04
type: execute
wave: 3
depends_on: [03-03]
files_modified:
  - src/lib/progress.ts
  - src/lib/actions/update-question-status.ts
  - src/components/question-item.tsx
  - src/components/concept-question-group.tsx
  - src/components/questions-queue.tsx
  - src/app/questions/page.tsx
autonomous: true
requirements:
  - QUESTION-02
  - QUESTION-03

must_haves:
  truths:
    - "Eugenia can open /questions and see all questions grouped by concept with status badges"
    - "Open questions show Park and Answer buttons; Parked and Answered questions show a Reopen button"
    - "Clicking Park, Answer, or Reopen updates the question status immediately (optimistic) and persists to progress.json"
    - "Each concept heading is a link to /concepts/[slug]"
    - "An empty state message appears when there are no questions at all"
    - "Parked and answered items appear below the open list at reduced opacity"
  artifacts:
    - path: "src/lib/progress.ts"
      provides: "updateQuestionStatus(questionId, newStatus) added"
      exports: ["updateQuestionStatus"]
    - path: "src/lib/actions/update-question-status.ts"
      provides: "updateQuestionStatusAction server action"
      exports: ["updateQuestionStatusAction"]
    - path: "src/components/question-item.tsx"
      provides: "single question row with status badge and action buttons"
      min_lines: 40
    - path: "src/components/concept-question-group.tsx"
      provides: "concept heading + open list + parked/answered secondary list"
      min_lines: 40
    - path: "src/components/questions-queue.tsx"
      provides: "client island managing optimistic state for all questions"
      min_lines: 40
    - path: "src/app/questions/page.tsx"
      provides: "server page component loading grouped questions data"
      min_lines: 30
  key_links:
    - from: "src/components/question-item.tsx"
      to: "src/lib/actions/update-question-status.ts"
      via: "optimistic status flip + void updateQuestionStatusAction(id, newStatus)"
      pattern: "updateQuestionStatusAction"
    - from: "src/lib/actions/update-question-status.ts"
      to: "src/lib/progress.ts"
      via: "updateQuestionStatus(questionId, newStatus)"
      pattern: "updateQuestionStatus"
    - from: "src/app/questions/page.tsx"
      to: "src/lib/data.ts"
      via: "getProgress() + getConcepts()"
      pattern: "getProgress|getConcepts"
---

<objective>
Replace the /questions coming-soon stub with a working questions queue: questions grouped by concept, with Park / Answer / Reopen actions that write back to progress.json.

Purpose: Closes QUESTION-02 and QUESTION-03. Questions parked during concept study become actionable.
Output: updateQuestionStatus added to progress.ts, update-question-status server action, three new components (QuestionItem, ConceptQuestionGroup, QuestionsQueue), /questions page replaced.

Note on wave: depends_on 03-03 because both plans extend progress.ts. Running sequentially avoids any git conflict on that file. The dependency is additive (different functions) but sequential ordering keeps the planner constraint satisfied.
</objective>

<execution_context>
@/Users/euge/.claude/get-shit-done/workflows/execute-plan.md
@/Users/euge/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/euge/Desktop/curriculum-app/.planning/PROJECT.md
@/Users/euge/Desktop/curriculum-app/.planning/ROADMAP.md
@/Users/euge/Desktop/curriculum-app/.planning/phases/03-writeback-actions/03-UI-SPEC.md
</context>

<interfaces>
<!-- Exact contracts. No codebase exploration needed. -->

From src/lib/progress.ts (add to bottom, after cycleSessionStatus):
```typescript
/**
 * Updates the status of a question in progress.json openQuestions array.
 * Throws if questionId is not found.
 */
export async function updateQuestionStatus(
  questionId: string,
  newStatus: "open" | "parked" | "answered"
): Promise<void>
// Logic:
//   1. readProgress()
//   2. find question by id in progress.openQuestions (throw if not found)
//   3. question.status = newStatus
//   4. writeProgress(progress)
```

From src/lib/types.ts:
```typescript
export type Question = { id: string; conceptId: string; text: string; status: QuestionStatus; createdAt: string; };
export type QuestionStatus = "open" | "parked" | "answered";
export type Concept = { id: string; slug: string; title: string; oneLiner: string; moduleIds: string[]; artifactIds: string[]; };
```

Data grouping for /questions page (server component logic):
```typescript
// 1. const progress = await getProgress()  // from src/lib/data.ts
// 2. const concepts = await getConcepts()  // from src/lib/data.ts
// 3. Group questions by conceptId
// 4. For each conceptId, find matching concept (slug, title, moduleIds[0])
// 5. For each group, find module name from a getModules() call or moduleId lookup
// 6. Build grouped array: { concept, moduleLabel, questions }[]
// 7. Filter out groups with no questions
// Pass to QuestionsQueue client island
```

Grouped data shape to pass to QuestionsQueue:
```typescript
type ConceptGroup = {
  conceptId: string;
  conceptTitle: string;
  conceptSlug: string;
  moduleLabel: string;  // module title for display, e.g. "Foundations"
  questions: Question[];
};
```

QuestionItem component spec (from 03-UI-SPEC.md):
```tsx
// Props: { question: Question; onStatusChange: (id: string, newStatus: QuestionStatus) => void }
// Container: flex row, bg-card rounded-lg border border-[var(--border)] px-4 py-3, gap-3
// Left: status badge (bg-muted text-muted-foreground text-[12px] rounded-sm px-1.5 py-0.5) + question text (text-[15px] text-foreground)
// Right (shrink-0 flex gap-2):
//   Open questions: <Button variant="outline" size="sm"> Park </Button> + <Button variant="outline" size="sm"> Answer </Button>
//   Parked or Answered: <Button variant="outline" size="sm"> Reopen </Button>
// Status badge copy: "Open" / "Parked" / "Answered"
// QuestionItem tracks its own status in local useState for optimistic flip
// onClick: update local status, call onStatusChange(question.id, newStatus)
```

ConceptQuestionGroup component spec (from 03-UI-SPEC.md):
```tsx
// Props: { group: ConceptGroup; onStatusChange: (id: string, newStatus: QuestionStatus) => void }
// Heading row: <Link href={/concepts/${group.conceptSlug}} className="text-[15px] font-medium hover:underline">{group.conceptTitle}</Link>
//   + <span className="ml-2 text-[12px] text-muted-foreground">{group.moduleLabel}</span>
// Open questions: filter group.questions where status === "open", render QuestionItem list gap-2
// Secondary block (parked + answered combined):
//   Parked count label: "{N} parked" (text-[12px] text-muted-foreground)
//   Answered count label: "{N} answered" (text-[12px] text-muted-foreground)
//   QuestionItems at opacity-70
//   Only render secondary block if parked.length > 0 or answered.length > 0
```

QuestionsQueue client island spec:
```tsx
// "use client"
// Props: { groups: ConceptGroup[] }
// Manages question statuses in local useState for all questions (optimistic)
// Initializes from groups prop
// onStatusChange handler: update local state immediately, fire void updateQuestionStatusAction(id, newStatus)
// On failure: revert to previous status
// Passes onStatusChange down to ConceptQuestionGroup -> QuestionItem
// Empty state: "No open questions yet. Add one from any concept page."
```

/questions page structure:
```tsx
// Server component (async)
// Imports: getProgress, getConcepts, getModules from @/lib/data; Shell from @/components/shell
// Builds ConceptGroup[] by joining questions + concepts + modules
// Renders:
//   <Shell phase={progress.phase}>
//     <h1 className="mb-6 text-[22px] font-medium">Open questions</h1>
//     <QuestionsQueue groups={groups} />
//   </Shell>
```

Server action:
```typescript
"use server";
import { revalidatePath } from "next/cache";
import { updateQuestionStatus } from "@/lib/progress";
import type { QuestionStatus } from "@/lib/types";

export async function updateQuestionStatusAction(
  questionId: string,
  newStatus: QuestionStatus
): Promise<void> {
  await updateQuestionStatus(questionId, newStatus);
  revalidatePath("/questions");
}
```
</interfaces>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Add updateQuestionStatus to progress.ts and create server action</name>
  <files>src/lib/progress.ts, src/lib/actions/update-question-status.ts</files>
  <action>
Add updateQuestionStatus to the bottom of src/lib/progress.ts (after cycleSessionStatus from plan 03-03). Do not modify any existing function.

```typescript
/**
 * Updates the status of a question in progress.json openQuestions.
 * Throws if questionId is not found.
 */
export async function updateQuestionStatus(
  questionId: string,
  newStatus: "open" | "parked" | "answered"
): Promise<void> {
  const progress = await readProgress();
  const question = progress.openQuestions.find((q) => q.id === questionId);
  if (!question) throw new Error(`Question ${questionId} not found in openQuestions`);
  question.status = newStatus;
  await writeProgress(progress);
}
```

Create src/lib/actions/update-question-status.ts:

```typescript
"use server";
import { revalidatePath } from "next/cache";
import { updateQuestionStatus } from "@/lib/progress";
import type { QuestionStatus } from "@/lib/types";

export async function updateQuestionStatusAction(
  questionId: string,
  newStatus: QuestionStatus
): Promise<void> {
  await updateQuestionStatus(questionId, newStatus);
  revalidatePath("/questions");
}
```
  </action>
  <verify>
    <automated>cd /Users/euge/Desktop/curriculum-app && pnpm tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>updateQuestionStatus exported from progress.ts; update-question-status.ts exports updateQuestionStatusAction; tsc exits 0</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Build QuestionItem, ConceptQuestionGroup, QuestionsQueue components and replace /questions page</name>
  <files>
    src/components/question-item.tsx,
    src/components/concept-question-group.tsx,
    src/components/questions-queue.tsx,
    src/app/questions/page.tsx
  </files>
  <action>
Create src/components/question-item.tsx:

```typescript
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Question, QuestionStatus } from "@/lib/types";

const badgeCopy: Record<QuestionStatus, string> = {
  open: "Open",
  parked: "Parked",
  answered: "Answered",
};

export function QuestionItem({
  question,
  onStatusChange,
}: {
  question: Question;
  onStatusChange: (id: string, newStatus: QuestionStatus) => void;
}) {
  const [status, setStatus] = useState<QuestionStatus>(question.status);

  function handleAction(newStatus: QuestionStatus) {
    setStatus(newStatus);
    onStatusChange(question.id, newStatus);
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[12px] text-muted-foreground">
          {badgeCopy[status]}
        </span>
        <p className="text-[15px] text-foreground">{question.text}</p>
      </div>
      <div className="shrink-0 flex gap-2">
        {status === "open" ? (
          <>
            <Button variant="outline" size="sm" onClick={() => handleAction("parked")}>
              Park
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAction("answered")}>
              Answer
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => handleAction("open")}>
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}
```

Create src/components/concept-question-group.tsx:

```typescript
import Link from "next/link";
import { QuestionItem } from "./question-item";
import type { Question, QuestionStatus } from "@/lib/types";

type ConceptGroup = {
  conceptId: string;
  conceptTitle: string;
  conceptSlug: string;
  moduleLabel: string;
  questions: Question[];
};

export function ConceptQuestionGroup({
  group,
  onStatusChange,
}: {
  group: ConceptGroup;
  onStatusChange: (id: string, newStatus: QuestionStatus) => void;
}) {
  const open = group.questions.filter((q) => q.status === "open");
  const parked = group.questions.filter((q) => q.status === "parked");
  const answered = group.questions.filter((q) => q.status === "answered");

  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <Link
          href={`/concepts/${group.conceptSlug}`}
          className="text-[15px] font-medium text-foreground hover:underline"
        >
          {group.conceptTitle}
        </Link>
        <span className="text-[12px] text-muted-foreground">{group.moduleLabel}</span>
      </div>
      {open.length > 0 && (
        <div className="flex flex-col gap-2">
          {open.map((q) => (
            <QuestionItem key={q.id} question={q} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
      {(parked.length > 0 || answered.length > 0) && (
        <div className="mt-3 flex flex-col gap-2 opacity-70">
          {parked.length > 0 && (
            <p className="text-[12px] text-muted-foreground">
              {parked.length === 1 ? "1 parked" : `${parked.length} parked`}
            </p>
          )}
          {parked.map((q) => (
            <QuestionItem key={q.id} question={q} onStatusChange={onStatusChange} />
          ))}
          {answered.length > 0 && (
            <p className="text-[12px] text-muted-foreground">
              {answered.length === 1 ? "1 answered" : `${answered.length} answered`}
            </p>
          )}
          {answered.map((q) => (
            <QuestionItem key={q.id} question={q} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
```

Create src/components/questions-queue.tsx:

```typescript
"use client";
import { useState } from "react";
import { ConceptQuestionGroup } from "./concept-question-group";
import { updateQuestionStatusAction } from "@/lib/actions/update-question-status";
import type { Question, QuestionStatus } from "@/lib/types";

type ConceptGroup = {
  conceptId: string;
  conceptTitle: string;
  conceptSlug: string;
  moduleLabel: string;
  questions: Question[];
};

export function QuestionsQueue({ groups }: { groups: ConceptGroup[] }) {
  // Track all question statuses in a flat map for optimistic updates
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>(() => {
    const map: Record<string, QuestionStatus> = {};
    for (const g of groups) {
      for (const q of g.questions) {
        map[q.id] = q.status;
      }
    }
    return map;
  });

  const groupsWithStatus = groups.map((g) => ({
    ...g,
    questions: g.questions.map((q) => ({ ...q, status: statuses[q.id] ?? q.status })),
  }));

  async function handleStatusChange(questionId: string, newStatus: QuestionStatus) {
    const prev = statuses[questionId];
    setStatuses((s) => ({ ...s, [questionId]: newStatus }));
    try {
      await updateQuestionStatusAction(questionId, newStatus);
    } catch {
      setStatuses((s) => ({ ...s, [questionId]: prev }));
    }
  }

  const hasAny = groups.some((g) => g.questions.length > 0);

  if (!hasAny) {
    return (
      <p className="text-[15px] text-muted-foreground">
        No open questions yet. Add one from any concept page.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {groupsWithStatus.map((g) => (
        <ConceptQuestionGroup key={g.conceptId} group={g} onStatusChange={handleStatusChange} />
      ))}
    </div>
  );
}
```

Replace src/app/questions/page.tsx:

```typescript
import { Shell } from "@/components/shell";
import { QuestionsQueue } from "@/components/questions-queue";
import { getProgress, getConcepts, getModules } from "@/lib/data";

export default async function QuestionsPage() {
  const [progress, concepts, modules] = await Promise.all([
    getProgress(),
    getConcepts(),
    getModules(),
  ]);

  const conceptMap = new Map(concepts.map((c) => [c.id, c]));
  const moduleMap = new Map(modules.map((m) => [m.id, m]));

  // Group questions by conceptId; only include conceptIds that have at least one question
  const questionsByConceptId = new Map<string, typeof progress.openQuestions>();
  for (const q of progress.openQuestions) {
    if (!questionsByConceptId.has(q.conceptId)) {
      questionsByConceptId.set(q.conceptId, []);
    }
    questionsByConceptId.get(q.conceptId)!.push(q);
  }

  const groups = Array.from(questionsByConceptId.entries())
    .map(([conceptId, questions]) => {
      const concept = conceptMap.get(conceptId);
      if (!concept) return null;
      const firstModuleId = concept.moduleIds[0];
      const mod = firstModuleId ? moduleMap.get(firstModuleId) : undefined;
      return {
        conceptId,
        conceptTitle: concept.title,
        conceptSlug: concept.slug,
        moduleLabel: mod?.title ?? "",
        questions,
      };
    })
    .filter((g): g is NonNullable<typeof g> => g !== null);

  return (
    <Shell phase={progress.phase}>
      <h1 className="mb-6 text-[22px] font-medium">Open questions</h1>
      <QuestionsQueue groups={groups} />
    </Shell>
  );
}
```

Keep all component files under 200 lines. The above implementations are all under that limit.
  </action>
  <verify>
    <automated>cd /Users/euge/Desktop/curriculum-app && pnpm tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
All four files created/replaced. tsc exits 0.
Grep checks:
- grep -q "updateQuestionStatusAction" src/components/questions-queue.tsx
- grep -q "ConceptQuestionGroup" src/components/questions-queue.tsx
- grep -q "QuestionsQueue" src/app/questions/page.tsx
- grep -q "ComingSoon" src/app/questions/page.tsx returns no match (stub replaced)
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client action click -> server action | questionId and newStatus cross trust boundary via updateQuestionStatusAction |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-04-01 | Tampering | updateQuestionStatus | accept | Single-user local tool; questionId validated by find (throws if not found); no path traversal via id |
| T-03-04-02 | Tampering | newStatus enum | accept | TypeScript QuestionStatus type at action boundary; zod progressSchema validates on next read |
| T-03-04-03 | Information Disclosure | /questions page lists all questions | accept | Single-user localhost tool; no external access; all data is the user's own |
</threat_model>

<verification>
1. `pnpm tsc --noEmit` exits 0
2. `curl -s http://localhost:3000/questions` returns 200 with no "coming soon" content
3. Manual: open /questions, confirm questions are grouped under the correct concept heading
4. Click Park on an open question, confirm badge changes to Parked and item moves to secondary block
5. Click Answer on another open question, confirm badge changes to Answered
6. Click Reopen on a parked question, confirm it returns to the open section
7. Reload and confirm status changes persisted in progress.json
8. Confirm concept headings link to /concepts/[slug] (hover to see href)
9. Remove all questions from progress.json temporarily and confirm empty state message appears (then restore)
</verification>

<success_criteria>
- /questions renders real data, no ComingSoon stub
- Questions grouped by concept with concept link and module label
- Park, Answer, Reopen actions work with optimistic updates and persist to progress.json
- Parked and answered items visible below open items at reduced opacity
- Empty state message shown when no questions exist
</success_criteria>

<output>
After completion, create .planning/phases/03-writeback-actions/03-04-SUMMARY.md
</output>
