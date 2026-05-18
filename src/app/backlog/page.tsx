import { Shell } from "@/components/shell";
import { BacklogClient } from "@/components/backlog-client";
import { getProgress, getSubjects } from "@/lib/data";

export default async function BacklogPage() {
  const [progress, subjects] = await Promise.all([getProgress(), getSubjects()]);
  const activeSubjects = subjects.filter((subject) => progress.subjects[subject.id]?.enabled !== false);
  const items = progress.backlog
    .filter((item) => item.subjectId === progress.currentSubjectId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <Shell phase={progress.phase}>
      <div className="mb-8">
        <p className="text-[13px] text-muted-foreground">Loose resources, questions, and topics</p>
        <h1 className="mt-1 text-[22px] font-medium text-foreground">Backlog</h1>
      </div>
      <BacklogClient
        subjectId={progress.currentSubjectId}
        subjectTitle={activeSubjects.find((s) => s.id === progress.currentSubjectId)?.title ?? "current subject"}
        subjects={activeSubjects}
        initialItems={items}
      />
    </Shell>
  );
}
