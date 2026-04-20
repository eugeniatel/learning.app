import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { paths } from "./paths";
import {
  artifactsFileSchema,
  conceptsFileSchema,
  moduleFrontmatterSchema,
  progressSchema,
  spineSchema,
} from "./schemas";
import type { Artifact, Concept, Module, Progress, Spine, Week } from "./types";

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as T;
}

export async function getSpine(): Promise<Spine> {
  const raw = await readJson<unknown>(paths.spineFile);
  return spineSchema.parse(raw);
}

export async function getConcepts(): Promise<Concept[]> {
  const raw = await readJson<unknown>(paths.conceptsFile);
  return conceptsFileSchema.parse(raw).concepts;
}

export async function getArtifacts(): Promise<Artifact[]> {
  const raw = await readJson<unknown>(paths.artifactsFile);
  return artifactsFileSchema.parse(raw).artifacts;
}

export async function getProgress(): Promise<Progress> {
  const raw = await readJson<unknown>(paths.progressFile);
  return progressSchema.parse(raw);
}

function parseModuleBody(body: string) {
  const sections: Record<string, string> = {};
  const lines = body.split("\n");
  let current = "";
  let buffer: string[] = [];
  const push = () => {
    if (current) sections[current] = buffer.join("\n").trim();
  };
  for (const line of lines) {
    const m = /^##\s+(.+)$/.exec(line);
    if (m) {
      push();
      current = m[1].trim().toLowerCase();
      buffer = [];
    } else if (current) {
      buffer.push(line);
    }
  }
  push();
  return sections;
}

function collectIds(section: string | undefined, prefix: string): string[] {
  if (!section) return [];
  const rx = new RegExp(`^-\\s*${prefix}:\\s*(\\S+)`, "gm");
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = rx.exec(section))) ids.push(m[1].trim());
  return ids;
}

function collectListItems(section: string | undefined): string[] {
  if (!section) return [];
  return section
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
}

export async function getModules(): Promise<Module[]> {
  const files = await fs.readdir(paths.curriculumDir);
  const mdFiles = files.filter((f) => /^(mod|int)-\d+\.md$/.test(f));
  const modules = await Promise.all(
    mdFiles.map(async (file) => {
      const full = path.join(paths.curriculumDir, file);
      const raw = await fs.readFile(full, "utf8");
      const { data, content } = matter(raw);
      const front = moduleFrontmatterSchema.parse(data);
      const sections = parseModuleBody(content);
      const concepts = collectListItems(sections.concepts);
      const resources = collectIds(sections.resources, "artifact");
      const interviews = collectIds(sections.interviews, "artifact");
      return {
        ...front,
        body: content,
        goal: sections.goal ?? "",
        conceptIds: concepts,
        artifactIds: [...resources, ...interviews],
      } satisfies Module;
    })
  );
  return modules.sort((a, b) => {
    if (a.track !== b.track) return a.track === "main" ? -1 : 1;
    return a.number - b.number;
  });
}

export async function getModule(id: string): Promise<Module | undefined> {
  const all = await getModules();
  return all.find((m) => m.id === id);
}

export async function getCurrentWeek(): Promise<{
  progress: Progress;
  week: Week;
  module: Module;
}> {
  const progress = await getProgress();
  const week = progress.weeks.find((w) => w.id === progress.currentWeek.id);
  if (!week) throw new Error(`Current week ${progress.currentWeek.id} not found in progress.json`);
  const module = await getModule(week.moduleId);
  if (!module) throw new Error(`Module ${week.moduleId} not found for current week`);
  return { progress, week, module };
}

export async function getConceptsGroupedByModule(): Promise<{ module: Module; concepts: Concept[] }[]> {
  const [concepts, modules] = await Promise.all([getConcepts(), getModules()]);
  return modules
    .map((mod) => ({
      module: mod,
      concepts: concepts.filter((c) => c.moduleIds.includes(mod.id)),
    }))
    .filter((group) => group.concepts.length > 0);
}

export async function getConceptBySlug(slug: string): Promise<Concept | undefined> {
  const concepts = await getConcepts();
  return concepts.find((c) => c.slug === slug);
}

export async function getAllWeeksWithModules(): Promise<{ module: Module; weeks: Week[] }[]> {
  const [progress, modules] = await Promise.all([getProgress(), getModules()]);
  return modules
    .map((mod) => ({
      module: mod,
      weeks: progress.weeks
        .filter((w) => w.moduleId === mod.id)
        .sort((a, b) => b.startDate.localeCompare(a.startDate)),
    }))
    .filter((group) => group.weeks.length > 0)
    .sort((a, b) => b.weeks[0].startDate.localeCompare(a.weeks[0].startDate));
}
