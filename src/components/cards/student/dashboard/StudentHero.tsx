"use client"

import { useMemo } from "react"
import { motion } from "motion/react";

type StudentHeroProps = {
  firstName: string;
  classLevel?: string;
  classArm?: string;
  term? : string
}

export function StudentHero({
  firstName,
  classLevel,
  classArm,
  term
}: StudentHeroProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning,";
    if (hour < 17) return "Good Afternoon,";
    return "Good Evening,";
  }, []);

  return (
    <motion.section 
      className="overflow-hidden rounded-3xl border border-border bg-bd-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .35, ease: "easeOut" }}
    >
      <div className="px-8 py-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-1 flex-col">
            <div>
              <div className="flex items-center gap-2">
                <motion.span 
                  className="overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: "auto" }}
                  transition={{ duration: 0.65, ease: "easeOut" }}
                >
                  <span className="block whitespace-nowrap text-sm font-medium text-text-secondary">
                    {greeting}
                  </span>

                  <motion.span 
                    initial={{ opacity: 0, rotate: 0, }}
                    animate={{ opacity: 1, rotate: [0, 18, -10, 18, 0], }}
                    transition={{ delay: 0.55, duration: 0.55, }}
                    style={{ originX: 0.7, originY: 0.7 }}
                  >
                    👋
                  </motion.span>
                </motion.span>
              </div>

              <h1 
                className="mt-2 text-3xl font-bold tracking-tight text-text-primary"
                style={{ fontFamily: "var(--font-head)" }}
              >
                {firstName}
              </h1>
            </div>

            <div className="mt-5 space-y-3">
              <p className="max-w-2xl text-sm leading-6 text-text-secondary">
                Welcome back to AI Studies. Continue building your AI skills one lesson at a time
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                <span className="font-medium">
                  Term {term}
                </span>
                <span className="text-text-muted">
                  •
                </span>
                <span>
                  {classLevel}{classArm}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}