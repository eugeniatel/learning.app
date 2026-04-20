"use client";

import { useState } from "react";
import { ReviewCard } from "@/components/review-card";
import type { ReviewQueueItem } from "@/lib/review";

interface ReviewQueueProps {
  queue: ReviewQueueItem[];
}

export function ReviewQueue({ queue }: ReviewQueueProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  function handleAdvance() {
    setVisible(false);
    setTimeout(() => {
      setIndex((i) => i + 1);
      setVisible(true);
    }, 150);
  }

  if (index >= queue.length) return null;

  const currentItem = queue[index];
  const remaining = queue.length - index;
  const counterText =
    remaining >= 2 ? `${remaining} concepts in queue` : remaining === 1 ? "Last one." : null;

  return (
    <div>
      {counterText && (
        <p className="text-[12px] text-muted-foreground mb-4">{counterText}</p>
      )}
      <div
        className="transition-opacity duration-[150ms] ease-out"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <ReviewCard
          key={currentItem.concept.id}
          item={currentItem}
          onAdvance={handleAdvance}
        />
      </div>
    </div>
  );
}
