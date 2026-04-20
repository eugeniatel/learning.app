import Link from "next/link";
import { QuestionItem } from "./question-item";
import type { Question, QuestionStatus } from "@/lib/types";

type ConceptGroup = {
  conceptId: string;
  conceptTitle: string;
  conceptSlug: string;
  moduleLabel: string;
  questions: Question[];
};

export function ConceptQuestionGroup({
  group,
  onStatusChange,
}: {
  group: ConceptGroup;
  onStatusChange: (id: string, newStatus: QuestionStatus) => void;
}) {
  const open = group.questions.filter((q) => q.status === "open");
  const parked = group.questions.filter((q) => q.status === "parked");
  const answered = group.questions.filter((q) => q.status === "answered");

  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <Link
          href={`/concepts/${group.conceptSlug}`}
          className="text-[15px] font-medium text-foreground hover:underline"
        >
          {group.conceptTitle}
        </Link>
        <span className="text-[12px] text-muted-foreground">{group.moduleLabel}</span>
      </div>
      {open.length > 0 && (
        <div className="flex flex-col gap-2">
          {open.map((q) => (
            <QuestionItem key={q.id} question={q} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
      {(parked.length > 0 || answered.length > 0) && (
        <div className="mt-3 flex flex-col gap-2 opacity-70">
          {parked.length > 0 && (
            <p className="text-[12px] text-muted-foreground">
              {parked.length === 1 ? "1 parked" : `${parked.length} parked`}
            </p>
          )}
          {parked.map((q) => (
            <QuestionItem key={q.id} question={q} onStatusChange={onStatusChange} />
          ))}
          {answered.length > 0 && (
            <p className="text-[12px] text-muted-foreground">
              {answered.length === 1 ? "1 answered" : `${answered.length} answered`}
            </p>
          )}
          {answered.map((q) => (
            <QuestionItem key={q.id} question={q} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
