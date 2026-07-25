import { motion } from "motion/react";
import { cn } from "@/lib/utils/utils";
import { StatusPill } from "@/components/ui/status-pill";
import type { SubmissionStatus } from "@/components/ui/status-pill";
import { ArrowRight } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description?: string | null;
  weekNumber: number;
  term: number;
  status?: SubmissionStatus | null;
  onClick?: () => void;
  locked?: boolean;
  className?: string;
}

export function ModuleCard({
  title,
  description,
  weekNumber,
  term,
  status,
  onClick,
  locked=false,
  className,
}: ModuleCardProps) {
  let actionText = "Start Lesson";

  if (locked) {
    actionText = "Locked";
  } else if (status === "submitted") {
    actionText = "Review Submission";
  } else if (status === "approved") {
    actionText = "Review Lesson"
  } else if (status === "flagged") {
    actionText = "Continue Revision"
  }

  return (
    <motion.button
      onClick={() => {
        if (locked) return;
        onClick?.();
      }}
      whileHover={locked ? { y: 2, } : undefined}
      whileTap={locked ? { scale: 0.98 } : undefined}
      className={cn(
        "group w-full text-left bg-bg-card border border-border rounded-2xl p-5",
        "shadow-sm shadow-slate-200/10",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-mid",

        // 👇 only allow hover if NOT locked
        //!locked && "hover:border-purple-mid hover:ring-2 hover:ring-purple-mid/10",

        // 👇 locked styles
        //locked && "cursor-not-allowed",

        className
      )}
      disabled={locked}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          {/* Week badge */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple">
              Week {weekNumber}
            </p>
          </div>

          {/* Status */}
          {status && <StatusPill status={status} />}
        </div>

        <div className="space-y-3">
          <h2
            className="text-xl font-semibold text-text-primary"
            style={{ fontFamily: "var(--font-head" }}
          >
            {title}
          </h2>

          {description && (
            <p className="text-sm leading-6 text-text-secondary line-clamp-2">
              {description}
            </p>
          )}

        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm font-medium text-purple">
            {actionText}
          </p>
          <div className="transition-transform duration-200 group-hover: translate-x-1">
            <ArrowRight size={18} className="text-text-muted" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
