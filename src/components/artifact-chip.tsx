import { BookOpen, Code2, FileText, Mic, PlaySquare } from "lucide-react";
import type { Artifact, ArtifactType } from "@/lib/types";

const iconFor: Record<ArtifactType, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  video: PlaySquare,
  paper: FileText,
  repo: Code2,
  post: BookOpen,
  podcast: Mic,
};

const labelFor: Record<ArtifactType, string> = {
  video: "Video",
  paper: "Paper",
  repo: "Repo",
  post: "Post",
  podcast: "Podcast",
};

export function ArtifactChip({ artifact }: { artifact: Artifact }) {
  const Icon = iconFor[artifact.type];
  return (
    <a
      href={artifact.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center gap-2 rounded-md bg-muted/60 px-2.5 py-1 text-[12.5px] text-foreground hover:bg-muted"
    >
      <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
      <span className="truncate">{artifact.title}</span>
      <span className="shrink-0 text-muted-foreground">{labelFor[artifact.type]}</span>
    </a>
  );
}
