import type { Phase, Progress, Spine } from "./types";

// Transition seam. Checkpoint 3 decision (time-based, milestone-based, manual
// toggle, hybrid) lands here. v1 reads phase from progress.json without
// inferring anything.
export function currentPhase(progress: Progress): Phase {
  return progress.phase;
}

export function phaseModuleIds(phase: Phase, spine: Spine): string[] {
  if (phase === "foundational") {
    return [
      ...spine.phases.foundational.moduleIds,
      ...spine.phases.foundational.interpretabilityIds,
    ];
  }
  return [
    ...spine.phases.flexible.spine,
    ...spine.phases.flexible.interpretability,
    ...spine.phases.flexible.branches,
  ];
}

export function phaseDescription(phase: Phase): string {
  if (phase === "foundational") {
    return "A fixed sequence of modules that loads the vocabulary, then opens up.";
  }
  return "A branching track. Pull the module you're ready for next.";
}

// Intentionally unused Claude API integration seam. When the app becomes
// active (post-v1), tutor hooks and review suggestion calls go behind this
// export. Leave as a marker.
export const claudeApiIntegrationSeam = null;
