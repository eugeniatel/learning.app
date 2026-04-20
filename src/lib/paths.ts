import path from "node:path";

const root = process.cwd();

export const paths = {
  curriculumDir: path.join(root, "curriculum"),
  notesDir: path.join(root, "notes"),
  reflectionsDir: path.join(root, "notes", "reflections"),
  progressFile: path.join(root, "progress.json"),
  spineFile: path.join(root, "curriculum", "spine.json"),
  conceptsFile: path.join(root, "curriculum", "concepts.json"),
  artifactsFile: path.join(root, "curriculum", "artifacts.json"),
};
