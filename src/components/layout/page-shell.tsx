import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface PageShellProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageShell({
  title,
  description,
  backHref,
  backLabel,
  actions,
  children,
  className,
}: PageShellProps) {
  return (
    <div className={cn("flex flex-col w-full min-h-full", className)}>
      
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-5 border-b border-border bg-bg-card">
        {backHref && (
          <a
            href={backHref}
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors mb-3"
          >
            <ChevronLeft size={14} />
            {backLabel ?? "Back"}
          </a>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">
              {title}
            </h1>

            {description && (
              <p className="text-sm text-text-secondary mt-1 max-w-2xl">
                {description}
              </p>
            )}
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}

/* ── Skeleton helpers shared across student pages ── */

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-bg-card border border-border rounded-[10px] animate-pulse",
        className
      )}
    />
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} className="h-24" />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <CardSkeleton key={i} className="h-16" />
      ))}
    </div>
  );
}
