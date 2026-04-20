"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Question, QuestionStatus } from "@/lib/types";

const badgeCopy: Record<QuestionStatus, string> = {
  open: "Open",
  parked: "Parked",
  answered: "Answered",
};

export function QuestionItem({
  question,
  onStatusChange,
}: {
  question: Question;
  onStatusChange: (id: string, newStatus: QuestionStatus) => void;
}) {
  const [status, setStatus] = useState<QuestionStatus>(question.status);

  function handleAction(newStatus: QuestionStatus) {
    setStatus(newStatus);
    onStatusChange(question.id, newStatus);
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[12px] text-muted-foreground">
          {badgeCopy[status]}
        </span>
        <p className="text-[15px] text-foreground">{question.text}</p>
      </div>
      <div className="shrink-0 flex gap-2">
        {status === "open" ? (
          <>
            <Button variant="outline" size="sm" onClick={() => handleAction("parked")}>
              Park
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAction("answered")}>
              Answer
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => handleAction("open")}>
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}
