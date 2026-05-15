"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { studentApi } from "@/lib/api/student";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { ModuleCard } from "@/components/cards/module-card";
import { StatCard } from "@/components/cards/stat-card";
import { BookOpen, CheckCircle2, Flag, Clock } from "lucide-react";
import type { ModuleSummary, StudentProgress } from "@/lib/api/api-types";
import { ApiError } from "@/lib/api/api-client";
import type { SubmissionStatus } from "@/components/ui/status-pill";

export default function LessonsPage() {
  const { accessToken, refreshToken, user } = useAuth();
  const router = useRouter();

  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken || !user?.class_level || !user?.term) return;

    async function load() {
      try {
        const [modulesData, progressData] = await Promise.all([
          studentApi.getModules(
            user!.term!, // current term — expand later when multi-term is needed
            user!.class_level!,
            accessToken!,
            refreshToken
          ),
          studentApi.getProgress(accessToken!, refreshToken),
        ]);
        setModules(modulesData.modules);
        setProgress(progressData);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 401) {
            setError("Authentication required. Please log in again.");
          } else if (err.status === 403) {
            setError("You are not allowed to access these lessons.");
          } else if (err.status === 404) {
            setError("Lessons not found.");
          } else if (err.status === 409) {
            setError("Conflict while loading lessons.");
          } else if (err.status === 400 || err.status === 422) {
            setError(`Invalid request. ${err.message}`);
          } else if (err.status === 500) {
            setError("Server error. Please try again.");
          } else {
            setError(err.message);
          }
        } else if (err instanceof Error) {
          setError(`Unable to connect. ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [accessToken, user?.class_level]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build a map of moduleId → submission status from progress data
  const statusMap = new Map<string, SubmissionStatus>(
  (progress?.modules ?? []).map((m) => [
    m.module_id,
    m.submission_status as SubmissionStatus,
  ])
);

  // Group modules by week
  const byWeek = modules.reduce<Record<number, ModuleSummary[]>>((acc, m) => {
    if (!acc[m.week_number]) acc[m.week_number] = [];
    acc[m.week_number].push(m);
    return acc;
  }, {});

  const tp = progress?.term_progress;

  return (
    <PageShell
      title="My Lessons"
      description={
        user?.class_level
          ? `Term ${progress?.current_term ?? "—"} · ${user.class_level}${user.class_arm ?? ""}`
          : undefined
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <>
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[111px] rounded-[10px] border border-purple-dark/20 bg-white animate-pulse"
                />
              ))}
            </div>

            <ListSkeleton rows={6} />
          </>
        ) : error ? (
          <div className="rounded-[10px] border border-danger/20 bg-danger-light px-4 py-3 text-[13px] text-danger">
            {error}
          </div>
        ) : (
          <>
            {/* Hero section */}
            <div className="relative overflow-hidden rounded-[10px] bg-purple-dark px-5 py-4 shadow-[0px_10px_23.5px_rgba(0,0,0,0.37)]">
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-[18px] font-semibold text-white">
                    My Lessons
                  </h2>

                  <div className="flex items-center gap-[9px]">
                    <span className="text-[13px] text-white">
                      Term {progress?.current_term ?? "—"}
                    </span>

                    {user?.class_level && (
                      <span className="rounded-[4px] bg-white/35 px-[11px] py-[2px] text-[11px] text-white">
                        {user.class_level}
                        {user.class_arm ?? ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute -right-20 -top-20 h-[220px] w-[220px] rounded-full bg-white/10 blur-3xl" />
            </div>

            {/* Term progress stats */}
            {tp && (
              <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2">
                <StatCard
                  label="Total modules"
                  value={tp.total_modules}
                  icon={BookOpen}
                  iconVariant="purple"
                />

                <StatCard
                  label="Submitted"
                  value={tp.submitted_modules}
                  sub={`${Math.round(
                    (tp.submitted_modules / tp.total_modules) * 100
                  )}% done`}
                  icon={Clock}
                  iconVariant="cyan"
                />

                <StatCard
                  label="Approved"
                  value={tp.approved_modules}
                  icon={CheckCircle2}
                  iconVariant="green"
                />

                <StatCard
                  label="Flagged"
                  value={tp.flagged_modules}
                  sub={
                    tp.flagged_modules > 0
                      ? "Needs revision"
                      : undefined
                  }
                  icon={Flag}
                  iconVariant={
                    tp.flagged_modules > 0
                      ? "amber"
                      : "purple"
                  }
                />
              </div>
            )}

            {/* Term progress bar */}
            {tp && (
              <div className="flex flex-col gap-4 rounded-[10px] border border-purple-dark bg-white px-5 py-4 shadow-[0px_10px_25px_rgba(0,0,0,0.15)] lg:flex-row lg:items-center">
                <div className="flex-1">
                  <div className="mb-[6px] flex items-center justify-between">
                    <span className="text-[12px] font-medium text-text-secondary">
                      Term {progress?.current_term} Progress
                    </span>

                    <span className="text-[12px] font-semibold text-cyan">
                      {Math.round(
                        (tp.approved_modules / tp.total_modules) * 100
                      )}
                      %
                    </span>
                  </div>

                  <div className="h-[7px] overflow-hidden rounded-full bg-[#EDEDED]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-dark via-[#8A38F5] to-cyan transition-all duration-500"
                      style={{
                        width: `${Math.round(
                          (tp.approved_modules / tp.total_modules) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[14px] font-semibold text-text-primary">
                    {tp.approved_modules} / {tp.total_modules}
                  </p>

                  <p className="text-[11px] text-text-muted">
                    modules approved
                  </p>
                </div>
              </div>
            )}

            {/* Module list grouped by week */}
            <div className="rounded-t-[20px] bg-white px-5 py-6">
              {Object.keys(byWeek)
                .map(Number)
                .sort((a, b) => a - b)
                .map((week, index, arr) => {
                  const module = byWeek[week][0];

                  let unlocked = true;

                  if (index > 0) {
                    const prevWeek = arr[index - 1];
                    const prevModule = byWeek[prevWeek][0];
                    const prevStatus = statusMap.get(prevModule.id);

                    unlocked =
                      prevStatus === "submitted" ||
                      prevStatus === "approved";
                  }

                  return (
                    <div key={week} className="mb-4">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                        Week {week}
                      </p>

                      <ModuleCard
                        key={module.id}
                        title={module.title}
                        weekNumber={module.week_number}
                        term={module.term}
                        status={
                          statusMap.get(module.id) ?? "not_started"
                        }
                        locked={!unlocked}
                        onClick={() => {
                          if (!unlocked) return;

                          router.push(
                            `/student/lessons/${module.id}`
                          );
                        }}
                      />
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
