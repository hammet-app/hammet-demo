import { ReactNode } from "react";

type SectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function Section({
  title,
  description,
  children,
}: SectionProps) {
  return (
    <section className="space-y-6">

      <div>

        <h2
          className="text-xl font-semibold text-text-primary"
          style={{
            fontFamily: "var(--font-head)",
          }}
        >
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
            {description}
          </p>
        )}

      </div>

      {children}

    </section>
  );
}