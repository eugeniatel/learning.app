"use client";
import { useState } from "react";
import Link from "next/link";
import { ConceptQuestionGroup } from "./concept-question-group";
import { getQuestionStatus, setQuestionStatus } from "@/lib/local-store";
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
        map[q.id] = getQuestionStatus(q.id, q.status);
      }
    }
    return map;
  });

  const groupsWithStatus = groups.map((g) => ({
    ...g,
    questions: g.questions.map((q) => ({ ...q, status: statuses[q.id] ?? q.status })),
  }));

  function handleStatusChange(questionId: string, newStatus: QuestionStatus) {
    setStatuses((s) => ({ ...s, [questionId]: newStatus }));
    setQuestionStatus(questionId, newStatus);
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
    </div>
  );
}
