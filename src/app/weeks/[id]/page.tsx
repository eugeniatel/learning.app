import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { WeekHeader } from "@/components/week-header";
import { SessionCard } from "@/components/session-card";
import { WeekSwitchConfirm } from "@/components/week-switch-confirm";
import { getProgress, getArtifacts, getModule } from "@/lib/data";

export const dynamicParams = false;

export async function generateStaticParams() {
  const progress = await getProgress();
  return progress.weeks.map((week) => ({ id: week.id }));
}

export default async function WeekDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [progress, artifacts] = await Promise.all([getProgress(), getArtifacts()]);
  const week = progress.weeks.find((w) => w.id === id);
  if (!week) notFound();
  const weekModule = await getModule(week.moduleId);
  if (!weekModule) notFound();
  const isCurrent = progress.currentWeek.id === id;
  const phase = progress.subjects[week.subjectId]?.phase ?? progress.phase;

  return (
    <Shell phase={phase}>
      <WeekHeader week={week} module={weekModule} />
      <div className="flex flex-col gap-3">
        {week.sessions.map((session) => {
          const sessionArtifacts = session.artifactIds
            .map((aid) => artifacts.find((a) => a.id === aid))
            .filter((a): a is NonNullable<typeof a> => !!a);
          return (
            <SessionCard
              key={session.id}
              session={session}
              artifacts={sessionArtifacts}
              upNext={false}
              weekId={id}
            />
          );
        })}
      </div>
      <div className="mt-10">
        {isCurrent ? (
          <p className="text-[13px] text-muted-foreground">
            This is your current week.
          </p>
        ) : (
          <WeekSwitchConfirm weekId={week.id} />
        )}
      </div>
    </Shell>
  );
}
