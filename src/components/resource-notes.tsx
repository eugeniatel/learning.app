import { ArtifactChip } from "./artifact-chip";
import { NoteEditor } from "./note-editor";
import type { Artifact } from "@/lib/types";

export function ResourceNotes({ artifacts }: { artifacts: Artifact[] }) {
  if (artifacts.length === 0) return null;

  return (
    <div>
      <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        Resources and notes
      </p>
      <div className="flex flex-col gap-6">
        {artifacts.map((artifact) => (
          <div key={artifact.id} className="flex flex-col gap-2">
            <ArtifactChip artifact={artifact} />
            <NoteEditor artifactId={artifact.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
