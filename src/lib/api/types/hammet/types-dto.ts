// ============================================================
// HammetLabs — AI Studies
// Hammet Admin API Types (addendum to api-types.ts)
// ============================================================

// ------------------------------------------------------------
// HAMMET ADMIN — SCHOOL MANAGEMENT
// ------------------------------------------------------------

// GET /hammet/schools
// Full list of all registered schools — hammet_admin only
export type SchoolListItemDto = {
  id: string;
  name: string;
  tier: "pilot" | "annual" | "suspended";
  term: number;
  stats: {
    total_students: number;
    active_students: number;
    pending_students: number;
  };
  created_at: string; // ISO 8601
};

export type SchoolsListResponseDto = {
  schools: SchoolListItemDto[];
  total: number;
};

// POST /hammet/schools/[schoolId]/deactivate
// Sets tier to "suspended" — hammet_admin only
// No request body needed
export type DeactivateSchoolResponseDto = {
  school_id: string;
  tier: "suspended";
  message: string;
};
