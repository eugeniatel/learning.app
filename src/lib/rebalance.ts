import { getModules, getProgress, getSubjects } from "./data";

export type RebalanceSuggestion = {
  title: string;
  detail: string;
  href: string;
};

export async function getRebalanceSuggestions(): Promise<RebalanceSuggestion[]> {
  const [subjects, modules, progress] = await Promise.all([getSubjects(), getModules(), getProgress()]);
  const moduleMap = new Map(modules.map((module) => [module.id, module]));
  const suggestions: RebalanceSuggestion[] = [];

  for (const subject of subjects) {
    const state = progress.subjects[subject.id];
    if (!state || state.enabled === false) {
      suggestions.push({
        title: `Paused: ${subject.title}`,
        detail: "Enable this subject when you want it back in the weekly rotation.",
        href: "/subjects",
      });
      continue;
    }
    const week = progress.weeks.find((item) => item.id === state.currentWeekId);
    if (!week) continue;
    const minutes = week.sessions.reduce((sum, session) => sum + session.estimatedMinutes, 0);
    const undone = week.sessions.filter((session) => session.status !== "done");
    const weekModule = moduleMap.get(week.moduleId);
    if (minutes > 300) {
      suggestions.push({
        title: `${subject.title} looks heavy`,
        detail: `Current week is ${minutes} minutes. Move one session out of ${weekModule?.title ?? "this module"}.`,
        href: `/weeks/${week.id}`,
      });
    }
    if (undone.length >= 3) {
      suggestions.push({
        title: `${subject.title} has unfinished work`,
        detail: `${undone.length} sessions remain in the current week. Start with ${undone[0].title}.`,
        href: `/weeks/${week.id}`,
      });
    }
  }

  const openQuestions = progress.openQuestions.filter((question) => question.status === "open");
  if (openQuestions.length >= 3) {
    suggestions.push({
      title: "Questions are accumulating",
      detail: `${openQuestions.length} open questions across active study. Answer or park the oldest few.`,
      href: "/questions",
    });
  }

  const openBacklog = progress.backlog.filter((item) => item.status === "open");
  if (openBacklog.length >= 3) {
    suggestions.push({
      title: "Backlog needs triage",
      detail: `${openBacklog.length} open backlog items. Park what is not actionable this week.`,
      href: "/backlog",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      title: "No rebalance needed",
      detail: "Current subjects look light enough to continue as planned.",
      href: "/week",
    });
  }

  return suggestions;
}
