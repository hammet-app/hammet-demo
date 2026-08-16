"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { studentApi } from "@/lib/api/student";
import { PageShell, StatsSkeleton, ListSkeleton } from "@/components/layout/common/PageShell";
import { StatCard } from "@/components/cards/stat-card";
import { BookOpen, CheckCircle2, Flag, Clock } from "lucide-react";
import type { StudentProgress, ModuleProgress } from "@/lib/api/types";
import { cn } from "@/lib/utils/utils";
import { ProgressHero } from "@/components/cards/student/progress";
import { WeeklyProgressSection } from "@/components/cards/student/progress/WeeklyProgress";

export default function ProgressPage() {
  const { accessToken, refreshToken, user } = useAuth();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  

  useEffect(() => {
    if (!accessToken) return;
    studentApi
      .getProgress(accessToken, refreshToken)
      .then(setProgress)
      .catch(() => setError("Failed to load progress. Please try again."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  const tp = progress?.termProgress;
  const completedModules = tp
    ? Math.max(tp.submittedModules - tp.flaggedModules, 0)
    : 0;

  const completedPct = tp
    ? Math.round((completedModules / tp.totalModules) * 100)
    : 0;
  const submittedPct = tp
    ? Math.round((tp.submittedModules / tp.totalModules) * 100)
    : 0;

  // Group modules by week
  const byWeek = (progress?.modules ?? []).reduce<
    Record<number, ModuleProgress[]>
  >((acc, m) => {
    if (!acc[m.weekNumber]) acc[m.weekNumber] = [];
    acc[m.weekNumber].push(m);
    return acc;
  }, {});

  const weeks = Object.keys(byWeek)
    .map(Number)
    .sort((a, b) => a - b);

  const currentWeek =
    weeks.find((week) => !byWeek[week].every((m) => m.completed)) ??
    weeks.at(-1) ??
    0;

  const summaryStats = tp ? [
    {
      label: "Completed",
      value: completedModules,
      icon: CheckCircle2,
      iconVariant: "green" as const,
    },
    {
      label: "Submitted",
      value: tp.submittedModules,
      icon: Clock,
      iconVariant: "cyan" as const
    },
    {
      label: "Remaining",
      value: Math.max(tp.totalModules - completedModules, 0),
      icon: BookOpen,
      iconVariant: "purple" as const,
    },
    {
      label: "Flagged",
      value: tp.flaggedModules,
      icon: Flag,
      iconVariant: tp.flaggedModules>0 ? ("amber" as const) : ("green" as const),
    },
  ]
  : [];

  return (
    <PageShell
      title="My Progress"
      description={
        progress
          ? `Term ${progress.currentTerm} · ${progress.currentLevel}${user?.classArm ?? ""}`
          : undefined
      }
    >
      {isLoading ? (
        <>
          <StatsSkeleton />
          <ListSkeleton rows={8} />
        </>
      ) : error ? (
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          {error}
        </div>
      ) : (
        <>
          {tp && (
            <>
              <ProgressHero
                totalModules={tp?.totalModules}
                completedModules={completedModules}
                submittedModules={tp.submittedModules}
                currentWeek={currentWeek}
              />
            
              <div className="relative">

                {tp && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    {summaryStats.map((stat) => (
                      <StatCard key={stat.label} {...stat}/>
                    ))

                    }
                  </div>
                )}


                <div className="bg-bg-page border border-border rounded-[14px] p-4 mb-0 flex flex-col gap-4">
                  <ProgressBar
                    label="Completed"
                    pct={completedPct}
                    color="bg-cyan"
                    value={`${completedModules} / ${tp.totalModules}`}
                  />
                  <ProgressBar
                    label="Submitted"
                    pct={submittedPct}
                    color="bg-purple-mid"
                    value={`${tp.submittedModules} / ${tp.totalModules}`}
                  />
                </div>
              </div>
            </>
          )}
            
          <WeeklyProgressSection
            weeks={byWeek}
            currentWeek={currentWeek}
          />
        </>
      )}
    </PageShell>
  );
}

function ProgressBar({
  label,
  pct,
  color,
  value,
}: {
  label: string;
  pct: number;
  color: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-1.5">
        <span className="text-text-secondary font-medium">{label}</span>
        <span className="text-text-secondary tabular-nums">{value}</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

