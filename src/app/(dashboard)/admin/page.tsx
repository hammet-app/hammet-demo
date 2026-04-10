"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getSchoolProfile } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { SchoolProfile } from "@/lib/api/api-types";

const TIER_STYLE: Record<string, { bg: string; text: string }> = {
  pilot:     { bg: "bg-cyan-50",     text: "text-cyan-700" },
  annual:    { bg: "bg-emerald-50",  text: "text-emerald-700" },
  suspended: { bg: "bg-red-50",      text: "text-red-600" },
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5">
      <p className="text-3xl font-bold text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="text-sm text-[var(--color-text-secondary)] mt-1">{label}</p>
      {sub && (
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</p>
      )}
    </div>
  );
}

type QuickAction = {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  accent: string;
};

function QuickActionCard({ action }: { action: QuickAction }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(action.href)}
      className="group w-full text-left bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 hover:border-[var(--color-purple)] hover:shadow-md transition-all"
    >
      <div
        className={`w-10 h-10 rounded-xl ${action.accent} flex items-center justify-center mb-3 group-hover:scale-105 transition`}
      >
        {action.icon}
      </div>

      <p className="font-semibold text-sm text-[var(--color-text-primary)]">
        {action.label}
      </p>

      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
        {action.description}
      </p>
    </button>
  );
}

export default function AdminDashboardPage() {
  const { accessToken, refreshToken } = useAuth();

  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getSchoolProfile(accessToken, refreshToken)
      .then(setProfile)
      .catch(() => setError("Failed to load school profile."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  const tier = profile
    ? TIER_STYLE[profile.tier] ?? TIER_STYLE.pilot
    : null;

  const quickActions: QuickAction[] = [
    {
      label: "Register student",
      description: "Add a single student to the school roster.",
      href: "/admin/students/new",
      accent: "bg-[var(--color-purple-light)]",
      icon: 
        <svg className="w-5 h-5 text-[var(--color-purple)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>
    },
    {
      label: "Bulk import students",
      description: "Paste a list to register multiple students at once.",
      href: "/admin/students/bulk",
      accent: "bg-cyan-50",
      icon: 
        <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
    },
    {
      label: "Register teacher",
      description: "Add a teacher and assign their classes.",
      href: "/admin/teachers/new",
      accent: "bg-indigo-50",
      icon: 
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
    },
    {
      label: "Promote students",
      description: "End-of-year class promotion with CSV upload.",
      href: "/admin/students/promote",
      accent: "bg-emerald-50",
      icon: 
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
        </svg>
    },
    {
      label: "View modules",
      description: "Browse curriculum.",
      href: "/admin/modules",
      accent: "bg-amber-50",
      icon: 
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
    },
  ];

  return (
    <PageShell title="Dashboard">
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      ) : !profile ? (
        <div className="text-sm text-[var(--color-text-secondary)]">
          No profile found.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                {profile.name}
              </h2>

              {tier && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full ${tier.bg} ${tier.text}`}>
                  {profile.tier}
                </span>
              )}
            </div>

            <p className="text-sm text-[var(--color-text-secondary)]">
              Term {profile.term}
              {profile.available_arms && profile.available_arms.length > 0 &&
                ` · Arms: ${profile.available_arms.join(", ")}`}
            </p>
          </div>

          {/* Stats */}
          <div>
            <p className="text-xs uppercase mb-3 text-[var(--color-text-muted)]">
              Overview
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Total students" value={profile.stats.total_students} />
              <StatCard label="Active students" value={profile.stats.active_students} />
              <StatCard label="Pending students" value={profile.stats.pending_students} />
              <StatCard label="Teachers" value={profile.stats.total_teachers} />
            </div>
          </div>

          {/* Actions */}
          <div>
            <p className="text-xs uppercase mb-3 text-[var(--color-text-muted)]">
              Quick actions
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <QuickActionCard key={action.href} action={action} />
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}