import fs from "node:fs/promises";
import { z } from "zod";
import { paths } from "./paths";
import { progressSchema } from "./schemas";
import type { Question, Review } from "./types";

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

/**
 * Updates progress.json.currentWeek to the given week.
 * Throws if weekId is not found in progress.weeks.
 */
export async function switchCurrentWeek(weekId: string): Promise<void> {
  const progress = await readProgress();
  const week = progress.weeks.find((w) => w.id === weekId);
  if (!week) throw new Error(`Week ${weekId} not found in progress.weeks`);
  progress.currentWeek = { id: week.id, moduleId: week.moduleId, number: week.number };
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

/**
 * Creates or updates the review entry for a concept.
 * Sets lastReviewed to now, nextSuggested to now + 24h, status as provided.
 * Note: _note is accepted for API symmetry but not persisted in v1;
 * the progressSchema reviews array does not include a note field.
 */
export async function upsertReview(
  conceptId: string,
  status: "ready" | "not_yet",
  _note?: string
): Promise<void> {
  const progress = await readProgress();
  const now = new Date();
  const next = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const entry: Review = {
    conceptId,
    lastReviewed: now.toISOString(),
    nextSuggested: next.toISOString(),
    status,
  };
  const existing = progress.reviews.findIndex((r) => r.conceptId === conceptId);
  if (existing >= 0) {
    progress.reviews[existing] = entry;
  } else {
    progress.reviews.push(entry);
  }
  await writeProgress(progress);
}
