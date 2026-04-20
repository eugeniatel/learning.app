"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WeekRow } from "./week-row";
import { WeekSwitchConfirm } from "./week-switch-confirm";
import type { Module, Week } from "@/lib/types";

interface WeeksListProps {
  groups: { module: Module; weeks: Week[] }[];
  currentWeekId: string;
}

export function WeeksList({ groups, currentWeekId }: WeeksListProps) {
  const [confirmingWeekId, setConfirmingWeekId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmingWeekId(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
                  <div key={week.id} className="flex flex-col">
                    <WeekRow
                      week={week}
                      module={module}
                      isCurrent={week.id === currentWeekId}
                      onClick={
                        week.id === currentWeekId
                          ? undefined
                          : () => setConfirmingWeekId(week.id)
                      }
                    />
                    {confirmingWeekId === week.id && (
                      <WeekSwitchConfirm
                        weekId={week.id}
                        onCancel={() => setConfirmingWeekId(null)}
                        onSuccess={() => {
                          setConfirmingWeekId(null);
                          router.refresh();
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
