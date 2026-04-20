import { z } from "zod";

export const moduleFrontmatterSchema = z.object({
  id: z.string(),
  track: z.enum(["main", "interpretability"]),
  number: z.number().int().nonnegative(),
  title: z.string(),
  slug: z.string(),
  hoursMin: z.number().nonnegative(),
  hoursMax: z.number().nonnegative(),
  prereqs: z.array(z.string()).default([]),
  phase: z.enum(["foundational", "flexible"]),
});

export const artifactSchema = z.object({
  id: z.string(),
  type: z.enum(["video", "paper", "repo", "post", "podcast"]),
  title: z.string(),
  url: z.string(),
  author: z.string().optional(),
  readStatus: z.enum(["unread", "in_progress", "read"]).default("unread"),
});

export const artifactsFileSchema = z.object({
  artifacts: z.array(artifactSchema),
});

export const conceptSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  oneLiner: z.string(),
  moduleIds: z.array(z.string()),
  artifactIds: z.array(z.string()),
});

export const conceptsFileSchema = z.object({
  concepts: z.array(conceptSchema),
});

export const spineSchema = z.object({
  phases: z.object({
    foundational: z.object({
      moduleIds: z.array(z.string()),
      interpretabilityIds: z.array(z.string()),
    }),
    flexible: z.object({
      spine: z.array(z.string()),
      interpretability: z.array(z.string()),
      branches: z.array(z.string()).default([]),
    }),
  }),
});

export const sessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  conceptIds: z.array(z.string()).default([]),
  artifactIds: z.array(z.string()).default([]),
  estimatedMinutes: z.number().nonnegative(),
  status: z.enum(["todo", "in_progress", "done"]),
  completedAt: z.string().optional(),
  notes: z.string().optional(),
});

export const weekSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  number: z.number().int().positive(),
  startDate: z.string(),
  sessions: z.array(sessionSchema),
  reflectionNoteId: z.string().optional(),
});

export const progressSchema = z.object({
  phase: z.enum(["foundational", "flexible"]),
  currentWeek: z.object({ id: z.string(), moduleId: z.string(), number: z.number().int().positive() }),
  weeks: z.array(weekSchema),
  openQuestions: z
    .array(
      z.object({
        id: z.string(),
        conceptId: z.string(),
        text: z.string(),
        status: z.enum(["open", "parked", "answered"]),
        createdAt: z.string(),
      })
    )
    .default([]),
  reviews: z
    .array(
      z.object({
        conceptId: z.string(),
        lastReviewed: z.string(),
        nextSuggested: z.string(),
        status: z.enum(["ready", "not_yet", "mastered"]),
      })
    )
    .default([]),
});
