import { PerformancePoint, TermProgress } from "@/lib/api/types/student";

// ============================================================
// PARENT PORTAL ROUTES
// ============================================================

// GET /parent/[token]/verify
// Token in path confirms link is valid and not expired
export type ParentVerifyChallenge = {
  studentName: string;         // so parent knows whose profile they're accessing
  question: string;             // e.g. "Enter the last 4 digits of your phone number"
};

export type ParentVerifyRequest = {
  answer: string;
};

export type ParentVerifyResponse = {
  availableLevels: string[],
  currentTerm: number,
  currentLevel: string,
};

// GET /parent/[token]/portal
// Same magic link token gates access throughout — no second token issued
export type ParentPortal = {
  studentName: string;
  classLevel: string;
  classArm: string | null;
  schoolName: string;
  termProgress: TermProgress | null;
  portfolioEntry: unknown[];
  // TODO: backend field pending — will be PerformancePoint[] once wired up
  performance: PerformancePoint[];
};

export type ParentPortalRequest = {
  term: number[] | null;
  level: string[] | null;
}
