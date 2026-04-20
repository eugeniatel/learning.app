"use server";
import { revalidatePath } from "next/cache";
import { switchCurrentWeek } from "@/lib/progress";

export async function switchWeekAction(weekId: string): Promise<void> {
  await switchCurrentWeek(weekId);
  revalidatePath("/");
  revalidatePath("/weeks");
}
