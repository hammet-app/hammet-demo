import { cn } from "@/lib/utils/utils";
import { StatusPill } from "@/components/ui/status-pill";
import type { SubmissionStatus } from "@/components/ui/status-pill";

interface ModuleCardProps {
  title: string;
  weekNumber: number;
  term: number;
  status: SubmissionStatus;
  onClick?: () => void;
  className?: string;
}

export function ModuleCard({
  title,
  weekNumber,
  term,
  status,
  onClick,
  className,
}: ModuleCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-bg-card border border-border rounded-[10px]",
        "flex items-center gap-3 p-4",
        "transition-all duration-150",
        "hover:border-purple-mid hover:ring-2 hover:ring-purple-mid/[0.08]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-mid",
        className
      )}
    >
      {/* Week badge */}
      <div
        className="w-9 h-9 rounded-[8px] bg-purple-light text-purple flex flex-col items-center justify-center shrink-0 leading-none"
        style={{ fontFamily: "var(--font-head)" }}
      >
        <span className="text-[9px] font-medium opacity-70 uppercase tracking-wide">Wk</span>
        <span className="text-[13px] font-bold">{weekNumber}</span>
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-text-primary truncate">{title}</p>
        <p className="text-[11px] text-text-muted mt-0.5">Term {term}</p>
      </div>

      {/* Status */}
      <StatusPill status={status} />
    </button>
  );
}
