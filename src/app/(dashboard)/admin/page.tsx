"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, UserPlus, Upload, CalendarDays, CircleHelp } from "lucide-react";
import { getSchoolProfile, updateTerm } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/common/PageShell";
import type { SchoolProfile, UpdateTerm } from "@/lib/api/types";
import { FadeIn } from "@/components/animations/FadeIn";
import { Section } from "@/components/cards/common";
import { 
  AttentionSection, 
  SchoolHero, 
  SchoolOverview,
  containerVariants, 
  cardVariants 
} from "@/components/cards/admin/dashboard";
import { Button } from "@/components/ui";
import { useOnboardingContext } from "@/components/onboarding/onboarding-provider";

const sessions = Array.from(
  { length: 10 },
  (_, i) => {
    const year = 2023 + i;
    return `${year}-${year + 1}`;
  }
);

// ── Term modal ────────────────────────────────────────────────────────────────

function TermModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: SchoolProfile;
  onClose: () => void;
  onSaved: (start: string, end: string, session: string) => void;
}) {
  const { accessToken, refreshToken } = useAuth();

  const [termStart, setTermStart] = useState(profile.termStart ?? "");
  const [termEnd, setTermEnd] = useState(profile.termEnd ?? "");
  const [session, setSession] = useState(profile.session ?? "")
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startDateRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(
      e: KeyboardEvent
    ) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      )
  }, [onClose])

  async function handleSave() {
    if (!termStart || !termEnd || !session.trim()) {
      setError("Both dates and session are required.");
      return;
    }
    if (termEnd <= termStart) {
      setError("Term end must be after term start.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateTerm({ termStart, termEnd, session } satisfies UpdateTerm, accessToken!, refreshToken);
      onSaved(termStart, termEnd, session);
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
    <motion.div
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      initial={{ opacity:0 }}
      animate={{ opacity:1, }}
      exit={{ opacity:0, }}
      transition={{ duration:.2 }}
    >
      <motion.div 
        className="w-full max-w-sm bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-5"
        initial={{ opacity: 0, scale:.95, y:20 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:.95, y:20, }}
        transition={{ duration:.25, ease:"easeOut", }}
      >
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Update term dates
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Changes take effect immediately for all students.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[var(--color-text-secondary)]">
            Session
          </label>
          <select
            className="h-9 rounded-lg border border-border bg-bg-card px-3 
              text-sm focus:outline-none focus:ring-2
              focus:ring-purple-mid
            "
            value={session}
            onChange={(e) => setSession(e.target.value)}
          >
            <option value="">Select session</option>

            {sessions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-xs text-text-secondary">
              <CalendarDays size={14}/>
              Term start
            </label>
            <input
              ref={startDateRef}
              type="date"
              value={termStart}
              onChange={(e) => setTermStart(e.target.value)}
              className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-xs text-text-secondary">
              <CalendarDays size={14}/>
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
            className=" h-10 px-5 rounded-xl border border-[var(--color-border)] 
              text-sm font-medium text-[var(--color-text-secondary)] 
              hover:bg-[var(--color-bg-page)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-4 rounded-xl bg-[var(--color-purple)] text-white 
              text-sm font-semibold hover:opacity-90 transition-all
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
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
    <motion.button
      onClick={() =>  {
        if (action.onClick) {
          action.onClick();
        } else if (action.href) {
          router.push(action.href);
        }
      }}
      className="group relative overflow-hidden rounded-2xl border border-border
        bg-bg-card p-5 text-left transition-all duration-200
        hover:-translate-y-1 hover:border-purple-mid hover:shadow-lg
      "
      variants={cardVariants}
      initial="rest"
      transition={{
        duration: 0.35,
      }}
      whileHover="hover"
      whileTap="tap"
    >
      {/* icon */}

      <motion.div
        className={`mb-5 flex h-12 w-12 items-center
          justify-center rounded-xl transition-transform
          duration-200 ${action.accent}
        `}
        whileHover={{
          rotate: -5,
          scale: 1.12,
        }}
      >
        {action.icon}
      </motion.div>

      <h3 className="text-base font-semibold text-text-primary">
        {action.label}
      </h3>

      <p className="mt-2 text-sm text-text-muted leading-6">
        {action.description}
      </p>

      <motion.div
        className="mt-6 flex items-center text-sm font-medium
          text-purple-mid opacity-0 transition-all duration-200
        "
        variants={{
          rest: { opacity: 0,  x: -8, },
          hover: { opacity: 1, x: 0 }
        }}
      >
        Open →
      </motion.div>
    </motion.button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { accessToken, refreshToken } = useAuth();

  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termModalOpen, setTermModalOpen] = useState(false);

  const router = useRouter();
  const { startTour } = useOnboardingContext();

  useEffect(() => {
    if (!accessToken) return;

    getSchoolProfile(accessToken, refreshToken)
      .then(setProfile)
      .catch(() => setError("Failed to load school profile."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  const quickActions: QuickAction[] = [
    {
      label: "Register student",
      description: "Add a single student to the school roster.",
      href: "/admin/students/new",
      accent: "bg-[var(--color-purple-light)]",
      icon: <UserPlus className="w-5 h-5 text-purple-mid" />
    },
    {
      label: "Bulk import students",
      description: "Paste a list to register multiple students at once.",
      href: "/admin/students/bulk",
      accent: "bg-cyan-light",
      icon: <Upload className="w-5 h-5 text-cyan-dark" />
    },
    {
      label: "View modules",
      description: "Browse curriculum.",
      href: "/admin/modules",
      accent: "bg-purple-light",
      icon: <BookOpen className="w-5 h-5 text-purple-dark" />
    },
    {
      label: "Manage term",
      description: "Update the current term start and end dates.",
      onClick: () => setTermModalOpen(true),
      accent: "bg-success-light",
      icon: <CalendarDays className="w-5 h-5 text-success-dark" />
    },
  ];

  const studentActions = quickActions.slice(0, 2);
  const academicActions = quickActions.slice(2);

  return (
    <PageShell title={"Dashboard"}>
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      ) : !profile ? (
        <div className="rounded-xl border border-danger bg-danger-light p4">
          <h3 className="font-semibold text-danger-dark">
            Unable to load school profile
          </h3>
          <p className="mt-1 text-sm text-danger-dark">
            Your account isn&apos;t linked ot a school. Please contact Hammet support
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* Header */}
          <FadeIn>
            <div data-tour="school-hero">
              <SchoolHero profile={profile} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startTour("school-dashboard")}
            >
              <CircleHelp className="h-4 w-4 mr-2" />
              Replay Tour
            </Button>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div data-tour="school-overview">
              <SchoolOverview 
                profile={profile}
                onManageTerm={() => setTermModalOpen(true)}
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.16}>
            <Section
              title="Needs Attention"
              description="Items that may require action" 
            >
              <div data-tour="needs-attention">
                <AttentionSection
                  attention={profile.attention}
                  onPendingInvitations={() =>
                    router.push("/admin/students?status=pending")
                  }

                  onPendingSubmissions={() =>
                    router.push("/admin/submissions?status=pending")
                  }

                  onCapacity={() =>
                    router.push("/admin/students")
                  }
                />
              </div>
            </Section>
          </FadeIn>
          
          <FadeIn delay={0.32}>
            <Section
              title="Quick Actions"
              description="Frequently used administrative tools"
            >
              {/* Quick actions */}
              <div>
                <div className="space-y-8">

                  <section>

                    <h2
                      className="mb-4 text-lg font-semibold text-text-primary"
                      style={{ fontFamily: "var(--font-head)" }}
                    >
                      Student Management
                    </h2>

                    <motion.div 
                      className="grid gap-3 md:grid-cols-2"
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, }}
                      data-tour="student-management"
                    >
                      {studentActions.map((action) => (
                        <QuickActionCard key={action.label} action={action} />
                      ))}
                    </motion.div>
                  </section>

                  <section>
                    <h2
                      className="mb-4 text-lg font-semibold text-text-primary"
                      style={{ fontFamily: "var(--font-head)" }}
                    >
                      Academics
                    </h2>

                    <motion.div 
                      className="grid gap-3 md:grid-cols-2"
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, }}
                      data-tour="school-card"
                    >
                      {academicActions.map((action) => (
                        <QuickActionCard key={action.label} action={action} />
                      ))}
                    </motion.div>
                  </section>
                </div>
              </div>
            </Section>
          </FadeIn>
        </div>
      )}

      {/* Term modal — rendered outside the scroll container */}
      <AnimatePresence>
        {termModalOpen && profile && (
          <TermModal
            profile={profile}
            onClose={() => setTermModalOpen(false)}
            onSaved={(start, end, session) => {
              setProfile((prev) =>
                prev ? { ...prev, termStart: start, termEnd: end, session: session } : prev
              );
              setTermModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </PageShell>
  );
}