import { ArtifactChip } from "./artifact-chip";
import type { Artifact } from "@/lib/types";

export function ArtifactList({ artifacts }: { artifacts: Artifact[] }) {
  if (artifacts.length === 0) return null;

  const badgeLabel = (s: Artifact["readStatus"]) =>
    s === "read" ? "read" : s === "in_progress" ? "in progress" : "unread";

  return (
    <div>
      <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        Linked artifacts
      </p>
      <div className="flex flex-wrap gap-2">
        {artifacts.map((artifact) => (
          <div key={artifact.id} className="flex items-center gap-1.5">
            <ArtifactChip artifact={artifact} />
            <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {badgeLabel(artifact.readStatus)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
