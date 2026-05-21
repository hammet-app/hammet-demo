import { cn } from "@/lib/utils/utils";
import { getInitials } from "@/lib/utils/roles";
import { useState } from "react";

interface StudentRowCardProps {
  fullName: string;
  classLevel: string;
  classArm: string | null;
  /** approved_modules / total_modules for the current term */
  approvedModules: number;
  totalModules: number;
  status: "active" | "pending" | "suspended";
  onClick?: () => void;
  className?: string;
  flaggedModules?: number;
  progressType?: "approved" | "submitted";
}

const statusDot: Record<string, string> = {
  active:    "bg-success",
  pending:   "bg-warning",
  suspended: "bg-danger",
};

export function StudentRowCard({
  fullName,
  classLevel,
  classArm,
  approvedModules,
  totalModules,
  status,
  onClick,
  className,
  flaggedModules,
  progressType,
}: StudentRowCardProps) {
  const initials = getInitials(fullName);
  const progressValue =
  progressType === "submitted" ? approvedModules : approvedModules;

  const pct =
    totalModules > 0
      ? Math.round((progressValue / totalModules) * 100)
      : 0;
  const classLabel = [classLevel, classArm].filter(Boolean).join("");

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-bg-card border border-border rounded-[10px]",
        "flex items-center gap-3 px-4 py-3",
        "transition-colors duration-150 hover:border-purple-light",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-mid",
        className
      )}
    >
      {/* Avatar */}
      <div
        className="w-[34px] h-[34px] rounded-full bg-purple-light text-purple flex items-center justify-center text-[12px] font-bold shrink-0"
        style={{ fontFamily: "var(--font-head)" }}
      >
        {initials}
      </div>

      {/* Name + class */}
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-text-primary truncate">
          {fullName}
        </p>

        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              statusDot[status]
            )}
          />
          <span className="text-[11px] text-text-muted">{classLabel}</span>

          {flaggedModules && flaggedModules > 0 && (
            <>
              <span className="text-[11px] text-text-muted">•</span>
              <span className="text-[11px] text-danger">
                {flaggedModules} flagged
              </span>
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1 min-w-[80px] shrink-0">
        <div className="h-[4px] rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-text-muted text-right">
          {pct}% done
        </p>
      </div>
    </button>
  );
}