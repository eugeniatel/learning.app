---
phase: 02-all-weeks-and-review
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/data.ts
  - src/components/week-row.tsx
  - src/components/weeks-list.tsx
  - src/app/weeks/page.tsx
autonomous: true
requirements:
  - WEEKS-01

must_haves:
  truths:
    - "/weeks returns 200 and renders real data (not ComingSoon stub)"
    - "Every week in progress.json.weeks is visible, grouped under its module label"
    - "Module groups are sorted most-recent first (descending by first week startDate in each group)"
    - "Each WeekRow shows week number, date range, module title, session done/total count"
    - "The current week row shows a 'Current' badge inline"
    - "Empty state 'No weeks recorded yet.' renders when progress.weeks is empty"
  artifacts:
    - path: "src/lib/data.ts"
      provides: "getAllWeeksWithModules helper"
      exports: ["getAllWeeksWithModules"]
    - path: "src/components/week-row.tsx"
      provides: "Individual week row (server component, display only)"
      min_lines: 20
    - path: "src/components/weeks-list.tsx"
      provides: "Grouped module list (client island, manages confirming state in wave 2)"
      min_lines: 30
    - path: "src/app/weeks/page.tsx"
      provides: "Server page replacing ComingSoon stub"
      min_lines: 10
  key_links:
    - from: "src/app/weeks/page.tsx"
      to: "src/lib/data.ts"
      via: "getAllWeeksWithModules() call"
      pattern: "getAllWeeksWithModules"
    - from: "src/components/weeks-list.tsx"
      to: "src/components/week-row.tsx"
      via: "renders WeekRow per week within each module group"
      pattern: "WeekRow"
---

<objective>
Replace the /weeks coming-soon stub with a real weeks index page. The page shows every week from progress.json grouped by module, sorted most-recent first, each row displaying week number, date range, module title, and session progress.

Purpose: WEEKS-01 — Eugenia can see her full week history at a glance.
Output: getAllWeeksWithModules helper, WeekRow server component, WeeksList client island scaffold, functional /weeks page.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/02-all-weeks-and-review/02-UI-SPEC.md

<interfaces>
<!-- Existing types used by this plan. No exploration needed. -->

From src/lib/types.ts:
```typescript
export type Week = {
  id: string;
  moduleId: string;
  number: number;
  startDate: string;
  sessions: Session[];
  reflectionNoteId?: string;
};

export type Module = {
  id: string;
  track: Track;
  number: number;
  title: string;
  slug: string;
  phase: Phase;
  // ...other fields
};

export type Progress = {
  phase: Phase;
  currentWeek: { id: string; moduleId: string; number: number };
  weeks: Week[];
  openQuestions: Question[];
  reviews: Review[];
};
```

From src/lib/data.ts (existing exports to reuse):
```typescript
export async function getProgress(): Promise<Progress>
export async function getModules(): Promise<Module[]>
// formatRange pattern from week-header.tsx (copy locally, do not import):
function formatRange(startDate: string): string {
  const [y, m, d] = startDate.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);
  const fmt = (x: Date) => x.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} to ${fmt(end)}`;
}
```

From src/components/session-card.tsx (card pattern to replicate):
```tsx
// bg-card rounded-xl px-5 py-4 is the established card container pattern
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add getAllWeeksWithModules to data.ts</name>
  <files>src/lib/data.ts</files>
  <read_first>
    - src/lib/data.ts (add helper alongside getConceptsGroupedByModule — same pattern)
    - src/lib/types.ts (Week, Module, Progress shapes)
    - progress.json (confirm weeks array shape; currently 1 week with moduleId "mod-0")
  </read_first>
  <action>
Add a new exported async function `getAllWeeksWithModules` to src/lib/data.ts. Do not modify any existing exports.

Function signature:
```typescript
export async function getAllWeeksWithModules(): Promise<{
  module: Module;
  weeks: Week[];
}[]>
```

Implementation:
1. Fetch `[progress, modules]` in parallel via `Promise.all([getProgress(), getModules()])`.
2. Group `progress.weeks` by `moduleId`: for each module, collect all weeks whose `moduleId === module.id`.
3. Filter out module groups with zero matching weeks.
4. Sort weeks within each group by `startDate` descending (most-recent first: string ISO comparison `b.startDate.localeCompare(a.startDate)` works for YYYY-MM-DD).
5. Sort module groups by the most-recent `startDate` in each group, descending (so the module with the newest activity appears first).
6. Return the sorted array.

This function will also need to expose `currentWeekId` to WeeksList so it can render the "Current" badge. Instead of a second helper, add `currentWeekId` as a second return value from the page (the page calls `getProgress()` separately — that is fine, no need to complicate this helper). The helper returns only `{ module, weeks }[]`.
  </action>
  <verify>pnpm tsc --noEmit exits 0</verify>
  <acceptance_criteria>
    - `grep -n "getAllWeeksWithModules" src/lib/data.ts` returns the function definition
    - `grep -n "export async function getAllWeeksWithModules" src/lib/data.ts` matches
    - No existing exports in data.ts were modified (verify with git diff --stat)
    - pnpm tsc --noEmit exits 0
  </acceptance_criteria>
  <done>getAllWeeksWithModules is exported from data.ts, groups weeks by module sorted most-recent first, TypeScript clean</done>
</task>

<task type="auto">
  <name>Task 2: Build WeekRow, WeeksList, replace /weeks stub</name>
  <files>
    src/components/week-row.tsx,
    src/components/weeks-list.tsx,
    src/app/weeks/page.tsx
  </files>
  <read_first>
    - src/components/session-card.tsx (card container class pattern: "rounded-xl bg-card px-5 py-4")
    - src/components/week-header.tsx (formatRange function — copy the implementation, do not import)
    - src/app/weeks/page.tsx (current stub to replace)
    - src/components/shell.tsx (Shell usage pattern)
    - .planning/phases/02-all-weeks-and-review/02-UI-SPEC.md (WeekRow, WeeksList, layout spec)
  </read_first>
  <action>
Create three files exactly as specified. Under 200 lines each.

--- src/components/week-row.tsx ---
Server component (no "use client"). Props:
```typescript
interface WeekRowProps {
  week: Week;
  module: Module;
  isCurrent: boolean;
}
```
Copy the `formatRange` function from week-header.tsx into this file (do not import from week-header.tsx — it is not exported there).

Layout (per UI-SPEC):
- Outer: `div` with classes `flex flex-col rounded-xl bg-card border border-border px-5 py-4 transition-colors duration-[180ms] ease-out hover:bg-muted/40 cursor-pointer`
- Inner row: `div` with `flex items-center gap-3`
  - Left content (flex-1): stacked week label + module title
    - Week label: `span` — `text-[12px] text-muted-foreground` — format: `"Week {week.number}, {formatRange(week.startDate)}"`. If `isCurrent`, append a badge inline: `<span className="ml-2 rounded-sm bg-muted px-1.5 py-0.5 text-[12px] text-muted-foreground">Current</span>`
    - Module title: `p` — `text-[15px] font-medium text-foreground mt-0.5`
  - Right: session count — `span` — `text-[13px] text-muted-foreground shrink-0` — format: `"{done}/{total} sessions done"` where done = sessions filtered by status === "done", total = sessions.length

WeekRow accepts an optional `onClick` prop (`() => void`) for wave 2 wiring. For now it is wired but does nothing (WeeksList will provide it in wave 2). Pass `onClick` to the outer `div`'s onClick handler.

Full prop type:
```typescript
interface WeekRowProps {
  week: Week;
  module: Module;
  isCurrent: boolean;
  onClick?: () => void;
}
```

--- src/components/weeks-list.tsx ---
Client island ("use client"). Props:
```typescript
interface WeeksListProps {
  groups: { module: Module; weeks: Week[] }[];
  currentWeekId: string;
}
```

State: `confirmingWeekId: string | null` initialized to `null`. (This will be used in wave 2 for the confirmation strip. In this plan, the state is declared but confirmingWeekId is unused — only the idle display is rendered.)

Layout (per UI-SPEC):
- Page heading: `h1` — `text-[22px] font-medium tracking-tight text-foreground mb-6` — text: "All weeks"
- If `groups.length === 0`: render `<p className="mt-8 text-[15px] text-muted-foreground">No weeks recorded yet.</p>`
- Otherwise: `div` with `flex flex-col gap-8` containing one section per module group
  - Module group label: `p` — `text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground mb-2` — text: module.title
  - Week rows: `div` with `flex flex-col gap-2` containing one WeekRow per week in the group
    - Pass `isCurrent={week.id === currentWeekId}`
    - Pass `onClick={() => setConfirmingWeekId(week.id)}` (state set, but UI effect is wave 2)

Import WeekRow. Import Module and Week types from "@/lib/types".

--- src/app/weeks/page.tsx ---
Server component. Replace ComingSoon stub entirely.

```typescript
import { Shell } from "@/components/shell";
import { WeeksList } from "@/components/weeks-list";
import { getAllWeeksWithModules, getProgress } from "@/lib/data";

export default async function WeeksPage() {
  const [groups, progress] = await Promise.all([
    getAllWeeksWithModules(),
    getProgress(),
  ]);
  return (
    <Shell phase={progress.phase}>
      <WeeksList groups={groups} currentWeekId={progress.currentWeek.id} />
    </Shell>
  );
}
```
  </action>
  <verify>
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/weeks
    Expected: 200
    Also: pnpm tsc --noEmit exits 0
  </verify>
  <acceptance_criteria>
    - `grep -n '"use client"' src/components/weeks-list.tsx` matches line 1
    - `grep -n "use client" src/components/week-row.tsx` returns no match (server component)
    - `grep -n "ComingSoon" src/app/weeks/page.tsx` returns no match
    - `grep -n "getAllWeeksWithModules" src/app/weeks/page.tsx` returns a match
    - `grep -n "confirmingWeekId" src/components/weeks-list.tsx` returns a match (state declared for wave 2)
    - `grep -n "formatRange" src/components/week-row.tsx` returns a match (local copy)
    - pnpm tsc --noEmit exits 0
    - curl http://localhost:3000/weeks returns 200
  </acceptance_criteria>
  <done>
    /weeks renders all weeks grouped by module with "Current" badge on the active week, session counts, date ranges. No confirmation strip yet (wave 2). TypeScript clean.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| fs read -> UI | progress.json and module markdown are local files; no user-controlled input in this plan |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-01 | Information Disclosure | progress.json | accept | Single-user local tool; no network exposure |
| T-02-02 | Tampering | progress.json (read path) | accept | Read-only in this plan; no writes until wave 2 |
</threat_model>

<verification>
After plan execution:
- pnpm tsc --noEmit exits 0
- curl http://localhost:3000/weeks returns 200
- Page shows "All weeks" heading
- Week 1 row visible under "Foundations of AI Research Practice" (or whichever module mod-0 maps to)
- "Current" badge appears on week 1 row (progress.json.currentWeek.id = "w1")
- "1/4 sessions done" appears (1 done out of 4 total per progress.json)
</verification>

<success_criteria>
- getAllWeeksWithModules exported from data.ts, groups weeks by module, most-recent first
- WeekRow server component renders week label, module title, session count, current badge
- WeeksList client island renders grouped layout, empty state handled, confirmingWeekId state declared
- /weeks page returns 200 with real data, ComingSoon removed
- pnpm tsc --noEmit exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/02-all-weeks-and-review/02-01-SUMMARY.md`
</output>
