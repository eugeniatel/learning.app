import { Shell } from "@/components/shell";
import { ComingSoon } from "@/components/coming-soon";
import { getProgress } from "@/lib/data";

export default async function QuestionsPage() {
  const progress = await getProgress();
  return (
    <Shell phase={progress.phase}>
      <ComingSoon title="Open questions" note="Queue of unresolved questions. Ships in session 4." />
    </Shell>
  );
}
