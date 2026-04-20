import { Shell } from "@/components/shell";
import { ConceptIndex } from "@/components/concept-index";
import { getProgress, getConceptsGroupedByModule } from "@/lib/data";

export default async function ConceptsPage() {
  const [progress, groups] = await Promise.all([
    getProgress(),
    getConceptsGroupedByModule(),
  ]);
  return (
    <Shell phase={progress.phase}>
      <ConceptIndex groups={groups} />
    </Shell>
  );
}
