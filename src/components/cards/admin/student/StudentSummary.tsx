"use client"

import { AdminStudent } from "@/lib/api/types";
import { ChevronDown, Mail, BookOpen } from "lucide-react";
import { motion } from "motion/react";

type StudentSummaryProps = {
  student: AdminStudent
  expanded: boolean;
}


export function StudentSummary({
  student,
  expanded
}: StudentSummaryProps){
  const initials = student.fullName
      ? student.fullName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "S";
  const classLabel = student.classArm
    ? `${student.classLevel} ${student.classArm}`
    : student.classLevel;
  
  const isPending = student.status === "pending";

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar & Text details */}
        <div className="flex items-center gap-3.5 min-w-0">
          <motion.div
            whileHover={{
              scale:1.08,
            }}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-purple-mid)] to-[var(--color-purple)] text-white font-semibold text-sm flex items-center justify-center shadow-sm shrink-0"
          >
            {initials}
          </motion.div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-base text-[var(--color-text-primary)] leading-tight truncate">
                {student.fullName}
              </p>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isPending
                    ? "bg-[var(--color-warning-light)] text-[var(--color-warning-dark)] border-[var(--color-warning-dark)]/10"
                    : "bg-[var(--color-success-light)] text-[var(--color-success-dark)] border-[var(--color-success-dark)]/10"
                }`}
              >
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-[var(--color-text-secondary)] min-w-0">
              <Mail size={13} className="text-[var(--color-text-muted)] shrink-0" />
              <p className="truncate">{student.email}</p>
            </div>
          </div>
        </div>

        {/* Right: Class label / details */}
        <div className="flex items-center gap-2 shrink-0 sm:self-start">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--color-purple-light)] text-[var(--color-purple)] border border-[var(--color-purple)]/10 flex items-center gap-1">
            <BookOpen size={12} className="text-[var(--color-purple)]" />
            <span>Class {classLabel}</span>
          </span>
        </div>
      </div>
      <div
        className="flex items-center justify-center rounded-lg p-2 text-text-muted transition-transform"
      >
        <ChevronDown
          size={18}
          className={`
            transition-transform
            duration-200
            ${expanded ? "rotate-180" : ""}
          `}
        />
      </div>
    </>
  )
}