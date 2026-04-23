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
    if (!accessToken || !user?.class_level) return;

    async function load() {
      try {
        const [modulesData, progressData] = await Promise.all([
          studentApi.getModules(
            1, // current term — expand later when multi-term is needed
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
      {isLoading ? (
        <>
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-bg-card border border-border rounded-[10px] h-24 animate-pulse" />
            ))}
          </div>
          <ListSkeleton rows={6} />
        </>
      ) : error ? (
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          {error}
        </div>
      ) : (
        <>
          {/* Term progress stats */}
          {tp && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard
                label="Total modules"
                value={tp.total_modules}
                icon={BookOpen}
                iconVariant="purple"
              />
              <StatCard
                label="Submitted"
                value={tp.submitted_modules}
                sub={`${Math.round((tp.submitted_modules / tp.total_modules) * 100)}% done`}
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
                sub={tp.flagged_modules > 0 ? "Needs revision" : undefined}
                icon={Flag}
                iconVariant={tp.flagged_modules > 0 ? "amber" : "purple"}
              />
            </div>
          )}

          {/* Term progress bar */}
          {tp && (
            <div className="bg-bg-card border border-border rounded-[10px] px-4 py-3 mb-6 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-text-secondary font-medium">
                    Term {progress?.current_term} progress
                  </span>
                  <span className="text-cyan font-semibold">
                    {Math.round((tp.approved_modules / tp.total_modules) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round((tp.approved_modules / tp.total_modules) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-semibold text-text-primary">
                  {tp.approved_modules} / {tp.total_modules}
                </p>
                <p className="text-[11px] text-text-muted">modules approved</p>
              </div>
            </div>
          )}

          {/* Module list grouped by week */}
          {Object.keys(byWeek)
            .map(Number)
            .sort((a, b) => a - b)
            .map((week, index, arr) => {
              const module = byWeek[week][0]; // only one module per week

              let unlocked = true;

              if (index > 0) {
                const prevWeek = arr[index - 1];
                const prevModule = byWeek[prevWeek][0];
                const prevStatus = statusMap.get(prevModule.id);

                unlocked =
                  prevStatus === "submitted" || prevStatus === "approved";
              }

              return (
                <div key={week} className="mb-6">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2.5">
                    Week {week}
                  </p>

                  <ModuleCard
                    key={module.id}
                    title={module.title}
                    weekNumber={module.week_number}
                    term={module.term}
                    status={statusMap.get(module.id) ?? "not_started"}
                    locked={!unlocked}
                    onClick={() => {
                      if (!unlocked) return;
                      router.push(`/student/lessons/${module.id}`);
                    }}
                  />
                </div>
              );
            })}
        </>
      )}
    </PageShell>
  );
}
