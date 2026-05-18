"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getCurrentSubject, setCurrentSubject } from "@/lib/local-store";
import type { Subject } from "@/lib/types";

export function SubjectSwitcher({
  subjects,
  currentSubjectId,
}: {
  subjects: Subject[];
  currentSubjectId: string;
}) {
  const [activeId, setActiveId] = useState(currentSubjectId);

  useEffect(() => {
    queueMicrotask(() => setActiveId(getCurrentSubject(currentSubjectId)));
  }, [currentSubjectId]);

  function handleSelect(subjectId: string) {
    setActiveId(subjectId);
    setCurrentSubject(subjectId);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {subjects.map((subject) => (
        <Button
          key={subject.id}
          type="button"
          size="sm"
          variant={subject.id === activeId ? "default" : "outline"}
          onClick={() => handleSelect(subject.id)}
        >
          {subject.title}
        </Button>
      ))}
    </div>
  );
}
