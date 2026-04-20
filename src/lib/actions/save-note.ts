"use server";
import { saveNote } from "@/lib/notes";

export async function saveNoteAction(
  slug: string,
  conceptId: string,
  body: string
): Promise<void> {
  await saveNote(slug, conceptId, body);
}
