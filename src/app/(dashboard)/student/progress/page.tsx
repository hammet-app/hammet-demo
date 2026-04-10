"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { studentApi } from "@/lib/api/student";
import { PageShell, StatsSkeleton, ListSkeleton } from "@/components/layout/page-shell";
import { StatCard } from "@/components/cards/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { BookOpen, CheckCircle2, Flag, Clock } from "lucide-react";
import type { StudentProgress, ModuleProgress } from "@/lib/api/api-types";
import { cn } from "@/lib/utils/utils";

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
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const tp = progress?.term_progress;
  const approvedPct = tp
    ? Math.round((tp.approved_modules / tp.total_modules) * 100)
    : 0;
  const submittedPct = tp
    ? Math.round((tp.submitted_modules / tp.total_modules) * 100)
    : 0;

  // Group modules by week
  const byWeek = (progress?.modules ?? []).reduce<
    Record<number, ModuleProgress[]>
  >((acc, m) => {
    if (!acc[m.week_number]) acc[m.week_number] = [];
    acc[m.week_number].push(m);
    return acc;
  }, {});

  return (
    <PageShell
      title="My Progress"
      description={
        progress
          ? `Term ${progress.current_term} · ${progress.current_level}${user?.class_arm ?? ""}`
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
          {/* Stat cards */}
          {tp && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total modules" value={tp.total_modules} icon={BookOpen} iconVariant="purple" />
              <StatCard label="Submitted" value={tp.submitted_modules} icon={Clock} iconVariant="cyan" />
              <StatCard label="Approved" value={tp.approved_modules} icon={CheckCircle2} iconVariant="green" />
              <StatCard label="Flagged" value={tp.flagged_modules} icon={Flag} iconVariant={tp.flagged_modules > 0 ? "amber" : "purple"} />
            </div>
          )}

          {/* Progress bars */}
          {tp && (
            <div className="bg-bg-card border border-border rounded-[10px] p-4 mb-6 flex flex-col gap-4">
              <ProgressBar
                label="Approved"
                pct={approvedPct}
                color="bg-cyan"
                value={`${tp.approved_modules} / ${tp.total_modules}`}
              />
              <ProgressBar
                label="Submitted"
                pct={submittedPct}
                color="bg-purple-mid"
                value={`${tp.submitted_modules} / ${tp.total_modules}`}
              />
            </div>
          )}

          {/* Module breakdown by week */}
          {Object.entries(byWeek)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([week, mods]) => (
              <div key={week} className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2.5">
                  Week {week}
                </p>
                <div className="bg-bg-card border border-border rounded-[10px] overflow-hidden divide-y divide-border">
                  {mods?.map((m) => (
                    <ModuleProgressRow key={m.module_id} module={m} />
                  ))}
                </div>
              </div>
            ))}
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

function ModuleProgressRow({ module: m }: { module: ModuleProgress }) {
  const date = m.submitted_at
    ? new Date(m.submitted_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-7 h-7 rounded-[6px] bg-purple-light text-purple flex items-center justify-center text-[11px] font-bold shrink-0">
        {m.week_number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-text-primary truncate">{m.title}</p>
        {date && (
          <p className="text-[11px] text-text-muted">Submitted {date}</p>
        )}
      </div>
      <StatusPill status={m.submission_status as any} />
    </div>
  );
}
