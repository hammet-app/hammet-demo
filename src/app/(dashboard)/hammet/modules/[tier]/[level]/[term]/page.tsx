"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getHammetModules } from "@/lib/api/hammet";
import { PageShell, ListSkeleton } from "@/components/layout/common/PageShell";
import type { CurriculumModule } from "@/lib/api/types";


export default function HammetModulesListPage() {
  const { accessToken, refreshToken } = useAuth();
    const params = useParams<{ tier: string, level: string; term: string }>();
    const router = useRouter()
  
    const tier = decodeURIComponent(params.tier);
    const level = decodeURIComponent(params.level);
    const term = Number(params.term);
  
    const [modules, setModules] = useState<CurriculumModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      if (!accessToken) return;
  
      getHammetModules(tier, accessToken, refreshToken)
        .then((res) => {
          setModules(
            res.modules
              .filter((m) => m.level === level && m.term === term)
              .sort((a, b) => a.weekNumber - b.weekNumber)
          );
        })
        .catch(() => setError("Failed to load modules."))
        .finally(() => setIsLoading(false));
    }, [accessToken, refreshToken, level, term, tier]);
  
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
        backHref={`/hammet/modules/${tier}/${level}`}
        rounded
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
            {modules.map((mod, index) => (
              <motion.button
                key={mod.id}
                className="bg-bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4"
                initial={{ opacity: 0, y: 12}}
                animate={{ opacity: 1, y: 0}}
                whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                transition={{ type: "spring", stiffness: 120, damping: 18, delay: index * 0.08 }}
                onClick={() => 
                  router.push(`/hammet/modules/${tier}/${level}/${term}/${mod.id}`)
                }
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-purple-light)] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[var(--color-purple)]">
                      W{mod.weekNumber}
                    </span>
                  </div>
  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{mod.title}</p>
  
                    <p className="text-xs text-text-muted mt-0.5">
                      {mod.contentJson.sections.length} sections · Last updated{" "}
                      {new Date(mod.updatedAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </PageShell>
    );
  }