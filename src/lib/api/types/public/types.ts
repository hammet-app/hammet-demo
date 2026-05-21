import { PortfolioEntry } from "@/lib/api/types/student";

// ============================================================
// PUBLIC PORTFOLIO ROUTE
// ============================================================

// GET /portfolio/public/[slug]
export type PublicPortfolio = {
  studentName: string;
  schoolName: string;
  classLevel: string;
  entries: PortfolioEntry[];
  total: number;
};