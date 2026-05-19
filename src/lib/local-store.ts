"use client";

import type {
  Phase,
  Question,
  QuestionStatus,
  ReadStatus,
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

/**
 * Returns all questions for a subject from the consolidated store.
 * On first access, migrates legacy concept-keyed questions and statuses
 * into the subject-keyed store so nothing captured earlier is lost.
 */
export function getSubjectQuestions(subjectId: string, seed: Question[]): Question[] {
  const store = readJson<Record<string, Question[]>>("questions-by-subject", {});
  const existing = store[subjectId];
  if (existing) return existing;
  const migrated = migrateSubjectQuestions(subjectId, seed);
  store[subjectId] = migrated;
  writeJson("questions-by-subject", store);
  return migrated;
}

export function setSubjectQuestions(subjectId: string, questions: Question[]) {
  const store = readJson<Record<string, Question[]>>("questions-by-subject", {});
  store[subjectId] = questions;
  writeJson("questions-by-subject", store);
}

function migrateSubjectQuestions(subjectId: string, seed: Question[]): Question[] {
  const legacyByConcept = readJson<Record<string, Question[]>>("questions", {});
  const legacyStatuses = readJson<Record<string, QuestionStatus>>("question-statuses", {});
  const byId = new Map<string, Question>();
  for (const question of seed) byId.set(question.id, question);
  for (const list of Object.values(legacyByConcept)) {
    for (const question of list) {
      if (question.subjectId === subjectId && !byId.has(question.id)) {
        byId.set(question.id, question);
      }
    }
  }
  return Array.from(byId.values())
    .filter((question) => question.subjectId === subjectId)
    .map((question) => ({ ...question, status: legacyStatuses[question.id] ?? question.status }));
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

export function setSessionStatus(sessionId: string, status: SessionStatus) {
  setSessionOverride(sessionId, {
    status,
    completedAt: status === "done" ? new Date().toISOString() : undefined,
  });
}
