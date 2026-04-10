"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getDefaultRoute } from "@/lib/auth/routes";
import type { UserRole } from "@/lib/utils/roles";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps dashboard pages. Shows a skeleton while the silent refresh
 * is in flight, then either renders children or redirects to login.
 *
 * Place this inside the (dashboard) group layout, inside AuthProvider.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, isResolved } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Once resolved with no user → send to login
    if (isResolved && !user) {
      router.replace("/login");
    }
  }, [isResolved, user, router]);

  // ── Loading: silent refresh in flight ──
  if (isLoading || !isResolved) {
    return <DashboardSkeleton />;
  }

  // ── No user: redirect is firing, show nothing ──
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Redirects the user from /dashboard to their role-appropriate page.
 * Use this as the default /dashboard page component.
 */
export function DashboardRedirect() {
  const { user, isResolved } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isResolved && user) {
      const route = getDefaultRoute(user.roles as UserRole[]);
      router.replace(route);
    }
  }, [isResolved, user, router]);

  return <DashboardSkeleton />;
}

// ─── Skeleton ─────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Topbar skeleton */}
      <div className="h-[56px] bg-purple-dark flex items-center px-5 gap-3 shrink-0">
        <div className="w-7 h-7 rounded-[7px] bg-white/10 animate-pulse" />
        <div className="w-28 h-4 rounded bg-white/10 animate-pulse" />
        <div className="flex-1" />
        <div className="w-20 h-6 rounded-full bg-white/10 animate-pulse" />
        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton — desktop only */}
        <div className="hidden md:flex flex-col w-[240px] bg-purple-dark gap-2 p-4 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-9 rounded-[8px] bg-white/[0.06] animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>

        {/* Content skeleton */}
        <main className="flex-1 overflow-y-auto bg-bg-page p-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-bg-card border border-border rounded-[10px] p-4 h-24 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-16 h-3 rounded bg-gray-100 mb-3" />
                <div className="w-12 h-7 rounded bg-gray-100" />
              </div>
            ))}
          </div>

          {/* Content rows */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-bg-card border border-border rounded-[10px] p-4 h-16 animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
