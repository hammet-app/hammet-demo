import { UserRole } from "../utils/roles";

// ── Shared primitives ──────────────────────────────────────────

export type SubmissionStatus = "submitted" | "approved" | "flagged";

export type UserStatus = "pending" | "active" | "suspended";

export type AssignedClass = {
  level: string;          // e.g. "SS1"
  arm: string | null;     // null for single-stream schools
  term: number;
};

export type CurriculumModuleBlock = {
  type:
    | "heading"
    | "body"
    | "activity"
    | "image"
    | "task"
    | "subheading"
    | "ai_prompt"
    | "reflection"
    | "video_embed"
    | "tool_link";
  content: string;
  tool_name?: string;
  url?: string;
  required?: boolean;
  is_valid?: boolean;
};

// Re-export full api-types here as you build them out.
// This file is the single import point for all API shapes.
// ============================================================
// AUTH ROUTES
// ============================================================

// POST /auth/login
export type LoginRequest = {
  email: string;
  password: string;
  deviceId: string;
};

export type LoginResponse = {
  access_token: string;         // JWT, 60 min expiry — store in memory only, never localStorage
  user: {
    id: string;
    full_name: string;
    email: string;
    roles: UserRole[];
    school_id: string;
    class_level: string | null; // null for non-students
    class_arm: string | null;
  };
};

// POST /auth/claim — student/teacher claiming invite via password or Google
export type ClaimAccountRequest =
  | { token?: string; code?:string; email?:string; password: string, deviceId: string }
  | { token: string; google_id_token: string, deviceId: string };

export type ClaimAccountResponse = {
  access_token: string;
  user: LoginResponse["user"];
};

// POST /auth/resend-verification
export type ResendVerificationRequest = {
  email: string;
};

export type ResendVerificationResponse = {
  message: string;
};


// POST /auth/refresh — no request body, uses httpOnly refresh token cookie
export type RefreshResponse = {
  access_token: string;
};

// POST /auth/logout — no request body, clears httpOnly cookie server-side
export type LogoutResponse = {
  message: string;
};



// POST /auth/register/school — HammetLabs only
export type RegisterSchoolRequest = {
  name: string;
  tier: "pilot" | "annual";
  school_email: string;
  phone_number: string;
  school_address: string;
  school_website?: string;
  admin_full_name: string;
  admin_email: string;
  arms?: string[]
  roles: UserRole[]

};

export type RegisterSchoolResponse = {
  school_id: string;
  admin_id: string;
  message: string;              // invite email sent to admin
};

// POST /auth/register/teacher — school_admin only
// Classes are assigned at creation — no separate assign route
export type RegisterTeacherRequest = {
  full_name: string;
  email: string;
  roles: string[];              // e.g. ["teacher"] or ["teacher", "school_admin"]
  class_level: string[];
  class_arm: string[] | null;
};

export type RegisterTeacherResponse = {
  teacher_id: string;
  message: string;              // invite email sent to teacher
};

// POST /auth/register/student — school_admin only
export type RegisterStudentRequest = {
  full_name: string;
  email: string;
  class_level: string;
  class_arm: string | null;
  parent_email: string;         // stored on user record, used for parent link
  parent_phone: string;         // stored on user record, used for parent link
};

export type RegisterStudentResponse = {
  full_name: string;
  email: string;
  code: string;
};

export type BulkRegisterRequest = {
  csvText: string;
}

// POST /auth/register/students/bulk — school_admin only (CSV upload)
export type BulkRegisterResponse = {
  total: number;
  codes: RegisterStudentResponse[];
};

// ============================================================
// GET /students/me
// ============================================================

export type StudentProfile = {
  id: string;
  full_name: string;
  email: string;
  class_level: string;       // e.g. "SS1"
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

export type ModuleProgress = {
  module_id: string;
  title: string;
  term: number;
  week_number: number;
  session_number: number;
  level: string;
  completed: boolean;
  submission_status: "not_started" | "submitted" | "approved" | "flagged";
  submitted_at: string | null;
};

export type TermProgress = {
  term: number;
  level: string;
  total_modules: number;
  submitted_modules: number;
  approved_modules: number;
  flagged_modules: number;
  completion_percentage: number;
};

export type StudentProgress = {
  current_term: number;
  current_level: string;
  term_progress: TermProgress;
  modules: ModuleProgress[];
};


// ============================================================
// GET /students/me/submissions
// ============================================================

export type Submission = {
  id: string;
  module_id: string;
  module_title: string;
  term: number;
  week_number: number;
  session_number: number;
  activity_text: string;
  reflection_text: string | null;
  file_url: string | null;
  status: "submitted" | "approved" | "flagged";
  teacher_note: string | null;    // populated when flagged
  submitted_at: string;
  synced_at: string | null;       // null = synced offline, not yet confirmed
  local_id: string;               // client UUID used for offline dedup
};

export type SubmissionHistory = {
  submissions: Submission[];
  total: number;
};


// ============================================================
// GET /students/me/portfolio
// ============================================================

export type PortfolioEntry = {
  id: string;
  module_id: string;
  module_title: string;
  term: number;
  week_number: number;
  reflection_text: string | null;
  file_url: string | null;
  approved_at: string;            // auto-generated on approval by Celery
  // denormalised — no join needed
  student_name: string;
  school_name: string;
};

export type StudentPortfolio = {
  entries: PortfolioEntry[];
  total: number;
};



// ============================================================
// LESSON ROUTES
// ============================================================

// GET /modules?term=1&level=SS1
// Lightweight list — content_json excluded to keep payload small
export type ModuleSummary = {
  id: string;
  title: string;
  term: number;
  week_number: number;
  level: string;
  published: boolean;
};

export type ModulesResponse = {
  modules: ModuleSummary[];
  total: number;
};


// GET /modules/[moduleId] — full module with content
export type CurriculumModule = {
  id: string;
  title: string;
  term: number;
  week_number: number;
  level: string;
  published: boolean;
  content_json: {
    blocks: CurriculumModuleBlock[];
  };
  created_at: string;
  updated_at: string;
};


// POST /submissions — online submission
export type CreateSubmissionRequest = {
  module_id: string;
  activity_text: string;
  reflection_text: string | null;
  file_url: string | null;
  local_id: string;             // client UUID for offline dedup
};

export type CreateSubmissionResponse = {
  id: string;
  module_id: string;
  status: SubmissionStatus;
  submitted_at: string;
  synced_at: string;
  local_id: string;             // echoed back so client can reconcile with Dexie
};


// POST /sync/submissions — batch offline sync
// Fires on reconnect via useOnlineStatus hook
// JWT extracted server-side — no user_id needed in body
// If JWT expired, refresh token silently renews it before sync fires
export type SyncSubmissionItem = {
  module_id: string;
  reflection_text: string | null;
  file_url: string | null;
  local_id: string;
};

export type SyncSubmissionsRequest = {
  submissions: SyncSubmissionItem[];
};

export type SyncSubmissionResult = {
  local_id: string;
  id: string | null;            // null if server rejected
  status: "synced" | "duplicate" | "failed";
  // duplicate = server already has this local_id, treated as success
  // client marks Dexie record as synced in both synced + duplicate cases
  submitted_at: string | null;
};

export type SyncSubmissionsResponse = {
  results: SyncSubmissionResult[];
};

// ============================================================
// TEACHER ROUTES
// ============================================================

// GET /teacher/classes
export type TeacherClass = {
  level: string;
  arm: string | null;
  term: number;
  student_count: number;
};

export type TeacherClassesResponse = {
  classes: TeacherClass[];
};


// GET /teacher/classes/[level]/students
// GET /teacher/classes/[level]/[arm]/students
// Progress resolved via single aggregation query on student_submissions
// total_modules comes from curriculum_modules join — not from submissions count
export type ClassStudentProgress = {
  term: number;
  total_modules: number;
  submitted_modules: number;
  approved_modules: number;
  flagged_modules: number;
};

export type ClassStudent = {
  student_id: string;
  full_name: string;
  class_level: string;
  class_arm: string | null;
  status: UserStatus;
  progress: ClassStudentProgress;
};

export type ClassStudentsResponse = {
  level: string;
  arm: string | null;
  term: number;
  students: ClassStudent[];
  total: number;
};


// GET /teacher/submissions/pending
// All pending submissions across teacher's assigned classes
// Resolved via single JOIN: student_submissions + users + curriculum_modules
// Scoped to teacher's school via JWT
export type PendingSubmission = {
  id: string;
  student_id: string;
  student_name: string;
  class_level: string;
  class_arm: string | null;
  module_id: string;
  module_title: string;
  term: number;
  week_number: number;
  reflection_text: string | null;
  file_url: string | null;
  submitted_at: string;
};

export type PendingSubmissionsResponse = {
  submissions: PendingSubmission[];
  total: number;
};


// GET /teacher/submissions/[id]
export type SubmissionDetail = {
  id: string;
  student_id: string;
  student_name: string;
  class_level: string;
  class_arm: string | null;
  module_id: string;
  module_title: string;
  term: number;
  week_number: number;
  activity_text: string | null;
  file_url: string | null;
  status: SubmissionStatus;
  ai_note: string | null;
  ai_status: string | null;
  ai_score: number | null;
  teacher_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;   // teacher user id
};


// POST /teacher/submissions/[id]/approve — no request body
// POST /teacher/submissions/[id]/flag
export type FlagSubmissionRequest = {
  teacher_note: string;         // required — student needs to know what to fix
};

export type SubmissionReviewResponse = {
  id: string;
  status: "approved" | "flagged";
  teacher_note: string | null;
  reviewed_at: string;
};


// GET /teacher/students/[studentId]
export type StudentDetail = {
  student_id: string;
  full_name: string;
  email: string;
  class_level: string;
  class_arm: string | null;
  status: UserStatus;
  progress: ClassStudentProgress;   // scoped to current term
  recent_submissions: SubmissionDetail[];
};




// ============================================================
// SCHOOL ADMIN ROUTES
// ============================================================

// GET /admin/school
export type SchoolStats = {
  total_students: number;
  total_teachers: number;
  active_students: number;
  pending_students: number;
};

export type SchoolProfile = {
  id: string;
  name: string;
  tier: "pilot" | "annual" | "suspended";
  term: number;
  available_arms?: string[];
  stats: SchoolStats;
};


// GET /admin/students
export type AdminStudent = {
  student_id: string;
  full_name: string;
  email: string;
  class_level: string;
  class_arm: string | null;
  status: import("./api-types").UserStatus;
  created_at: string;
  parent_link_sent_at: string | null; // null = never sent; ISO timestamp = last sent
};

export type AdminStudentsResponse = {
  students: AdminStudent[];
  total: number;
};

// DELETE /admin/students/[id] — reuses DeleteResponse
export type DeleteResponse = {
  message: string;
};


// POST /admin/students/promote/preview
// Admin uploads CSV of emails of students being RETAINED (repeating)
// Everyone not on the list is promoted up one level
// SS3 students not on the retained list are deactivated
export type PromotionStudentPreview = {
  student_id: string;
  full_name: string;
  email: string;
  current_level: string;
  outcome: "promoted" | "retained" | "deactivated";
  next_level: string | null;    // null if deactivated
};

export type PromotionPreviewResponse = {
  promotion_id: string;         // temp ID referenced in confirm step
  expires_at: string;           // admin must confirm before this — prevents stale promotions
  summary: {
    total_students: number;
    promoted: number;
    retained: number;
    deactivated: number;
  };
  students: PromotionStudentPreview[];
};

// POST /admin/students/promote/confirm
export type PromotionConfirmRequest = {
  promotion_id: string;         // from preview response
};

export type PromotionConfirmResponse = {
  message: string;
  promoted: number;
  retained: number;
  deactivated: number;
};


// GET /admin/teachers
export type AdminTeacher = {
  teacher_id: string;
  full_name: string;
  email: string;
  roles: string[];
  status: UserStatus;
  assigned_classes: AssignedClass[];
  created_at: string;
};

export type AdminTeachersResponse = {
  teachers: AdminTeacher[];
  total: number;
};

// DELETE /admin/teachers/[id] — reuses DeleteResponse


// POST /admin/parent-links/[studentId]/send
// Token stored in Redis (48hr TTL) — not in DB
// parent_email + parent_phone read from student record — no admin input needed
export type ParentLinkSendResponse = {
  student_id: string;
  parent_email: string;         // echoed back so admin can confirm who it was sent to
  parent_phone: string;
  expires_at: string;
};

// POST /admin/parent-links/[studentId]/revoke — reuses DeleteResponse


// HammetLabs only — guarded by school registration role
// GET /admin/modules
export type AdminModulesResponse = {
  modules: CurriculumModule[];
  total: number;
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

// PUT /admin/modules/[moduleId] — full replace, no partial update
// reuses CreateModuleRequest as request body
export type UpdateModuleResponse = CurriculumModule;


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
    total_students: number;
    total_teachers: number;
    active_students: number;
    pending_students: number;
  };
  created_at: string; // ISO 8601
};

export type SchoolsListResponse = {
  schools: SchoolListItem[];
  total: number;
};

// POST /hammet/schools/[schoolId]/deactivate
// Sets tier to "suspended" — hammet_admin only
// No request body needed
export type DeactivateSchoolResponse = {
  school_id: string;
  tier: "suspended";
  message: string;
};


// ============================================================
// PARENT PORTAL ROUTES
// ============================================================

// GET /parent/[token]/verify
// Token in path confirms link is valid and not expired
export type ParentVerifyChallenge = {
  student_name: string;         // so parent knows whose profile they're accessing
  question: string;             // e.g. "Enter the last 4 digits of your phone number"
};

// POST /parent/[token]/verify
export type ParentVerifyRequest = {
  answer: string;
};

export type ParentVerifyResponse = {
  verified: boolean;
};

// GET /parent/[token]/portal
// Same magic link token gates access throughout — no second token issued
export type ParentPortal = {
  student_name: string;
  class_level: string;
  class_arm: string | null;
  school_name: string;
  term_progress: TermProgress;
  portfolio: PortfolioEntry[];
};



// ============================================================
// PUBLIC PORTFOLIO ROUTE
// ============================================================

// GET /portfolio/public/[slug]
export type PublicPortfolio = {
  student_name: string;
  school_name: string;
  class_level: string;
  entries: PortfolioEntry[];
  total: number;
};
