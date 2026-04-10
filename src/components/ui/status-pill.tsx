"use client";

import { cn } from "@/lib/utils/utils";

export type SubmissionStatus =
  | "approved"
  | "submitted"
  | "flagged"
  | "not_started"
  | "locked";

const statusConfig: Record<
  SubmissionStatus,
  { label: string; dot: string; pill: string }
> = {
  approved: {
    label: "Approved",
    dot: "bg-success",
    pill: "bg-success-light text-success-dark",
  },
  submitted: {
    label: "Submitted",
    dot: "bg-purple-mid",
    pill: "bg-purple-light text-purple-hover",
  },
  flagged: {
    label: "Flagged",
    dot: "bg-warning",
    pill: "bg-warning-light text-warning-dark",
  },
  not_started: {
    label: "Not started",
    dot: "bg-text-muted",
    pill: "bg-gray-100 text-text-secondary",
  },
  locked: {
    label: "Locked",
    dot: "bg-gray-300",
    pill: "bg-gray-100 text-text-muted",
  },
};

interface StatusPillProps {
  status: SubmissionStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        config.pill,
        className
      )}
    >
      <span className={cn("inline-block w-1.5 h-1.5 rounded-full flex-shrink-0", config.dot)} />
      {config.label}
    </span>
  );
}
