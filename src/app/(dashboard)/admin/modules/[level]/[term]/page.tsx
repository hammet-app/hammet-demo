"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getAdminModules } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { CurriculumModule } from "@/lib/api/api-types";


export default function AdminModulesListPage() {
  const { accessToken, refreshToken } = useAuth();
    const router = useRouter();
    const params = useParams<{ level: string; term: string }>();
  
    const level = decodeURIComponent(params.level);
    const term = Number(params.term);
  
    const [modules, setModules] = useState<CurriculumModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      if (!accessToken) return;
  
      getAdminModules(accessToken, refreshToken)
        .then((res) => {
          setModules(
            res.modules
              .filter((m) => m.level === level && m.term === term)
              .sort((a, b) => a.week_number - b.week_number)
          );
        })
        .catch(() => setError("Failed to load modules."))
        .finally(() => setIsLoading(false));
    }, [accessToken, refreshToken, level, term]);
  
    const TERM_LABELS: Record<number, string> = {
      1: "First Term",
      2: "Second Term",
      3: "Third Term",
    };
  
    const termLabel = TERM_LABELS[term] ?? `Term ${term}`;
  
    return (
      <PageShell
        title={`${level} — ${termLabel}`}
        description={`${modules.length} ${
          modules.length === 1 ? "module" : "modules"
        }`}
        backHref={`/admin/modules/${level}`}
      >
        {isLoading ? (
          <ListSkeleton rows={6} />
        ) : error ? (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        ) : modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            No modules found
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-purple-light)] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[var(--color-purple)]">
                      W{mod.week_number}
                    </span>
                  </div>
  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{mod.title}</p>
  
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {mod.content_json.sections.length} blocks · Last updated{" "}
                      {new Date(mod.updated_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageShell>
    );
  }