import { Shell } from "@/components/shell";
import { ComingSoon } from "@/components/coming-soon";
import { getProgress } from "@/lib/data";

export default async function ConceptDetailPage(props: PageProps<"/concepts/[slug]">) {
  const { slug } = await props.params;
  const progress = await getProgress();
  return (
    <Shell phase={progress.phase}>
      <ComingSoon
        title={`Concept: ${slug}`}
        note="Full concept detail, artifacts, notes, and review. Ships in session 2."
      />
    </Shell>
  );
}
