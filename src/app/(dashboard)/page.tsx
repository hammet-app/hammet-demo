// src/app/(dashboard)/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getPrimaryRole } from "@/lib/utils/roles";

const ROLE_ROUTES: Record<string, string> = {
  hammet_admin: "/hammet",
  school_admin: "/admin",
  teacher:      "/teacher/classes",
  student:      "/student/lessons",
};

export default function DashboardPage() {
  const { user, isResolved } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isResolved) return;
    if (!user) {
      router.replace("/login");
    } else {
      const role = getPrimaryRole(user.roles);
      router.replace(ROLE_ROUTES[role] ?? "/login");
    }
  }, [isResolved, user, router]);

  // Returning a div helps ensure the manifest registers a valid client entry point
  return <div className="hidden" aria-hidden="true" />;
}