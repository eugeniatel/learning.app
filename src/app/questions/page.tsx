import { Shell } from "@/components/shell";
import { QuestionsManager } from "@/components/questions-manager";
import { getProgress, getConcepts } from "@/lib/data";

export default async function QuestionsPage() {
  const [progress, concepts] = await Promise.all([getProgress(), getConcepts()]);
  const subjectId = progress.currentSubjectId;
  const seed = progress.openQuestions.filter((question) => question.subjectId === subjectId);

  const conceptLabels: Record<string, string> = {};
  for (const concept of concepts) {
    if (concept.subjectId === subjectId) {
      conceptLabels[concept.id] = concept.title;
    }
  }

  return (
    <Shell phase={progress.phase}>
      <h1 className="mb-6 text-[22px] font-medium">Open questions</h1>
      <QuestionsManager subjectId={subjectId} seed={seed} conceptLabels={conceptLabels} />
    </Shell>
  );
}
