"use server";

import { revalidatePath } from "next/cache";
import { setPhase } from "@/lib/progress";
import type { Phase } from "@/lib/types";

export async function setPhaseAction(phase: Phase): Promise<void> {
  await setPhase(phase);
  revalidatePath("/");
  revalidatePath("/subjects");
}
