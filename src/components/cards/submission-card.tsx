import { cn } from "@/lib/utils/utils";
import { StatusPill } from "@/components/ui/status-pill";
import type { SubmissionStatus } from "@/components/ui/status-pill";
import { Eye } from "lucide-react";

interface SubmissionCardProps {
  moduleTitle: string;
  weekNumber: number;
  term: number;
  submittedAt: string;
  status: SubmissionStatus;
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

  return (
    <div
      className={cn(
        "bg-bg-card border border-border rounded-[10px] p-4 flex flex-col gap-3",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-text-primary">{moduleTitle}</p>
          <p className="text-[11px] text-text-muted mt-0.5">
            Week {weekNumber} · Term {term} · Submitted {date}
            {studentName && ` · ${studentName}`}
          </p>
        </div>
        <StatusPill status={status} className="shrink-0 mt-0.5" />
      </div>

      {/* Flag note */}
      {status === "flagged" && teacherNote && (
        <div className="border-l-[3px] border-warning bg-warning-light text-warning-dark text-[12px] leading-relaxed px-3 py-2 rounded-r-[6px]">
          {teacherNote}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-text-muted">
          {status === "approved"
            ? "Added to portfolio automatically"
            : reviewedBy
            ? `Reviewed by ${reviewedBy}`
            : null}
        </p>

        {status === "flagged" && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-purple text-white px-3 py-1.5 rounded-[8px] hover:bg-purple-hover transition-colors"
          >
            Revise & Resubmit
          </button>
        )}

        {status === "approved" && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary border border-border px-3 py-1.5 rounded-[8px] hover:bg-gray-50 transition-colors"
          >
            <Eye size={13} />
            View
          </button>
        )}
      </div>
    </div>
  );
}
