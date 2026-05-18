"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setCurrentWeek } from "@/lib/local-store";

interface WeekSwitchConfirmProps {
  weekId: string;
  moduleTitle?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function WeekSwitchConfirm({ weekId, onCancel, onSuccess }: WeekSwitchConfirmProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const router = useRouter();

  function handleConfirm() {
    setStatus("saving");
    setCurrentWeek(weekId);
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/weeks");
    }
  }

  function handleCancel() {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/weeks");
    }
  }

  return (
    <div className="flex flex-col gap-2 bg-muted/60 rounded-b-xl px-5 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-foreground">Switch to this week?</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground" onClick={handleCancel}>
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
