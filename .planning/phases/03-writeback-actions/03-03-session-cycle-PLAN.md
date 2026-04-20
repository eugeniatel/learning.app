---
phase: 03-writeback-actions
plan: 03
type: execute
wave: 2
depends_on: []
files_modified:
  - src/lib/progress.ts
  - src/lib/actions/cycle-session-status.ts
  - src/components/session-card.tsx
  - src/components/week-view.tsx
autonomous: true
requirements:
  - SESSION-01
  - SESSION-02

must_haves:
  truths:
    - "Clicking the StatusIcon on a session card cycles status todo -> in_progress -> done -> todo"
    - "The icon updates immediately (optimistic) without waiting for the server write"
    - "The new status persists in progress.json across page reloads"
    - "Only the StatusIcon element is clickable; the rest of the card (title, estimated minutes, artifact chips) is not"
    - "completedAt is written when cycling to done and removed when cycling away from done"
  artifacts:
    - path: "src/lib/progress.ts"
      provides: "cycleSessionStatus(weekId, sessionId, newStatus) added"
      exports: ["cycleSessionStatus"]
    - path: "src/lib/actions/cycle-session-status.ts"
      provides: "cycleSessionStatusAction server action"
      exports: ["cycleSessionStatusAction"]
    - path: "src/components/session-card.tsx"
      provides: "client component with StatusIcon as a button"
      min_lines: 50
  key_links:
    - from: "src/components/session-card.tsx"
      to: "src/lib/actions/cycle-session-status.ts"
      via: "void cycleSessionStatusAction(weekId, sessionId, nextStatus)"
      pattern: "cycleSessionStatusAction"
    - from: "src/lib/actions/cycle-session-status.ts"
      to: "src/lib/progress.ts"
      via: "cycleSessionStatus(weekId, sessionId, newStatus)"
      pattern: "cycleSessionStatus"
    - from: "src/components/week-view.tsx"
      to: "src/components/session-card.tsx"
      via: "weekId prop passed from week.id"
      pattern: "weekId={week.id}"
---

<objective>
Make session status interactive: the StatusIcon on each SessionCard becomes a button that cycles status and writes back to progress.json.

Purpose: Closes SESSION-01 and SESSION-02. The This Week view becomes a live tracker, not a read-only display.
Output: cycleSessionStatus added to progress.ts, new cycle-session-status server action, SessionCard refactored to client component, WeekView passes weekId.
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
<!-- Exact contracts the executor works against. No codebase exploration needed. -->

From src/lib/progress.ts (existing pattern, add to bottom):
```typescript
// readProgress() / writeProgress() are private helpers already in the file
// cycleSessionStatus new function signature:
export async function cycleSessionStatus(
  weekId: string,
  sessionId: string,
  newStatus: "todo" | "in_progress" | "done"
): Promise<void>
// Logic:
//   1. readProgress()
//   2. find week by weekId (throw if not found)
//   3. find session by sessionId within week.sessions (throw if not found)
//   4. session.status = newStatus
//   5. if newStatus === "done": session.completedAt = new Date().toISOString()
//      else: delete session.completedAt (use delete operator or omit field)
//   6. writeProgress(data)
```

From src/components/session-card.tsx (current state, before changes):
```typescript
// Currently a server component with a StatusIcon sub-component
// Props: { session: Session; artifacts: Artifact[]; upNext: boolean }
// weekId is NOT currently a prop — must be added
// StatusIcon renders Circle / CircleDot / Check based on status
```

New SessionCard props (from 03-UI-SPEC.md):
```typescript
// { session: Session; artifacts: Artifact[]; upNext: boolean; weekId: string }
// weekId: required — passed from WeekView as week.id
```

StatusIcon as button spec (from 03-UI-SPEC.md):
```typescript
// Wrap existing StatusIcon render in a <button> element
// type="button"
// cursor-pointer
// No extra padding or border (icon is the entire hit target)
// aria-label constructed from status:
//   "todo"        -> "Session status: todo. Click to cycle."
//   "in_progress" -> "Session status: in progress. Click to cycle."
//   "done"        -> "Session status: done. Click to cycle."
// onClick: compute nextStatus, setStatus(next) optimistically, void cycleSessionStatusAction(weekId, session.id, next)
// On failure: revert status in catch block
```

Cycle order: todo -> in_progress -> done -> todo

Optimistic pattern (fire-and-forget with revert on failure):
```typescript
async function handleClick() {
  const prev = status;
  const next = cycleNext(status);
  setStatus(next);
  try {
    await cycleSessionStatusAction(weekId, session.id, next);
  } catch {
    setStatus(prev);
  }
}
// Note: unlike the artifact chip, this one awaits so it can revert on failure (per UI-SPEC)
```

From src/components/week-view.tsx (needs weekId prop threading):
```typescript
// WeekView renders SessionCard; add weekId={week.id} to each <SessionCard> call
// No other changes needed to WeekView
// If WeekView was made async in plan 03-01 (readReflection), keep it async
// The weekId is already available as week.id from the week prop
```

From src/lib/actions pattern (thin wrapper):
```typescript
"use server";
import { revalidatePath } from "next/cache";
import { cycleSessionStatus } from "@/lib/progress";
import type { SessionStatus } from "@/lib/types";

export async function cycleSessionStatusAction(
  weekId: string,
  sessionId: string,
  newStatus: SessionStatus
): Promise<void> {
  await cycleSessionStatus(weekId, sessionId, newStatus);
  revalidatePath("/");
}
```
</interfaces>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Add cycleSessionStatus to progress.ts and create server action</name>
  <files>src/lib/progress.ts, src/lib/actions/cycle-session-status.ts</files>
  <action>
Add cycleSessionStatus to the bottom of src/lib/progress.ts. The existing readProgress/writeProgress private helpers are reused. Do not modify any existing exported functions.

```typescript
/**
 * Updates the status of a session within a week in progress.json.
 * Sets completedAt to current ISO timestamp when newStatus is "done".
 * Removes completedAt when newStatus is not "done".
 * Throws if weekId or sessionId is not found.
 */
export async function cycleSessionStatus(
  weekId: string,
  sessionId: string,
  newStatus: "todo" | "in_progress" | "done"
): Promise<void> {
  const progress = await readProgress();
  const week = progress.weeks.find((w) => w.id === weekId);
  if (!week) throw new Error(`Week ${weekId} not found in progress.weeks`);
  const session = week.sessions.find((s) => s.id === sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found in week ${weekId}`);
  session.status = newStatus;
  if (newStatus === "done") {
    session.completedAt = new Date().toISOString();
  } else {
    delete session.completedAt;
  }
  await writeProgress(progress);
}
```

Create src/lib/actions/cycle-session-status.ts:

```typescript
"use server";
import { revalidatePath } from "next/cache";
import { cycleSessionStatus } from "@/lib/progress";
import type { SessionStatus } from "@/lib/types";

export async function cycleSessionStatusAction(
  weekId: string,
  sessionId: string,
  newStatus: SessionStatus
): Promise<void> {
  await cycleSessionStatus(weekId, sessionId, newStatus);
  revalidatePath("/");
}
```
  </action>
  <verify>
    <automated>cd /Users/euge/Desktop/curriculum-app && pnpm tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>cycleSessionStatus exported from progress.ts; cycle-session-status.ts exports cycleSessionStatusAction; tsc exits 0</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Refactor SessionCard to client component with StatusIcon button and thread weekId through WeekView</name>
  <files>src/components/session-card.tsx, src/components/week-view.tsx</files>
  <action>
Rewrite src/components/session-card.tsx as a "use client" component.

Add `"use client"` directive at the top. Add `useState` import from react. Add `cycleSessionStatusAction` import from "@/lib/actions/cycle-session-status".

New props type:
```typescript
{
  session: Session;
  artifacts: Artifact[];
  upNext: boolean;
  weekId: string;  // new required prop
}
```

State: `const [status, setStatus] = useState<SessionStatus>(session.status)`

Cycle function:
```typescript
function cycleNext(s: SessionStatus): SessionStatus {
  if (s === "todo") return "in_progress";
  if (s === "in_progress") return "done";
  return "todo";
}
```

aria-label map:
```typescript
const ariaLabel: Record<SessionStatus, string> = {
  todo: "Session status: todo. Click to cycle.",
  in_progress: "Session status: in progress. Click to cycle.",
  done: "Session status: done. Click to cycle.",
};
```

Click handler (awaits for revert-on-failure per UI-SPEC):
```typescript
async function handleStatusClick() {
  const prev = status;
  const next = cycleNext(status);
  setStatus(next);
  try {
    await cycleSessionStatusAction(weekId, session.id, next);
  } catch {
    setStatus(prev);
  }
}
```

JSX change: wrap the `<StatusIcon>` element in a `<button>`:
```tsx
<button
  type="button"
  aria-label={ariaLabel[status]}
  onClick={handleStatusClick}
  className="cursor-pointer"
>
  <StatusIcon status={status} />
</button>
```

The dim/stronger logic uses the local `status` state (not session.status) so it stays in sync with the optimistic update:
```typescript
const dim = status === "done";
const stronger = status === "in_progress" || upNext;
```

The rest of the article JSX is unchanged. ArtifactChip renders are unchanged.

The StatusIcon sub-component function is unchanged (still uses the passed `status` prop).

Update src/components/week-view.tsx: add `weekId={week.id}` to each `<SessionCard>` invocation. This is the only change needed to WeekView in this task (plan 03-01 already made it async if it modified WeekView; if not, no async change needed here).
  </action>
  <verify>
    <automated>cd /Users/euge/Desktop/curriculum-app && pnpm tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>session-card.tsx has "use client" directive, weekId in props, StatusIcon wrapped in button element; week-view.tsx passes weekId={week.id} to each SessionCard; tsc exits 0</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client button click -> server action | weekId, sessionId, newStatus cross trust boundary via cycleSessionStatusAction |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-03-01 | Tampering | cycleSessionStatus | accept | Single-user local tool; weekId and sessionId validated by findIndex (throws if not found); no path traversal possible |
| T-03-03-02 | Tampering | newStatus enum | accept | TypeScript SessionStatus type at action boundary; zod progressSchema validates on re-parse |
| T-03-03-03 | Spoofing | completedAt timestamp | accept | Single-user local tool; timestamp is informational only, not used for security decisions |
</threat_model>

<verification>
1. `pnpm tsc --noEmit` exits 0
2. Manual: load /, click the StatusIcon on a todo session card, confirm icon changes to CircleDot immediately
3. Click again, confirm icon changes to Check (done state)
4. Click again, confirm icon returns to Circle (todo state)
5. Reload and confirm status persists in the displayed icon
6. Inspect progress.json and confirm status and completedAt fields updated correctly
7. Confirm clicking the session title text does nothing (not a button)
</verification>

<success_criteria>
- StatusIcon on each SessionCard is a clickable button with correct aria-labels
- Status cycles todo -> in_progress -> done -> todo with optimistic UI update
- completedAt written when cycling to done, removed when cycling away from done
- Persisted status visible after page reload
- Artifact chips and session title remain non-interactive (layout unchanged)
</success_criteria>

<output>
After completion, create .planning/phases/03-writeback-actions/03-03-SUMMARY.md
</output>
