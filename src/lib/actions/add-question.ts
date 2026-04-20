"use server";
import { appendQuestion } from "@/lib/progress";
import type { Question } from "@/lib/types";

export async function addQuestionAction(question: Question): Promise<void> {
  await appendQuestion(question);
}
