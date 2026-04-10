"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getAdminModules } from "@/lib/api/hammet";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { CurriculumModule } from "@/lib/api/api-types";

const LEVEL_ORDER = ["JS1", "JS2", "JS3", "SS1", "SS2", "SS3"];

function sortLevels(levels: string[]): string[] {
  return [...levels].sort((a, b) => {
    const ai = LEVEL_ORDER.indexOf(a);
    const bi = LEVEL_ORDER.indexOf(b);

    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;

    return ai - bi;
  });
}

function getLevelStats(modules: CurriculumModule[], level: string) {
  const levelModules = modules.filter((m) => m.level === level);
  const terms = [...new Set(levelModules.map((m) => m.term))];
  const published = levelModules.filter((m) => m.published).length;

  return {
    total: levelModules.length,
    terms: terms.length,
    published,
  };
}

const LEVEL_ACCENTS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  JS1: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  JS2: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  JS3: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  SS1: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  SS2: {
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
  },
  SS3: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
};

function getAccent(level: string) {
  return (
    LEVEL_ACCENTS[level] ?? {
      bg: "bg-[var(--color-purple-light)]",
      text: "text-[var(--color-purple)]",
      border: "border-[var(--color-purple)]",
    }
  );
}

export default function HammetModulesPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getAdminModules(accessToken, refreshToken)
      .then((res) => setModules(res.modules))
      .catch(() => setError("Failed to load modules."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  const levels = sortLevels([...new Set(modules.map((m) => m.level))]);

  return (
    <PageShell
      title="Modules"
      description={`${modules.length} total across ${levels.length} levels`}
    >
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      ) : levels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-purple-light)] flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-[var(--color-purple)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>

          <p className="font-semibold mb-1">No modules yet</p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Create your first module to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => {
            const stats = getLevelStats(modules, level);
            const accent = getAccent(level);

            return (
              <button
                key={level}
                onClick={() =>
                  router.push(`/hammet/modules/${level}`)
                }
                className="group w-full text-left bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[var(--color-purple)] hover:shadow-md transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${accent.bg} border ${accent.border} flex items-center justify-center mb-4`}
                >
                  <span className={`text-sm font-bold ${accent.text}`}>
                    {level}
                  </span>
                </div>

                <p className="font-semibold text-lg mb-1">{level}</p>

                <div className="flex flex-col gap-1 mb-4">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {stats.terms} terms · {stats.total} modules
                  </p>

                  <p className="text-sm text-[var(--color-text-muted)]">
                    {stats.published} published ·{" "}
                    {stats.total - stats.published} draft
                  </p>
                </div>

                {stats.total > 0 && (
                  <div className="h-1.5 rounded-full bg-[var(--color-purple-light)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-cyan)]"
                      style={{
                        width: `${(stats.published / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                )}

                <div className="mt-4 text-sm text-[var(--color-purple)] opacity-0 group-hover:opacity-100 transition">
                  View terms →
                </div>
              </button>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}