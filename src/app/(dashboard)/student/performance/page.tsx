"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { performanceApi } from "@/lib/api/performance";
import type { PerformancePoint, PerformanceParams } from "@/lib/api/performance";
import { PerformanceChart } from "@/components/cards/performance-chart";
import { PageShell, CardSkeleton } from "@/components/layout/page-shell";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/utils";

const TERMS = [
  { value: 1, label: "Term 1" },
  { value: 2, label: "Term 2" },
  { value: 3, label: "Term 3" },
];

const BAND_META = {
  "Needs Work": {
    color: "text-warning-dark",
    bg: "bg-warning-light",
    border: "border-warning/20",
    dot: "bg-warning",
  },
  Improving: {
    color: "text-purple-hover",
    bg: "bg-purple-light",
    border: "border-purple-mid/20",
    dot: "bg-purple-mid",
  },
  Strong: {
    color: "text-success-dark",
    bg: "bg-success-light",
    border: "border-success/20",
    dot: "bg-success",
  },
};

export default function PerformancePage() {
  const { accessToken, refreshToken, user } = useAuth();

  // Filter state — null means "not selected"
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(
    user?.class_level ?? null
  );

  const [data, setData] = useState<PerformancePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Derive available levels from data (only levels the student has submissions for)
  const availableLevels = useMemo(
    () => [...new Set(data.map((d) => d.level))].sort(),
    [data]
  );

  // ── Build query params based on filter selection logic ──
  function buildParams(): PerformanceParams {
    const hasLevel = selectedLevel !== null;
    const hasTerm = selectedTerm !== null;

    if (hasLevel && !hasTerm) {
      // Level only → all terms for that level
      return { level: selectedLevel!, term: [1, 2, 3] };
    }

    if (hasTerm && !hasLevel) {
      // Term only → that term across all levels
      return { term: selectedTerm! };
    }

    if (hasLevel && hasTerm) {
      // Both → specific term + level
      return { term: selectedTerm!, level: selectedLevel! };
    }

    // Neither → default: current term + current level
    return {
      term: user?.class_level ? undefined : undefined,
      level: user?.class_level ?? undefined,
    };
  }

  useEffect(() => {
    if (!accessToken) return;

    setIsLoading(true);
    setError("");

    const params = buildParams();

    performanceApi
      .getPerformance(params, accessToken, refreshToken)
      .then(setData)
      .catch((err) => {
        // 404-style — no submissions yet
        if (err?.status === 404 || err?.message?.includes("No submissions")) {
          setData([]);
        } else {
          setError("Failed to load performance data. Please try again.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [accessToken, selectedTerm, selectedLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Current band from last data point ──
  const currentBand = data.length
    ? data[data.length - 1].band
    : null;

  // ── Band distribution for summary ──
  const bandCounts = data.reduce(
    (acc, d) => {
      acc[d.band] = (acc[d.band] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <PageShell
      title="My Performance"
      description="Your learning trajectory over time"
    >
      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-6 mb-6">
        {/* Term filter */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
            Term
          </p>
          <div className="flex gap-2 flex-wrap">
            {TERMS.map((t) => (
              <FilterChip
                key={t.value}
                label={t.label}
                active={selectedTerm === t.value}
                onClick={() =>
                  setSelectedTerm(
                    selectedTerm === t.value ? null : t.value
                  )
                }
              />
            ))}
          </div>
        </div>

        {/* Level filter — only show levels with data */}
        {availableLevels.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
              Class
            </p>
            <div className="flex gap-2 flex-wrap">
              {availableLevels.map((level) => (
                <FilterChip
                  key={level}
                  label={level}
                  active={selectedLevel === level}
                  onClick={() =>
                    setSelectedLevel(
                      selectedLevel === level ? null : level
                    )
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Chart card ── */}
      {isLoading ? (
        <CardSkeleton className="h-[400px]" />
      ) : error ? (
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          {error}
        </div>
      ) : data.length === 0 ? (
        <EmptyPerformance />
      ) : (
        <>
          {/* Current band summary */}
          {currentBand && (
            <div
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-4 py-3 mb-4 border",
                BAND_META[currentBand].bg,
                BAND_META[currentBand].border
              )}
            >
              <TrendingUp
                size={18}
                className={BAND_META[currentBand].color}
              />
              <div>
                <p
                  className={cn(
                    "text-[13px] font-semibold",
                    BAND_META[currentBand].color
                  )}
                >
                  Currently: {currentBand}
                </p>
                <p className="text-[12px] text-text-muted">
                  Based on your most recent submissions
                </p>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="bg-bg-card border border-border rounded-[14px] p-5 mb-4">
            <PerformanceChart data={data} />
          </div>

          {/* Band distribution */}
          <div className="grid grid-cols-3 gap-3">
            {(["Strong", "Improving", "Needs Work"] as const).map((band) => {
              const count = bandCounts[band] ?? 0;
              const pct = data.length
                ? Math.round((count / data.length) * 100)
                : 0;
              const meta = BAND_META[band];

              return (
                <div
                  key={band}
                  className={cn(
                    "bg-bg-card border rounded-[10px] px-4 py-3 flex flex-col gap-1",
                    meta.border
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        meta.dot
                      )}
                    />
                    <p
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-wide",
                        meta.color
                      )}
                    >
                      {band}
                    </p>
                  </div>
                  <p
                    className="text-[22px] font-bold text-text-primary leading-none"
                    style={{ fontFamily: "var(--font-head)" }}
                  >
                    {pct}%
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {count} of {data.length} weeks
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </PageShell>
  );
}

// ── Filter chip ───────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-[12px] font-medium px-3.5 py-1.5 rounded-full border transition-colors",
        active
          ? "bg-purple text-white border-purple"
          : "bg-bg-card text-text-secondary border-border hover:border-purple hover:text-purple"
      )}
    >
      {label}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────

function EmptyPerformance() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-purple-light flex items-center justify-center">
        <TrendingUp size={26} className="text-purple-mid" />
      </div>
      <div>
        <p className="text-[15px] font-medium text-text-primary mb-1">
          No performance data yet
        </p>
        <p className="text-[13px] text-text-muted max-w-[260px] mx-auto leading-relaxed">
          Complete and submit lessons to start tracking your learning
          trajectory.
        </p>
      </div>
      <a
        href="/dashboard/student/lessons"
        className="mt-2 text-[13px] font-semibold text-purple-mid hover:text-purple transition-colors no-underline"
      >
        Go to My Lessons
      </a>
    </div>
  );
}
