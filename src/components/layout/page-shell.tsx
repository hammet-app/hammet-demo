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
    <div
      className={cn(
        "flex min-h-full w-full flex-col bg-[#E4E4FE]",
        className
      )}
    >
      {/* Header */}
      <div className="bg-[#4B0081] px-4 sm:px-6 lg:px-8 pt-6 pb-5">
        {backHref && (
          <a
            href={backHref}
            className="mb-4 inline-flex items-center gap-1 text-xs text-white/70 transition-colors hover:text-white"
          >
            <ChevronLeft size={14} />
            {backLabel ?? "Back"}
          </a>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">
              {title}
            </h1>

            {description && (
              <p className="mt-1 text-sm text-white/75 max-w-2xl">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

/* ── Skeleton helpers ── */

export function CardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[10px] border border-purple-200 bg-white",
        className
      )}
    />
  );
}

export function StatsSkeleton() {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} className="h-28" />
      ))}
    </div>
  );
}

export function ListSkeleton({
  rows = 4,
}: {
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <CardSkeleton
          key={i}
          className="h-24 rounded-[14px]"
        />
      ))}
    </div>
  );
}