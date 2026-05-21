import { PortfolioEntryDto } from "@/lib/api/types/student";

// ============================================================
// PUBLIC PORTFOLIO ROUTE
// ============================================================

// GET /portfolio/public/[slug]
export type PublicPortfolioDto = {
  student_name: string;
  school_name: string;
  class_level: string;
  entries: PortfolioEntryDto[];
  total: number;
};