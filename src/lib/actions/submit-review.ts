"use server";
import { revalidatePath } from "next/cache";
import { upsertReview } from "@/lib/progress";

export async function submitReviewAction(
  conceptId: string,
  status: "known" | "needs_review",
  note?: string
): Promise<void> {
  const mappedStatus = status === "known" ? "ready" : "not_yet";
  await upsertReview(conceptId, mappedStatus, note);
  revalidatePath("/review");
  revalidatePath("/");
}
