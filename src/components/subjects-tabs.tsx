"use client";

import { useState, type ReactNode } from "react";

const tabClass = (active: boolean) =>
  [
    "min-h-[44px] rounded-md px-3 text-[13px] transition-colors duration-[180ms] ease-out",
    active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50",
  ].join(" ");

export function SubjectsTabs({
  subjectsView,
  mapView,
}: {
  subjectsView: ReactNode;
  mapView: ReactNode;
}) {
  const [tab, setTab] = useState<"subjects" | "map">("subjects");

  return (
    <div>
      <div className="mb-6 flex gap-1">
        <button type="button" onClick={() => setTab("subjects")} className={tabClass(tab === "subjects")}>
          Subjects
        </button>
        <button type="button" onClick={() => setTab("map")} className={tabClass(tab === "map")}>
          Map
        </button>
      </div>
      {tab === "subjects" ? subjectsView : mapView}
    </div>
  );
}
