import { Shell } from "@/components/shell";
import { QuestionsQueue } from "@/components/questions-queue";
import { getProgress, getConcepts, getModules } from "@/lib/data";

export default async function QuestionsPage() {
  const [progress, concepts, modules] = await Promise.all([
    getProgress(),
    getConcepts(),
    getModules(),
  ]);

  const conceptMap = new Map(concepts.map((c) => [c.id, c]));
  const moduleMap = new Map(modules.map((m) => [m.id, m]));

  const questionsByConceptId = new Map<string, typeof progress.openQuestions>();
  for (const q of progress.openQuestions) {
    if (!questionsByConceptId.has(q.conceptId)) {
      questionsByConceptId.set(q.conceptId, []);
    }
    questionsByConceptId.get(q.conceptId)!.push(q);
  }

  const groups = Array.from(questionsByConceptId.entries())
    .map(([conceptId, questions]) => {
      const concept = conceptMap.get(conceptId);
      if (!concept) return null;
      const firstModuleId = concept.moduleIds[0];
      const mod = firstModuleId ? moduleMap.get(firstModuleId) : undefined;
      return {
        conceptId,
        conceptTitle: concept.title,
        conceptSlug: concept.slug,
        moduleLabel: mod?.title ?? "",
        questions,
      };
    })
    .filter((g): g is NonNullable<typeof g> => g !== null);

  return (
    <Shell phase={progress.phase}>
      <h1 className="mb-6 text-[22px] font-medium">Open questions</h1>
      <QuestionsQueue groups={groups} />
    </Shell>
  );
}
