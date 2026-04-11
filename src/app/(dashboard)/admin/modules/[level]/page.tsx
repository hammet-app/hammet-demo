"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getAdminModules } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { CurriculumModule } from "@/lib/api/api-types";

export default function AdminModulesLevelsPage() {
  const { accessToken, refreshToken } = useAuth();
    const router = useRouter();
    const params = useParams<{ level: string }>();
    const level = decodeURIComponent(params.level);
  
    const [modules, setModules] = useState<CurriculumModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      if (!accessToken) return;
  
      getAdminModules(accessToken, refreshToken)
        .then((res) => {
          setModules(res.modules.filter((m) => m.level === level));
        })
        .catch(() => setError("Failed to load modules."))
        .finally(() => setIsLoading(false));
    }, [accessToken, refreshToken, level]);
  
    const terms = [...new Set(modules.map((m) => m.term))].sort((a, b) => a - b);
  
    function getTermStats(term: number) {
      const termModules = modules.filter((m) => m.term === term);
      const published = termModules.filter((m) => m.published).length;
  
      return {
        total: termModules.length,
        published,
        draft: termModules.length - published,
      };
    }
  
    const TERM_LABELS: Record<number, string> = {
      1: "First Term",
      2: "Second Term",
      3: "Third Term",
    };
  
    return (
      <PageShell
        title={level}
        description={`${terms.length} ${terms.length === 1 ? "term" : "terms"}`}
        backHref="/admin/modules"
      >
        {isLoading ? (
          <ListSkeleton rows={3} />
        ) : error ? (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        ) : terms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              No modules for {level} yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {terms.map((term) => {
              const stats = getTermStats(term);
              const label = TERM_LABELS[term] ?? `Term ${term}`;
  
              return (
                <button
                  key={term}
                  onClick={() =>
                    router.push(`/admin/modules/${level}/${term}`)
                  }
                  className="group w-full text-left bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[var(--color-purple)] hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-purple-light)] flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-[var(--color-purple)]">
                      T{term}
                    </span>
                  </div>
  
                  <p className="font-semibold text-lg mb-1">{label}</p>
  
                  <div className="flex flex-col gap-1 mb-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {stats.total} modules
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
                    View modules →
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </PageShell>
    );
  }