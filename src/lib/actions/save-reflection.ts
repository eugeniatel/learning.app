"use server";
import { saveReflection } from "@/lib/reflections";

export async function saveReflectionAction(weekId: string, body: string): Promise<void> {
  await saveReflection(weekId, body);
}
