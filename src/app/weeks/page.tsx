import { Shell } from "@/components/shell";
import { WeeksList } from "@/components/weeks-list";
import { getAllWeeksWithModules, getProgress } from "@/lib/data";

export default async function WeeksPage() {
  const [groups, progress] = await Promise.all([
    getAllWeeksWithModules(),
    getProgress(),
  ]);
  return (
    <Shell phase={progress.phase}>
      <WeeksList groups={groups} currentWeekId={progress.currentWeek.id} />
    </Shell>
  );
}
