import { AiFormState } from "@/lib/api/types/submissions";

// ============================================================
// GET /students/me
// ============================================================

export type StudentProfile = {
  id: string;
  fullName: string;
  email: string;
  classLevel: string;       // e.g. "SSS1"
  classArm: string;         // e.g. "A"
  schoolId: string;
  schoolName: string;       // denormalised for display
  roles: string[];           // always ["student"]
  status: "pending" | "active" | "suspended";
  googleId: string | null;
  hasPinSet: boolean;      // frontend uses this to know whether to prompt PIN setup
  createdAt: string;        // ISO 8601
};


// ============================================================
// GET /students/me/progress
// ============================================================

export type ModuleProgress = {
  moduleId: string;
  title: string;
  term: number;
  weekNumber: number;
  level: string;
  completed: boolean;
  submissionStatus: "not_started" | "submitted" | "approved" | "flagged";
  submittedAt: string | null;
};

export type TermProgress = {
  term: number;
  level: string;
  totalModules: number;
  submittedModules: number;
  approvedModules: number;
  flaggedModules: number;
  completionPercentage: number;
};

export type StudentProgress = {
  currentTerm: number;
  currentLevel: string;
  termProgress: TermProgress;
  modules: ModuleProgress[];
};


// ============================================================
// GET /students/me/submissions
// ============================================================

export type Submission = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  term: number;
  weekNumber: number;
  aiForm: AiFormState | null
  activityText: string;
  reflectionText: string | null;
  fileUrls: string[] | null;
  status: "submitted" | "approved" | "flagged";
  teacherNote: string | null;    // populated when flagged
  submittedAt: string;
  syncedAt: string | null;       // null = synced offline, not yet confirmed
  localId: string;               // client UUID used for offline dedup
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
  moduleId: string;
  moduleTitle: string;
  term: number;
  weekNumber: number;
  reflectionText: string | null;
  fileUrls: string[] | null;
  approvedAt: string;            // auto-generated on approval by Celery
  // denormalised — no join needed
  studentName: string;
  schoolName: string;
};

export type StudentPortfolio = {
  entries: PortfolioEntry[];
  total: number;
};

export interface PerformancePoint {
  term: number;
  level: string;
  label: number;      // week_number
  y: number;          // moving average 0–1
  band: "Needs Work" | "Improving" | "Strong";
}

export interface PerformanceParams {
  term?: number[];
  level?: string[];
}