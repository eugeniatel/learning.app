"use client";
import { useState } from "react";
import { BookOpen, CheckCircle2, Circle, CircleDot, Code2, FileText, Mic, PlaySquare } from "lucide-react";
import { toggleArtifactStatusAction } from "@/lib/actions/toggle-artifact-status";
import type { Artifact, ArtifactType, ReadStatus } from "@/lib/types";

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

function nextStatus(current: ReadStatus): ReadStatus {
  if (current === "unread") return "in_progress";
  if (current === "in_progress") return "read";
  return "unread";
}

const ariaLabelMap: Record<ReadStatus, string> = {
  in_progress: "Mark artifact as in progress",
  read: "Mark artifact as read",
  unread: "Mark artifact as unread",
};

function ToggleIcon({ status }: { status: ReadStatus }) {
  if (status === "read") {
    return <CheckCircle2 className="size-3.5 text-foreground/70" strokeWidth={1.5} />;
  }
  if (status === "in_progress") {
    return <CircleDot className="size-3.5 text-muted-foreground" strokeWidth={1.5} />;
  }
  return <Circle className="size-3.5 text-muted-foreground/50" strokeWidth={1} />;
}

export function ArtifactChip({ artifact }: { artifact: Artifact }) {
  const [readStatus, setReadStatus] = useState<ReadStatus>(artifact.readStatus);
  const Icon = iconFor[artifact.type];

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const next = nextStatus(readStatus);
    setReadStatus(next);
    void toggleArtifactStatusAction(artifact.id, next);
  }

  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-md bg-muted/60 px-2.5 py-1 text-[12.5px] text-foreground hover:bg-muted">
      <button
        type="button"
        aria-label={ariaLabelMap[nextStatus(readStatus)]}
        onClick={handleToggle}
        className="z-10 shrink-0 cursor-pointer transition-colors duration-[180ms] ease-out"
      >
        <ToggleIcon status={readStatus} />
      </button>
      <a
        href={artifact.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-w-0 items-center gap-2"
      >
        <Icon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <span className="truncate">{artifact.title}</span>
        <span className="shrink-0 text-muted-foreground">{labelFor[artifact.type]}</span>
      </a>
    </div>
  );
}
