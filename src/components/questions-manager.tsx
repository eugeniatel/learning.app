"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuestionItem } from "./question-item";
import { getSubjectQuestions, setSubjectQuestions } from "@/lib/local-store";
import type { Question, QuestionStatus } from "@/lib/types";

function byNewest(a: Question, b: Question): number {
  return b.createdAt.localeCompare(a.createdAt);
}

export function QuestionsManager({
  subjectId,
  seed,
  conceptLabels,
}: {
  subjectId: string;
  seed: Question[];
  conceptLabels: Record<string, string>;
}) {
  const [questions, setQuestions] = useState<Question[]>(seed);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    queueMicrotask(() => setQuestions(getSubjectQuestions(subjectId, seed)));
  }, [subjectId, seed]);

  function persist(next: Question[]) {
    setQuestions(next);
    setSubjectQuestions(subjectId, next);
  }

  function addQuestion() {
    const text = inputValue.trim();
    if (!text) return;
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      subjectId,
      text,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    persist([newQuestion, ...questions]);
    setInputValue("");
  }

  function changeStatus(id: string, status: QuestionStatus) {
    persist(questions.map((question) => (question.id === id ? { ...question, status } : question)));
  }

  function labelFor(question: Question): string | undefined {
    return question.conceptId ? conceptLabels[question.conceptId] : undefined;
  }

  const open = questions.filter((question) => question.status === "open").sort(byNewest);
  const parked = questions.filter((question) => question.status === "parked").sort(byNewest);
  const answered = questions.filter((question) => question.status === "answered").sort(byNewest);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addQuestion();
            }
          }}
          placeholder="Add a question for this subject..."
          className="flex-1"
        />
        <Button className="min-h-[44px]" onClick={addQuestion}>
          Add
        </Button>
      </div>

      {questions.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">
          No open questions yet. Type one above, or add one from any concept page.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {open.length > 0 && (
            <div className="flex flex-col gap-2">
              {open.map((question) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  conceptLabel={labelFor(question)}
                  onStatusChange={changeStatus}
                />
              ))}
            </div>
          )}
          {(parked.length > 0 || answered.length > 0) && (
            <div className="flex flex-col gap-2 opacity-70">
              {parked.length > 0 && (
                <p className="text-[12px] text-muted-foreground">
                  {parked.length === 1 ? "1 parked" : `${parked.length} parked`}
                </p>
              )}
              {parked.map((question) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  conceptLabel={labelFor(question)}
                  onStatusChange={changeStatus}
                />
              ))}
              {answered.length > 0 && (
                <p className="text-[12px] text-muted-foreground">
                  {answered.length === 1 ? "1 answered" : `${answered.length} answered`}
                </p>
              )}
              {answered.map((question) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  conceptLabel={labelFor(question)}
                  onStatusChange={changeStatus}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
