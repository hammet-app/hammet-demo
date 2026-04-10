"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getAdminModules } from "@/lib/api/hammet";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { CurriculumModule } from "@/lib/api/api-types";

export default function HammetModulesListPage() {
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
      backHref={`hammet/modules/${level}`}
      actions={
        <button
          onClick={() =>
            router.push(`/hammet/modules/${level}/${term}/new`)
          }
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-purple)] text-white text-sm font-semibold hover:opacity-90 transition"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          New module
        </button>
      }
    >
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      ) : modules.length === 0 ? (
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>

          <p className="font-semibold mb-1">No modules yet</p>

          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Create the first module for {level}, {termLabel}.
          </p>

          <button
            onClick={() =>
              router.push(`/hammet/modules/${level}/${term}/new`)
            }
            className="px-4 py-2 rounded-xl bg-[var(--color-purple)] text-white text-sm font-semibold hover:opacity-90 transition"
          >
            Create module
          </button>
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
                    {mod.content_json.blocks.length} blocks · Last updated{" "}
                    {new Date(mod.updated_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    mod.published
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {mod.published ? "Published" : "Draft"}
                </span>

                <button
                  onClick={() =>
                    router.push(`/hammet/modules/edit/${mod.id}`)
                  }
                  className="p-2 rounded-lg hover:bg-[var(--color-purple-light)] text-[var(--color-text-muted)] hover:text-[var(--color-purple)] transition-colors"
                >
                  ✏️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}