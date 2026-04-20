import fs from "node:fs/promises";
import { z } from "zod";
import { paths } from "./paths";
import { progressSchema } from "./schemas";
import type { Question } from "./types";

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
