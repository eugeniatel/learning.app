"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSubjectQuestions, setSubjectQuestions } from "@/lib/local-store";
import type { Question } from "@/lib/types";

export function OpenQuestionCapture({
  conceptId,
  subjectId,
  subjectQuestions,
}: {
  conceptId: string;
  subjectId: string;
  subjectQuestions: Question[];
}) {
  const [all, setAll] = useState<Question[]>(subjectQuestions);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    queueMicrotask(() => setAll(getSubjectQuestions(subjectId, subjectQuestions)));
  }, [subjectId, subjectQuestions]);

  const conceptQuestions = all.filter((question) => question.conceptId === conceptId);

  function handleSubmit() {
    const text = inputValue.trim();
    if (!text) return;
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      subjectId,
      conceptId,
      text,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    const next = [...all, newQuestion];
    setAll(next);
    setSubjectQuestions(subjectId, next);
    setInputValue("");
  }

  return (
    <div>
      <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        Open questions
      </p>
      {conceptQuestions.length > 0 && (
        <div className="mb-3 flex flex-col gap-1.5">
          {conceptQuestions.map((question) => (
            <div
              key={question.id}
              className="rounded-md bg-muted px-3 py-2 text-[14px] text-foreground"
            >
              {question.text}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Park a question about this concept..."
          className="flex-1"
        />
        <Button variant="outline" size="sm" className="min-h-[44px]" onClick={handleSubmit}>
          Add question
        </Button>
      </div>
    </div>
  );
}
