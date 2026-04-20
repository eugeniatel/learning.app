import { Shell } from "@/components/shell";
import { ComingSoon } from "@/components/coming-soon";
import { getProgress } from "@/lib/data";

export default async function ConceptsPage() {
  const progress = await getProgress();
  return (
    <Shell phase={progress.phase}>
      <ComingSoon title="Concepts" note="Index of concepts across modules. Ships in session 2." />
    </Shell>
  );
}
