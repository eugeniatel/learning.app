"use client";

import { Button } from "@/components/ui/button";
import type { Question, QuestionStatus } from "@/lib/types";

const badgeCopy: Record<QuestionStatus, string> = {
  open: "Open",
  parked: "Parked",
  answered: "Answered",
};

export function QuestionItem({
  question,
  conceptLabel,
  onStatusChange,
}: {
  question: Question;
  conceptLabel?: string;
  onStatusChange: (id: string, newStatus: QuestionStatus) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[12px] text-muted-foreground">
          {badgeCopy[question.status]}
        </span>
        <p className="min-w-0 text-[15px] text-foreground">{question.text}</p>
        {conceptLabel ? (
          <span className="shrink-0 text-[12px] text-muted-foreground">{conceptLabel}</span>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-2">
        {question.status === "open" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px]"
              onClick={() => onStatusChange(question.id, "parked")}
            >
              Park
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px]"
              onClick={() => onStatusChange(question.id, "answered")}
            >
              Answer
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px]"
            onClick={() => onStatusChange(question.id, "open")}
          >
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}
