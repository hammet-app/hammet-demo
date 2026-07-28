import { cn } from "@/lib/utils/utils";
import { StatusPill } from "@/components/ui/status-pill";
import { Eye } from "lucide-react";
import { AnimatePresence, motion  } from "motion/react";

interface SubmissionCardProps {
  moduleTitle: string;
  weekNumber: number;
  term: number;
  submittedAt: string;
  status: "approved" | "flagged" | "submitted";
  teacherNote?: string | null;
  reviewedBy?: string | null;
  /** Shown only for teacher/admin cards */
  studentName?: string;
  /** Called when primary action is clicked (Revise / View) */
  onAction?: () => void;
  className?: string;
}

export function SubmissionCard({
  moduleTitle,
  weekNumber,
  term,
  submittedAt,
  status,
  teacherNote,
  reviewedBy,
  studentName,
  onAction,
  className,
}: SubmissionCardProps) {
  const date = new Date(submittedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statusMessage = {
    submitted: "Waiting for your teacher to review this submission.",
    approved: "Your submission has been approved.",
    flagged: "Changes are required before this can be approved",
  }[status];

  return (
    <div
      className={cn(
        "bg-bg-card border border-border rounded-[10px] p-4 flex flex-col gap-3",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-purple/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-text-primary">
            {moduleTitle}
          </p>

          <p className="text-[12px] text-text-secondary mt-1">
            {statusMessage}
          </p>

          <p className="text-[11px] text-text-muted mt-0.5">
            Week {weekNumber} · Term {term} · Submitted {date}
            {studentName && ` · ${studentName}`}
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.15 }}
        >
          <StatusPill status={status} className="shrink-0 mt-0.5" />
        </motion.div>
      </div>

      <AnimatePresence>
        {/* Flag note */}
        {teacherNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "border-l-[3px] text-[12px] leading-relaxed px-3 py-2 rounded-r-[6px]",
              status === "flagged"
              ? "border-warning bg-warning-light text-warning"
              : "border-success bg-success-light text-success-dark"
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-1">
              Teacher Feedback
            </p>

            {teacherNote}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-text-muted">
          {status === "submitted"
            ? "Waiting for teacher review"
            : status === "approved"
            ? "Added to portfolio automatically"
            : reviewedBy
            ? `Reviewed by ${reviewedBy}`
            : null}
        </p>

        {status === "flagged" && onAction && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={onAction}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-purple text-white px-3 py-1.5 rounded-[8px] hover:bg-purple-hover transition-colors"
          >
            Revise & Resubmit
          </motion.button>
        )}

        {status === "approved" && onAction && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={onAction}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary border border-border px-3 py-1.5 rounded-[8px] hover:bg-gray-50 transition-colors"
          >
            <Eye size={13} />
            View Portfolio
          </motion.button>
        )}
      </div>
    </div>
  );
}
