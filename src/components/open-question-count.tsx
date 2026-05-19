"use client";

import { useEffect, useState } from "react";
import { getSubjectQuestions } from "@/lib/local-store";
import type { Question } from "@/lib/types";

function openCount(questions: Question[]): number {
  return questions.filter((question) => question.status === "open").length;
}

export function OpenQuestionCount({ subjectId, seed }: { subjectId: string; seed: Question[] }) {
  const [count, setCount] = useState(() => openCount(seed));

  useEffect(() => {
    queueMicrotask(() => setCount(openCount(getSubjectQuestions(subjectId, seed))));
  }, [subjectId, seed]);

  return <>{count} questions</>;
}
