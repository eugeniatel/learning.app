import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { paths } from "./paths";

const SLUG_RE = /^[a-z0-9-]+$/;

function noteFilePath(slug: string): string {
  return path.join(paths.notesDir, `${slug}.md`);
}

/** Returns the note body (without frontmatter) for a concept slug, or empty string if no note exists. */
export async function readNote(slug: string): Promise<string> {
  const file = noteFilePath(slug);
  try {
    const raw = await fs.readFile(file, "utf8");
    const { content } = matter(raw);
    return content.trim();
  } catch {
    // File does not exist yet
    return "";
  }
}

/**
 * Writes note body to notes/<slug>.md with frontmatter.
 * Creates notes/ directory if it does not exist.
 * Throws on write failure or invalid slug.
 */
export async function saveNote(
  slug: string,
  conceptId: string,
  body: string
): Promise<void> {
  if (!SLUG_RE.test(slug)) {
    throw new Error(`Invalid slug: ${slug}`);
  }
  await fs.mkdir(paths.notesDir, { recursive: true });
  const file = noteFilePath(slug);
  const updatedAt = new Date().toISOString();
  const output = matter.stringify(body, { conceptId, updatedAt });
  await fs.writeFile(file, output, "utf8");
}
