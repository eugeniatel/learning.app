"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSubjectEnabled, setSubjectEnabled } from "@/lib/local-store";

export function SubjectEnableToggle({
  subjectId,
  initialEnabled,
}: {
  subjectId: string;
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);

  useEffect(() => {
    queueMicrotask(() => setEnabled(getSubjectEnabled(subjectId, initialEnabled)));
  }, [subjectId, initialEnabled]);

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    setSubjectEnabled(subjectId, next);
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <span className="text-[12px] text-muted-foreground">
        {enabled ? "Active track" : "Paused track"}
      </span>
      <Button
        type="button"
        size="sm"
        variant={enabled ? "outline" : "default"}
        onClick={handleToggle}
      >
        {enabled ? "Pause" : "Enable"}
      </Button>
    </div>
  );
}
