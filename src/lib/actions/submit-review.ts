"use server";
import { revalidatePath } from "next/cache";
import { upsertReview } from "@/lib/progress";

export async function submitReviewAction(
  conceptId: string,
  status: "known" | "needs_review" | "mastered" | "skip_week",
  note?: string
): Promise<void> {
  const mappedStatus =
    status === "mastered" ? "mastered" : status === "needs_review" ? "not_yet" : "ready";
  const delayDays = status === "skip_week" ? 7 : undefined;
  await upsertReview(conceptId, mappedStatus, note, delayDays);
  revalidatePath("/review");
  revalidatePath("/");
}
