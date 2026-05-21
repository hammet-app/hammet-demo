import { CurriculumModuleBlock } from "@/lib/api/types/module";

// ============================================================
// HammetLabs — AI Studies
// Hammet Admin API Types (addendum to api-types.ts)
// ============================================================

// ------------------------------------------------------------
// HAMMET ADMIN — SCHOOL MANAGEMENT
// ------------------------------------------------------------

// GET /hammet/schools
// Full list of all registered schools — hammet_admin only
export type SchoolListItem = {
  id: string;
  name: string;
  tier: "pilot" | "annual" | "suspended";
  term: number;
  stats: {
    totalStudents: number;
    activeStudents: number;
    pendingStudents: number;
  };
  createdAt: string; // ISO 8601
};

export type SchoolsListResponse = {
  schools: SchoolListItem[];
  total: number;
};

// POST /hammet/schools/[schoolId]/deactivate
// Sets tier to "suspended" — hammet_admin only
// No request body needed
export type DeactivateSchoolResponse = {
  schoolId: string;
  tier: "suspended";
  message: string;
};

// PUT /admin/modules/[moduleId] — full replace, no partial update
// reuses CreateModuleRequest as request body
export type UpdateModuleResponse = {
  success: boolean;
};

// POST /admin/modules
export type CreateModuleRequest = {
  title: string;
  term: number;
  week_number: number;
  level: string;
  published: boolean;           // false = draft, not visible to students yet
  content_json: {
    blocks: CurriculumModuleBlock[];
  };
};