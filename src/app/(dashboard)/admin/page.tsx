"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getSchoolProfile, updateTerm } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { SchoolProfile, UpdateTerm } from "@/lib/api/types";

const TIER_STYLE: Record<string, { bg: string; text: string }> = {
  pilot:     { bg: "bg-cyan-50",     text: "text-cyan-700" },
  annual:    { bg: "bg-emerald-50",  text: "text-emerald-700" },
  suspended: { bg: "bg-red-50",      text: "text-red-600" },
};

// ── Term modal ────────────────────────────────────────────────────────────────

function TermModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: SchoolProfile;
  onClose: () => void;
  onSaved: (start: string, end: string) => void;
}) {
  const { accessToken, refreshToken } = useAuth();

  const [termStart, setTermStart] = useState(profile.termStart ?? "");
  const [termEnd, setTermEnd] = useState(profile.termEnd ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!termStart || !termEnd) {
      setError("Both dates are required.");
      return;
    }
    if (termEnd <= termStart) {
      setError("Term end must be after term start.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateTerm({ termStart, termEnd } satisfies UpdateTerm, accessToken!, refreshToken);
      onSaved(termStart, termEnd);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="w-full max-w-sm bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Update term dates
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Changes take effect immediately for all students.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[var(--color-text-secondary)]">
              Term start
            </label>
            <input
              type="date"
              value={termStart}
              onChange={(e) => setTermStart(e.target.value)}
              className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[var(--color-text-secondary)]">
              Term end
            </label>
            <input
              type="date"
              value={termEnd}
              onChange={(e) => setTermEnd(e.target.value)}
              className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="h-9 px-4 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-page)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-4 rounded-lg bg-[var(--color-purple)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

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

// ── Quick action card ─────────────────────────────────────────────────────────

type QuickAction = {
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  accent: string;
};

function QuickActionCard({ action }: { action: QuickAction }) {
  const router = useRouter();

  return (
    <button
      onClick={() => (action.onClick ? action.onClick() : router.push(action.href!))}
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { accessToken, refreshToken } = useAuth();

  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termModalOpen, setTermModalOpen] = useState(false);

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
      icon: (
        <svg className="w-5 h-5 text-[var(--color-purple)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>
      ),
    },
    {
      label: "Bulk import students",
      description: "Paste a list to register multiple students at once.",
      href: "/admin/students/bulk",
      accent: "bg-cyan-50",
      icon: (
        <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      ),
    },
    {
      label: "View modules",
      description: "Browse curriculum.",
      href: "/admin/modules",
      accent: "bg-amber-50",
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
    {
      label: "Manage term",
      description: "Update the current term start and end dates.",
      onClick: () => setTermModalOpen(true),
      accent: "bg-emerald-50",
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      ),
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
              {profile.availableArms && profile.availableArms.length > 0 &&
                ` · Arms: ${profile.availableArms.join(", ")}`}
            </p>
          </div>

          {/* Stats */}
          <div>
            <p className="text-xs uppercase mb-3 text-[var(--color-text-muted)]">
              Overview
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Total students" value={profile.stats.totalStudents} />
              <StatCard label="Active students" value={profile.stats.activeStudents} />
              <StatCard label="Pending students" value={profile.stats.pendingStudents} />
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <p className="text-xs uppercase mb-3 text-[var(--color-text-muted)]">
              Quick actions
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <QuickActionCard key={action.label} action={action} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Term modal — rendered outside the scroll container */}
      {termModalOpen && profile && (
        <TermModal
          profile={profile}
          onClose={() => setTermModalOpen(false)}
          onSaved={(start, end) => {
            setProfile((prev) =>
              prev ? { ...prev, termStart: start, termEnd: end } : prev
            );
            setTermModalOpen(false);
          }}
        />
      )}
    </PageShell>
  );
}