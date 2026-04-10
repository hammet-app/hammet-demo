"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getModulesForLevel } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { ModuleSummary } from "@/lib/api/api-types";

const TERM_LABELS: Record<number, string> = {
  1: "First Term",
  2: "Second Term",
  3: "Third Term",
};

export default function AdminModulesTermsPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const params = useParams<{ level: string }>();
  const level = decodeURIComponent(params.level);

  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    Promise.allSettled(
      [1, 2, 3].map((t) =>
        getModulesForLevel(t, level, accessToken, refreshToken).then(
          (res) => res.modules
        )
      )
    )
      .then((results) => {
        const all: ModuleSummary[] = [];
        results.forEach((r) => {
          if (r.status === "fulfilled") all.push(...r.value);
        });
        setModules(all);
      })
      .catch(() => setError("Failed to load modules."))
      .finally(() => setLoading(false));
  }, [accessToken, refreshToken, level]);

  const terms = [...new Set(modules.map((m) => m.term))].sort(
    (a, b) => a - b
  );

  return (
    <PageShell
      title={level}
      description={`${terms.length} ${terms.length === 1 ? "term" : "terms"}`}
      backHref="/admin/modules"
    >
      {loading ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      ) : terms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-[var(--color-text-secondary)] text-sm">
            No published modules for {level} yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {terms.map((term) => {
            const termMods = modules.filter((m) => m.term === term);
            const label = TERM_LABELS[term] ?? `Term ${term}`;

            return (
              <button
                key={term}
                onClick={() =>
                  router.push(`/admin/modules/${level}/${term}`)
                }
                className="group w-full text-left bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[var(--color-purple)] hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-purple-light)] flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-[var(--color-purple)]">
                    T{term}
                  </span>
                </div>

                <p className="font-semibold text-[var(--color-text-primary)] text-lg mb-1">
                  {label}
                </p>

                <p className="text-sm text-[var(--color-text-secondary)]">
                  {termMods.length}{" "}
                  {termMods.length === 1 ? "module" : "modules"}
                </p>

                <div className="mt-4 flex items-center gap-1 text-[var(--color-purple)] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  View modules
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
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