import { CurriculumModuleBlock } from "@/lib/api/types/module";
import { UserRole } from "@/lib/utils/roles";

// GET /hammet/schools
// Full list of all registered schools — hammet_admin only
export type SchoolListItem = {
  id: string;
  name: string;
  tier: "pilot" | "summer" | "spark" | "academy" | "premier" | "global" | "suspended";
  term: number;
  stats: {
    totalStudents: number;
    activeStudents: number;
    pendingStudents: number;
  };
  createdAt: string; // ISO 8601
};

export type SchoolDetails = {
  id: string;
  name: string;
  tier: "pilot" | "summer" | "spark" | "academy" | "premier" | "global" | "suspended";
  email: string;
  address: string;
  phoneNumber: string;
  website: string | null;
  term: string;
  createdAt: string;
  stats: {
    totalStudents: number
    activeStudents: number;
    pendingStudents: number;
  }
}

export type AdminDetails = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole[];
  lastLogin: string | null;
}

// GET /hammet/schools/{school_id}
// Details of registered school
export type SchoolDetailsItem ={
  school: SchoolDetails;
  admins: AdminDetails[]

}

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

export type DisputeReviewPayload = {
  id: string;
  reviewNote: string
}

export type  Dispute = {
  id: string;
  studentId: string;
  moduleTitle: string;
  originalResponse: string;
  aiStatus: string;
  aiScore: number;
  studentReview: string;
  studentDisputeNote: string;
  disputedAt: string;
  reviewedBy: string | null;
  reviewed: boolean;
  reviewNote: string | null
}

export type Disputes = {
  disputes: Dispute[]
}

