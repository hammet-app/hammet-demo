export type UserRole =
  | "student"
  | "teacher"
  | "school_admin"
  | "hammet_admin";

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  roles: UserRole[];
  school_id: string;
  class_level: string | null;
  class_arm: string | null;
}

/** Derives the primary display role from the roles array. */
export function getPrimaryRole(roles: UserRole[]): UserRole {
  if (roles.includes("hammet_admin")) return "hammet_admin";
  if (roles.includes("school_admin")) return "school_admin";
  if (roles.includes("teacher")) return "teacher";
  return "student";
}

/** Returns the user's display label for a given role. */
export function getRoleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    student: "Student",
    teacher: "Teacher",
    school_admin: "School Admin",
    hammet_admin: "Hammet Admin",
  };
  return map[role];
}

/** Returns initials from a full name (max 2 chars). */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}
