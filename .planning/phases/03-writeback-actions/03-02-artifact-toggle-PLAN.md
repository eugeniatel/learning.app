---
phase: 03-writeback-actions
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/artifacts.ts
  - src/lib/actions/toggle-artifact-status.ts
  - src/components/artifact-chip.tsx
autonomous: true
requirements:
  - ARTIFACT-01

must_haves:
  truths:
    - "Clicking the toggle button on any artifact chip cycles its read status (unread -> in_progress -> read -> unread)"
    - "The status change is optimistic: icon updates immediately without waiting for the write"
    - "The new read status persists in artifacts.json across page reloads"
    - "Clicking the artifact title/icon still opens the artifact URL in a new tab; the toggle button does not trigger navigation"
  artifacts:
    - path: "src/lib/artifacts.ts"
      provides: "writeArtifactStatus(artifactId, newStatus) — atomic write to artifacts.json"
      exports: ["writeArtifactStatus"]
    - path: "src/lib/actions/toggle-artifact-status.ts"
      provides: "toggleArtifactStatusAction server action"
      exports: ["toggleArtifactStatusAction"]
    - path: "src/components/artifact-chip.tsx"
      provides: "client component with toggle button + anchor as separate interactive zones"
      min_lines: 55
  key_links:
    - from: "src/components/artifact-chip.tsx"
      to: "src/lib/actions/toggle-artifact-status.ts"
      via: "void toggleArtifactStatusAction(artifact.id, nextStatus)"
      pattern: "toggleArtifactStatusAction"
    - from: "src/lib/actions/toggle-artifact-status.ts"
      to: "src/lib/artifacts.ts"
      via: "writeArtifactStatus(artifactId, newStatus)"
      pattern: "writeArtifactStatus"
---

<objective>
Make artifact read-status interactive: a small toggle button on each chip cycles unread/in_progress/read and writes back to artifacts.json.

Purpose: Closes ARTIFACT-01. Eugenia can track which resources she has read without leaving the page.
Output: src/lib/artifacts.ts (write helper), src/lib/actions/toggle-artifact-status.ts (server action), updated artifact-chip.tsx (client component).
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

From src/lib/data.ts — existing getArtifacts pattern (mirror for write):
```typescript
// getArtifacts reads artifacts.json, parses with artifactsFileSchema, returns artifacts array
// writeArtifactStatus must: read full file -> mutate one artifact's readStatus -> write back atomically
// Use paths.artifactsFile (curriculum/artifacts.json)
// Use artifactsFileSchema for parse; write back as { artifacts: [...] }
```

From src/lib/schemas.ts:
```typescript
export const artifactSchema = z.object({
  id: z.string(),
  type: z.enum(["video", "paper", "repo", "post", "podcast"]),
  title: z.string(),
  url: z.string(),
  author: z.string().optional(),
  readStatus: z.enum(["unread", "in_progress", "read"]).default("unread"),
});
export const artifactsFileSchema = z.object({ artifacts: z.array(artifactSchema) });
```

From src/lib/types.ts:
```typescript
export type ReadStatus = "unread" | "in_progress" | "read";
export type Artifact = { id: string; type: ArtifactType; title: string; url: string; author?: string; readStatus: ReadStatus; };
```

From src/components/artifact-chip.tsx (current, before changes):
```typescript
// Currently a plain <a> anchor wrapping icon + title + type label
// Needs to become: flex row with two interactive zones
//   Zone 1 (left): toggle <button> with e.stopPropagation() + e.preventDefault() on click
//   Zone 2 (right): <a> anchor opening artifact.url in new tab (unchanged behavior)
// The outer wrapper becomes a <div> (not an <a>) to allow a sibling button + anchor
```

Toggle button spec (from 03-UI-SPEC.md):
```
State icons (all grayscale, lucide-react):
  unread:     Circle       text-muted-foreground/50  strokeWidth=1     size-3.5
  in_progress: CircleDot   text-muted-foreground     strokeWidth=1.5   size-3.5
  read:       CheckCircle2 text-foreground/70        strokeWidth=1.5   size-3.5

Cycle order: unread -> in_progress -> read -> unread
aria-label (cycling to in_progress): "Mark artifact as in progress"
aria-label (cycling to read):        "Mark artifact as read"
aria-label (cycling to unread):      "Mark artifact as unread"
type="button", no background/border/padding, cursor-pointer
180ms ease-out color transition
```

Server action spec (from 03-UI-SPEC.md):
```typescript
// src/lib/actions/toggle-artifact-status.ts
"use server"
// toggleArtifactStatusAction(artifactId: string, newStatus: "unread" | "in_progress" | "read"): Promise<void>
// Calls writeArtifactStatus(artifactId, newStatus)
// revalidatePath("/concepts", "layout") to cover all concept detail pages
// Also revalidatePath("/") to update This Week view artifact chips
```
</interfaces>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create artifacts.ts write helper and toggle server action</name>
  <files>src/lib/artifacts.ts, src/lib/actions/toggle-artifact-status.ts</files>
  <action>
Create src/lib/artifacts.ts with a single exported function:

```typescript
import fs from "node:fs/promises";
import { paths } from "./paths";
import { artifactsFileSchema } from "./schemas";
import type { ReadStatus } from "./types";

/**
 * Reads artifacts.json, updates the readStatus of the artifact with the given id, writes back.
 * Throws if the artifact id is not found.
 */
export async function writeArtifactStatus(artifactId: string, newStatus: ReadStatus): Promise<void> {
  const raw = await fs.readFile(paths.artifactsFile, "utf8");
  const parsed = artifactsFileSchema.parse(JSON.parse(raw));
  const idx = parsed.artifacts.findIndex((a) => a.id === artifactId);
  if (idx === -1) throw new Error(`Artifact ${artifactId} not found`);
  parsed.artifacts[idx] = { ...parsed.artifacts[idx], readStatus: newStatus };
  await fs.writeFile(paths.artifactsFile, JSON.stringify({ artifacts: parsed.artifacts }, null, 2), "utf8");
}
```

Create src/lib/actions/toggle-artifact-status.ts as a thin "use server" wrapper:

```typescript
"use server";
import { revalidatePath } from "next/cache";
import { writeArtifactStatus } from "@/lib/artifacts";
import type { ReadStatus } from "@/lib/types";

export async function toggleArtifactStatusAction(
  artifactId: string,
  newStatus: ReadStatus
): Promise<void> {
  await writeArtifactStatus(artifactId, newStatus);
  revalidatePath("/concepts", "layout");
  revalidatePath("/");
}
```
  </action>
  <verify>
    <automated>cd /Users/euge/Desktop/curriculum-app && pnpm tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>src/lib/artifacts.ts and src/lib/actions/toggle-artifact-status.ts created; tsc exits 0</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Refactor ArtifactChip to client component with toggle button</name>
  <files>src/components/artifact-chip.tsx</files>
  <action>
Rewrite src/components/artifact-chip.tsx as a "use client" component. The existing prop interface stays the same: `{ artifact: Artifact }`.

New structure: outer `<div>` as flex row, no longer an `<a>` wrapper. Two interactive zones: the toggle button (left) and the anchor (right, covering the rest of the chip).

State: `const [readStatus, setReadStatus] = useState<ReadStatus>(artifact.readStatus)`

Cycle function:
```typescript
function nextStatus(current: ReadStatus): ReadStatus {
  if (current === "unread") return "in_progress";
  if (current === "in_progress") return "read";
  return "unread";
}
```

Toggle button click:
```typescript
function handleToggle(e: React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
  const next = nextStatus(readStatus);
  setReadStatus(next);
  void toggleArtifactStatusAction(artifact.id, next);
}
```

Toggle icon map:
```typescript
// Circle from lucide-react (unread): className="size-3.5 text-muted-foreground/50" strokeWidth={1}
// CircleDot from lucide-react (in_progress): className="size-3.5 text-muted-foreground" strokeWidth={1.5}
// CheckCircle2 from lucide-react (read): className="size-3.5 text-foreground/70" strokeWidth={1.5}
```

aria-label for toggle button:
```typescript
const ariaLabelMap: Record<ReadStatus, string> = {
  in_progress: "Mark artifact as in progress",
  read: "Mark artifact as read",
  unread: "Mark artifact as unread",
};
// Use ariaLabelMap[nextStatus(readStatus)] as the aria-label value
```

Full outer container:
```tsx
<div className="inline-flex max-w-full items-center gap-2 rounded-md bg-muted/60 px-2.5 py-1 text-[12.5px] text-foreground hover:bg-muted">
  <button
    type="button"
    aria-label={ariaLabelMap[nextStatus(readStatus)]}
    onClick={handleToggle}
    className="z-10 shrink-0 cursor-pointer transition-colors duration-[180ms] ease-out"
  >
    <ToggleIcon />
  </button>
  <a
    href={artifact.url}
    target="_blank"
    rel="noreferrer"
    className="inline-flex min-w-0 items-center gap-2"
  >
    <Icon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
    <span className="truncate">{artifact.title}</span>
    <span className="shrink-0 text-muted-foreground">{labelFor[artifact.type]}</span>
  </a>
</div>
```

Imports needed: `"use client"`, `useState` from react, `Circle`, `CircleDot`, `CheckCircle2`, and the existing artifact type icons from lucide-react; `toggleArtifactStatusAction` from "@/lib/actions/toggle-artifact-status"; `ReadStatus` from "@/lib/types".

Keep existing `iconFor` and `labelFor` maps for artifact type icons unchanged.
  </action>
  <verify>
    <automated>cd /Users/euge/Desktop/curriculum-app && pnpm tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>artifact-chip.tsx has "use client" directive, toggle button with correct aria-labels, anchor wraps title/icon, tsc exits 0</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client toggle click -> server action | artifactId and newStatus cross trust boundary via toggleArtifactStatusAction |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-02-01 | Tampering | writeArtifactStatus | accept | Single-user local tool; artifactId validated by findIndex (throws if not found); no path traversal possible via id |
| T-03-02-02 | Tampering | newStatus enum | accept | TypeScript ReadStatus type at action boundary; zod schema validates on re-parse |
| T-03-02-03 | Information Disclosure | artifacts.json write | accept | curriculum/ directory is local only; no PII; not a server with external access |
</threat_model>

<verification>
1. `pnpm tsc --noEmit` exits 0
2. Manual: load /concepts/[any slug], click toggle on an artifact chip, confirm icon changes immediately
3. Reload the page, confirm the icon reflects the updated status
4. Inspect curriculum/artifacts.json and confirm readStatus field updated for the correct artifact id
5. Confirm clicking the artifact title still opens a new tab (anchor behavior unaffected)
</verification>

<success_criteria>
- ArtifactChip renders toggle button (left) and anchor (right) as separate interactive elements
- Toggle button cycles unread -> in_progress -> read -> unread with correct grayscale icons
- Status persists across reloads in artifacts.json
- Anchor opens artifact URL in new tab; toggle button does not trigger navigation
</success_criteria>

<output>
After completion, create .planning/phases/03-writeback-actions/03-02-SUMMARY.md
</output>
