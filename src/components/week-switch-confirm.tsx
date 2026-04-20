"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { switchWeekAction } from "@/lib/actions/switch-week";

interface WeekSwitchConfirmProps {
  weekId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function WeekSwitchConfirm({ weekId, onCancel, onSuccess }: WeekSwitchConfirmProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleConfirm() {
    setStatus("saving");
    try {
      await switchWeekAction(weekId);
      onSuccess();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-2 bg-muted/60 rounded-b-xl px-5 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-foreground">Switch to this week?</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground" onClick={onCancel}>
            Keep current
          </Button>
          <Button
            variant="default"
            size="sm"
            className="text-[13px]"
            onClick={handleConfirm}
            disabled={status === "saving"}
          >
            Yes, switch
          </Button>
        </div>
      </div>
      {status === "error" && (
        <p className="text-[13px] text-destructive">Could not switch week. Try again.</p>
      )}
    </div>
  );
}
