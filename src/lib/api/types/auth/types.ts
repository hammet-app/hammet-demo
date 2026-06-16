import { UserRole } from "@/lib/utils/roles";

export type InviteInfo = {
  fullName: string;
  email: string;
  roles: UserRole[];
}

export type LoginRequest = {
  email: string;
  password: string;
  deviceId: string;
};

export type LoginResponse = {
  accessToken: string;         // JWT, 60 min expiry — store in memory only, never localStorage
  user: {
    id: string;
    fullName: string;
    email: string;
    roles: UserRole[];
    schoolId: string;
    classLevel: string | null; // null for non-students
    classArm: string | null;
    term: number | null;
  };
};

export type VerifyOTPRequest = {
  otp: string;
};

export type ResetPasswordRequest = {
  password: string;
  confirmPassword: string;
};

// POST /auth/claim — student/teacher claiming invite via password or Google
export type ClaimAccountRequest =
  | { token?: string; claimCode?: string; email?: string; password: string, deviceId: string }
  | { token: string; googleIdToken: string, deviceId: string };

export type ClaimAccountResponse = {
  accessToken: string;
  user: LoginResponse["user"];
};

// POST /auth/resend/student
export type ResendVerificationRequest = {
  id: string;
  role: UserRole
};

export type ResendVerificationResponse = {
  message: string | boolean;
};


// POST /auth/refresh — no request body, uses httpOnly refresh token cookie
export type RefreshResponse = {
  accessToken: string;         // JWT, 60 min expiry — store in memory only, never localStorage
  user: {
    id: string;
    fullName: string;
    email: string;
    roles: UserRole[];
    schoolId: string;
    classLevel: string | null; // null for non-students
    classArm: string | null;
    term: number | null;
  };
};

// POST /auth/logout — no request body, clears httpOnly cookie server-side
export type LogoutResponse = {
  message: string;
};



// POST /auth/register/school — HammetLabs only
export type RegisterSchoolRequest = {
  name: string;
  tier: "pilot" | "annual";
  schoolEmail: string;
  phoneNumber: string;
  schoolAddress: string;
  schoolWebsite?: string;
  adminFullName: string;
  adminEmail: string;
  arms?: string[]
  roles: UserRole[]

};

export type RegisterSchoolResponse = {
  schoolId: string;
  adminId: string;
  message: boolean;              // invite email sent to admin
};

// POST /auth/register/student — school_admin only
export type RegisterStudentRequest = {
  fullName: string;
  email: string;
  classLevel: string;
  classArm: string | null;
  parentEmail: string;         // stored on user record, used for parent link
  parentPhone: string;         // stored on user record, used for parent link
  dateOfBirth: string;
};

export type RegisterStudentResponse = {
  fullName: string;
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

// POST /auth/reset
// Before you call this you call /auth/reset/{token}
// to verify the code or token. It returns True if it's correct
export type ResetPassword = {
  token: string; // This is for either the code or token
  password: string;
}