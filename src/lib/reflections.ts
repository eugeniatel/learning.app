import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { paths } from "./paths";

function reflectionFilePath(weekId: string): string {
  return path.join(paths.reflectionsDir, `week-${weekId}.md`);
}

/** Returns the reflection body (without frontmatter) for a week id, or empty string if no file exists. */
export async function readReflection(weekId: string): Promise<string> {
  const file = reflectionFilePath(weekId);
  try {
    const raw = await fs.readFile(file, "utf8");
    const { content } = matter(raw);
    return content.trim();
  } catch {
    return "";
  }
}

/**
 * Writes reflection body to notes/reflections/week-{weekId}.md with frontmatter.
 * Creates notes/reflections/ directory if it does not exist.
 */
export async function saveReflection(weekId: string, body: string): Promise<void> {
  await fs.mkdir(paths.reflectionsDir, { recursive: true });
  const file = reflectionFilePath(weekId);
  const updatedAt = new Date().toISOString();
  const output = matter.stringify(body, { weekId, kind: "week-reflection", updatedAt });
  await fs.writeFile(file, output, "utf8");
}
