import { Shell } from "@/components/shell";
import { WeekPlanList } from "@/components/week-plan-list";
import { getProgress } from "@/lib/data";
import { getWeekPlanItems } from "@/lib/week-plan";

export default async function WeekPage() {
  const [progress, items] = await Promise.all([getProgress(), getWeekPlanItems()]);

  return (
    <Shell phase={progress.phase}>
      <div className="mb-8">
        <p className="text-[13px] text-muted-foreground">One next block per active subject, whenever study time fits</p>
        <h1 className="mt-1 text-[22px] font-medium text-foreground">This week</h1>
      </div>
      <WeekPlanList items={items} />
    </Shell>
  );
}
