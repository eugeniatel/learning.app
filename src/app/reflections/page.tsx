import Link from "next/link";
import { Shell } from "@/components/shell";
import { getProgress } from "@/lib/data";
import { getReflectionHistoryForCurrentSubject } from "@/lib/reflections";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function ReflectionsPage() {
  const [progress, reflections] = await Promise.all([
    getProgress(),
    getReflectionHistoryForCurrentSubject(),
  ]);

  return (
    <Shell phase={progress.phase}>
      <div className="mb-8">
        <p className="text-[13px] text-muted-foreground">Week-level learning notes</p>
        <h1 className="mt-1 text-[22px] font-medium text-foreground">Reflections</h1>
      </div>
      {reflections.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">
          No reflections yet. Save one from a week page and it will appear here.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {reflections.map((reflection) => (
            <Link
              key={reflection.weekId}
              href={reflection.href}
              className="rounded-lg border border-border bg-card px-4 py-4 transition-colors duration-[180ms] ease-out hover:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] text-muted-foreground">
                    Week {reflection.weekNumber}, {formatDate(reflection.startDate)}
                  </p>
                  <h2 className="mt-1 text-[15px] font-medium text-foreground">
                    {reflection.moduleTitle}
                  </h2>
                </div>
                {reflection.updatedAt && (
                  <span className="shrink-0 text-[12px] text-muted-foreground">
                    Updated {formatDate(reflection.updatedAt)}
                  </span>
                )}
              </div>
              <p className="mt-3 line-clamp-3 text-[13px] text-muted-foreground">
                {reflection.body}
              </p>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}
