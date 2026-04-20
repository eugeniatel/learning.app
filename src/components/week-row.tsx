import type { Module, Week } from "@/lib/types";

interface WeekRowProps {
  week: Week;
  module: Module;
  isCurrent: boolean;
  onClick?: () => void;
}

function formatRange(startDate: string): string {
  const [y, m, d] = startDate.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);
  const fmt = (x: Date) =>
    x.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} to ${fmt(end)}`;
}

export function WeekRow({ week, module, isCurrent, onClick }: WeekRowProps) {
  const done = week.sessions.filter((s) => s.status === "done").length;
  const total = week.sessions.length;
  return (
    <div
      className={`flex flex-col rounded-xl bg-card border border-border px-5 py-4 transition-colors duration-[180ms] ease-out hover:bg-muted/40 ${onClick ? "cursor-pointer" : "cursor-default"}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <span className="text-[12px] text-muted-foreground">
            Week {week.number}, {formatRange(week.startDate)}
            {isCurrent && (
              <span className="ml-2 rounded-sm bg-muted px-1.5 py-0.5 text-[12px] text-muted-foreground">
                Current
              </span>
            )}
          </span>
          <p className="text-[15px] font-medium text-foreground mt-0.5">{module.title}</p>
        </div>
        <span className="text-[13px] text-muted-foreground shrink-0">
          {done}/{total} sessions done
        </span>
      </div>
    </div>
  );
}
