"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { upsertReview } from "@/lib/local-store";
import type { ReviewQueueItem } from "@/lib/review";

interface ReviewCardProps {
  item: ReviewQueueItem;
  onAdvance: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ReviewCard({ item, onAdvance }: ReviewCardProps) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  function handleSubmit(action: "known" | "needs_review" | "mastered" | "skip_week") {
    setStatus("saving");
    const now = new Date();
    const next = new Date(now);
    if (action === "needs_review") next.setDate(next.getDate() + 2);
    if (action === "known") next.setDate(next.getDate() + 7);
    if (action === "skip_week") next.setDate(next.getDate() + 7);
    if (action === "mastered") next.setFullYear(next.getFullYear() + 10);

    upsertReview({
      subjectId: item.concept.subjectId,
      conceptId: item.concept.id,
      lastReviewed: now.toISOString(),
      nextSuggested: next.toISOString(),
      status: action === "mastered" ? "mastered" : action === "needs_review" ? "not_yet" : "ready",
    });
    void note;
    onAdvance();
  }

  return (
    <div className="max-w-prose rounded-xl bg-card border border-border px-6 py-6">
      <h2 className="text-[22px] font-medium tracking-tight text-foreground mb-1">
        {item.concept.title}
      </h2>
      <p className="text-[15px] text-muted-foreground mb-0">{item.concept.oneLiner}</p>
      <p className="text-[12px] text-muted-foreground mt-2">
        {item.lastReviewed
          ? "Last reviewed " + formatDate(item.lastReviewed)
          : "Not yet reviewed"}
        {item.nextSuggested ? `, due ${formatDate(item.nextSuggested)}` : ""}
      </p>
      {item.moduleTitle && (
        <span className="text-[12px] bg-muted text-muted-foreground rounded-sm px-1.5 py-0.5 mt-1 inline-block">
          {item.moduleTitle}
        </span>
      )}
      <div className="mt-6 flex gap-3">
        <Button
          size="default"
          className="flex-1 max-w-[160px] bg-[var(--ring)] text-white hover:bg-[var(--ring)]/90 transition-colors duration-[180ms] ease-out"
          disabled={status === "saving"}
          onClick={() => handleSubmit("known")}
        >
          Got it
        </Button>
        <Button
          variant="outline"
          size="default"
          className="flex-1 max-w-[160px]"
          disabled={status === "saving"}
          onClick={() => handleSubmit("needs_review")}
        >
          Not yet
        </Button>
      </div>
      <div className="mt-3 flex gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={status === "saving"}
          onClick={() => handleSubmit("skip_week")}
        >
          Skip 7 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={status === "saving"}
          onClick={() => handleSubmit("mastered")}
        >
          Mastered
        </Button>
      </div>
      <div className="mt-4">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this concept..."
          className="min-h-[80px] resize-none bg-muted/40 border border-border rounded-lg px-3 py-2 text-[15px] text-foreground"
        />
      </div>
      {status === "error" && (
        <p className="text-[13px] text-destructive mt-2">Could not save review. Try again.</p>
      )}
    </div>
  );
}
