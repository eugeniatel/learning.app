import { FlexibleMap } from "@/components/flexible-map";
import { Shell } from "@/components/shell";
import { getModules, getProgress, getSpine } from "@/lib/data";
import type { Module, Phase, Week } from "@/lib/types";

function completedModuleIds(weeks: Week[]): Set<string> {
  return new Set(
    weeks
      .filter((week) => week.sessions.length > 0 && week.sessions.every((session) => session.status === "done"))
      .map((week) => week.moduleId)
  );
}

function moduleState(module: Module, currentModuleId: string, completeIds: Set<string>): "current" | "complete" | "ready" | "locked" {
  if (module.id === currentModuleId) return "current";
  if (completeIds.has(module.id)) return "complete";
  if (module.prereqs.every((id) => completeIds.has(id))) return "ready";
  return "locked";
}

function orderedModules(ids: string[], modules: Map<string, Module>) {
  return ids.map((id) => modules.get(id)).filter((module): module is Module => Boolean(module));
}

export default async function FlexibleMapPage() {
  const [progress, modules, spine] = await Promise.all([
    getProgress(),
    getModules(),
    getSpine(),
  ]);
  const scopedModules = modules.filter((module) => module.subjectId === progress.currentSubjectId);
  const moduleMap = new Map(scopedModules.map((module) => [module.id, module]));
  const scopedWeeks = progress.weeks.filter((week) => week.subjectId === progress.currentSubjectId);
  const completeIds = completedModuleIds(scopedWeeks);
  const currentWeekId = progress.subjects[progress.currentSubjectId]?.currentWeekId ?? progress.currentWeek.id;
  const currentWeek = progress.weeks.find((week) => week.id === currentWeekId);
  const currentModuleId = currentWeek?.moduleId ?? progress.currentWeek.moduleId;

  const toNode = (module: Module) => ({
    module,
    state: moduleState(module, currentModuleId, completeIds),
  });

  const main = progress.currentSubjectId === "ai-systems"
    ? orderedModules(spine.phases.flexible.spine, moduleMap).map(toNode)
    : scopedModules.filter((module) => module.track === "main").map(toNode);
  const interpretability = progress.currentSubjectId === "ai-systems"
    ? orderedModules(spine.phases.flexible.interpretability, moduleMap).map(toNode)
    : scopedModules.filter((module) => module.track === "interpretability").map(toNode);
  const branches = progress.currentSubjectId === "ai-systems"
    ? orderedModules(spine.phases.flexible.branches, moduleMap).map(toNode)
    : scopedModules.filter((module) => module.track === "branch").map(toNode);
  const readyBranches = branches
    .filter((node) => node.state === "ready")
    .map((node) => node.module);

  return (
    <Shell phase={progress.phase as Phase} wide>
      <FlexibleMap
        phase={progress.phase}
        main={main}
        interpretability={interpretability}
        branches={branches}
        readyBranches={readyBranches}
      />
    </Shell>
  );
}
