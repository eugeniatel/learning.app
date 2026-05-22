import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { ConceptHeader } from "@/components/concept-header";
import { ResourceNotes } from "@/components/resource-notes";
import { OpenQuestionCapture } from "@/components/open-question-capture";
import { RelatedConceptsList } from "@/components/related-concepts-list";
import { getConceptBySlug, getArtifacts, getConcepts, getProgress } from "@/lib/data";

export const dynamicParams = false;

export async function generateStaticParams() {
  const concepts = await getConcepts();
  return concepts.map((concept) => ({ slug: concept.slug }));
}

export default async function ConceptDetailPage(props: PageProps<"/concepts/[slug]">) {
  const { slug } = await props.params;

  const [concept, allArtifacts, allConcepts, progress] = await Promise.all([
    getConceptBySlug(slug),
    getArtifacts(),
    getConcepts(),
    getProgress(),
  ]);

  if (!concept) notFound();

  const conceptArtifacts = allArtifacts.filter(
    (artifact) => artifact.subjectId === concept.subjectId && concept.artifactIds.includes(artifact.id)
  );
  const relatedConcepts = allConcepts
    .filter(
      (candidate) =>
        candidate.subjectId === concept.subjectId &&
        candidate.id !== concept.id &&
        candidate.moduleIds.some((moduleId) => concept.moduleIds.includes(moduleId))
    )
    .slice(0, 10);
  const subjectQuestions = progress.openQuestions.filter(
    (question) => question.subjectId === concept.subjectId
  );
  const phase = progress.subjects[concept.subjectId]?.phase ?? progress.phase;

  return (
    <Shell phase={phase}>
      <ConceptHeader concept={concept} />
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <ResourceNotes artifacts={conceptArtifacts} />
          <OpenQuestionCapture
            conceptId={concept.id}
            subjectId={concept.subjectId}
            subjectQuestions={subjectQuestions}
          />
        </div>
        <div className="flex w-full shrink-0 flex-col gap-6 md:w-56">
          <RelatedConceptsList concepts={relatedConcepts} />
        </div>
      </div>
    </Shell>
  );
}
