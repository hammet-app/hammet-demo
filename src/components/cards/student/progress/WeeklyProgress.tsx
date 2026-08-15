"use client"

import { ModuleProgress } from "@/lib/api/types"
import { StatusPill } from "@/components/ui";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Circle } from "lucide-react";

type WeeklyProgressSectionProps = {
  weeks: Record<number, ModuleProgress[]>
  currentWeek: number
}

type WeekStatusBadgeProps = {
  status: "completed" | "current" | "in-progress" | "upcoming";
};


export function WeeklyProgressSection({
  weeks,
  currentWeek
}: WeeklyProgressSectionProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([
    Math.max(...Object.keys(weeks).map(Number), 0)
  ])

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => 
      prev.includes(week)
        ? prev.filter((w) => w !== week)
        : [...prev, week]
    );
  }
  return (
    <div className="space-y-4">
      {Object.entries(weeks)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([week, modules]) => {
          const weekNumber = Number(week);
          const progressModules = modules.filter(
            (module) =>
              module.submissionStatus === "submitted" ||
              module.submissionStatus === "approved"
          ).length;

          const progressPct =
            modules.length > 0
              ? Math.round((progressModules / modules.length) * 100)
              : 0;

          const isCompleted = progressModules === modules.length;

          const status = isCompleted
            ? "completed"
            : weekNumber === currentWeek
              ? "current"
              : weekNumber < currentWeek
                ? "in-progress"
                : "upcoming";

          return (
            <div
              key={week}
              className="rounded-[16px] border border-border bg-bg-card overflow-hidden"
            >
              <button
                onClick={() => toggleWeek(Number(week))}
                className="flex w-full items-center justify-between px-5 py-4 hover:bg-bg-page transition-colors"
              >
                <div>
                  <h3 className="text-sm font-semibold">
                    Week {week}
                  </h3>
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-3"
                  >
                    <WeekStatusBadge status={status} />
                    <p className="text-xs text-text-muted">
                      {modules.length} Modules
                    </p>
                  </motion.div>
                </div>
                <motion.div
                  animate={{ rotate: expandedWeeks.includes(Number(week)) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={18} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {expandedWeeks.includes(Number(week)) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-border">
                      {modules.map((module, index) => (
                        <ModuleProgressRow
                          key={module.moduleId}
                          module={module}
                          index={index + 1}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )})
      }
    </div>
  )
}

function WeekStatusBadge({
  status
}: WeekStatusBadgeProps) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-light px-2.5 py-1 text-[11px] font-medium text-green">
        <Check size={12} />
        Completed
      </span>
    )
  }

  if (status === "current") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-light px-2.5 py-1 text-[11px] font-medium text-purple">
        <Circle size={8} fill="currentColor"/>
        Current
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-bg-page px-2.5 py-1 text-[11px] font-medium text-text-muted">
      Upcoming
    </span>
  )
}


function ModuleProgressRow({ module: m, index }: { module: ModuleProgress, index: number }) {
  const date = m.submittedAt
    ? new Date(m.submittedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="group flex items-center gap-4 px-5 py-4 transition-colors duration-200"
    >
      <div className="flex w-8 h-8 items-center justify-center rounded-full bg-purple-light text-purple text-sm font-semibold">
        {index}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium font-semibold text-text-primary truncate">{m.title}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
          {date && (
            <span>Submitted {date}</span>
          )}
        </div>
      </div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <StatusPill status={m.submissionStatus} />
      </motion.div>
    </motion.div>
  );
}
