import { Shell } from "@/components/shell";
import { ConceptIndex } from "@/components/concept-index";
import { getProgress, getConceptsGroupedByModule } from "@/lib/data";

export default async function ConceptsPage() {
  const progress = await getProgress();
  const groups = await getConceptsGroupedByModule(progress.currentSubjectId);
  return (
    <Shell phase={progress.phase}>
      <ConceptIndex groups={groups} />
    </Shell>
  );
}
