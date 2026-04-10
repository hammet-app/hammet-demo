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

const iconVariantStyles = {
  purple: "bg-purple-light text-purple-mid",
  cyan:   "bg-cyan-light text-cyan-dark",
  green:  "bg-success-light text-success-dark",
  amber:  "bg-warning-light text-warning-dark",
  red:    "bg-danger-light text-danger-dark",
};

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconVariant = "purple",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card border border-border rounded-[10px] p-4 flex flex-col gap-2",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-text-secondary">{label}</span>
        <div
          className={cn(
            "w-7 h-7 rounded-[7px] flex items-center justify-center",
            iconVariantStyles[iconVariant]
          )}
        >
          <Icon size={14} />
        </div>
      </div>
      <div
        className="text-[26px] font-bold text-text-primary leading-none"
        style={{ fontFamily: "var(--font-head)" }}
      >
        {value}
      </div>
      {sub && (
        <p className="text-[11px] text-text-muted">{sub}</p>
      )}
    </div>
  );
}
