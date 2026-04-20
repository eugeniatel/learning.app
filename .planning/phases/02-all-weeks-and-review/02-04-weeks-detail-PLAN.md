---
id: 02-04
phase: 02
title: Per-week detail page and repositioned switch action
wave: 4
depends_on: [02-01, 02-02]
gap_closure: true
autonomous: true
requirements: [WEEKS-01, WEEKS-02]
files_modified:
  - src/app/weeks/[id]/page.tsx
  - src/components/week-row.tsx
  - src/components/weeks-list.tsx
  - src/components/week-switch-confirm.tsx
---

<objective>
Close the WEEKS-01 gap from Phase 02 verification: the row must link to a per-week detail route, not open an inline switch. Add `/weeks/[id]` that shows the week's sessions read-only and hosts the "Switch to this week" action there. Reuse the existing WeekSwitchConfirm + switchWeekAction (no throwaway code).

Interaction after this plan:
- `/weeks` list: each row is a Link to `/weeks/[id]`. No inline confirmation state on the list.
- `/weeks/[id]`: header + session list (read-only). If this is not the current week, show "Switch to this week" button that expands an inline confirm strip ("Yes, switch" / "Keep current"). If this IS the current week, show "This is your current week" muted copy instead.
</objective>

<must_haves>
truths:
  - Opening /weeks and clicking any row navigates to /weeks/<id> (Link + router).
  - /weeks/<id> returns 200 for a valid weekId; 404 for invalid.
  - /weeks/<id> renders the week header (number, date range, module title, module goal) and the week's sessions in read-only form.
  - On a non-current week detail page, a "Switch to this week" button is visible; clicking expands the confirmation; confirming updates progress.json.currentWeek and redirects/revalidates the home view.
  - On the current week detail page, no switch button. Instead: "This is your current week." muted copy.
artifacts:
  - src/app/weeks/[id]/page.tsx (new)
  - src/components/week-row.tsx (changed from clickable div to <Link>)
  - src/components/weeks-list.tsx (remove inline confirmation state; just render links)
  - src/components/week-switch-confirm.tsx (rendered on detail page instead of list)
key_links:
  - weeks/page.tsx -> weeks-list.tsx -> week-row.tsx (as Link) -> /weeks/[id]/page.tsx
  - /weeks/[id]/page.tsx -> week-switch-confirm.tsx -> actions/switch-week.ts -> progress.ts::switchCurrentWeek
</must_haves>

<tasks>

<task id="1">
<title>Build /weeks/[id]/page.tsx and switch affordance on detail page</title>

<read_first>
- /Users/euge/Desktop/curriculum-app/src/app/weeks/page.tsx (reference for data-fetching shape)
- /Users/euge/Desktop/curriculum-app/src/app/concepts/[slug]/page.tsx (reference for PageProps&lt;"/route/[param]"&gt; pattern and notFound() usage)
- /Users/euge/Desktop/curriculum-app/src/components/shell.tsx
- /Users/euge/Desktop/curriculum-app/src/components/week-header.tsx (REUSE)
- /Users/euge/Desktop/curriculum-app/src/components/session-card.tsx (REUSE read-only; no toggle)
- /Users/euge/Desktop/curriculum-app/src/components/week-switch-confirm.tsx (REUSE; if its interface assumes "one confirming at a time" list context, either refactor minimally or render it always-open on detail page)
- /Users/euge/Desktop/curriculum-app/src/lib/data.ts (getProgress, getArtifacts, getModule)
- /Users/euge/Desktop/curriculum-app/progress.json (confirm shape)
- /Users/euge/Desktop/curriculum-app/.planning/phases/02-all-weeks-and-review/02-UI-SPEC.md
</read_first>

<action>
Create `/Users/euge/Desktop/curriculum-app/src/app/weeks/[id]/page.tsx` as an async server component:

```tsx
import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { WeekHeader } from "@/components/week-header";
import { SessionCard } from "@/components/session-card";
import { WeekSwitchConfirm } from "@/components/week-switch-confirm";
import { getProgress, getArtifacts, getModule } from "@/lib/data";

export default async function WeekDetailPage(props: PageProps<"/weeks/[id]">) {
  const { id } = await props.params;
  const [progress, artifacts] = await Promise.all([getProgress(), getArtifacts()]);
  const week = progress.weeks.find((w) => w.id === id);
  if (!week) notFound();
  const module = await getModule(week.moduleId);
  if (!module) notFound();
  const isCurrent = progress.currentWeek.id === id;

  return (
    <Shell phase={progress.phase}>
      <WeekHeader week={week} module={module} />
      <div className="flex flex-col gap-3">
        {week.sessions.map((session) => {
          const sessionArtifacts = session.artifactIds
            .map((aid) => artifacts.find((a) => a.id === aid))
            .filter((a): a is NonNullable<typeof a> => !!a);
          return (
            <SessionCard
              key={session.id}
              session={session}
              artifacts={sessionArtifacts}
              upNext={false}
            />
          );
        })}
      </div>
      <div className="mt-10">
        {isCurrent ? (
          <p className="text-[13px] text-muted-foreground">
            This is your current week.
          </p>
        ) : (
          <WeekSwitchConfirm weekId={week.id} moduleTitle={module.title} />
        )}
      </div>
    </Shell>
  );
}
```

Notes:
- `PageProps<"/weeks/[id]">` comes from the auto-generated types. Run `pnpm exec next typegen` if the type isn't resolved.
- SessionCard rendered with `upNext={false}` for pure read-only. Status dots still render.
- If WeekSwitchConfirm currently expects list context (e.g., an "onCancel" that collapses it in a parent-managed state machine), render it always-open. It may need a minimal prop change; if so, extract that into Task 2 rather than over-editing here.
</action>

<verify>
```bash
cd /Users/euge/Desktop/curriculum-app
pnpm exec tsc --noEmit 2>&1 | tail -5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/weeks/w1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/weeks/w999
```
Expected: tsc clean; /weeks/w1 => 200; /weeks/w999 => 404.
</verify>

<acceptance_criteria>
- grep -l "export default async function WeekDetailPage" /Users/euge/Desktop/curriculum-app/src/app/weeks/[id]/page.tsx (file exists with this default export)
- grep -n "notFound()" /Users/euge/Desktop/curriculum-app/src/app/weeks/[id]/page.tsx (404 wired)
- grep -n "WeekSwitchConfirm" /Users/euge/Desktop/curriculum-app/src/app/weeks/[id]/page.tsx
- grep -n "This is your current week" /Users/euge/Desktop/curriculum-app/src/app/weeks/[id]/page.tsx
- curl http://localhost:3000/weeks/w1 returns 200
- curl http://localhost:3000/weeks/w999 returns 404
- pnpm exec tsc --noEmit exits 0
</acceptance_criteria>

<done>
/weeks/[id] page ships. Invalid id returns 404. Current week shows "This is your current week." Non-current weeks show WeekSwitchConfirm.
</done>
</task>

<task id="2">
<title>Convert WeekRow to Link and simplify WeeksList</title>

<read_first>
- /Users/euge/Desktop/curriculum-app/src/components/week-row.tsx (current clickable div)
- /Users/euge/Desktop/curriculum-app/src/components/weeks-list.tsx (current inline-confirmation state)
- /Users/euge/Desktop/curriculum-app/src/components/week-switch-confirm.tsx (ensure it remains usable on the detail page; if the original assumed an onCancel/onClose that unmounts it from a parent state machine, give it a self-contained fallback)
</read_first>

<action>
- Edit `src/components/week-row.tsx` to render as `<Link href={`/weeks/${week.id}`}>` wrapping the existing row content. Remove any `onClick`/`confirmingWeekId` prop wiring. Keep the "Current" badge and visual styles exactly as before. Keep cursor-pointer behavior via Link default.
- Edit `src/components/weeks-list.tsx` to remove the `confirmingWeekId` state (and its handlers), the Escape key effect, and the inline confirmation render slot under each row. The component now just maps rows as Links. Keep module group headers + empty state.
- Edit `src/components/week-switch-confirm.tsx` only if Task 1 surfaced a prop/interaction issue. Two possibilities:
  (a) It already works rendered on the detail page without modification — leave it.
  (b) It requires an `onCancel`/unmount-parent callback to reset state — add an internal collapsed-state fallback (controlled/uncontrolled pattern) so it renders always-open when no `onCancel` is provided. The "Keep current" button simply redirects back to `/weeks` (via `router.push("/weeks")`) when used on the detail page.

If weeks-list.tsx no longer imports WeekSwitchConfirm, remove the import. Keep the export from week-switch-confirm.tsx intact.
</action>

<verify>
```bash
cd /Users/euge/Desktop/curriculum-app
pnpm exec tsc --noEmit 2>&1 | tail -5
curl -s http://localhost:3000/weeks | grep -c 'href="/weeks/'
```
Expected: tsc clean; at least 1 href="/weeks/" match in the /weeks HTML.
</verify>

<acceptance_criteria>
- grep -n "from \"next/link\"" /Users/euge/Desktop/curriculum-app/src/components/week-row.tsx
- grep -n "<Link" /Users/euge/Desktop/curriculum-app/src/components/week-row.tsx
- grep -nE "confirmingWeekId|setConfirmingWeekId" /Users/euge/Desktop/curriculum-app/src/components/weeks-list.tsx exits with no matches (cleaned up)
- curl -s http://localhost:3000/weeks | grep -q 'href="/weeks/w1"'
- pnpm exec tsc --noEmit exits 0
</acceptance_criteria>

<done>
Rows are real links. List component no longer owns confirmation state. Confirmation lives on the detail page only.
</done>
</task>

</tasks>

<verification>
After both tasks, confirm:
1. /weeks renders module-grouped rows, each a link to /weeks/<id>.
2. /weeks/w1 renders the week's sessions read-only; shows "This is your current week." when w1 is current.
3. Navigating to /weeks/<non-current-id> shows the switch confirmation.
4. Confirming the switch updates progress.json.currentWeek.
5. tsc --noEmit passes.
6. No regressions in /review, /concepts, /concepts/[slug], or /.
</verification>
