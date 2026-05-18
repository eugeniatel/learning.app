import { Shell } from "@/components/shell";
import { StudyCockpit } from "@/components/study-cockpit";
import { TodayList } from "@/components/today-list";
import { WeekView } from "@/components/week-view";
import { getArtifacts, getCurrentWeek, getModules, getProgress, getSubjects } from "@/lib/data";
import { getTodayItems } from "@/lib/today";

export default async function Home() {
  const [{ progress, week, module }, artifacts, subjects, modules, fullProgress, todayItems] = await Promise.all([
    getCurrentWeek(),
    getArtifacts(),
    getSubjects(),
    getModules(),
    getProgress(),
    getTodayItems(),
  ]);
  const moduleMap = new Map(modules.map((item) => [item.id, item]));
  const enabledSubjects = subjects.filter((subject) => fullProgress.subjects[subject.id]?.enabled !== false);
  const snapshots = enabledSubjects.map((subject) => {
    const subjectState = fullProgress.subjects[subject.id];
    const subjectWeek = fullProgress.weeks.find((item) => item.id === subjectState?.currentWeekId);
    const subjectModule = subjectWeek ? moduleMap.get(subjectWeek.moduleId) : undefined;
    const nextSession =
      subjectWeek?.sessions.find((session) => session.status !== "done") ?? subjectWeek?.sessions[0];
    const openQuestions = fullProgress.openQuestions.filter(
      (question) => question.subjectId === subject.id && question.status === "open"
    ).length;
    return {
      subject,
      phase: subjectState?.phase ?? "foundational",
      week: subjectWeek,
      module: subjectModule,
      nextSessionTitle: nextSession?.title ?? "No session planned",
      weekId: subjectWeek?.id,
      openQuestions,
    };
  });
  return (
    <Shell phase={progress.phase}>
      <StudyCockpit subjects={enabledSubjects} progress={fullProgress} snapshots={snapshots} />
      <section className="mt-8">
        <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
          Today
        </p>
        <TodayList items={todayItems} compact />
      </section>
      <div className="mt-10 border-t border-border pt-10">
        <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
          Active subject
        </p>
        <p className="mb-6 text-[15px] text-muted-foreground">
          {subjects.find((subject) => subject.id === progress.currentSubjectId)?.description}
        </p>
      </div>
      <WeekView week={week} module={module} artifacts={artifacts} phase={progress.phase} />
    </Shell>
  );
}
