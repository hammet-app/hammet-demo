import { cn } from "@/lib/utils/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  iconVariant?: "purple" | "cyan" | "green" | "amber" | "red";
  className?: string;
}

const variantStyles = {
  purple: {
    icon: "bg-purple-light text-purple-mid",
    border: "border-t-purple-mid",
  },
  cyan: {
    icon: "bg-cyan-light text-cyan-dark",
    border: "border-t-cyan-dark",
  },
  green: {
    icon: "bg-success-light text-success-dark",
    border: "border-t-success-dark",
  },
  amber: {
    icon: "bg-warning-light text-warning-dark",
    border: "border-t-warning-dark",
  },
  red: {
    icon: "bg-danger-light text-danger-dark",
    border: "border-t-danger-dark",
  },
};

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconVariant="purple",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        `bg-bg-card
        border
        border-border
        border-t-4
        rounded-xl
        p-5
        flex
        flex-col
        gap-3
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-lg`,
        variantStyles[iconVariant].border,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            variantStyles[iconVariant].icon
          )}
        >
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>
      <div
        className="text-[26px] font-bold text-text-primary leading-none"
        style={{ fontFamily: "var(--font-head)" }}
      >
        {typeof value === "number"
          ? value.toLocaleString()
          : value}
      </div>
      {sub && (
        <p className="text-[11px] text-text-muted">{sub}</p>
      )}
    </div>
  );
}
