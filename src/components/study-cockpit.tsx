import Link from "next/link";
import { SubjectSwitcher } from "./subject-switcher";
import type { Module, Progress, Subject, Week } from "@/lib/types";

type SubjectSnapshot = {
  subject: Subject;
  phase: string;
  week?: Week;
  module?: Module;
  nextSessionTitle: string;
  weekId?: string;
  openQuestions: number;
};

function sessionProgress(week?: Week) {
  if (!week) return "No week selected";
  const done = week.sessions.filter((session) => session.status === "done").length;
  return `${done}/${week.sessions.length} sessions done`;
}

export function StudyCockpit({
  subjects,
  progress,
  snapshots,
}: {
  subjects: Subject[];
  progress: Progress;
  snapshots: SubjectSnapshot[];
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[13px] text-muted-foreground">Deep study cockpit</p>
        <h1 className="mt-1 text-[22px] font-medium text-foreground">This week</h1>
        <div className="mt-4">
          <SubjectSwitcher subjects={subjects} currentSubjectId={progress.currentSubjectId} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {snapshots.map((snapshot) => (
          <Link
            key={snapshot.subject.id}
            href={snapshot.weekId ? `/weeks/${snapshot.weekId}` : "/weeks"}
            className="rounded-lg border border-border bg-card px-4 py-4 transition-colors duration-[180ms] ease-out hover:bg-muted/40"
          >
            <p className="text-[12px] text-muted-foreground">{snapshot.subject.cadence}</p>
            <h2 className="mt-1 text-[15px] font-medium text-foreground">{snapshot.subject.title}</h2>
            <p className="mt-3 text-[13px] text-muted-foreground">
              {snapshot.module ? snapshot.module.title : "No module selected"}
            </p>
            <p className="mt-2 text-[15px] text-foreground">{snapshot.nextSessionTitle}</p>
            <div className="mt-4 flex items-center justify-between text-[12px] text-muted-foreground">
              <span>{sessionProgress(snapshot.week)}</span>
              <span>{snapshot.openQuestions} questions</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
