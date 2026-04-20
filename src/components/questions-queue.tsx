"use client";
import { useState } from "react";
import Link from "next/link";
import { ConceptQuestionGroup } from "./concept-question-group";
import { updateQuestionStatusAction } from "@/lib/actions/update-question-status";
import type { Question, QuestionStatus } from "@/lib/types";

type ConceptGroup = {
  conceptId: string;
  conceptTitle: string;
  conceptSlug: string;
  moduleLabel: string;
  questions: Question[];
};

export function QuestionsQueue({ groups }: { groups: ConceptGroup[] }) {
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>(() => {
    const map: Record<string, QuestionStatus> = {};
    for (const g of groups) {
      for (const q of g.questions) {
        map[q.id] = q.status;
      }
    }
    return map;
  });

  const [error, setError] = useState<string | null>(null);

  const groupsWithStatus = groups.map((g) => ({
    ...g,
    questions: g.questions.map((q) => ({ ...q, status: statuses[q.id] ?? q.status })),
  }));

  async function handleStatusChange(questionId: string, newStatus: QuestionStatus) {
    const prev = statuses[questionId];
    setStatuses((s) => ({ ...s, [questionId]: newStatus }));
    try {
      await updateQuestionStatusAction(questionId, newStatus);
      setError(null);
    } catch {
      setStatuses((s) => ({ ...s, [questionId]: prev }));
      setError("Could not update question. Try again.");
    }
  }

  const hasAny = groups.some((g) => g.questions.length > 0);

  if (!hasAny) {
    return (
      <p className="text-[15px] text-muted-foreground">
        No open questions yet. Add one from any{" "}
        <Link href="/concepts" className="underline">
          concept page
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {groupsWithStatus.map((g) => (
        <ConceptQuestionGroup key={g.conceptId} group={g} onStatusChange={handleStatusChange} />
      ))}
      {error && <p className="text-[13px] text-destructive">{error}</p>}
    </div>
  );
}
