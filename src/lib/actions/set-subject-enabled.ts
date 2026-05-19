"use server";

import { revalidatePath } from "next/cache";
import { setSubjectEnabled } from "@/lib/progress";

export async function setSubjectEnabledAction(subjectId: string, enabled: boolean): Promise<void> {
  await setSubjectEnabled(subjectId, enabled);
  revalidatePath("/");
  revalidatePath("/subjects");
  revalidatePath("/weeks");
  revalidatePath("/concepts");
  revalidatePath("/questions");
  revalidatePath("/search");
  revalidatePath("/reflections");
}
