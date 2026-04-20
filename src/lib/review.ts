import { getConcepts, getModules, getProgress } from "./data";
import type { Concept, Module } from "./types";

export type ReviewQueueItem = {
  concept: Concept;
  moduleTitle: string;
  lastReviewed: string | null; // ISO string or null if never reviewed
};

export type ReviewEmptyState = "no_concepts" | "all_done" | null;

export type ReviewPageData = {
  queue: ReviewQueueItem[];
  emptyState: ReviewEmptyState;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function getReviewQueue(): Promise<ReviewPageData> {
  const [concepts, modules, progress] = await Promise.all([
    getConcepts(),
    getModules(),
    getProgress(),
  ]);

  if (concepts.length === 0) {
    return { queue: [], emptyState: "no_concepts" };
  }

  const moduleMap = new Map<string, Module>(modules.map((m) => [m.id, m]));
  const reviewMap = new Map(progress.reviews.map((r) => [r.conceptId, r]));

  const now = Date.now();
  const reviewedTodayIds = new Set(
    progress.reviews
      .filter((r) => now - new Date(r.lastReviewed).getTime() < ONE_DAY_MS)
      .map((r) => r.conceptId)
  );

  // Concepts not reviewed in the last 24h form the queue
  const queueConcepts = concepts.filter((c) => !reviewedTodayIds.has(c.id));

  if (queueConcepts.length === 0) {
    return { queue: [], emptyState: "all_done" };
  }

  // Sort: concepts with a review entry by lastReviewed ascending (oldest first),
  // then concepts with no review entry (never reviewed) at the end.
  const sorted = [...queueConcepts].sort((a, b) => {
    const ra = reviewMap.get(a.id);
    const rb = reviewMap.get(b.id);
    if (!ra && !rb) return 0;
    if (!ra) return 1; // a never reviewed -> goes last
    if (!rb) return -1; // b never reviewed -> goes last
    return ra.lastReviewed < rb.lastReviewed ? -1 : 1;
  });

  const queue: ReviewQueueItem[] = sorted.map((c) => {
    const review = reviewMap.get(c.id);
    const primaryModuleId = c.moduleIds[0] ?? "";
    const mod = moduleMap.get(primaryModuleId);
    return {
      concept: c,
      moduleTitle: mod?.title ?? "",
      lastReviewed: review?.lastReviewed ?? null,
    };
  });

  return { queue, emptyState: null };
}
