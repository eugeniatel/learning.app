import { Shell } from "@/components/shell";
import { Textarea } from "@/components/ui/textarea";
import { getProgress } from "@/lib/data";

export default async function ImportPage() {
  const progress = await getProgress();

  return (
    <Shell phase={progress.phase}>
      <div className="mb-8">
        <p className="text-[13px] text-muted-foreground">Paste a simple outline</p>
        <h1 className="mt-1 text-[22px] font-medium text-foreground">Import markdown</h1>
      </div>
      <div className="flex max-w-xl flex-col gap-4">
        <p className="text-[14px] text-muted-foreground">
          Static GitHub Pages deployment cannot create curriculum files from the browser. Add new
          subjects in the repo, then redeploy.
        </p>
        <Textarea
          name="markdown"
          className="min-h-[260px]"
          placeholder={"# New subject\n\n## First module\n- First session\n- Second session\n- Third session"}
          disabled
        />
      </div>
    </Shell>
  );
}
