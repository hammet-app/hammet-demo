"use client"

import { FONT_BODY, FONT_HEAD } from "@/lib/student/lessons/build";
import { cn } from "@/lib/utils/utils";


// ─────────────────────────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────────────────────────

export function RequiredBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#D85A30]"
      style={{ fontFamily: FONT_BODY }}
    >
      <span className="w-[5px] h-[5px] rounded-full bg-[#D85A30]" />
      Required
    </span>
  );
}

export function BlockMeta({
  children,
  className,
  required,
}: {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-1.5", className)}>
      <p
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ fontFamily: FONT_HEAD }}
      >
        {children}
      </p>
      {required && <RequiredBadge />}
    </div>
  );
}