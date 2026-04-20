import { Shell } from "@/components/shell";
import { ComingSoon } from "@/components/coming-soon";
import { getProgress } from "@/lib/data";

export default async function ReviewPage() {
  const progress = await getProgress();
  return (
    <Shell phase={progress.phase}>
      <ComingSoon title="Review" note="One card at a time, ready or not ready. Ships in session 3." />
    </Shell>
  );
}
