import { CurriculumModuleDto } from "../module";

type UserStatus = "pending" | "active" | "suspended"| "graduated" | "inactive"; 

// ============================================================
// SCHOOL ADMIN ROUTES
// ============================================================

// GET /admin/school
export type SchoolStatsDto = {
  total_students: number;
  active_students: number;
  pending_students: number;
};

export type SchoolProfileDto = {
  id: string;
  name: string;
  tier: "pilot" | "summer" | "spark" | "academy" | "premier" | "global" | "suspended";
  term: number;
  available_arms?: string[];
  stats: SchoolStatsDto;
  term_start: string;
  term_end: string;
  session: string|null;
};

// POST /admin/update-term
export type UpdateTermDto = {
  term_start: string;
  term_end: string;
  session: string;
}


// GET /admin/students
export type AdminStudentDto = {
  student_id: string;
  full_name: string;
  email: string;
  class_level: string;
  class_arm: string | null;
  status: UserStatus;
  created_at: string;
  parent_link_sent_at: string | null; // null = never sent; ISO timestamp = last sent
};

export type AdminStudentsResponseDto = {
  students: AdminStudentDto[];
  total: number;
};

// PATCH /admin/students/[id]
export type UserUpdateRequestDto = {
  full_name?: string;
  email?: string;
  date_of_birth?: string;
  class_level?: string;
  class_arm?: string;
  parent_phone?: string;
  parent_email?:string
};

// POST /admin/parent-links/[studentId]/send
// Token stored in Redis (48hr TTL) — not in DB
// parent_email + parent_phone read from student record — no admin input needed
export type ParentLinkSendResponseDto = {
  student_id: string;
  parent_email: string;         // echoed back so admin can confirm who it was sent to
  parent_phone: string;
  expires_at: string;
};

// POST /admin/parent-links/[studentId]/revoke — reuses DeleteResponse


// Hammet only — guarded by school registration role
// GET /admin/modules
export type AdminModulesResponseDto = {
  modules: CurriculumModuleDto[];
  total: number;
};