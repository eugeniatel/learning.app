import { WeekRow } from "./week-row";
import type { Module, Week } from "@/lib/types";

interface WeeksListProps {
  groups: { module: Module; weeks: Week[] }[];
  currentWeekId: string;
}

export function WeeksList({ groups, currentWeekId }: WeeksListProps) {
  return (
    <div>
      <h1 className="text-[22px] font-medium tracking-tight text-foreground mb-6">All weeks</h1>
      {groups.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted-foreground">No weeks recorded yet.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(({ module, weeks }) => (
            <section key={module.id}>
              <p className="text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground mb-2">
                {module.title}
              </p>
              <div className="flex flex-col gap-2">
                {weeks.map((week) => (
                  <WeekRow
                    key={week.id}
                    week={week}
                    module={module}
                    isCurrent={week.id === currentWeekId}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
