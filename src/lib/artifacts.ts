import fs from "node:fs/promises";
import { paths } from "./paths";
import { artifactsFileSchema } from "./schemas";
import type { ReadStatus } from "./types";

/**
 * Reads artifacts.json, updates the readStatus of the artifact with the given id, writes back.
 * Throws if the artifact id is not found.
 */
export async function writeArtifactStatus(artifactId: string, newStatus: ReadStatus): Promise<void> {
  const raw = await fs.readFile(paths.artifactsFile, "utf8");
  const parsed = artifactsFileSchema.parse(JSON.parse(raw));
  const idx = parsed.artifacts.findIndex((a) => a.id === artifactId);
  if (idx === -1) throw new Error(`Artifact ${artifactId} not found`);
  parsed.artifacts[idx] = { ...parsed.artifacts[idx], readStatus: newStatus };
  await fs.writeFile(paths.artifactsFile, JSON.stringify({ artifacts: parsed.artifacts }, null, 2), "utf8");
}
