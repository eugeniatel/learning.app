import type { Module, Week } from "@/lib/types";

function formatRange(startDate: string): string {
  const [y, m, d] = startDate.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);
  const fmt = (x: Date) =>
    x.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} to ${fmt(end)}`;
}

export function WeekHeader({ week, module }: { week: Week; module: Module }) {
  const done = week.sessions.filter((s) => s.status === "done").length;
  const total = week.sessions.length;
  return (
    <header className="flex flex-col gap-3 pb-8">
      <div className="flex items-center justify-between text-[12px] text-muted-foreground">
        <span>Week {week.number}, {formatRange(week.startDate)}</span>
        <span>
          {done} of {total} done
        </span>
      </div>
      <div>
        <h2 className="text-[22px] font-medium tracking-tight text-foreground">
          {module.title}
        </h2>
        {module.goal ? (
          <p className="mt-2 max-w-prose text-[14.5px] text-muted-foreground">
            {module.goal}
          </p>
        ) : null}
      </div>
    </header>
  );
}
