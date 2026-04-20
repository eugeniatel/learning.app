import { WeekHeader } from "./week-header";
import { SessionCard } from "./session-card";
import { ReflectionPrompt } from "./reflection-prompt";
import type { Artifact, Module, Session, Week } from "@/lib/types";

export function WeekView({
  week,
  module,
  artifacts,
}: {
  week: Week;
  module: Module;
  artifacts: Artifact[];
}) {
  const byId = new Map(artifacts.map((a) => [a.id, a]));
  const firstTodoIdx = week.sessions.findIndex((s) => s.status === "todo");
  const hasInProgress = week.sessions.some((s) => s.status === "in_progress");
  return (
    <div>
      <WeekHeader week={week} module={module} />
      <div className="flex flex-col gap-3">
        {week.sessions.map((session: Session, i) => {
          const upNext = !hasInProgress && i === firstTodoIdx;
          const sessionArtifacts = session.artifactIds
            .map((id) => byId.get(id))
            .filter((a): a is Artifact => !!a);
          return (
            <SessionCard
              key={session.id}
              session={session}
              artifacts={sessionArtifacts}
              upNext={upNext}
            />
          );
        })}
      </div>
      <ReflectionPrompt weekId={week.id} />
    </div>
  );
}
