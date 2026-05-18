import { Shell } from "@/components/shell";
import { WeeksList } from "@/components/weeks-list";
import { getAllWeeksWithModules, getProgress } from "@/lib/data";

export default async function WeeksPage() {
  const progress = await getProgress();
  const groups = await getAllWeeksWithModules(progress.currentSubjectId);
  const currentWeekId = progress.subjects[progress.currentSubjectId]?.currentWeekId ?? progress.currentWeek.id;
  return (
    <Shell phase={progress.phase}>
      <WeeksList groups={groups} currentWeekId={currentWeekId} />
    </Shell>
  );
}
