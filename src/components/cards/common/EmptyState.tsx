import { ReactNode } from "react";

type EmptyStateProps = {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode
};

export function EmptyState({
    icon,
    title,
    description,
    action
}: EmptyStateProps) {
    return (
        <div
          className="flex flex-col items-center justify-center rounded-3xl
            border border-border bg-bg-card px-8 py-14 text-center"
        >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-light text-purple-mid">
              {icon}
            </div>

            <h3
              className="text-lg font-semibold text-[var(--color-text-primary)"
              style={{ fontFamily: "var(--font-head" }}
            >
                {title}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">
                {description}
            </p>

            {action && (
                <div className="mt-8">
                    {action}
                </div>
            )}
        </div>
    )
}