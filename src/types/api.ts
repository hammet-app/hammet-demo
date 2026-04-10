export type SubmissionStatus = "submitted" | "approved" | "flagged";
export type UserStatus = "pending" | "active" | "suspended";
export type UserRole = "student" | "teacher" | "school_admin" | "hammet_admin";

export type AssignedClass = {
  level: string;
  arm: string | null;
  term: number;
};

export type LoginRequest = { email: string; password: string };
export type LoginResponse = {
  access_token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    roles: UserRole[];
    school_id: string;
    class_level: string | null;
    class_arm: string | null;
  };
};

export type RefreshResponse = { access_token: string };
export type LogoutResponse = { message: string };

export type RegisterSchoolRequest = {
  name: string;
  tier: "pilot" | "annual";
  admin_full_name: string;
  admin_email: string;
};
export type RegisterSchoolResponse = {
  school_id: string;
  admin_id: string;
  message: string;
};

export type RegisterTeacherRequest = {
  full_name: string;
  email: string;
  roles: string[];
  assigned_classes: AssignedClass[];
};
export type RegisterTeacherResponse = { teacher_id: string; message: string };

export type RegisterStudentRequest = {
  full_name: string;
  email: string;
  class_level: string;
  class_arm: string | null;
  parent_email: string;
  parent_phone: string;
};
export type RegisterStudentResponse = { student_id: string; message: string };

export type BulkRegisterResponse = {
  total: number;
  succeeded: number;
  failed: number;
  errors: { row: number; email: string; reason: string }[];
};

export type ClaimAccountRequest =
  | { token: string; password: string }
  | { token: string; google_id_token: string };

export type ClaimAccountResponse = {
  access_token: string;
  user: LoginResponse["user"];
};

export type ResendVerificationRequest = { email: string };
export type ResendVerificationResponse = { message: string };
