import { SubmissionStatus } from "@/components/ui";
import { AiFormState, AiFormStateDto } from "@/lib/api/types/submissions";

export type PreviewLinkDto = {
  task_id: string;
  url: string;
  title? : string;
  type? : string;
  favicon_url?: string
}



export type PreviewLinkStateDto = PreviewLinkDto[];

// ============================================================
// GET /students/me
// ============================================================

export type StudentProfileDto = {
  id: string;
  full_name: string;
  email: string;
  class_level: string;       // e.g. "SSS1"
  class_arm: string;         // e.g. "A"
  school_id: string;
  school_name: string;       // denormalised for display
  roles: string[];           // always ["student"]
  status: "pending" | "active" | "suspended";
  google_id: string | null;
  has_pin_set: boolean;      // frontend uses this to know whether to prompt PIN setup
  created_at: string;        // ISO 8601
};


// ============================================================
// GET /students/me/progress
// ============================================================

export type ModuleProgressDto = {
  module_id: string;
  title: string;
  term: number;
  week_number: number;
  level: string;
  completed: boolean;
  submission_status: "not_started" | "submitted" | "approved" | "flagged";
  submitted_at: string | null;
};

export type TermProgressDto = {
  term: number;
  level: string;
  total_modules: number;
  submitted_modules: number;
  approved_modules: number;
  flagged_modules: number;
  completion_percentage: number;
};

export type StudentProgressDto = {
  current_term: number;
  current_level: string;
  term_progress: TermProgressDto;
  modules: ModuleProgressDto[];
};


// ============================================================
// GET /students/me/submissions
// ============================================================

export type SubmissionDto = {
  id: string;
  module_id: string;
  module_title: string;
  term: number;
  week_number: number;
  ai_form: AiFormStateDto | null
  activity_text: string;
  reflection_text: string | null;
  file_urls: PreviewLinkDto[] | null;
  other_urls: PreviewLinkDto[] | null;
  status: "submitted" | "approved" | "flagged";
  teacher_note: string | null;    // populated when flagged
  submitted_at: string;
  synced_at: string | null;       // null = synced offline, not yet confirmed
  local_id: string;               // client UUID used for offline dedup
};

export type SubmissionHistoryDto = {
  submissions: SubmissionDto[];
  total: number;
};


// ============================================================
// GET /students/me/portfolio
// ============================================================

export type PortfolioEntryDto = {
  id: string;
  module_id: string;
  module_title: string;
  term: number;
  week_number: number;
  status: SubmissionStatus;
  reflection_text: string | null;
  file_urls: PreviewLinkDto[] | null;
  other_urls: PreviewLinkDto[] | null;
  approved_at: string;            // auto-generated on approval by Celery
  // denormalised — no join needed
  student_name: string;
  school_name: string;
};

export type StudentPortfolioDto = {
  entries: PortfolioEntryDto[];
  total: number;
};


export interface DisputeReviewDto {
  submission_id : string;
  note?: string;
  review: "helpful" | "disagree"
}
