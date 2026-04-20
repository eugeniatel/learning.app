"use server";
import { revalidatePath } from "next/cache";
import { updateQuestionStatus } from "@/lib/progress";
import type { QuestionStatus } from "@/lib/types";

export async function updateQuestionStatusAction(
  questionId: string,
  newStatus: QuestionStatus
): Promise<void> {
  await updateQuestionStatus(questionId, newStatus);
  revalidatePath("/questions");
}
