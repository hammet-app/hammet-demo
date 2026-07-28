"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/lib/auth/auth-context";
import { getHammetModules } from "@/lib/api/hammet";
import type { CurriculumModule } from "@/lib/api/types";
import { Upload, Pencil, LibraryBig } from "lucide-react";
import { PageShell, ListSkeleton } from "@/components/layout/common/PageShell";
import { SelectField, TIER_OPTIONS } from "@/components/forms";
import { Alert } from "@/components/ui";
import { ApiError } from "@/lib/api/api-client";

const LEVEL_ORDER = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];

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
  SSS1: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  SSS2: {
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
  },
  SSS3: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
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
  const [tier, setTier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModules = async (selectedTier: string) => {
    if (!accessToken) return;

    setTier(selectedTier);
    setIsLoading(true);
    setError(null);

    try {
      const res = await getHammetModules(
        selectedTier,
        accessToken,
        refreshToken
      );

      setModules(res.modules);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.notFound) {
          setModules([])
        } else {
          setError(err.message)
        }
      } else {
        setError("Failed to load modules.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const levels = sortLevels([...new Set(modules.map((m) => m.level))]);

  return (
    <PageShell
      title="Modules"
      description={
        tier
        ? `${modules.length} total across ${levels.length} levels`
        : ""
      }
      rounded={true}
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/hammet/modules/bulk")}
            className="inline-flex items-center px-4 py-2 rounded-md bg-[var(--color-purple)] text-white text-sm font-medium hover:opacity-90 transition"
          >
            <Upload size={16} className="mr-2 shrink-0" />
            Upload CSV
          </button>

          <button
            onClick={() => router.push("/hammet/modules/update")}
            className="inline-flex items-center px-4 py-2 rounded-md bg-white/80 text-purple text-sm font-medium hover:opacity-90 transition"
          >
            <Pencil size={16} className="mr-2 shrink-0" />
            Update Modules
          </button>
        </div>
      }
    >  
      <div className="rounded-xl border border-dashed border-border bg-bg-card p-4 mb-6">
        <p className="text-base font-semibold">
          Module Filters
        </p>
          <div className="max-w-sm">
            <SelectField
              id="tier"
              label=""
              placeholder="Select Tier"
              value={tier}
              options={TIER_OPTIONS}
              onChange={loadModules}
            />
          </div>

        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Choose the subscription tier you&apos;d like to browse.
        </p>
      </div>
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <Alert title="Modules Loading" variant="error">
          {error}
        </Alert>
      ) : !tier ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-purple-light)] flex items-center justify-center mb-4">
            <LibraryBig size={18} />
          </div>

          <p className="font-semibold mb-1">Select a subscription tier</p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Choose a subscription tier above to view its curriculum levels and modules.
          </p>
        </div>
      ): levels.length === 0 ? (
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

          <p className="font-semibold mb-1">No modules found</p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            There are no curriculum modules available for this subscription tier yet.
          </p>
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level, index) => {
            const stats = getLevelStats(modules, level);
            const accent = getAccent(level);

            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y:0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18, delay: index * 0.1 }}
              >
                <motion.button
                  onClick={() =>
                    router.push(`/hammet/modules/${tier}/${level}`)
                  }
                  className="group w-full text-left bg-bg-card border border-border rounded-2xl p-6 hover:border-border"
                  initial="rest"
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  variants={{
                    rest: {
                      y: 0,
                    },
                    hover: {
                      y: -2,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }
                    }
                  }}
                  
                >
                  <motion.div
                    className={`w-12 h-12 rounded-xl ${accent.bg} border ${accent.border} flex items-center justify-center mb-4`}
                    variants={{
                      hover: {
                        scale: 1.05
                      }
                    }}
                    transition={{
                      type:"spring",
                      stiffness: 450,
                      damping: 18
                    }}
                  >
                    <span className={`text-sm font-bold ${accent.text}`}>
                      {level}
                    </span>
                  </motion.div>

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
                      <motion.div
                        className="h-full bg-purple-dark"
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.published / stats.total) * 100}%`}}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-4 text-sm text-purple">
                    <span>View terms</span> 
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
        </motion.div>
      )}
    </PageShell>
  );
}