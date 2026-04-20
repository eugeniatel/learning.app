import { Shell } from "@/components/shell";
import { ComingSoon } from "@/components/coming-soon";
import { getProgress } from "@/lib/data";

export default async function WeeksPage() {
  const progress = await getProgress();
  return (
    <Shell phase={progress.phase}>
      <ComingSoon title="All weeks" note="Grouped by module. Ships in session 3." />
    </Shell>
  );
}
