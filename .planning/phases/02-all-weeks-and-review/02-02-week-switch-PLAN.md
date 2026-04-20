---
phase: 02-all-weeks-and-review
plan: 02
type: execute
wave: 2
depends_on:
  - 02-01
files_modified:
  - src/lib/progress.ts
  - src/lib/actions/switch-week.ts
  - src/components/week-switch-confirm.tsx
  - src/components/weeks-list.tsx
autonomous: true
requirements:
  - WEEKS-02

must_haves:
  truths:
    - "Clicking a non-current WeekRow expands an inline confirmation strip below it"
    - "Clicking the current-week row does nothing (no strip appears)"
    - "Only one row can be in confirming state at a time"
    - "Pressing 'Yes, switch' calls the server action, updates progress.json.currentWeek, and revalidates / and /weeks"
    - "Pressing 'Keep current' collapses the strip without any write"
    - "Pressing Escape while a row is confirming collapses the strip"
    - "After a successful switch, the 'Current' badge moves to the newly selected row on the next render"
    - "Error state shows 'Could not switch week. Try again.' inline"
  artifacts:
    - path: "src/lib/progress.ts"
      provides: "switchCurrentWeek(weekId) write helper"
      exports: ["switchCurrentWeek"]
    - path: "src/lib/actions/switch-week.ts"
      provides: "switchWeekAction server action"
      exports: ["switchWeekAction"]
    - path: "src/components/week-switch-confirm.tsx"
      provides: "Inline confirmation strip client island"
      min_lines: 30
    - path: "src/components/weeks-list.tsx"
      provides: "Updated client island wiring WeekSwitchConfirm into WeekRow"
      min_lines: 40
  key_links:
    - from: "src/components/week-switch-confirm.tsx"
      to: "src/lib/actions/switch-week.ts"
      via: "switchWeekAction server action call on confirm"
      pattern: "switchWeekAction"
    - from: "src/lib/actions/switch-week.ts"
      to: "src/lib/progress.ts"
      via: "switchCurrentWeek(weekId)"
      pattern: "switchCurrentWeek"
    - from: "src/components/weeks-list.tsx"
      to: "src/components/week-switch-confirm.tsx"
      via: "renders WeekSwitchConfirm when confirmingWeekId matches"
      pattern: "WeekSwitchConfirm"
---

<objective>
Wire the week-switching interaction: inline confirmation strip inside WeekRow, server action that writes progress.json.currentWeek, and route revalidation so the home view reflects the change.

Purpose: WEEKS-02 — Eugenia can select a week and confirm; progress.json.currentWeek updates.
Output: switchCurrentWeek helper, switchWeekAction server action, WeekSwitchConfirm client island, WeeksList updated to wire the strip.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/02-all-weeks-and-review/02-UI-SPEC.md
@.planning/phases/02-all-weeks-and-review/02-01-SUMMARY.md

<interfaces>
<!-- Existing patterns this plan must replicate. -->

From src/lib/progress.ts (current file, extend with switchCurrentWeek):
```typescript
// Existing private helpers (do not change):
async function readProgress(): Promise<ProgressData>
async function writeProgress(data: ProgressData): Promise<void>

// Existing exports (do not change):
export async function readOpenQuestionsForConcept(conceptId: string): Promise<Question[]>
export async function appendQuestion(question: Question): Promise<void>

// New export to add:
export async function switchCurrentWeek(weekId: string): Promise<void>
// Implementation: readProgress(), find week by id in progress.weeks,
// if not found throw new Error(`Week ${weekId} not found`),
// set progress.currentWeek = { id: week.id, moduleId: week.moduleId, number: week.number },
// writeProgress(progress).
```

From src/lib/actions/save-note.ts (server action pattern to replicate):
```typescript
"use server";
import { saveNote } from "@/lib/notes";
export async function saveNoteAction(slug: string, conceptId: string, body: string): Promise<void> {
  await saveNote(slug, conceptId, body);
}
// switchWeekAction follows the same thin-wrapper pattern.
// Also import revalidatePath from "next/cache" and call revalidatePath("/") and revalidatePath("/weeks").
```

From src/components/note-editor.tsx (client island error pattern):
```typescript
// Status machine: "idle" | "saving" | "error"
// On catch: setStatus("error")
// Error copy rendered inline below the action row
```

From 02-UI-SPEC.md WeekSwitchConfirm spec:
- Confirmation strip: bg-muted/60 rounded-b-xl px-5 py-3, flex items-center justify-between
- Confirmation text: "Switch to this week?" text-[13px] text-foreground
- "Yes, switch": variant default size sm text-[13px] (coral fill via default variant)
- "Keep current": variant ghost size sm text-[13px] text-muted-foreground
- Error: "Could not switch week. Try again." inline below strip, text-[13px] text-destructive
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add switchCurrentWeek to progress.ts and create switchWeekAction</name>
  <files>src/lib/progress.ts, src/lib/actions/switch-week.ts</files>
  <read_first>
    - src/lib/progress.ts (append after appendQuestion; do not touch existing exports)
    - src/lib/actions/save-note.ts (thin server action wrapper pattern)
    - src/lib/types.ts (Progress.currentWeek shape: { id, moduleId, number })
  </read_first>
  <action>
In src/lib/progress.ts, add after appendQuestion:

```typescript
/**
 * Updates progress.json.currentWeek to the given week.
 * Throws if weekId is not found in progress.weeks.
 */
export async function switchCurrentWeek(weekId: string): Promise<void> {
  const progress = await readProgress();
  const week = progress.weeks.find((w) => w.id === weekId);
  if (!week) throw new Error(`Week ${weekId} not found in progress.weeks`);
  progress.currentWeek = { id: week.id, moduleId: week.moduleId, number: week.number };
  await writeProgress(progress);
}
```

Create src/lib/actions/switch-week.ts as a new file:

```typescript
"use server";
import { revalidatePath } from "next/cache";
import { switchCurrentWeek } from "@/lib/progress";

export async function switchWeekAction(weekId: string): Promise<void> {
  await switchCurrentWeek(weekId);
  revalidatePath("/");
  revalidatePath("/weeks");
}
```

No other files touched.
  </action>
  <verify>pnpm tsc --noEmit exits 0</verify>
  <acceptance_criteria>
    - `grep -n "switchCurrentWeek" src/lib/progress.ts` matches the export
    - `grep -n '"use server"' src/lib/actions/switch-week.ts` matches line 1
    - `grep -n "revalidatePath" src/lib/actions/switch-week.ts` returns 2 matches (one for "/" and one for "/weeks")
    - `grep -n "appendQuestion\|readOpenQuestionsForConcept" src/lib/progress.ts` still returns original exports (nothing removed)
    - pnpm tsc --noEmit exits 0
  </acceptance_criteria>
  <done>switchCurrentWeek exported from progress.ts; switchWeekAction server action created and revalidates both / and /weeks</done>
</task>

<task type="auto">
  <name>Task 2: Build WeekSwitchConfirm island and wire into WeeksList</name>
  <files>src/components/week-switch-confirm.tsx, src/components/weeks-list.tsx</files>
  <read_first>
    - src/components/weeks-list.tsx (current file from 02-01; confirmingWeekId state already declared; update this file)
    - src/components/note-editor.tsx (status machine + error display pattern)
    - src/components/open-question-capture.tsx (client island pattern)
    - .planning/phases/02-all-weeks-and-review/02-UI-SPEC.md (WeekSwitchConfirm, interaction contracts)
  </read_first>
  <action>
--- src/components/week-switch-confirm.tsx ---
"use client" island. Props:
```typescript
interface WeekSwitchConfirmProps {
  weekId: string;
  onCancel: () => void;
  onSuccess: () => void;
}
```

State: `status: "idle" | "saving" | "error"`, initialized to "idle".

Render:
```
div.bg-muted/60.rounded-b-xl.px-5.py-3.flex.flex-col.gap-2
  div.flex.items-center.justify-between
    span.text-[13px].text-foreground  "Switch to this week?"
    div.flex.gap-2
      Button variant="ghost" size="sm" text-[13px] text-muted-foreground  onClick={onCancel}  "Keep current"
      Button variant="default" size="sm" text-[13px]  onClick={handleConfirm}  disabled={status==="saving"}  "Yes, switch"
  if status === "error":
    p.text-[13px].text-destructive  "Could not switch week. Try again."
```

handleConfirm implementation:
```typescript
async function handleConfirm() {
  setStatus("saving");
  try {
    await switchWeekAction(weekId);
    onSuccess();
  } catch {
    setStatus("error");
  }
}
```

Import switchWeekAction from "@/lib/actions/switch-week".

--- src/components/weeks-list.tsx ---
Update this file (already created in 02-01). Additions only:
1. Import WeekSwitchConfirm.
2. Import useRouter from "next/navigation" — add `const router = useRouter()`.
3. Add keydown handler for Escape on the document: use `useEffect` to attach a `keydown` listener that calls `setConfirmingWeekId(null)` when `e.key === "Escape"`. Cleanup on unmount.
4. When rendering a WeekRow, wrap it and its potential confirmation strip in a `div key={week.id}` with `className="flex flex-col"`.
5. After WeekRow, conditionally render WeekSwitchConfirm when `confirmingWeekId === week.id`:
   ```tsx
   {confirmingWeekId === week.id && (
     <WeekSwitchConfirm
       weekId={week.id}
       onCancel={() => setConfirmingWeekId(null)}
       onSuccess={() => {
         setConfirmingWeekId(null);
         router.refresh();
       }}
     />
   )}
   ```
6. In WeekRow onClick: clicking a week that is already current (`week.id === currentWeekId`) should do nothing. Update the onClick handler:
   ```tsx
   onClick={week.id === currentWeekId ? undefined : () => setConfirmingWeekId(week.id)}
   ```
   Also add `cursor-default` class to WeekRow when isCurrent (pass an additional prop or handle in WeekRow directly via `isCurrent`). Since WeekRow already accepts `onClick?: () => void`, passing `undefined` stops the click from triggering state change. WeekRow's outer div cursor class: update week-row.tsx to use `className={[..., onClick ? "cursor-pointer" : "cursor-default"].join(" ")}` by checking if onClick prop is defined.

Update week-row.tsx to conditionally apply cursor:
The outer div in week-row.tsx should use `cursor-pointer` only when `onClick` is defined. Change the className to include `onClick ? "cursor-pointer" : ""`.
  </action>
  <verify>
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/weeks
    Expected: 200
    Also: pnpm tsc --noEmit exits 0
  </verify>
  <acceptance_criteria>
    - `grep -n '"use client"' src/components/week-switch-confirm.tsx` matches line 1
    - `grep -n "switchWeekAction" src/components/week-switch-confirm.tsx` returns a match
    - `grep -n "WeekSwitchConfirm" src/components/weeks-list.tsx` returns a match (import and usage)
    - `grep -n "useRouter\|router.refresh" src/components/weeks-list.tsx` returns matches
    - `grep -n "useEffect" src/components/weeks-list.tsx` returns a match (Escape handler)
    - `grep -n "Could not switch week" src/components/week-switch-confirm.tsx` returns a match
    - pnpm tsc --noEmit exits 0
    - curl http://localhost:3000/weeks returns 200
  </acceptance_criteria>
  <done>
    Inline confirmation strip renders below a clicked non-current week row. "Yes, switch" writes to progress.json and refreshes. "Keep current" or Escape dismisses. Error state shows inline. Current week row is not clickable.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client -> server action | weekId travels from client click to switchWeekAction; must be validated server-side |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-03 | Tampering | switchCurrentWeek | mitigate | Validate weekId exists in progress.weeks before writing; throws Error if not found |
| T-02-04 | Elevation of Privilege | switchWeekAction | accept | Single-user local tool; no auth boundary to elevate past |
| T-02-05 | Denial of Service | progress.json write | accept | Sequential write via writeProgress; concurrent writes not possible from a single browser tab |
</threat_model>

<verification>
After plan execution:
- pnpm tsc --noEmit exits 0
- curl http://localhost:3000/weeks returns 200
- Clicking week 1 row (current week) does nothing visually
- If a second week existed, clicking it would show the confirmation strip
- switchWeekAction revalidates both / and /weeks (inspect action file)
</verification>

<success_criteria>
- switchCurrentWeek exported from progress.ts, validates weekId before write
- switchWeekAction server action calls revalidatePath("/") and revalidatePath("/weeks")
- WeekSwitchConfirm island renders confirmation strip with "Yes, switch" and "Keep current" buttons and error state
- WeeksList wired: Escape collapses strip, onSuccess calls router.refresh(), current week not clickable
- pnpm tsc --noEmit exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/02-all-weeks-and-review/02-02-SUMMARY.md`
</output>
