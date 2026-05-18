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
  subjectsFileSchema,
} from "./schemas";
import type { Artifact, Concept, Module, Progress, Spine, Subject, Week } from "./types";

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as T;
}

export async function getSpine(): Promise<Spine> {
  const raw = await readJson<unknown>(paths.spineFile);
  return spineSchema.parse(raw);
}

export async function getSubjects(): Promise<Subject[]> {
  const raw = await readJson<unknown>(paths.subjectsFile);
  return subjectsFileSchema.parse(raw).subjects;
}

export async function getActiveSubject(): Promise<Subject> {
  const [subjects, progress] = await Promise.all([getSubjects(), getProgress()]);
  return subjects.find((subject) => subject.id === progress.currentSubjectId) ?? subjects[0];
}

export async function getConcepts(): Promise<Concept[]> {
  const raw = await readJson<unknown>(paths.conceptsFile);
  return conceptsFileSchema.parse(raw).concepts;
}

export async function getConceptsForSubject(subjectId: string): Promise<Concept[]> {
  const concepts = await getConcepts();
  return concepts.filter((concept) => concept.subjectId === subjectId);
}

export async function getArtifacts(): Promise<Artifact[]> {
  const raw = await readJson<unknown>(paths.artifactsFile);
  return artifactsFileSchema.parse(raw).artifacts;
}

export async function getArtifactsForSubject(subjectId: string): Promise<Artifact[]> {
  const artifacts = await getArtifacts();
  return artifacts.filter((artifact) => artifact.subjectId === subjectId);
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
  const mdFiles = files.filter((f) => f.endsWith(".md"));
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
  const trackOrder: Record<Module["track"], number> = {
    main: 0,
    interpretability: 1,
    branch: 2,
  };
  return modules.sort((a, b) => {
    if (a.track !== b.track) return trackOrder[a.track] - trackOrder[b.track];
    return a.number - b.number;
  });
}

export async function getModulesForSubject(subjectId: string): Promise<Module[]> {
  const modules = await getModules();
  return modules.filter((module) => module.subjectId === subjectId);
}

export async function getModule(id: string): Promise<Module | undefined> {
  const all = await getModules();
  return all.find((m) => m.id === id);
}

export async function getCurrentWeek(): Promise<{
  progress: Progress;
  subject: Subject;
  week: Week;
  module: Module;
}> {
  const [progress, subjects] = await Promise.all([getProgress(), getSubjects()]);
  const subject = subjects.find((item) => item.id === progress.currentSubjectId) ?? subjects[0];
  const subjectState = progress.subjects[subject.id];
  const currentWeekId = subjectState?.currentWeekId ?? progress.currentWeek.id;
  const week = progress.weeks.find((w) => w.id === currentWeekId);
  if (!week) throw new Error(`Current week ${currentWeekId} not found in progress.json`);
  const currentModule = await getModule(week.moduleId);
  if (!currentModule) throw new Error(`Module ${week.moduleId} not found for current week`);
  return { progress, subject, week, module: currentModule };
}

export async function getConceptsGroupedByModule(subjectId?: string): Promise<{ module: Module; concepts: Concept[] }[]> {
  const [concepts, modules] = await Promise.all([getConcepts(), getModules()]);
  const scopedConcepts = subjectId
    ? concepts.filter((concept) => concept.subjectId === subjectId)
    : concepts;
  const scopedModules = subjectId
    ? modules.filter((module) => module.subjectId === subjectId)
    : modules;
  return scopedModules
    .map((mod) => ({
      module: mod,
      concepts: scopedConcepts.filter((c) => c.moduleIds.includes(mod.id)),
    }))
    .filter((group) => group.concepts.length > 0);
}

export async function getConceptBySlug(slug: string): Promise<Concept | undefined> {
  const concepts = await getConcepts();
  return concepts.find((c) => c.slug === slug);
}

export async function getAllWeeksWithModules(subjectId?: string): Promise<{ module: Module; weeks: Week[] }[]> {
  const [progress, modules] = await Promise.all([getProgress(), getModules()]);
  const scopedModules = subjectId
    ? modules.filter((module) => module.subjectId === subjectId)
    : modules;
  const scopedWeeks = subjectId
    ? progress.weeks.filter((week) => week.subjectId === subjectId)
    : progress.weeks;
  return scopedModules
    .map((mod) => ({
      module: mod,
      weeks: scopedWeeks
        .filter((w) => w.moduleId === mod.id)
        .sort((a, b) => b.startDate.localeCompare(a.startDate)),
    }))
    .filter((group) => group.weeks.length > 0)
    .sort((a, b) => b.weeks[0].startDate.localeCompare(a.weeks[0].startDate));
}
