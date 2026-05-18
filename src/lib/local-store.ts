"use client";

import type {
  BacklogItem,
  Phase,
  Question,
  QuestionStatus,
  ReadStatus,
  Review,
  Session,
  SessionStatus,
} from "@/lib/types";

const PREFIX = "learning-app:";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(PREFIX + key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function getSessionOverride(sessionId: string): Partial<Session> {
  return readJson<Record<string, Partial<Session>>>("sessions", {})[sessionId] ?? {};
}

export function setSessionOverride(sessionId: string, patch: Partial<Session>) {
  const sessions = readJson<Record<string, Partial<Session>>>("sessions", {});
  sessions[sessionId] = { ...(sessions[sessionId] ?? {}), ...patch };
  writeJson("sessions", sessions);
}

export function getArtifactStatus(artifactId: string, fallback: ReadStatus): ReadStatus {
  return readJson<Record<string, ReadStatus>>("artifact-statuses", {})[artifactId] ?? fallback;
}

export function setArtifactStatus(artifactId: string, status: ReadStatus) {
  const statuses = readJson<Record<string, ReadStatus>>("artifact-statuses", {});
  statuses[artifactId] = status;
  writeJson("artifact-statuses", statuses);
}

export function getNote(slug: string, fallback: string): string {
  return readJson<Record<string, string>>("notes", {})[slug] ?? fallback;
}

export function setNote(slug: string, body: string) {
  const notes = readJson<Record<string, string>>("notes", {});
  notes[slug] = body;
  writeJson("notes", notes);
}

export function getReflection(weekId: string, fallback: string): string {
  return readJson<Record<string, string>>("reflections", {})[weekId] ?? fallback;
}

export function setReflection(weekId: string, body: string) {
  const reflections = readJson<Record<string, string>>("reflections", {});
  reflections[weekId] = body;
  writeJson("reflections", reflections);
}

export function getQuestions(conceptId: string, fallback: Question[]): Question[] {
  return readJson<Record<string, Question[]>>("questions", {})[conceptId] ?? fallback;
}

export function setQuestions(conceptId: string, questions: Question[]) {
  const byConcept = readJson<Record<string, Question[]>>("questions", {});
  byConcept[conceptId] = questions;
  writeJson("questions", byConcept);
}

export function setQuestionStatus(questionId: string, status: QuestionStatus) {
  const statuses = readJson<Record<string, QuestionStatus>>("question-statuses", {});
  statuses[questionId] = status;
  writeJson("question-statuses", statuses);
}

export function getQuestionStatus(questionId: string, fallback: QuestionStatus): QuestionStatus {
  return readJson<Record<string, QuestionStatus>>("question-statuses", {})[questionId] ?? fallback;
}

export function getSubjectEnabled(subjectId: string, fallback: boolean): boolean {
  return readJson<Record<string, boolean>>("subject-enabled", {})[subjectId] ?? fallback;
}

export function setSubjectEnabled(subjectId: string, enabled: boolean) {
  const subjects = readJson<Record<string, boolean>>("subject-enabled", {});
  subjects[subjectId] = enabled;
  writeJson("subject-enabled", subjects);
}

export function getCurrentSubject(fallback: string): string {
  return readJson<string>("current-subject", fallback);
}

export function setCurrentSubject(subjectId: string) {
  writeJson("current-subject", subjectId);
}

export function getCurrentWeek(fallback: string): string {
  return readJson<string>("current-week", fallback);
}

export function setCurrentWeek(weekId: string) {
  writeJson("current-week", weekId);
}

export function getPhase(fallback: Phase): Phase {
  return readJson<Phase>("phase", fallback);
}

export function setPhase(phase: Phase) {
  writeJson("phase", phase);
}

export function getReviews(): Review[] {
  return readJson<Review[]>("reviews", []);
}

export function upsertReview(review: Review) {
  const reviews = getReviews().filter(
    (item) => !(item.subjectId === review.subjectId && item.conceptId === review.conceptId)
  );
  writeJson("reviews", [...reviews, review]);
}

export function getBacklog(subjectId: string, fallback: BacklogItem[]): BacklogItem[] {
  return readJson<Record<string, BacklogItem[]>>("backlog", {})[subjectId] ?? fallback;
}

export function setBacklog(subjectId: string, items: BacklogItem[]) {
  const backlog = readJson<Record<string, BacklogItem[]>>("backlog", {});
  backlog[subjectId] = items;
  writeJson("backlog", backlog);
}

export function setSessionStatus(sessionId: string, status: SessionStatus) {
  setSessionOverride(sessionId, {
    status,
    completedAt: status === "done" ? new Date().toISOString() : undefined,
  });
}
