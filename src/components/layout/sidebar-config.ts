import {
  BookOpen,
  BarChart2,
  ClipboardList,
  Award,
  Users,
  User,
  List,
  Home,
  Link2,
  ArrowUp,
  LogOut,
  Building2,
  Plus,
  Upload,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/utils/roles";

export interface NavItem {
  type: "item";
  label: string;
  href?: string;
  action?: "logout"
  icon: LucideIcon;
  badge?: number;
  danger?: boolean;
  tourId?: string;
}

export interface NavSection {
  type: "section";
  label: string;
}

export interface NavDivider {
  type: "divider";
}

export type NavEntry = NavItem | NavSection | NavDivider;

export const navConfig: Record<UserRole, NavEntry[]> = {
  student: [
    { type: "item", label: "My Lessons",     href: "/student/lessons",       icon: BookOpen,      tourId: "student-lessons" },
    { type: "item", label: "My Progress",    href: "/student/progress",      icon: BarChart2,     tourId: "student-progress" },
    { type: "item", label: "Submissions",    href: "/student/submissions",   icon: ClipboardList, tourId: "student-submissions" },
    { type: "item", label: "My Portfolio",   href: "/student/portfolio",     icon: Award,         tourId: "student-portfolio" },
    { type: "item", label: "My Performance", href: "/student/performance",   icon: TrendingUp, tourId: "student-performance" },
    { type: "divider" },
    { type: "item", label: "Sign Out", action: "logout", icon: LogOut, danger: true },
  ],

  /**teacher: [
    { type: "item", label: "My Classes",      href: "/teacher/classes",     icon: Users },
    { type: "item", label: "Pending Reviews", href: "/teacher/reviews",     icon: ClipboardList },
    /** {type: "item", label: "All Submissions", href: "/teacher/submissions", icon: List} */
    /**{ type: "item", label: "Student Profiles",href: "/teacher/students",    icon: User },
    { type: "item", label: "Lessons", href: "/teacher/lessons", icon: BookOpen},
    { type: "divider" },
    { type: "item",    label: "Sign Out",           action: "logout",           icon: LogOut, danger: true }
  ],*/

  school_admin: [
    { type: "item", label: "Dashboard",      href: "/admin",                 icon: Home,   tourId: "admin-dashboard" },
    { type: "item", label: "Students",       href: "/admin/students",        icon: Users,  tourId: "admin-students" },
    /**{ type: "item",    label: "Teachers",       href: "/admin/teachers",       icon: User },
    { type: "item",    label: "Parent Links",   href: "/admin/parent-links",   icon: Link2 },*/
    /**{ type: "section", label: "End of Year" },
    { type: "item", label: "Class Promotion",href: "/admin/students/promote",icon: ArrowUp },*/
    { type: "divider" },
    { type: "item", label: "Sign Out", action: "logout", icon: LogOut, danger: true },
  ],

  hammet_admin: [
    { type: "item", label: "Platform Overview", href: "/hammet",             icon: Home,     tourId: "hammet-overview" },
    { type: "section", label: "Schools" },
    //{ type: "item",    label: "All Schools",        href: "/hammet",        icon: Building2 },
    { type: "item", label: "Register School",   href: "/hammet/schools/new", icon: Plus,     tourId: "register-school"},
    { type: "section", label: "Curriculum" },
    { type: "item", label: "Modules",           href: "/hammet/modules",     icon: BookOpen, tourId: "hammet-modules" },
    { type: "item", label: "Upload Module",     href: "/hammet/modules/bulk",icon: Upload,   tourId: "hammet-upload" },
    { type: "divider" },
    { type: "item", label: "Sign Out", action: "logout", icon: LogOut, danger: true },
  ],
};
