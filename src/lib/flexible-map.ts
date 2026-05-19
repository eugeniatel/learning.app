import { getModules, getProgress, getSpine } from "./data";
import type { Module, Week } from "./types";

type NodeState = "current" | "complete" | "ready" | "locked";

export type MapNode = {
  module: Module;
  state: NodeState;
};

export type FlexibleMapData = {
  main: MapNode[];
  interpretability: MapNode[];
  branches: MapNode[];
  readyBranches: Module[];
};

function completedModuleIds(weeks: Week[]): Set<string> {
  return new Set(
    weeks
      .filter((week) => week.sessions.length > 0 && week.sessions.every((session) => session.status === "done"))
      .map((week) => week.moduleId)
  );
}

function moduleState(module: Module, currentModuleId: string, completeIds: Set<string>): NodeState {
  if (module.id === currentModuleId) return "current";
  if (completeIds.has(module.id)) return "complete";
  if (module.prereqs.every((id) => completeIds.has(id))) return "ready";
  return "locked";
}

function orderedModules(ids: string[], modules: Map<string, Module>): Module[] {
  return ids.map((id) => modules.get(id)).filter((module): module is Module => Boolean(module));
}

export async function getFlexibleMapData(): Promise<FlexibleMapData> {
  const [progress, modules, spine] = await Promise.all([getProgress(), getModules(), getSpine()]);
  const scopedModules = modules.filter((module) => module.subjectId === progress.currentSubjectId);
  const moduleMap = new Map(scopedModules.map((module) => [module.id, module]));
  const scopedWeeks = progress.weeks.filter((week) => week.subjectId === progress.currentSubjectId);
  const completeIds = completedModuleIds(scopedWeeks);
  const currentWeekId = progress.subjects[progress.currentSubjectId]?.currentWeekId ?? progress.currentWeek.id;
  const currentWeek = progress.weeks.find((week) => week.id === currentWeekId);
  const currentModuleId = currentWeek?.moduleId ?? progress.currentWeek.moduleId;

  const toNode = (module: Module): MapNode => ({
    module,
    state: moduleState(module, currentModuleId, completeIds),
  });

  const isAiSystems = progress.currentSubjectId === "ai-systems";
  const main = isAiSystems
    ? orderedModules(spine.phases.flexible.spine, moduleMap).map(toNode)
    : scopedModules.filter((module) => module.track === "main").map(toNode);
  const interpretability = isAiSystems
    ? orderedModules(spine.phases.flexible.interpretability, moduleMap).map(toNode)
    : scopedModules.filter((module) => module.track === "interpretability").map(toNode);
  const branches = isAiSystems
    ? orderedModules(spine.phases.flexible.branches, moduleMap).map(toNode)
    : scopedModules.filter((module) => module.track === "branch").map(toNode);
  const readyBranches = branches.filter((node) => node.state === "ready").map((node) => node.module);

  return { main, interpretability, branches, readyBranches };
}
