---
phase: 03-writeback-actions
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/reflections.ts
  - src/lib/actions/save-reflection.ts
  - src/components/reflection-prompt.tsx
  - src/components/week-view.tsx
autonomous: true
requirements:
  - REFLECT-01

must_haves:
  truths:
    - "Typing in the reflection textarea and clicking Save reflection persists the text to notes/reflections/week-<id>.md"
    - "Reloading the page repopulates the textarea with the saved text"
    - "The Save reflection button shows coral fill only when there is unsaved text (dirty state)"
    - "The button label shows Saved for 2 seconds after a successful save then reverts to Save reflection"
    - "An inline error message appears below the save button on write failure"
  artifacts:
    - path: "src/lib/reflections.ts"
      provides: "readReflection(weekId) and saveReflection(weekId, body)"
      exports: ["readReflection", "saveReflection"]
    - path: "src/lib/actions/save-reflection.ts"
      provides: "saveReflectionAction server action"
      exports: ["saveReflectionAction"]
    - path: "src/components/reflection-prompt.tsx"
      provides: "enabled client island with dirty-save UX"
      min_lines: 50
  key_links:
    - from: "src/components/reflection-prompt.tsx"
      to: "src/lib/actions/save-reflection.ts"
      via: "saveReflectionAction call on button click"
      pattern: "saveReflectionAction"
    - from: "src/lib/actions/save-reflection.ts"
      to: "src/lib/reflections.ts"
      via: "saveReflection(weekId, body)"
      pattern: "saveReflection"
    - from: "src/components/week-view.tsx"
      to: "src/components/reflection-prompt.tsx"
      via: "initialValue prop from server-read"
      pattern: "initialValue"
---

<objective>
Enable the reflection textarea on the home view: saving text to notes/reflections/week-{id}.md and repopulating it on reload.

Purpose: Closes REFLECT-01. The tracker stops being passive for weekly reflections.
Output: src/lib/reflections.ts, src/lib/actions/save-reflection.ts, updated reflection-prompt.tsx (client island), updated week-view.tsx (passes initialValue).
</objective>

<execution_context>
@/Users/euge/.claude/get-shit-done/workflows/execute-plan.md
@/Users/euge/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/euge/Desktop/curriculum-app/.planning/PROJECT.md
@/Users/euge/Desktop/curriculum-app/.planning/ROADMAP.md
@/Users/euge/Desktop/curriculum-app/.planning/STATE.md
@/Users/euge/Desktop/curriculum-app/.planning/phases/03-writeback-actions/03-UI-SPEC.md
</context>

<interfaces>
<!-- Existing patterns the executor reuses directly. No exploration needed. -->

From src/lib/notes.ts (mirror exactly for reflections):
```typescript
// readNote mirrors -> readReflection(weekId: string): Promise<string>
// saveNote mirrors -> saveReflection(weekId: string, body: string): Promise<void>
// Frontmatter: { weekId, kind: "week-reflection", updatedAt }
// File path: notes/reflections/week-{weekId}.md  (paths.reflectionsDir already exists in paths.ts)
```

From src/lib/paths.ts:
```typescript
export const paths = {
  reflectionsDir: path.join(root, "notes", "reflections"),
  // ...
};
```

From src/components/note-editor.tsx (dirty-save state machine to mirror):
```typescript
type Status = "idle" | "saving" | "saved" | "error";
// dirty = body !== savedBody
// On save: setStatus("saving") -> await action -> setSavedBody(body) -> setStatus("saved") -> setTimeout(2000) -> setStatus("idle")
// On error: setStatus("error")
// Button variant: dirty && status !== "saved" ? "default" : "outline"
//   "default" = bg-[var(--ring)] text-white (coral fill via shadcn default button)
// Button label: status === "saved" ? "Saved" : "Save reflection"
```

From src/components/week-view.tsx (current, needs async + initialValue threading):
```typescript
// WeekView currently renders: <ReflectionPrompt weekId={week.id} />
// Change: WeekView becomes async, calls readReflection(week.id), passes initialValue
// WeekView is already a server component (no "use client"), so async is fine
```

From src/components/reflection-prompt.tsx (current disabled state):
```typescript
// Props to add: initialValue: string
// Remove: disabled attribute on Textarea
// Remove: "Saving is enabled in a later session. v1 is a passive tracker." paragraph
// Keep: section container, heading, helper text, Textarea styles unchanged
// Heading copy: "End-of-week reflection" (13px font-medium uppercase tracking)
// Helper text: "One concept that clicked, one that did not, one question you are carrying forward."
// Textarea placeholder: "Write freely. This stays local."
// Save button copy (dirty): "Save reflection"
// Save button copy (just saved): "Saved"
// Error copy: "Could not save. Try again." (text-destructive text-[13px])
```

From src/lib/actions/save-note.ts (thin wrapper pattern):
```typescript
"use server";
// saveReflectionAction(weekId: string, body: string): Promise<void>
// Calls saveReflection(weekId, body)
// No revalidatePath needed (textarea stays on same page; value is already in client state)
```
</interfaces>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create reflections.ts and save-reflection server action</name>
  <files>src/lib/reflections.ts, src/lib/actions/save-reflection.ts</files>
  <action>
Create src/lib/reflections.ts mirroring the pattern in src/lib/notes.ts.

```typescript
// src/lib/reflections.ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { paths } from "./paths";

function reflectionFilePath(weekId: string): string {
  return path.join(paths.reflectionsDir, `week-${weekId}.md`);
}

export async function readReflection(weekId: string): Promise<string> {
  const file = reflectionFilePath(weekId);
  try {
    const raw = await fs.readFile(file, "utf8");
    const { content } = matter(raw);
    return content.trim();
  } catch {
    return "";
  }
}

export async function saveReflection(weekId: string, body: string): Promise<void> {
  await fs.mkdir(paths.reflectionsDir, { recursive: true });
  const file = reflectionFilePath(weekId);
  const updatedAt = new Date().toISOString();
  const output = matter.stringify(body, { weekId, kind: "week-reflection", updatedAt });
  await fs.writeFile(file, output, "utf8");
}
```

Create src/lib/actions/save-reflection.ts as a thin "use server" wrapper:

```typescript
"use server";
import { saveReflection } from "@/lib/reflections";

export async function saveReflectionAction(weekId: string, body: string): Promise<void> {
  await saveReflection(weekId, body);
}
```

No revalidatePath call is needed. The textarea client state already reflects the saved value after success.
  </action>
  <verify>
    <automated>cd /Users/euge/Desktop/curriculum-app && pnpm tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>src/lib/reflections.ts exports readReflection and saveReflection; src/lib/actions/save-reflection.ts exports saveReflectionAction; tsc exits 0</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Enable ReflectionPrompt as client island and thread initialValue through WeekView</name>
  <files>src/components/reflection-prompt.tsx, src/components/week-view.tsx</files>
  <action>
Rewrite src/components/reflection-prompt.tsx as a "use client" component, mirroring the NoteEditor state machine exactly.

Props: `{ weekId: string; initialValue: string }`

State machine type: `"idle" | "saving" | "saved" | "error"`

Logic:
- `body` state initialized from `initialValue`
- `savedBody` state initialized from `initialValue`
- `dirty = body !== savedBody`
- `handleSave`: setStatus("saving") -> await saveReflectionAction(weekId, body) -> setSavedBody(body) -> setStatus("saved") -> setTimeout(() => setStatus("idle"), 2000). On catch: setStatus("error").
- Button disabled while status === "saving"
- Button variant: `dirty && status !== "saved" ? "default" : "outline"` (default maps to coral fill per shadcn base-nova)

JSX structure (keep existing section/heading/helper untouched, update textarea + add button):
- Section: `<section className="mt-10 rounded-xl bg-secondary/60 p-6">`
- Heading: `<h3 className="text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">End-of-week reflection</h3>`
- Helper: `<p className="mt-1 text-[13px] text-muted-foreground">One concept that clicked, one that did not, one question you are carrying forward.</p>`
- Textarea: remove `disabled`; bind `value={body}` and `onChange`; keep existing className `min-h-[128px] resize-y bg-background text-[15px] leading-7`; placeholder "Write freely. This stays local."
- Remove the "Saving is enabled in a later session." paragraph entirely
- Error message (only when status === "error"): `<p className="mt-1.5 text-[13px] text-destructive">Could not save. Try again.</p>`
- Save button row: `<div className="mt-2 flex justify-end">` containing a `<Button>` with size="sm"
  - Label: status === "saved" ? "Saved" : "Save reflection"

Update src/components/week-view.tsx: make the function async and call readReflection before rendering.

Import readReflection from "@/lib/reflections" at the top.

Change:
```tsx
// Before
export function WeekView(...) {
  // ...
  return (
    // ...
    <ReflectionPrompt weekId={week.id} />
  );
}

// After
export async function WeekView(...) {
  // ...
  const initialReflection = await readReflection(week.id);
  return (
    // ...
    <ReflectionPrompt weekId={week.id} initialValue={initialReflection} />
  );
}
```

The WeekView is already a Server Component (no "use client") so making it async is valid.
  </action>
  <verify>
    <automated>cd /Users/euge/Desktop/curriculum-app && pnpm tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>reflection-prompt.tsx has "use client" directive, accepts initialValue prop, textarea is enabled, save button present; week-view.tsx is async and passes initialValue; tsc exits 0</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client textarea -> server action | User-supplied reflection body crosses the trust boundary via saveReflectionAction |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-01-01 | Tampering | saveReflection write path | accept | Single-user local tool on localhost; no auth surface; file write is bounded to notes/reflections/ subdirectory |
| T-03-01-02 | Denial of Service | saveReflection large body | accept | Single-user local tool; no size limit needed; disk space exhaustion is a localhost-only concern |
| T-03-01-03 | Information Disclosure | reflection file path | accept | paths.reflectionsDir is derived from process.cwd(); no weekId validation needed beyond gray-matter stringify safety |
</threat_model>

<verification>
1. `pnpm tsc --noEmit` exits 0
2. `curl -s http://localhost:3000/ | grep -q "Save reflection"` returns match
3. Manual: type in textarea, click Save reflection, verify button shows Saved for ~2s, reload and confirm text persists
4. Confirm notes/reflections/week-w1.md exists after save with correct frontmatter
</verification>

<success_criteria>
- Reflection textarea on / is enabled and accepts input
- Save reflection button turns coral when dirty, outline when clean
- Saved text persists to notes/reflections/week-{id}.md across page reloads
- "Saving is enabled in a later session." copy is gone from the UI
</success_criteria>

<output>
After completion, create .planning/phases/03-writeback-actions/03-01-SUMMARY.md
</output>
