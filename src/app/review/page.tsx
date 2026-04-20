import { Shell } from "@/components/shell";
import { ReviewQueue } from "@/components/review-queue";
import { getReviewQueue } from "@/lib/review";
import { getProgress } from "@/lib/data";

export default async function ReviewPage() {
  const [{ queue, emptyState }, progress] = await Promise.all([
    getReviewQueue(),
    getProgress(),
  ]);

  return (
    <Shell phase={progress.phase}>
      <h1 className="text-[22px] font-medium tracking-tight text-foreground mb-6">
        Review
      </h1>
      {emptyState === "no_concepts" && (
        <p className="mt-8 text-[15px] text-muted-foreground">
          No concepts to review.
        </p>
      )}
      {emptyState === "all_done" && (
        <p className="mt-8 text-[15px] text-muted-foreground">
          You&apos;ve reviewed everything for now. Check back tomorrow.
        </p>
      )}
      {emptyState === null && <ReviewQueue queue={queue} />}
    </Shell>
  );
}
