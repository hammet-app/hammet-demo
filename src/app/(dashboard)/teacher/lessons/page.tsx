"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getTeacherClasses, getTeacherModules } from "@/lib/api/teacher";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { ModuleCard } from "@/components/cards/module-card";
import type { ModuleSummary } from "@/lib/api/api-types";
import { ApiError } from "@/lib/api/api-client";

export default function LessonsPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [classLevel, setClassLevel] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [error, setError] = useState("");

  // ── Load teacher classes ──
  useEffect(() => {
    if (!accessToken) return;

    async function loadClasses() {
      try {
        if(!accessToken) return;
        const res = await getTeacherClasses(accessToken, refreshToken);

        // extract unique levels
        const uniqueLevels = Array.from(
          new Set(res.classes.map((c) => c.level))
        );

        setLevels(uniqueLevels);

        // auto-select first level
        if (uniqueLevels.length > 0) {
          setClassLevel(uniqueLevels[0]);
        }
      } catch (err) {
        setError("Failed to load classes.");
      } finally {
        setIsLoading(false);
      }
    }

    loadClasses();
  }, [accessToken]);

  // ── Load modules when classLevel changes ──
  useEffect(() => {
    if (!accessToken || !classLevel) return;

    async function loadModules() {
      setIsLoadingModules(true);
      try {
        if(!accessToken) return;
        const res = await getTeacherModules(
          classLevel,
          accessToken,
          refreshToken
        );
        setModules(res.modules);
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
        } else {
          setError("Failed to load modules.");
        }
      } finally {
        setIsLoadingModules(false);
      }
    }
    loadModules();
  }, [accessToken, classLevel]);

  // ── Group modules by week ──
  const byWeek = modules.reduce<Record<number, ModuleSummary[]>>(
    (acc, m) => {
      if (!acc[m.week_number]) acc[m.week_number] = [];
      acc[m.week_number].push(m);
      return acc;
    },
    {}
  );

  return (
    <PageShell title="Lessons">

      {/* ── Level selector ── */}
      {!isLoading && levels.length > 0 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setClassLevel(lvl)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                lvl === classLevel
                  ? "bg-purple text-white"
                  : "bg-white border-border"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      )}

      {/* ── Loading states ── */}
      {isLoading || isLoadingModules ? (
        <ListSkeleton />
      ) : error ? (
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          {error}
        </div>
      ) : (
        Object.keys(byWeek)
          .map(Number)
          .sort((a, b) => a - b)
          .map((week, index, arr) => {
            const module = byWeek[week][0];

            if (index > 0) {
                const prevWeek = arr[index - 1];
                const prevModule = byWeek[prevWeek][0];
            }

            return (
              <div key={week} className="mb-6">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2.5">
                  Week {week}
                </p>

                <ModuleCard
                  title={module.title}
                  weekNumber={module.week_number}
                  term={module.term}
                  status={"not_started"}
                  onClick={() =>
                        router.push(`/teacher/lessons/${module.id}?level=${classLevel}`)
                    }
                />
              </div>
            );
          })
      )}
    </PageShell>
  );
}