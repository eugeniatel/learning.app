import { Shell } from "@/components/shell";
import { TodayList } from "@/components/today-list";
import { getProgress } from "@/lib/data";
import { getTodayItems } from "@/lib/today";

export default async function TodayPage() {
  const [progress, items] = await Promise.all([getProgress(), getTodayItems()]);

  return (
    <Shell phase={progress.phase}>
      <div className="mb-8">
        <p className="text-[13px] text-muted-foreground">One next block per active subject</p>
        <h1 className="mt-1 text-[22px] font-medium text-foreground">Today</h1>
      </div>
      <TodayList items={items} />
    </Shell>
  );
}
