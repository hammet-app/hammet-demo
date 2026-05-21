import type { UserRole } from "@/lib/utils/roles";

/**
 * Returns the default landing route for a given role after login.
 * Each role maps directly to its own top-level route.
 */
export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  student:       "/student/lessons",
  school_admin:  "/admin",
  hammet_admin:  "/hammet",
};

export function getDefaultRoute(roles: UserRole[]): string {
  // Priority order matches getPrimaryRole
  if (roles.includes("hammet_admin")) return ROLE_DEFAULT_ROUTES.hammet_admin;
  if (roles.includes("school_admin")) return ROLE_DEFAULT_ROUTES.school_admin;
  return ROLE_DEFAULT_ROUTES.student;
}

export function getDashboardRoute(role: UserRole): string {
  if (role === "hammet_admin") return ROLE_DEFAULT_ROUTES.hammet_admin;
  if (role === "school_admin") return ROLE_DEFAULT_ROUTES.school_admin;
  return ROLE_DEFAULT_ROUTES.student;
}