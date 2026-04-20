import { Shell } from "@/components/shell";
import { WeekView } from "@/components/week-view";
import { getArtifacts, getCurrentWeek } from "@/lib/data";

export default async function Home() {
  const [{ progress, week, module }, artifacts] = await Promise.all([
    getCurrentWeek(),
    getArtifacts(),
  ]);
  return (
    <Shell phase={progress.phase}>
      <WeekView week={week} module={module} artifacts={artifacts} />
    </Shell>
  );
}
