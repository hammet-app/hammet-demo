"use client"

import { FONT_BODY } from "@/lib/student/lessons/build";
import { useEffect } from "react";
import { motion, animate, useMotionValue, useTransform } from "motion/react";

type ProgressHeroProps = {
  totalModules: number;
  approvedModules: number;
  submittedModules: number;
  currentWeek: number;
}

export function ProgressHero({
  totalModules,
  approvedModules,
  submittedModules,
  currentWeek
}: ProgressHeroProps) {
  const progress = Math.round((approvedModules / totalModules) * 100)
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, progress, { duration: 0.8, ease: "easeOut" })
    return () => controls.stop();
  }, [count, progress])
  const remainingModules = totalModules - approvedModules;
  const progressMessage =
    progress === 100
      ? "🎉 Outstanding! You've completed every module this term."
      : progress >= 90
        ? `🏁 Almost there! Only ${remainingModules} module${remainingModules === 1 ? "" : "s"} left.`
        : progress >= 70
          ? "🔥 You're making excellent progress. Keep it up!"
          : progress >= 50
            ? "🚀 You're over halfway there. Keep the momentum going."
            : progress >= 25
              ? "📚 A solid start. Every completed module moves you forward."
              : "🌱 Every expert starts somewhere. Let's build your streak.";

    

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-border bg-purple-light p-6">
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-sm text-text-secondary"
            style={{ fontFamily: FONT_BODY }}
          >
            Your Progress
          </p>

          <h1
            className="mt-1 text-4xl font-bold text-text-primary"
            style={{ fontFamily: FONT_BODY }}
          >
            <motion.span>{rounded}</motion.span>%
          </h1>
          <p
            className="mt-2 text-sm text-text-secondary"
            style={{ fontFamily: FONT_BODY }}
          >
            {approvedModules} of {totalModules} modules completed
          </p>
          <motion.p 
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="mt-3 text-sm font-medium text-purple"
          >
            {progressMessage}
          </motion.p>
        </div>

        <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
          <p
            className="text-xs text-text-muted"
            style={{ fontFamily: FONT_BODY }}
          >
            Current Week
          </p>

          <p
            className="mt-1 text-2xl font-bold text-purple"
            style={{ fontFamily: FONT_BODY }}
          >
            {currentWeek}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-3 overflow-hidden rounded-fill bg-white/50">
          <motion.div 
            initial={{ width: 0}}
            animate={{ width: `${progress}%`}}
            transition={{ duration: 0.8, ease: "easeOut", }}
            className="h-full rounded-full bg-cyan"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-between text-sm text-text-secondary">
        <span>{submittedModules} submitted </span>
        <span>{approvedModules} approved</span>
      </div>
    </div>
  )
}