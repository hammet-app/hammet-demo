export type UserRole =
  | "student"
  | "school_admin"
  | "hammet_admin";

export type UserAccess = 
  | "module"
  | "courses"
  | "admin"
  | "disputes"
  | "schools"

export type UserScope = 
  | "b2b"
  | "b2c"
  | "platform"

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: UserRole;
  scope: UserScope;
  access: UserAccess[];
  schoolId: string;
  cookieConsent: boolean;
  cookiePolicyVersion: string;
  classLevel: string | null;
  classArm: string | null;
  term: number | null;
  learningMode?: "focus" | "guided";
}

/** Returns the user's display label for a given role. */
export function getRoleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    student: "Student",
    school_admin: "School Admin",
    hammet_admin: "Hammet Admin",
  };
  return map[role];
}

/** Returns initials from a full name (max 2 chars). */
export function getInitials(name: string): string {
  if (!name) return ""
  const parts = name.trim().split(/\s+/);

  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");
  }

  return name.trim().slice(0, 2).toUpperCase();
  }
