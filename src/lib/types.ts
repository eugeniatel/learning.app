export type Phase = "foundational" | "flexible";
export type Track = "main" | "interpretability" | "branch";
export type SessionStatus = "todo" | "in_progress" | "done";
export type ReadStatus = "unread" | "in_progress" | "read";
export type ArtifactType = "video" | "paper" | "repo" | "post" | "podcast";
export type QuestionStatus = "open" | "parked" | "answered";

export type Subject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cadence: string;
};

export type Module = {
  id: string;
  subjectId: string;
  track: Track;
  number: number;
  title: string;
  slug: string;
  hoursMin: number;
  hoursMax: number;
  prereqs: string[];
  phase: Phase;
  branchOf?: string;
  body: string;
  goal: string;
  conceptIds: string[];
  artifactIds: string[];
};

export type Session = {
  id: string;
  title: string;
  conceptIds: string[];
  artifactIds: string[];
  estimatedMinutes: number;
  status: SessionStatus;
  completedAt?: string;
  notes?: string;
};

export type Week = {
  id: string;
  subjectId: string;
  moduleId: string;
  number: number;
  startDate: string;
  sessions: Session[];
  reflectionNoteId?: string;
};

export type Concept = {
  id: string;
  subjectId: string;
  slug: string;
  title: string;
  oneLiner: string;
  moduleIds: string[];
  artifactIds: string[];
};

export type Artifact = {
  id: string;
  subjectId: string;
  type: ArtifactType;
  title: string;
  url: string;
  author?: string;
  readStatus: ReadStatus;
};

export type Question = {
  id: string;
  subjectId: string;
  conceptId?: string;
  text: string;
  status: QuestionStatus;
  createdAt: string;
};

export type Progress = {
  currentSubjectId: string;
  subjects: Record<string, { phase: Phase; currentWeekId: string; enabled?: boolean }>;
  phase: Phase;
  currentWeek: { id: string; moduleId: string; number: number };
  weeks: Week[];
  openQuestions: Question[];
};

export type Spine = {
  phases: {
    foundational: { moduleIds: string[]; interpretabilityIds: string[] };
    flexible: { spine: string[]; interpretability: string[]; branches: string[] };
  };
};
