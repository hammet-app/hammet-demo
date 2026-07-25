"use client";

import { motion } from "motion/react";
import { ArrowRight, } from "lucide-react";
import { getProgress } from "@/lib/student/progress";

interface ProgressOverviewCardProps {
  approvedModules: number;
  totalModules: number;
  onViewProgress?: () => void;
}

export function ProgressOverviewCard({
  approvedModules,
  totalModules,
  onViewProgress,
}: ProgressOverviewCardProps) {
  const percentage =
    totalModules === 0
      ? 0
      : Math.round((approvedModules / totalModules) * 100);

  const status = getProgress(percentage);
    
  return (
    <motion.article
      className="rounded-2xl border border-border bg-bg-card p-6 shadow-sm shadow-slate-200/10"
      whileHover={{ y: -3, }}
      transition={{ duration: 0.2, ease: "easeOut", }}
    >
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h3 
            className="text-lg font-bold text-text-primary"
            style={{ fontFamily: "var(--font-head)" }}
          >
            Your Progress
          </h3>

          <p className="text-sm text-text-secondary">
            Track how far you&apos;ve come this term.
          </p>
        </div>
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y:8, }}
          animate={{ opacity:1, y: 0, }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <div className="flex items-end justify-between gap-4">
            <span
              className="text-4xl font-bold text-text-primary"
              style={{ fontFamily: "var(--font-head)" }}
            >
              {percentage}%
            </span>

            <div className="text-right">
              <p className="text-sm font-medium text-purple">
                {status.title}
              </p>

              <p className="mt-1 text-xs text-text-secondary">
                {status.description}
              </p>
            </div>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-purple-light">
            <motion.div
              className="h-full w-full rounded-full bg-purple"
              initial={{ scaleX: 0 , }}
              animate={{ scaleX: percentage / 100, }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut", }}
              style={{ originX: 0, }}
            />
            
          </div>
          <p className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">
              {approvedModules}
            </span>{" "}
            of{" "}
            <span className="font-medium text-text-primary">
              {totalModules}
            </span>{" "}
            lessons completed
          </p>
          <div className="border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                See your weekly progress and completed lessons.
              </p>
              <motion.button
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                onClick={onViewProgress}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-purple"
              >
                <span>View Progress</span>
                
                <motion.div
                  variants={{ hover: { x: 5, }, }}
                  transition={{ duration: 0.18 }}
                >
                  <ArrowRight size={18} />
                </motion.div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
}