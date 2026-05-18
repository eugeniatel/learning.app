import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { paths } from "./paths";
import { getModules, getProgress } from "./data";

export type ReflectionHistoryItem = {
  weekId: string;
  weekNumber: number;
  startDate: string;
  moduleTitle: string;
  body: string;
  href: string;
  updatedAt?: string;
};

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

export async function getReflectionHistoryForCurrentSubject(): Promise<ReflectionHistoryItem[]> {
  const [progress, modules] = await Promise.all([getProgress(), getModules()]);
  const subjectId = progress.currentSubjectId;
  const moduleMap = new Map(
    modules.filter((module) => module.subjectId === subjectId).map((module) => [module.id, module])
  );
  const weeks = progress.weeks.filter((week) => week.subjectId === subjectId);
  const items: ReflectionHistoryItem[] = [];
  const candidates = await Promise.all(
    weeks.map(async (week) => {
      const file = reflectionFilePath(week.id);
      try {
        const raw = await fs.readFile(file, "utf8");
        const parsed = matter(raw);
        const body = parsed.content.trim();
        if (!body) return null;
        return {
          weekId: week.id,
          weekNumber: week.number,
          startDate: week.startDate,
          moduleTitle: moduleMap.get(week.moduleId)?.title ?? "Unknown module",
          body,
          href: `/weeks/${week.id}`,
          updatedAt: typeof parsed.data.updatedAt === "string" ? parsed.data.updatedAt : undefined,
        };
      } catch {
        return null;
      }
    })
  );
  for (const item of candidates) {
    if (item) items.push(item);
  }
  return items.sort((a, b) => b.startDate.localeCompare(a.startDate));
}
