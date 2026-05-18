import Link from "next/link";
import type { Review } from "@/lib/types";

function formatReviewDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

const statusCopy: Record<Review["status"], string> = {
  ready: "Ready",
  not_yet: "Not yet",
  mastered: "Mastered",
};

export function ReviewStub({ review }: { review?: Review }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        Review
      </p>
      <Link
        href="/review"
        className="block rounded-lg bg-muted px-3 py-3 transition-colors duration-[180ms] ease-out hover:bg-muted/70"
      >
        <p className="text-[13px] text-foreground">
          {review ? statusCopy[review.status] : "Not reviewed yet"}
        </p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {review ? `Last reviewed ${formatReviewDate(review.lastReviewed)}` : "Add it from review queue"}
        </p>
      </Link>
    </div>
  );
}
