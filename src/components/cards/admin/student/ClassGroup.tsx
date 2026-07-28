import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdminStudent } from "@/lib/api/types";

type ClassGroupProps = {
  level: string;
  students: AdminStudent[];
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export function ClassGroup({
  level,
  students,
  expanded,
  onToggle,
  children,
}: ClassGroupProps) {

  return (
    <div className="rounded-2xl border border-border bg-bg-card overflow-hidden">
      <div
        onClick={onToggle}
        className="flex cursor-pointer items-center justify-between
          px-6 py-5 transition-colors hover:bg-bg-page
        "
      >
        <div>
          <h3
            className="text-lg font-semibold"
            style={{
                fontFamily:"var(--font-head)",
            }}
          >
            {level}
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            {students.length} student{students.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="rounded-full bg-purple-light px-3 py-1 text-xs font-medium text-purple-mid"
          >
            {students.length}
          </span>

          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height:0, opacity:0, }}
            animate={{ height:"auto", opacity:1, }}
            exit={{ height:0, opacity:0, }}
            transition={{ duration:.25, }}
            className="overflow-hidden border-t border-border"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

}