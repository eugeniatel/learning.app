"use server";
import { revalidatePath } from "next/cache";
import { writeArtifactStatus } from "@/lib/artifacts";
import type { ReadStatus } from "@/lib/types";

export async function toggleArtifactStatusAction(
  artifactId: string,
  newStatus: ReadStatus
): Promise<void> {
  await writeArtifactStatus(artifactId, newStatus);
  revalidatePath("/concepts", "layout");
  revalidatePath("/");
}
