// GET /modules?term=1&level=SSS1

import { SubmissionStatus } from "../submissions";

// Lightweight list — content_json excluded to keep payload small
export type ModuleSummaryDto = {
  id: string;
  title: string;
  term: number;
  week_number: number;
  level: string;
  published: boolean;
  
};

export type ModulesResponseDto = {
  modules: ModuleSummaryDto[];
  total: number;
};

export type ModuleStateDto = {
  stopped_at: string | null;
  submission_status: SubmissionStatus
  disputes: boolean
}

export type ModuleStateResponseDto = {
  current_term: number;
  states: Record<string, ModuleStateDto>
}

export type CurriculumModuleBlockDto = {
  type:
    | "body"
    | "subheading"
    | "image"
    | "activity"
    | "ai_prompt"
    | "reflection"
    | "task"
    | "video_embed"
    | "tool_link";
  content: string;
  url?: string;
  tool_name?: string;
  required?: boolean;
  is_valid?: boolean;
  id: string;
};

export type QuestionOptionDto = {
  id: string;
  text: string;
}

export type CurriculumQuestionDto = {
  type: "question";
  id: string;
  question: string;
  options: QuestionOptionDto[]
  required?: boolean;
}

export type CurriculumSectionItemDto = 
  | CurriculumModuleBlockDto
  | CurriculumQuestionDto


export interface CurriculumSectionDto {
  id: string
  heading?: string | null;
  blocks: CurriculumSectionItemDto[];
}

export interface CurriculumContentJsonDto {
  sections: CurriculumSectionDto[];
}


export interface CurriculumModuleDto {
  id: string;
  title: string;
  description?: string;
  outcome: string;
  term: number;
  tier?: string;
  week_number: number;
  level: string;
  content_json: CurriculumContentJsonDto;
  created_at: string;
  updated_at: string;
  published: boolean;
}

export interface SectionProgressDto {
  student_id: string;
  module_id: string;
  section_id: string|null;
}