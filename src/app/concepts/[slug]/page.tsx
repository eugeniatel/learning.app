import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { ConceptHeader } from "@/components/concept-header";
import { ArtifactList } from "@/components/artifact-list";
import { RelatedConceptsList } from "@/components/related-concepts-list";
import { ReviewStub } from "@/components/review-stub";
import { getConceptBySlug, getArtifacts, getConcepts, getProgress } from "@/lib/data";

export default async function ConceptDetailPage(props: PageProps<"/concepts/[slug]">) {
  const { slug } = await props.params;

  const [concept, allArtifacts, allConcepts, progress] = await Promise.all([
    getConceptBySlug(slug),
    getArtifacts(),
    getConcepts(),
    getProgress(),
  ]);

  if (!concept) notFound();

  const conceptArtifacts = allArtifacts.filter((a) =>
    concept.artifactIds.includes(a.id)
  );

  const relatedConcepts = allConcepts
    .filter(
      (c) =>
        c.id !== concept.id &&
        c.moduleIds.some((mid) => concept.moduleIds.includes(mid))
    )
    .slice(0, 10);

  return (
    <Shell phase={progress.phase}>
      <ConceptHeader concept={concept} />
      <div className="flex gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <ArtifactList artifacts={conceptArtifacts} />
          {/* NoteEditor mounts here in Plan 03 */}
          {/* OpenQuestionCapture mounts here in Plan 04 */}
        </div>
        <div className="flex w-56 shrink-0 flex-col gap-6">
          <ReviewStub />
          <RelatedConceptsList concepts={relatedConcepts} />
        </div>
      </div>
    </Shell>
  );
}
