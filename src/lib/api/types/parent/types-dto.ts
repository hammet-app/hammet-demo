import { PerformancePoint, TermProgressDto } from "@/lib/api/types/student";

// ============================================================
// PARENT PORTAL ROUTES
// ============================================================

// GET /parent/[token]/verify
// Token in path confirms link is valid and not expired
export type ParentVerifyChallengeDto = {
  student_name: string;         // so parent knows whose profile they're accessing
  question: string;             // e.g. "Enter the last 4 digits of your phone number"
};

export type ParentVerifyResponseDto = {
  available_levels: string[],
  current_term: number,
  current_level: string,
};

// GET /parent/[token]/portal
// Same magic link token gates access throughout — no second token issued
export type ParentPortalDto = {
  student_name: string;
  class_level: string;
  class_arm: string | null;
  school_name: string;
  term_progress: TermProgressDto | null;
  portfolio_entry: unknown[];
  // TODO: backend field pending — will be PerformancePoint[] once wired up
  performance: PerformancePoint[];
};
