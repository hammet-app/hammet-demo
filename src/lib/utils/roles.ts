export type UserRole =
  | "student"
  | "school_admin"
  | "hammet_admin";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  roles: UserRole[];
  schoolId: string;
  cookieConsent: boolean;
  cookiePolicyVersion: string;
  classLevel: string | null;
  classArm: string | null;
  term: number | null;
  learningMode?: "focus" | "guided";
}

/** Derives the primary display role from the roles array. */
export function getPrimaryRole(roles: UserRole[]): UserRole {
  if (roles.includes("hammet_admin")) return "hammet_admin";
  if (roles.includes("school_admin")) return "school_admin";
  return "student";
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
