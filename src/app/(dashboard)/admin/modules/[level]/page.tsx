"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getSchoolProfile, getModulesForLevel } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { ModuleSummary } from "@/lib/api/api-types";

const LEVEL_ORDER = ["JS1", "JS2", "JS3", "SS1", "SS2", "SS3"];

const LEVEL_ACCENTS: Record<string, { bg: string; text: string; border: string }> = {
  JS1: { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200" },
  JS2: { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
  JS3: { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200" },
  SS1: { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200" },
  SS2: { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200" },
  SS3: { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200" },
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

export default function AdminModulesLevelsPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [term, setTerm] = useState<number | null>(null);
  const [modulesByLevel, setModulesByLevel] = useState<Record<string, ModuleSummary[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getSchoolProfile(accessToken, refreshToken)
      .then(async (profile) => {
        setTerm(profile.term);

        const results = await Promise.allSettled(
          LEVEL_ORDER.map((level) =>
            getModulesForLevel(profile.term, level, accessToken, refreshToken)
              .then((res) => ({ level, modules: res.modules }))
          )
        );

        const map: Record<string, ModuleSummary[]> = {};
        results.forEach((r) => {
          if (r.status === "fulfilled" && r.value.modules.length > 0) {
            map[r.value.level] = r.value.modules;
          }
        });

        setModulesByLevel(map);
      })
      .catch(() => setError("Failed to load curriculum."))
      .finally(() => setLoading(false));
  }, [accessToken, refreshToken]);

  const levels = LEVEL_ORDER.filter((l) => modulesByLevel[l]?.length > 0);

  return (
    <PageShell
      title="Curriculum"
      description="Published modules your students are following"
    >
      {loading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      ) : levels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-[var(--color-text-secondary)] text-sm">
            No published modules yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => {
            const mods = modulesByLevel[level];
            const accent = getAccent(level);

            return (
              <button
                key={level}
                onClick={() => router.push(`/admin/modules/${level}`)}
                className="group w-full text-left bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[var(--color-purple)] hover:shadow-md transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl ${accent.bg} border ${accent.border} flex items-center justify-center mb-4`}>
                  <span className={`text-sm font-bold ${accent.text}`}>
                    {level}
                  </span>
                </div>

                <p className="font-semibold text-[var(--color-text-primary)] text-lg mb-1">
                  {level}
                </p>

                <p className="text-sm text-[var(--color-text-secondary)]">
                  {mods.length} published {mods.length === 1 ? "module" : "modules"} · Term {term}
                </p>

                <div className="mt-4 flex items-center gap-1 text-[var(--color-purple)] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  View modules
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}