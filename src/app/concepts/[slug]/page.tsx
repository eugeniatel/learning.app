import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { ConceptHeader } from "@/components/concept-header";
import { ArtifactList } from "@/components/artifact-list";
import { NoteEditor } from "@/components/note-editor";
import { OpenQuestionCapture } from "@/components/open-question-capture";
import { RelatedConceptsList } from "@/components/related-concepts-list";
import { ReviewStub } from "@/components/review-stub";
import { getConceptBySlug, getArtifacts, getConcepts, getProgress } from "@/lib/data";
import { readNote } from "@/lib/notes";
import { readOpenQuestionsForConcept } from "@/lib/progress";

export const dynamicParams = false;

export async function generateStaticParams() {
  const concepts = await getConcepts();
  return concepts.map((concept) => ({ slug: concept.slug }));
}

export default async function ConceptDetailPage(props: PageProps<"/concepts/[slug]">) {
  const { slug } = await props.params;

  const [concept, allArtifacts, allConcepts, progress, noteBody] = await Promise.all([
    getConceptBySlug(slug),
    getArtifacts(),
    getConcepts(),
    getProgress(),
    readNote(slug),
  ]);

  if (!concept) notFound();

  const [conceptArtifacts, relatedConcepts, conceptQuestions] = await Promise.all([
    Promise.resolve(allArtifacts.filter((a) => a.subjectId === concept.subjectId && concept.artifactIds.includes(a.id))),
    Promise.resolve(
      allConcepts
        .filter(
          (c) =>
            c.subjectId === concept.subjectId &&
            c.id !== concept.id &&
            c.moduleIds.some((mid) => concept.moduleIds.includes(mid))
        )
        .slice(0, 10)
    ),
    readOpenQuestionsForConcept(concept.id),
  ]);
  const conceptReview = progress.reviews.find((r) => r.subjectId === concept.subjectId && r.conceptId === concept.id);
  const phase = progress.subjects[concept.subjectId]?.phase ?? progress.phase;

  return (
    <Shell phase={phase}>
      <ConceptHeader concept={concept} />
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <ArtifactList artifacts={conceptArtifacts} />
          <NoteEditor slug={concept.slug} conceptId={concept.id} initialBody={noteBody} />
          <OpenQuestionCapture
            conceptId={concept.id}
            subjectId={concept.subjectId}
            initialQuestions={conceptQuestions.filter((question) => question.subjectId === concept.subjectId)}
          />
        </div>
        <div className="flex w-full shrink-0 flex-col gap-6 md:w-56">
          <ReviewStub review={conceptReview} />
          <RelatedConceptsList concepts={relatedConcepts} />
        </div>
      </div>
    </Shell>
  );
}
