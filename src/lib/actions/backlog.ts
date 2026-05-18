"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { appendBacklogItem, updateBacklogStatus } from "@/lib/progress";
import type { BacklogItem } from "@/lib/types";

export async function addBacklogItemAction(formData: FormData): Promise<void> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  await appendBacklogItem({
    id: randomUUID(),
    subjectId: String(formData.get("subjectId") ?? ""),
    text,
    kind: String(formData.get("kind") ?? "topic") as BacklogItem["kind"],
    status: "open",
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/backlog");
}

export async function updateBacklogStatusAction(formData: FormData): Promise<void> {
  await updateBacklogStatus(
    String(formData.get("id") ?? ""),
    String(formData.get("status") ?? "open") as BacklogItem["status"]
  );
  revalidatePath("/backlog");
}
