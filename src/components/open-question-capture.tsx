"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getQuestions, setQuestions as saveQuestions } from "@/lib/local-store";
import type { Question } from "@/lib/types";

export function OpenQuestionCapture({
  conceptId,
  subjectId,
  initialQuestions,
}: {
  conceptId: string;
  subjectId: string;
  initialQuestions: Question[];
}) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    queueMicrotask(() => setQuestions(getQuestions(conceptId, initialQuestions)));
  }, [conceptId, initialQuestions]);

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
    const next = [...questions, newQuestion];
    setQuestions(next);
    saveQuestions(conceptId, next);
    setInputValue("");
  }

  return (
    <div>
      <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        Open questions
      </p>
      {questions.length > 0 && (
        <div className="mb-3 flex flex-col gap-1.5">
          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-md bg-muted px-3 py-2 text-[14px] text-foreground"
            >
              {q.text}
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Park a question about this concept..."
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={handleSubmit}>
          Add question
        </Button>
      </div>
    </div>
  );
}
