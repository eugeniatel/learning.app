"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getPhase, setPhase } from "@/lib/local-store";
import type { Phase } from "@/lib/types";

export function PhaseToggle({ phase }: { phase: Phase }) {
  const [localPhase, setLocalPhase] = useState(phase);
  const nextPhase = localPhase === "foundational" ? "flexible" : "foundational";

  useEffect(() => {
    queueMicrotask(() => setLocalPhase(getPhase(phase)));
  }, [phase]);

  function handleClick() {
    setLocalPhase(nextPhase);
    setPhase(nextPhase);
  }

  return (
    <section className="mb-8 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-foreground">
            {localPhase === "foundational" ? "Foundational phase" : "Flexible phase"}
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Switch manually when the fixed sequence has done its job.
          </p>
        </div>
        <Button type="button" size="sm" onClick={handleClick}>
          {nextPhase === "flexible" ? "Enter flexible" : "Back to foundational"}
        </Button>
      </div>
    </section>
  );
}
