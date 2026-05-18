"use server";

import { revalidatePath } from "next/cache";
import { setCurrentSubject } from "@/lib/progress";

export async function setCurrentSubjectAction(subjectId: string): Promise<void> {
  await setCurrentSubject(subjectId);
  revalidatePath("/");
  revalidatePath("/subjects");
  revalidatePath("/weeks");
  revalidatePath("/concepts");
  revalidatePath("/questions");
  revalidatePath("/review");
  revalidatePath("/search");
  revalidatePath("/reflections");
  revalidatePath("/flexible-map");
}
