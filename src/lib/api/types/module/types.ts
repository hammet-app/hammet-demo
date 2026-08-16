// GET /modules?term=1&level=SSS1

import { SubmissionStatus } from "../submissions";

// Lightweight list — content_json excluded to keep payload small
export type ModuleSummary = {
  id: string;
  title: string;
  term: number;
  weekNumber: number;
  level: string;
  published: boolean;
};

export type ModulesResponse = {
  modules: ModuleSummary[];
  total: number;
};

export type ModuleState = {
  stoppedAt: string | null;
  submissionStatus: SubmissionStatus;
  disputes: boolean;
}

export type ModuleStateResponse = {
  currentTerm: number;
  states: Record<string, ModuleState>
}

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

export type QuestionOption = {
  id: string;
  text: string;
}

export type CurriculumQuestion = {
  type: "question";
  id: string;
  question: string;
  options: QuestionOption[]
  required?: boolean;
}

export type CurriculumSectionItem = 
  | CurriculumModuleBlock
  | CurriculumQuestion

export interface CurriculumSection {
  id: string
  heading?: string | null;
  blocks: CurriculumSectionItem[];
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
}

export interface SectionProgress {
  studentId: string;
  moduleId: string;
  sectionId: string|null;
}