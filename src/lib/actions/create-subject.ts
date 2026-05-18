"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSubject, parseImportedSubject, parseSessions } from "@/lib/subjects";

function refresh() {
  revalidatePath("/");
  revalidatePath("/week");
  revalidatePath("/subjects");
  revalidatePath("/setup-subject");
  revalidatePath("/weeks");
}

export async function createSubjectAction(formData: FormData): Promise<void> {
  await createSubject({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    cadence: String(formData.get("cadence") ?? ""),
    moduleTitle: String(formData.get("moduleTitle") ?? ""),
    sessions: parseSessions(String(formData.get("sessions") ?? "")),
  });
  refresh();
  redirect("/");
}

export async function importSubjectAction(formData: FormData): Promise<void> {
  const parsed = parseImportedSubject(String(formData.get("markdown") ?? ""));
  await createSubject(parsed);
  refresh();
  redirect("/");
}
