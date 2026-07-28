"use client"

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, RefreshCw, Key } from "lucide-react";
import { AdminStudent } from "@/lib/api/types";

type AccountActionsSectionProps = {
    student: AdminStudent;
    inFlight: InFlight | null;
    onAction: (action: RowAction) => void;
};

type RowAction =
  | { type: "send-link"; studentId: string }
  | { type: "revoke-link"; studentId: string }
  | { type: "delete"; studentId: string }
  | { type: "resend-code"; studentId: string }
  | { type: "update"; studentId: string };

type InFlight = { studentId: string; action: RowAction["type"] };

export function AccountActionSection({
  student,
  inFlight,
  onAction
}: AccountActionsSectionProps) {

  const router = useRouter(); 
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const busy = inFlight?.studentId === student.studentId;
  const busyAction = busy ? inFlight!.action : null;
  const isPending = student.status === "pending";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/admin/students/${student.studentId}/edit`)
        }}
        className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-purple)] bg-[var(--color-bg-page)] hover:bg-[var(--color-purple-light)] border border-[var(--color-border)] hover:border-[var(--color-purple)]/25 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
        whileTap={{
          scale:.96
        }}
      >
        <Edit size={12} />
        <span>Update</span>
      </motion.button>

      {/* Reset password or Resend code */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onAction({ type: "resend-code", studentId: student.studentId })
        }}
        disabled={busy}
        className="text-xs font-semibold text-[var(--color-purple)] hover:text-white bg-[var(--color-purple-light)] hover:bg-[var(--color-purple)] px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        whileTap={{
          scale:.96
        }}
      >
        {busyAction === "resend-code" ? (
          <>
            <RefreshCw size={12} className="animate-spin" />
            <span>{isPending ? "Sending code…" : "Resetting password…"}</span>
          </>
        ) : (
          <>
            <Key size={12} />
            <span>{isPending ? "Resend code" : "Reset password"}</span>
          </>
        )}
      </motion.button>

      {/* Delete student */}
      {confirmDelete ? (
        <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-lg border border-red-200/40 text-xs">
          <span className="text-red-600 font-semibold">Delete?</span>
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onAction({ type: "delete", studentId: student.studentId });
              setConfirmDelete(false);
            }}
            disabled={busy}
            className="font-bold text-red-600 hover:text-red-700 cursor-pointer"
            whileTap={{
              scale:.96
            }}
          >
            {busyAction === "delete" ? "Deleting…" : "Confirm"}
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(false)
            }}
            className="font-semibold text-[var(--color-text-secondary)] cursor-pointer"
            whileTap={{
              scale:.96
            }}
          >
            Cancel
          </motion.button>
        </div>
      ) : (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDelete(true)
          }}
          className="text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200/40 hover:border-red-600 transition-all flex items-center gap-1.5 cursor-pointer"
          whileTap={{
            scale:.96
          }}
        >
          <Trash2 size={12} />
          <span>Delete</span>
        </motion.button>
      )}
    </div>
  )
}