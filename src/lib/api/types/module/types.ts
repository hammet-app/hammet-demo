// GET /modules?term=1&level=SSS1
// Lightweight list — content_json excluded to keep payload small
export type ModuleSummary = {
  id: string;
  title: string;
  term: number;
  weekNumber: number;
  level: string;
  published: boolean;
  // Backend joins with student's submissions to attach current status.
  // null = student has no submission yet (same as "not_started")
  submissionStatus: "not_started" | "submitted" | "approved" | "flagged" | null;
};

export type ModulesResponse = {
  modules: ModuleSummary[];
  total: number;
};

export type CurriculumModuleBlockType =
  | "body"
  | "subheading"
  | "image"
  | "activity"
  | "aiPrompt"
  | "reflection"
  | "task"
  | "videoEmbed"
  | "toolLink";

export type CurriculumModuleBlock = {
  type: CurriculumModuleBlockType
  content: string;
  url?: string;
  toolName?: string;
  required?: boolean;
  isValid?: boolean;
  id: string;
};

export interface CurriculumSection {
  id: string
  heading?: string | null;
  blocks: CurriculumModuleBlock[];
}

export interface CurriculumContentJson {
  sections: CurriculumSection[];
}

// GET /modules/[moduleId] — full module with content
export interface CurriculumModule {
  id: string;
  title: string;
  description?: string;
  outcome: string;
  tier?: string;
  term: number;
  weekNumber: number;
  level: string;
  contentJson: CurriculumContentJson;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  stoppedAt: string | null;
}

export interface SectionProgress {
  studentId: string;
  moduleId: string;
  sectionId: string|null;
}