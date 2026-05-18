import fs from "node:fs/promises";
import { z } from "zod";
import { paths } from "./paths";
import { progressSchema } from "./schemas";
import type { BacklogItem, Phase, Question, Review } from "./types";

type ProgressData = z.infer<typeof progressSchema>;

async function readProgress(): Promise<ProgressData> {
  const raw = await fs.readFile(paths.progressFile, "utf8");
  return progressSchema.parse(JSON.parse(raw));
}

async function writeProgress(data: ProgressData): Promise<void> {
  await fs.writeFile(paths.progressFile, JSON.stringify(data, null, 2), "utf8");
}

/** Returns all questions for a given conceptId. */
export async function readOpenQuestionsForConcept(conceptId: string): Promise<Question[]> {
  const progress = await readProgress();
  return progress.openQuestions.filter((q) => q.conceptId === conceptId);
}

/**
 * Appends a new question to progress.json openQuestions.
 * Throws on write failure.
 */
export async function appendQuestion(question: Question): Promise<void> {
  const progress = await readProgress();
  progress.openQuestions.push(question);
  await writeProgress(progress);
}

export async function setCurrentSubject(subjectId: string): Promise<void> {
  const progress = await readProgress();
  const subjectState = progress.subjects[subjectId];
  if (!subjectState) {
    throw new Error(`Subject ${subjectId} not found in progress.subjects`);
  }
  if (subjectState.enabled === false) {
    throw new Error(`Subject ${subjectId} is not enabled`);
  }
  progress.currentSubjectId = subjectId;
  const week = progress.weeks.find((item) => item.id === subjectState.currentWeekId);
  if (week) {
    progress.currentWeek = { id: week.id, moduleId: week.moduleId, number: week.number };
    progress.phase = subjectState.phase;
  }
  await writeProgress(progress);
}

export async function setSubjectEnabled(subjectId: string, enabled: boolean): Promise<void> {
  const progress = await readProgress();
  const subjectState = progress.subjects[subjectId];
  if (!subjectState) {
    throw new Error(`Subject ${subjectId} not found in progress.subjects`);
  }
  const enabledCount = Object.values(progress.subjects).filter((state) => state.enabled !== false).length;
  if (!enabled && subjectState.enabled !== false && enabledCount <= 1) {
    throw new Error("At least one subject must stay enabled");
  }
  subjectState.enabled = enabled;
  if (!enabled && progress.currentSubjectId === subjectId) {
    const fallback = Object.entries(progress.subjects).find(
      ([id, state]) => id !== subjectId && state.enabled !== false
    );
    if (fallback) {
      const [fallbackId, fallbackState] = fallback;
      const week = progress.weeks.find((item) => item.id === fallbackState.currentWeekId);
      progress.currentSubjectId = fallbackId;
      progress.phase = fallbackState.phase;
      if (week) {
        progress.currentWeek = { id: week.id, moduleId: week.moduleId, number: week.number };
      }
    }
  }
  await writeProgress(progress);
}

/**
 * Updates progress.json.currentWeek to the given week.
 * Throws if weekId is not found in progress.weeks.
 */
export async function switchCurrentWeek(weekId: string): Promise<void> {
  const progress = await readProgress();
  const week = progress.weeks.find((w) => w.id === weekId);
  if (!week) throw new Error(`Week ${weekId} not found in progress.weeks`);
  progress.currentWeek = { id: week.id, moduleId: week.moduleId, number: week.number };
  progress.currentSubjectId = week.subjectId;
  const existingSubjectState = progress.subjects[week.subjectId];
  progress.subjects[week.subjectId] = {
    phase: existingSubjectState?.phase ?? progress.phase,
    currentWeekId: week.id,
    enabled: existingSubjectState?.enabled ?? true,
  };
  progress.phase = progress.subjects[week.subjectId].phase;
  await writeProgress(progress);
}

/**
 * Updates progress.json.phase directly. The v1 phase trigger is manual.
 */
export async function setPhase(phase: Phase): Promise<void> {
  const progress = await readProgress();
  progress.phase = phase;
  const subjectId = progress.currentSubjectId;
  if (progress.subjects[subjectId]) {
    progress.subjects[subjectId].phase = phase;
  }
  await writeProgress(progress);
}

/**
 * Updates the status of a session within a week in progress.json.
 * Sets completedAt to current ISO timestamp when newStatus is "done".
 * Removes completedAt when newStatus is not "done".
 * Throws if weekId or sessionId is not found.
 */
export async function cycleSessionStatus(
  weekId: string,
  sessionId: string,
  newStatus: "todo" | "in_progress" | "done"
): Promise<void> {
  const progress = await readProgress();
  const week = progress.weeks.find((w) => w.id === weekId);
  if (!week) throw new Error(`Week ${weekId} not found in progress.weeks`);
  const session = week.sessions.find((s) => s.id === sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found in week ${weekId}`);
  session.status = newStatus;
  if (newStatus === "done") {
    session.completedAt = new Date().toISOString();
  } else {
    delete session.completedAt;
  }
  await writeProgress(progress);
}

export async function updateSessionDetails(
  weekId: string,
  sessionId: string,
  input: { title: string; estimatedMinutes: number; notes?: string }
): Promise<void> {
  const progress = await readProgress();
  const week = progress.weeks.find((w) => w.id === weekId);
  if (!week) throw new Error(`Week ${weekId} not found in progress.weeks`);
  const session = week.sessions.find((s) => s.id === sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found in week ${weekId}`);
  session.title = input.title.trim() || session.title;
  session.estimatedMinutes = Number.isFinite(input.estimatedMinutes)
    ? Math.max(5, input.estimatedMinutes)
    : session.estimatedMinutes;
  const notes = input.notes?.trim();
  if (notes) {
    session.notes = notes;
  } else {
    delete session.notes;
  }
  await writeProgress(progress);
}

/**
 * Updates the status of a question in progress.json openQuestions.
 * Throws if questionId is not found.
 */
export async function updateQuestionStatus(
  questionId: string,
  newStatus: "open" | "parked" | "answered"
): Promise<void> {
  const progress = await readProgress();
  const question = progress.openQuestions.find((q) => q.id === questionId);
  if (!question) throw new Error(`Question ${questionId} not found in openQuestions`);
  question.status = newStatus;
  await writeProgress(progress);
}

export async function appendBacklogItem(item: BacklogItem): Promise<void> {
  const progress = await readProgress();
  progress.backlog.push(item);
  await writeProgress(progress);
}

export async function updateBacklogStatus(
  itemId: string,
  status: "open" | "parked" | "done"
): Promise<void> {
  const progress = await readProgress();
  const item = progress.backlog.find((entry) => entry.id === itemId);
  if (!item) throw new Error(`Backlog item ${itemId} not found`);
  item.status = status;
  await writeProgress(progress);
}

const reviewDelayDays: Record<"ready" | "not_yet" | "mastered", number> = {
  ready: 3,
  not_yet: 1,
  mastered: 90,
};

export async function upsertReview(
  conceptId: string,
  status: "ready" | "not_yet" | "mastered",
  _note?: string,
  nextDelayDays?: number
): Promise<void> {
  void _note;
  const progress = await readProgress();
  const now = new Date();
  const delayDays = nextDelayDays ?? reviewDelayDays[status];
  const next = new Date(now.getTime() + delayDays * 24 * 60 * 60 * 1000);
  const entry: Review = {
    subjectId: progress.currentSubjectId,
    conceptId,
    lastReviewed: now.toISOString(),
    nextSuggested: next.toISOString(),
    status,
  };
  const existing = progress.reviews.findIndex(
    (r) => r.subjectId === progress.currentSubjectId && r.conceptId === conceptId
  );
  if (existing >= 0) {
    progress.reviews[existing] = entry;
  } else {
    progress.reviews.push(entry);
  }
  await writeProgress(progress);
}
