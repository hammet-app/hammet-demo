"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getHammetModules } from "@/lib/api/hammet";
import { PageShell, ListSkeleton } from "@/components/layout/common/PageShell";
import type { CurriculumModule } from "@/lib/api/types";

export default function HammetModulesLevelsPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const params = useParams<{ tier: string, level: string }>();
  const level = decodeURIComponent(params.level);
  const tier = decodeURIComponent(params.tier)

  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getHammetModules(tier, accessToken, refreshToken)
      .then((res) => {
        setModules(res.modules.filter((m) => m.level === level));
      })
      .catch(() => setError("Failed to load modules."))
      .finally(() => setIsLoading(false));
  }, [tier, level, accessToken, refreshToken]);

  const terms = [...new Set(modules.map((m) => m.term))].sort((a, b) => a - b);

  function getTermStats(term: number) {
    const termModules = modules.filter((m) => m.term === term);

    return {
      total: termModules.length,
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
      backHref="/hammet/modules"
      rounded
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
          {terms.map((term, index) => {
            const stats = getTermStats(term);
            const label = TERM_LABELS[term] ?? `Term ${term}`;

            return (
              <motion.div
                key={term}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 18, 
                  delay: index * 0.1
                }}
              >
                <motion.button
                  key={term}
                  onClick={() =>
                    router.push(`/hammet/modules/${tier}/${level}/${term}`)
                  }
                  className="group w-full text-left bg-bg-card border border-border rounded-2xl p-6 hover:border-[var(--color-purple)] hover:shadow-md transition-all"
                  initial="rest"
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  variants={{
                    rest: {
                      y: 0
                    },
                    hover: {
                      y: -2,
                      transition: {
                        type: "spring",
                        stiffness: 450,
                        damping: 25
                      }
                    }
                  }}
                >
                  <motion.div 
                    className="w-12 h-12 rounded-xl bg-[var(--color-purple-light)] flex items-center justify-center mb-4"
                    variants={{ hover: { scale: 1.05 }}}
                  >
                    <span className="text-sm font-bold text-[var(--color-purple)]">
                      Term {term}
                    </span>
                  </motion.div>

                  <p className="font-semibold text-lg mb-1">{label}</p>

                  <div className="flex flex-col gap-1 mb-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {stats.total} modules
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-4 text-sm text-purple">
                    <span>View modules</span> 
                    <motion.p
                      variants={{ 
                        rest: {opacity: 0, x: 0}, 
                        hover: { opacity: 1, x: 4} 
                      }}
                      transition={{ duration: 0.2, ease: "easeIn"}}
                    >
                      →
                    </motion.p>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}