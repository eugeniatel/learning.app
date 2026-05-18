import { getModules, getProgress, getSubjects } from "./data";
import type { Module, Session, Subject, Week } from "./types";

export type WeekPlanItem = {
  subject: Subject;
  week: Week;
  module: Module;
  session: Session;
};

export async function getWeekPlanItems(): Promise<WeekPlanItem[]> {
  const [subjects, modules, progress] = await Promise.all([getSubjects(), getModules(), getProgress()]);
  const subjectMap = new Map(subjects.map((subject) => [subject.id, subject]));
  const moduleMap = new Map(modules.map((module) => [module.id, module]));

  return Object.entries(progress.subjects)
    .filter(([, state]) => state.enabled !== false)
    .map(([subjectId, state]) => {
      const subject = subjectMap.get(subjectId);
      const week = progress.weeks.find((item) => item.id === state.currentWeekId);
      const weekModule = week ? moduleMap.get(week.moduleId) : undefined;
      const session = week?.sessions.find((item) => item.status !== "done") ?? week?.sessions[0];
      if (!subject || !week || !weekModule || !session) return null;
      return { subject, week, module: weekModule, session };
    })
    .filter((item): item is WeekPlanItem => item !== null);
}
