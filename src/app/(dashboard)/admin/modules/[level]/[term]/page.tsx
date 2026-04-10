"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getModulesForLevel } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { ModuleSummary } from "@/lib/api/api-types";

const TERM_LABELS: Record<number, string> = {
  1: "First Term",
  2: "Second Term",
  3: "Third Term",
};

export default function AdminModulesListPage() {
  const { accessToken, refreshToken } = useAuth();
  const params = useParams<{ level: string; term: string }>();
  const level = decodeURIComponent(params.level);
  const term = Number(params.term);

  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getModulesForLevel(term, level, accessToken, refreshToken)
      .then((res) =>
        setModules(
          [...res.modules].sort((a, b) => a.week_number - b.week_number)
        )
      )
      .catch(() => setError("Failed to load modules."))
      .finally(() => setLoading(false));
  }, [accessToken, refreshToken, level, term]);

  const termLabel = TERM_LABELS[term] ?? `Term ${term}`;

  return (
    <PageShell
      title={`${level} — ${termLabel}`}
      description={`${modules.length} published ${
        modules.length === 1 ? "module" : "modules"
      }`}
      backHref={`/admin/modules/${level}`}
    >
      {loading ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      ) : modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-[var(--color-text-secondary)] text-sm">
            No published modules for {level}, {termLabel} yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-purple-light)] flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[var(--color-purple)]">
                  W{mod.week_number}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--color-text-primary)] truncate">
                  {mod.title}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Week {mod.week_number} · Term {mod.term}
                </p>
              </div>

              <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                Published
              </span>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}