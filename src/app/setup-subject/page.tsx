import { Shell } from "@/components/shell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getProgress } from "@/lib/data";

export default async function SetupSubjectPage() {
  const progress = await getProgress();

  return (
    <Shell phase={progress.phase}>
      <div className="mb-8">
        <p className="text-[13px] text-muted-foreground">Create a lightweight track</p>
        <h1 className="mt-1 text-[22px] font-medium text-foreground">Add subject</h1>
      </div>
      <div className="flex max-w-xl flex-col gap-4">
        <p className="text-[14px] text-muted-foreground">
          Static GitHub Pages deployment keeps the app lightweight, but new subjects need to be
          added in the repo so they are part of the curriculum source.
        </p>
        <Input name="title" placeholder="Subject title" disabled />
        <Input name="description" placeholder="What this track covers" disabled />
        <Input name="cadence" placeholder="Cadence, e.g. 2 sessions per week" disabled />
        <Input name="moduleTitle" placeholder="First module title" disabled />
        <Textarea
          name="sessions"
          className="min-h-[140px]"
          placeholder={"First week sessions, one per line\nRead the core overview\nTake notes\nBuild a tiny example"}
          disabled
        />
      </div>
    </Shell>
  );
}
