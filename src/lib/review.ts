import { getConcepts, getModules, getProgress } from "./data";
import type { Concept, Module } from "./types";

export type ReviewQueueItem = {
  concept: Concept;
  moduleTitle: string;
  lastReviewed: string | null; // ISO string or null if never reviewed
  nextSuggested: string | null;
};

export type ReviewEmptyState = "no_concepts" | "all_done" | null;

export type ReviewPageData = {
  queue: ReviewQueueItem[];
  emptyState: ReviewEmptyState;
};

async function buildReviewQueue(subjectId?: string): Promise<ReviewPageData> {
  const [concepts, modules, progress] = await Promise.all([
    getConcepts(),
    getModules(),
    getProgress(),
  ]);
  const scopedConcepts = subjectId
    ? concepts.filter((concept) => concept.subjectId === subjectId)
    : concepts;

  if (scopedConcepts.length === 0) {
    return { queue: [], emptyState: "no_concepts" };
  }

  const moduleMap = new Map<string, Module>(
    modules
      .filter((module) => !subjectId || module.subjectId === subjectId)
      .map((module) => [module.id, module])
  );
  const scopedReviews = subjectId
    ? progress.reviews.filter((review) => review.subjectId === subjectId)
    : progress.reviews;
  const reviewMap = new Map(scopedReviews.map((review) => [review.conceptId, review]));
  const now = Date.now();
  const queueConcepts = scopedConcepts.filter((concept) => {
    const review = reviewMap.get(concept.id);
    if (!review) return true;
    return new Date(review.nextSuggested).getTime() <= now;
  });

  if (queueConcepts.length === 0) {
    return { queue: [], emptyState: "all_done" };
  }

  const sorted = [...queueConcepts].sort((a, b) => {
    const ra = reviewMap.get(a.id);
    const rb = reviewMap.get(b.id);
    if (!ra && !rb) return 0;
    if (!ra) return 1;
    if (!rb) return -1;
    return ra.lastReviewed < rb.lastReviewed ? -1 : 1;
  });

  const queue: ReviewQueueItem[] = sorted.map((concept) => {
    const review = reviewMap.get(concept.id);
    const primaryModuleId = concept.moduleIds[0] ?? "";
    const mod = moduleMap.get(primaryModuleId);
    return {
      concept,
      moduleTitle: mod?.title ?? "",
      lastReviewed: review?.lastReviewed ?? null,
      nextSuggested: review?.nextSuggested ?? null,
    };
  });

  return { queue, emptyState: null };
}

export async function getReviewQueue(): Promise<ReviewPageData> {
  return buildReviewQueue();
}

export async function getReviewQueueForSubject(subjectId: string): Promise<ReviewPageData> {
  return buildReviewQueue(subjectId);
}
