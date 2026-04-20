"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addQuestionAction } from "@/lib/actions/add-question";
import type { Question } from "@/lib/types";

export function OpenQuestionCapture({
  conceptId,
  initialQuestions,
}: {
  conceptId: string;
  initialQuestions: Question[];
}) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [inputValue, setInputValue] = useState("");

  function handleSubmit() {
    const text = inputValue.trim();
    if (!text) return;
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      conceptId,
      text,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setInputValue("");
    void addQuestionAction(newQuestion);
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
