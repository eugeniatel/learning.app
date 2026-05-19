import { z } from "zod";

export const DEFAULT_SUBJECT_ID = "ai-systems";

export const subjectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  cadence: z.string(),
});

export const subjectsFileSchema = z.object({
  subjects: z.array(subjectSchema),
});

export const moduleFrontmatterSchema = z.object({
  id: z.string(),
  subjectId: z.string().default(DEFAULT_SUBJECT_ID),
  track: z.enum(["main", "interpretability", "branch"]),
  number: z.number().int().nonnegative(),
  title: z.string(),
  slug: z.string(),
  hoursMin: z.number().nonnegative(),
  hoursMax: z.number().nonnegative(),
  prereqs: z.array(z.string()).default([]),
  phase: z.enum(["foundational", "flexible"]),
  branchOf: z.string().optional(),
});

export const artifactSchema = z.object({
  id: z.string(),
  subjectId: z.string().default(DEFAULT_SUBJECT_ID),
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
  subjectId: z.string().default(DEFAULT_SUBJECT_ID),
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
  subjectId: z.string().default(DEFAULT_SUBJECT_ID),
  moduleId: z.string(),
  number: z.number().int().positive(),
  startDate: z.string(),
  sessions: z.array(sessionSchema),
  reflectionNoteId: z.string().optional(),
});

export const progressSchema = z.object({
  currentSubjectId: z.string().default(DEFAULT_SUBJECT_ID),
  subjects: z
    .record(
      z.string(),
      z.object({
        phase: z.enum(["foundational", "flexible"]),
        currentWeekId: z.string(),
        enabled: z.boolean().default(true),
      })
    )
    .default({}),
  phase: z.enum(["foundational", "flexible"]),
  currentWeek: z.object({ id: z.string(), moduleId: z.string(), number: z.number().int().positive() }),
  weeks: z.array(weekSchema),
  openQuestions: z
    .array(
      z.object({
        id: z.string(),
        subjectId: z.string().default(DEFAULT_SUBJECT_ID),
        conceptId: z.string().optional(),
        text: z.string(),
        status: z.enum(["open", "parked", "answered"]),
        createdAt: z.string(),
      })
    )
    .default([]),
});
