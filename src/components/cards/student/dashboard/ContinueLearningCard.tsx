"use client";

import { motion } from "motion/react";
import { ModuleSummary } from "@/lib/api/types";
import { ArrowRight, BookOpen, Clock3, PartyPopper } from "lucide-react";
import { EmptyState } from "../../common";

type ContinueLearningCardProps = {
  module?: ModuleSummary | null;
  estimatedMinutes?: number;
  onContinue: () => void;
}

export function ContinueLearningCard({
  module,
  estimatedMinutes,
  onContinue,
}: ContinueLearningCardProps) {
  return (
    <>
      {!module ?(
        <EmptyState
          icon={<PartyPopper size={28} />}
          title="You're all caught up!" 
          description="New lessons will be ready next term."
        />
      ) : (  
          <motion.article
            whileHover={{ y: -3, }}
            transition={{ duration: 0.2, ease: "easeOut", }}
            className="overflow-hidden rounded-2xl border border-border bg-bg-card shadow-sm shadow-slate-200/10"
          >
            <motion.div 
              className="h-1 origin-left bg-purple" 
              initial={{ scaleX: 0, }}
              animate={{ scaleX: 1, }}
              transition={{ duration: 0.6, ease: "easeOut", }}
            />
            <div className="px-7 py-7">
              <div className="flex flex-col gap-6">
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: .15, duration: .35 }}
                >
                  <div className="inline-flex items-center rounded-full bg-purple-light px-3 py-1">
                    <BookOpen size={14} className="mr-2 text-purple" />
                    <span className="text-xs font-semibold text-purple">
                      Week {module.weekNumber}
                    </span>
                  </div>
                  <h2 
                    className="text-2xl font-bold tracking-tight text-text-primary"
                    style={{ fontFamily: "var(--font-head) "}}
                  >
                    {module.title}
                  </h2>
                  <p className="max-w-xl text-sm leading-6 text-text-secondary">
                    Continue where you left off and complete this week&apos;s lesson
                  </p>

                  <div className="flex flex-wrap items-center gap-5 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Clock3 className="text-text-muted" size={15} />
                      <span>
                        {estimatedMinutes
                          ? `Approx. ${estimatedMinutes} mins`
                          : "Self-paced"}
                      </span>
                      {/*
                        <div className="flex items-center gap-2">
                          <Brain size={15} />
                          <span>AI Fundamentals</span>
                        </div>
                        <Badge>
                          Beginner
                        </Badge>
                      */}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-5">
                    <p className="text-sm text-text-secondary">
                      Continue from your last completed lesson.
                    </p>
                    <motion.button
                      onClick={onContinue}
                      whileHover="hover"
                      whileTap={{ scale: 0.98, }}
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-purple"
                    >
                      <span>
                        Resume Lesson
                      </span>
                      <motion.div
                        variants={{ hover: { x: 5, }}}
                        transition={{ duration: 0.18, }}
                      >
                        <ArrowRight size={18} />
                      </motion.div>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.article>  
      )}
    </>
  );
}