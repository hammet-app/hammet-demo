import { UserRole } from "@/lib/utils/roles";

// ============================================================
// AUTH ROUTES
// ============================================================


export type InviteInfoDto = {
  full_name: string;
  email: string;
  roles: UserRole[];
}

// POST /auth/login
export type LoginRequestDto = {
  email: string;
  password: string;
  device_id: string;
};

export type LoginResponseDto = {
  access_token: string;         // JWT, 60 min expiry — store in memory only, never localStorage
  user: {
    id: string;
    full_name: string;
    email: string;
    roles: UserRole[];
    school_id: string;
    cookie_consent: boolean;
    cookie_policy_version: string;
    class_level: string | null; // null for non-students
    class_arm: string | null;
    term: number | null;
  };
};

// POST /auth/claim — student/teacher claiming invite via password or Google
export type ClaimAccountRequestDto =
  | { token?: string; claim_code?: string; email?: string; password: string, device_id: string }
  | { token: string; google_id_token: string, device_id: string };

export type ClaimAccountResponseDto = {
  access_token: string;
  user: LoginResponseDto["user"];
};


// POST /auth/refresh — no request body, uses httpOnly refresh token cookie
export type RefreshResponseDto = {
  access_token: string;         // JWT, 60 min expiry — store in memory only, never localStorage
  user: {
    id: string;
    full_name: string;
    email: string;
    roles: UserRole[];
    school_id: string;
    cookie_consent: boolean;
    cookie_policy_version: string;
    class_level: string | null; // null for non-students
    class_arm: string | null;
    term: number | null;
  };
};


// POST /auth/register/school — HammetLabs only
export type RegisterSchoolRequestDto = {
  name: string;
  tier: "pilot" | "summer" | "spark" | "academy" | "premier" | "global";
  school_email: string;
  phone_number: string;
  school_address: string;
  school_website?: string;
  admin_full_name: string;
  admin_email: string;
  arms?: string[]
  roles: UserRole[]

};

export type RegisterSchoolResponseDto = {
  school_id: string;
  admin_id: string;
  message: boolean;              // invite email sent to admin
};

// POST /auth/register/admin
export type RegisterAdminRequestDto = {
  school_id: string;
  full_name: string;
  email: string;
  roles: string[];
}


// POST /auth/register/student — school_admin only
export type RegisterStudentRequestDto = {
  full_name: string;
  email: string;
  class_level: string;
  class_arm: string | null;
  parent_email?: string;         // stored on user record, used for parent link
  parent_phone?: string;         // stored on user record, used for parent link
  date_of_birth: string;
};

export type RegisterStudentResponseDto = {
  full_name: string;
  email: string;
  code: string;
};

export type BulkStudentInputDto = {
  full_name: string;
  email: string;
  class_level: string;
  class_arm: string;
  parent_email?: string;
  parent_phone?: string;
  date_of_birth: string;
}

export type BulkRegisterRequestDto = {
  students: BulkStudentInputDto[];
}


// POST /auth/register/students/bulk — school_admin only (CSV upload)
export type BulkRegisterResponseDto = {
  total: number;
  codes: RegisterStudentResponseDto[];
};

export type forgotPasswordResponseDto = {
  is_admin: boolean;
}