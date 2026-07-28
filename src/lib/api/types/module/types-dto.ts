// GET /modules?term=1&level=SSS1
// Lightweight list — content_json excluded to keep payload small
export type ModuleSummaryDto = {
  id: string;
  title: string;
  term: number;
  week_number: number;
  level: string;
  published: boolean;
  // Backend joins with student's submissions to attach current status.
  // null = student has no submission yet (same as "not_started")
  submission_status: "not_started" | "submitted" | "approved" | "flagged" | null;
};

export type ModulesResponseDto = {
  modules: ModuleSummaryDto[];
  total: number;
};


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

export interface CurriculumSectionDto {
  id: string
  heading?: string | null;
  blocks: CurriculumModuleBlockDto[];
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
  stopped_at: string | null;
}

export interface SectionProgressDto {
  student_id: string;
  module_id: string;
  section_id: string|null;
}