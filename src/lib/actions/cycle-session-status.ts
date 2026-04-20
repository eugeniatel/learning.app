"use server";
import { revalidatePath } from "next/cache";
import { cycleSessionStatus } from "@/lib/progress";
import type { SessionStatus } from "@/lib/types";

export async function cycleSessionStatusAction(
  weekId: string,
  sessionId: string,
  newStatus: SessionStatus
): Promise<void> {
  await cycleSessionStatus(weekId, sessionId, newStatus);
  revalidatePath("/");
}
