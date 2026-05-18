import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { paths } from "./paths";
import { getArtifacts, getConcepts, getModules, getProgress } from "./data";

export type SearchItemKind = "concept" | "module" | "artifact" | "note" | "reflection";

export type SearchItem = {
  id: string;
  kind: SearchItemKind;
  subjectId: string;
  title: string;
  subtitle: string;
  body: string;
  href?: string;
};

function kindLabel(kind: SearchItemKind): string {
  if (kind === "artifact") return "Reading";
  if (kind === "reflection") return "Reflection";
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function titleForNote(file: string): string {
  return file
    .replace(/\.md$/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function readMarkdownFiles(dir: string): Promise<{ file: string; data: Record<string, unknown>; body: string }[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));
    return Promise.all(
      files.map(async (entry) => {
        const file = path.join(dir, entry.name);
        const raw = await fs.readFile(file, "utf8");
        const parsed = matter(raw);
        return { file: entry.name, data: parsed.data, body: parsed.content.trim() };
      })
    );
  } catch {
    return [];
  }
}

export async function getSearchIndexForCurrentSubject(): Promise<SearchItem[]> {
  const [progress, modules, concepts, artifacts, noteFiles, reflectionFiles] = await Promise.all([
    getProgress(),
    getModules(),
    getConcepts(),
    getArtifacts(),
    readMarkdownFiles(paths.notesDir),
    readMarkdownFiles(paths.reflectionsDir),
  ]);
  const subjectId = progress.currentSubjectId;
  const scopedModules = modules.filter((module) => module.subjectId === subjectId);
  const moduleMap = new Map(scopedModules.map((module) => [module.id, module]));
  const conceptMap = new Map(
    concepts.filter((concept) => concept.subjectId === subjectId).map((concept) => [concept.id, concept])
  );
  const weekMap = new Map(
    progress.weeks.filter((week) => week.subjectId === subjectId).map((week) => [week.id, week])
  );

  const moduleItems: SearchItem[] = scopedModules.map((module) => ({
    id: module.id,
    kind: "module",
    subjectId,
    title: module.title,
    subtitle: `${kindLabel("module")} ${module.number}`,
    body: [module.goal, module.body].filter(Boolean).join("\n\n"),
    href: `/weeks?module=${module.id}`,
  }));

  const conceptItems: SearchItem[] = Array.from(conceptMap.values()).map((concept) => {
    const primaryModule = moduleMap.get(concept.moduleIds[0] ?? "");
    return {
      id: concept.id,
      kind: "concept",
      subjectId,
      title: concept.title,
      subtitle: primaryModule ? primaryModule.title : kindLabel("concept"),
      body: concept.oneLiner,
      href: `/concepts/${concept.slug}`,
    };
  });

  const artifactItems: SearchItem[] = artifacts
    .filter((artifact) => artifact.subjectId === subjectId)
    .map((artifact) => ({
      id: artifact.id,
      kind: "artifact",
      subjectId,
      title: artifact.title,
      subtitle: artifact.author ? `${kindLabel("artifact")} by ${artifact.author}` : kindLabel("artifact"),
      body: `${artifact.type} ${artifact.readStatus}`,
      href: artifact.url,
    }));

  const noteItems: SearchItem[] = noteFiles
    .filter((note) => !note.file.startsWith("week-"))
    .reduce<SearchItem[]>((items, note) => {
      const conceptId = typeof note.data.conceptId === "string" ? note.data.conceptId : "";
      const concept = conceptMap.get(conceptId);
      if (!concept) return items;
      items.push({
        id: `note-${concept.id}`,
        kind: "note",
        subjectId,
        title: concept.title,
        subtitle: "Concept note",
        body: note.body,
        href: `/concepts/${concept.slug}`,
      });
      return items;
    }, []);

  const reflectionItems: SearchItem[] = reflectionFiles
    .reduce<SearchItem[]>((items, reflection) => {
      const weekId = typeof reflection.data.weekId === "string" ? reflection.data.weekId : "";
      const week = weekMap.get(weekId);
      if (!week) return items;
      const weekModule = moduleMap.get(week.moduleId);
      items.push({
        id: `reflection-${week.id}`,
        kind: "reflection",
        subjectId,
        title: `Week ${week.number} reflection`,
        subtitle: weekModule ? weekModule.title : titleForNote(reflection.file),
        body: reflection.body,
        href: `/weeks/${week.id}`,
      });
      return items;
    }, []);

  return [...conceptItems, ...moduleItems, ...artifactItems, ...noteItems, ...reflectionItems];
}
