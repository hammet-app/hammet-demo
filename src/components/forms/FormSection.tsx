import { ReactNode } from "react";
import { motion } from "motion/react";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <motion.section 
      className="rounded-2xl border border-border bg-bg-card p-6 flex flex-col gap-6 shadow-sm"
      initial={{ opacity: 0, y: 12, }}
      whileInView={{ opacity:1, y:0, }}
      viewport={{ once: true, }}
      transition={{ duration: 0.35, ease: "easeOut"}}
    >
      <div>
        <h2
          className="text-base font-semibold text-text-primary"
          style={{ fontFamily: "var(--font-head)", }}
        >
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-text-muted">
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {children}
      </div>
    </motion.section>
  );
}