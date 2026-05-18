"use server";

import { revalidatePath } from "next/cache";
import { updateSessionDetails } from "@/lib/progress";

export async function updateSessionAction(formData: FormData): Promise<void> {
  const weekId = String(formData.get("weekId") ?? "");
  const sessionId = String(formData.get("sessionId") ?? "");
  await updateSessionDetails(weekId, sessionId, {
    title: String(formData.get("title") ?? ""),
    estimatedMinutes: Number(formData.get("estimatedMinutes") ?? 45),
    notes: String(formData.get("notes") ?? ""),
  });
  revalidatePath("/");
  revalidatePath("/week");
  revalidatePath(`/weeks/${weekId}`);
}
