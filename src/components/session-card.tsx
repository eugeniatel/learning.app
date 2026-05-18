"use client";
import { useEffect, useState } from "react";
import { Check, Circle, CircleDot } from "lucide-react";
import { ArtifactChip } from "./artifact-chip";
import { SessionEditForm } from "./session-edit-form";
import { getSessionOverride, setSessionStatus } from "@/lib/local-store";
import type { Artifact, Session, SessionStatus } from "@/lib/types";

function StatusIcon({ status }: { status: SessionStatus }) {
  if (status === "done") {
    return (
      <span className="inline-flex size-5 items-center justify-center rounded-full bg-foreground text-background">
        <Check className="size-3" strokeWidth={2} />
      </span>
    );
  }
  if (status === "in_progress") {
    return <CircleDot className="size-5 text-[var(--ring)]" strokeWidth={1.5} />;
  }
  return <Circle className="size-5 text-muted-foreground/60" strokeWidth={1} strokeDasharray="2 2" />;
}

function cycleNext(s: SessionStatus): SessionStatus {
  if (s === "todo") return "in_progress";
  if (s === "in_progress") return "done";
  return "todo";
}

const ariaLabel: Record<SessionStatus, string> = {
  todo: "Session status: todo. Click to cycle.",
  in_progress: "Session status: in progress. Click to cycle.",
  done: "Session status: done. Click to cycle.",
};

export function SessionCard({
  session,
  artifacts,
  upNext,
  weekId,
}: {
  session: Session;
  artifacts: Artifact[];
  upNext: boolean;
  weekId: string;
}) {
  const [localSession, setLocalSession] = useState<Session>(session);

  useEffect(() => {
    queueMicrotask(() => setLocalSession((current) => ({ ...current, ...getSessionOverride(session.id) })));
  }, [session.id]);

  const dim = localSession.status === "done";
  const stronger = localSession.status === "in_progress" || upNext;

  function handleStatusClick() {
    const next = cycleNext(localSession.status);
    setLocalSession((current) => ({ ...current, status: next }));
    setSessionStatus(session.id, next);
  }

  return (
    <article
      className={[
        "flex flex-col gap-3 rounded-xl bg-card px-5 py-4",
        dim ? "opacity-60" : "",
        stronger ? "border-foreground/30" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <button
            type="button"
            aria-label={ariaLabel[localSession.status]}
            onClick={handleStatusClick}
            className="cursor-pointer"
          >
            <StatusIcon status={localSession.status} />
          </button>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[15px] font-medium text-foreground">{localSession.title}</h3>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[12px] text-muted-foreground">{localSession.estimatedMinutes} min</span>
              <SessionEditForm
                weekId={weekId}
                session={localSession}
                onSave={(patch) => setLocalSession((current) => ({ ...current, ...patch }))}
              />
            </div>
          </div>
          {upNext ? (
            <p className="mt-0.5 text-[12px] text-[var(--ring)]">Up next</p>
          ) : null}
          {localSession.notes ? <p className="mt-2 text-[13px] text-muted-foreground">{localSession.notes}</p> : null}
        </div>
      </div>
      {artifacts.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pl-8">
          {artifacts.map((a) => (
            <ArtifactChip key={a.id} artifact={a} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
