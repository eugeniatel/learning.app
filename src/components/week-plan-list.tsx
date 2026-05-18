import Link from "next/link";
import type { WeekPlanItem } from "@/lib/week-plan";

export function WeekPlanList({ items, compact = false }: { items: WeekPlanItem[]; compact?: boolean }) {
  if (items.length === 0) {
    return <p className="text-[15px] text-muted-foreground">No enabled subjects yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map(({ subject, week, module, session }) => (
        <Link
          key={`${subject.id}-${session.id}`}
          href={`/weeks/${week.id}`}
          className="rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-[180ms] ease-out hover:bg-muted/40"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[12px] text-muted-foreground">{subject.title}</p>
              <h2 className="mt-1 truncate text-[15px] font-medium text-foreground">{session.title}</h2>
              {!compact && <p className="mt-1 text-[13px] text-muted-foreground">{module.title}</p>}
            </div>
            <span className="shrink-0 text-[12px] text-muted-foreground">{session.estimatedMinutes} min</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
