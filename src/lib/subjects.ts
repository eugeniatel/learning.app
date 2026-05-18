import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { paths } from "./paths";
import { slugify, uniqueSlug } from "./slugs";
import { subjectsFileSchema } from "./schemas";
import { getModules, getProgress, getSubjects } from "./data";

type NewSubjectInput = {
  title: string;
  description: string;
  cadence: string;
  moduleTitle: string;
  sessions: string[];
};

async function writeJson(file: string, data: unknown) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

export function parseSessions(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function parseImportedSubject(markdown: string): NewSubjectInput {
  const lines = markdown.split("\n").map((line) => line.trim());
  const title = lines.find((line) => line.startsWith("# "))?.replace(/^#\s+/, "").trim() || "New subject";
  const moduleTitle =
    lines.find((line) => line.startsWith("## "))?.replace(/^##\s+/, "").trim() || "Start here";
  const sessions = parseSessions(lines.filter((line) => /^[-*]\s+/.test(line)).join("\n"));
  return {
    title,
    moduleTitle,
    description: "Imported curriculum track.",
    cadence: "Flexible cadence",
    sessions: sessions.length > 0 ? sessions : ["First study session"],
  };
}

export async function createSubject(input: NewSubjectInput): Promise<string> {
  const [subjects, modules, progress] = await Promise.all([getSubjects(), getModules(), getProgress()]);
  const subjectId = uniqueSlug(input.title, new Set(subjects.map((subject) => subject.id)));
  const moduleId = uniqueSlug(`${subjectId}-start`, new Set(modules.map((module) => module.id)));
  const weekId = uniqueSlug(`${subjectId}-w1`, new Set(progress.weeks.map((week) => week.id)));
  const subjectFile = subjectsFileSchema.parse(
    JSON.parse(await fs.readFile(paths.subjectsFile, "utf8"))
  );

  subjectFile.subjects.push({
    id: subjectId,
    slug: subjectId,
    title: input.title.trim(),
    description: input.description.trim() || "Self-paced curriculum track.",
    cadence: input.cadence.trim() || "Flexible cadence",
  });

  const moduleSlug = slugify(input.moduleTitle) || "start-here";
  const moduleBody = matter.stringify(
    [
      "## Goal",
      `Build a working foundation for ${input.title.trim()}.`,
      "",
      "## Concepts",
      "",
      "## Resources",
    ].join("\n"),
    {
      id: moduleId,
      subjectId,
      track: "main",
      number: 1,
      title: input.moduleTitle.trim() || "Start here",
      slug: moduleSlug,
      hoursMin: 1,
      hoursMax: 3,
      prereqs: [],
      phase: "foundational",
    }
  );

  progress.currentSubjectId = subjectId;
  progress.subjects[subjectId] = {
    phase: "foundational",
    currentWeekId: weekId,
    enabled: true,
  };
  progress.currentWeek = { id: weekId, moduleId, number: 1 };
  progress.phase = "foundational";
  progress.weeks.push({
    id: weekId,
    subjectId,
    moduleId,
    number: 1,
    startDate: new Date().toISOString().slice(0, 10),
    sessions: (input.sessions.length > 0 ? input.sessions : ["First study session"]).map((title, index) => ({
      id: `${weekId}-s${index + 1}`,
      title,
      conceptIds: [],
      artifactIds: [],
      estimatedMinutes: 45,
      status: "todo",
    })),
  });

  await Promise.all([
    writeJson(paths.subjectsFile, subjectFile),
    fs.writeFile(path.join(paths.curriculumDir, `${moduleId}.md`), moduleBody, "utf8"),
    writeJson(paths.progressFile, progress),
  ]);

  return subjectId;
}
