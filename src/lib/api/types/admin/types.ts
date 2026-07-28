import { CurriculumModule } from "../module";

export type UserStatus = "pending" | "active" | "suspended"| "graduated" | "inactive"; 
// ============================================================
// SCHOOL ADMIN ROUTES
// ============================================================

// GET /admin/school
export type SchoolStats = {
  totalStudents: number;
  activeStudents: number;
  pendingStudents: number;
};

export type DashboardAttention = {
  pendingInvitations: number;
  pendingSubmissions: number;
  capacity: {
    enrolled: number;
    maximum: number;
  };
  term: {
    daysRemaining: number;
  };
};

export type SchoolProfile = {
  id: string;
  name: string;
  tier: "pilot" | "summer" | "spark" | "academy" | "premier" | "global" | "suspended";
  term: number;
  availableArms?: string[];
  stats: SchoolStats;
  termStart: string;
  termEnd: string;
  session: string|null;
  attention: DashboardAttention;
};

// POST /admin/update-term
export type UpdateTerm = {
  termStart: string;
  termEnd: string;
  session: string;
}


// GET /admin/students
export type AdminStudent = {
  studentId: string;
  fullName: string;
  email: string;
  classLevel: string;
  classArm: string | null;
  status: UserStatus;
  createdAt: string;
  parentLinkSentAt: string | null; // null = never sent; ISO timestamp = last sent
};

export type AdminStudentsResponse = {
  students: AdminStudent[];
  total: number;
};

// PATCH /admin/students/[id]
export type UserUpdateRequest = {
  fullName?: string;
  email?: string;
  dateOfBirth?: string;
  classLevel?: string;
  classArm?: string;
  parentPhone?: string;
  parentEmail?:string
};

export type UserUpdateResponse = {
  message: boolean
}

// DELETE /admin/students/[id] — reuses DeleteResponse
export type DeleteResponse = {
  message: boolean;
};

// POST /admin/parent-links/[studentId]/send
// Token stored in Redis (48hr TTL) — not in DB
// parent_email + parent_phone read from student record — no admin input needed
export type ParentLinkSendResponse = {
  studentId: string;
  parentEmail: string;         // echoed back so admin can confirm who it was sent to
  parentPhone: string;
  expiresAt: string;
};

// POST /admin/parent-links/[studentId]/revoke — reuses DeleteResponse


// Hammet only — guarded by school registration role
// GET /admin/modules
export type AdminModulesResponse = {
  modules: CurriculumModule[];
  total: number;
};