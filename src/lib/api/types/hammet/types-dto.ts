// GET /hammet/schools

import { UserRole } from "@/lib/utils/roles";

// Full list of all registered schools — hammet_admin only
export type SchoolListItemDto = {
  id: string;
  name: string;
  tier: "pilot" | "summer" | "spark" | "academy" | "premier" | "global" | "suspended";
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

export type SchoolDetailsDto = {
  id: string;
  name: string;
  tier: "pilot" | "summer" | "spark" | "academy" | "premier" | "global" | "suspended";
  email: string;
  address: string;
  phone_number: string;
  website: string | null;
  term: string;
  created_at: string;
  stats: {
    total_students: number
    active_students: number;
    pending_students: number;
  }
}

export type AdminDetailsDto = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole[];
  last_login: string | null;
}

// GET /hammet/schools/{school_id}
// Details of registered school
export type SchoolDetailsItemDto ={
  school: SchoolDetailsDto;
  admins: AdminDetailsDto[]

}

// POST /hammet/schools/[schoolId]/deactivate
// Sets tier to "suspended" — hammet_admin only
// No request body needed
export type DeactivateSchoolResponseDto = {
  school_id: string;
  tier: "suspended";
  message: string;
};


export type DisputeReviewPayloadDto = {
  id: string;
  review_note: string
}

export type  DisputeDto = {
  id: string;
  student_id: string;
  module_title: string;
  original_response: string;
  ai_status: string;
  ai_score: number;
  student_review: string;
  student_dispute_note: string;
  disputed_at: string;
  reviewed_by: string | null;
  reviewed: boolean;
  review_note: string | null
}

export type DisputesDto = {
  disputes: DisputeDto[]
}

