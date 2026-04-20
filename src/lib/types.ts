export type Phase = "foundational" | "flexible";
export type Track = "main" | "interpretability";
export type SessionStatus = "todo" | "in_progress" | "done";
export type ReadStatus = "unread" | "in_progress" | "read";
export type ArtifactType = "video" | "paper" | "repo" | "post" | "podcast";
export type QuestionStatus = "open" | "parked" | "answered";

export type Module = {
  id: string;
  track: Track;
  number: number;
  title: string;
  slug: string;
  hoursMin: number;
  hoursMax: number;
  prereqs: string[];
  phase: Phase;
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
  moduleId: string;
  number: number;
  startDate: string;
  sessions: Session[];
  reflectionNoteId?: string;
};

export type Concept = {
  id: string;
  slug: string;
  title: string;
  oneLiner: string;
  moduleIds: string[];
  artifactIds: string[];
};

export type Artifact = {
  id: string;
  type: ArtifactType;
  title: string;
  url: string;
  author?: string;
  readStatus: ReadStatus;
};

export type Question = {
  id: string;
  conceptId: string;
  text: string;
  status: QuestionStatus;
  createdAt: string;
};

export type Review = {
  conceptId: string;
  lastReviewed: string;
  nextSuggested: string;
  status: "ready" | "not_yet" | "mastered";
};

export type Progress = {
  phase: Phase;
  currentWeek: { id: string; moduleId: string; number: number };
  weeks: Week[];
  openQuestions: Question[];
  reviews: Review[];
};

export type Spine = {
  phases: {
    foundational: { moduleIds: string[]; interpretabilityIds: string[] };
    flexible: { spine: string[]; interpretability: string[]; branches: string[] };
  };
};
