"use client"

import { motion, AnimatePresence } from "motion/react";
import { Send, RefreshCw } from "lucide-react";
import { useState } from "react";

import { InFlight, RowAction } from "./types";
import { AdminStudent } from "@/lib/api/types";


type ParentLinkSectionProps = {
    student: AdminStudent;
    inFlight: InFlight | null;
    onAction: (action: RowAction) => void;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 1000 / 60 / 60);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ParentLinkSection({
  student,
  inFlight,
  onAction
}: ParentLinkSectionProps) {
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const busy = inFlight?.studentId === student.studentId;
  const busyAction = busy ? inFlight!.action : null;
  const hasLink = student.parentLinkSentAt !== null;

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--color-text-secondary)]">
      {hasLink ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-[var(--color-text-primary)] font-medium">
            <Send size={12} className="text-[var(--color-success)]" />
            <span>
              {student.parentLinkSentAt
                ? `Link sent ${timeAgo(student.parentLinkSentAt)}`
                : "Link sent 0d ago"}
            </span>
          </span>
          <span className="text-[var(--color-text-muted)]">·</span>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onAction({ type: "send-link", studentId: student.studentId })
            }}
            disabled={busy}
            className="text-xs font-semibold text-[var(--color-purple)] hover:text-[var(--color-purple-hover)] hover:underline disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            whileTap={{
              scale:.96
            }}
          >
            {busyAction === "send-link" ? (
              <>
                <RefreshCw size={11} className="animate-spin" />
                <span>Sending…</span>
              </>
            ) : (
              <span>Resend link</span>
            )}
          </motion.button>
          <span className="text-[var(--color-text-muted)]">·</span>
          {confirmRevoke ? (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded border border-red-200/40">
              <span className="text-red-600 font-medium">Revoke?</span>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction({
                    type: "revoke-link",
                    studentId: student.studentId,
                  });
                  setConfirmRevoke(false);
                }}
                disabled={busy}
                className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                whileTap={{
                  scale:.96
                }}
              >
                {busyAction === "revoke-link" ? "Revoking…" : "Confirm"}
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmRevoke(false);
                }}
                className="text-xs font-semibold text-[var(--color-text-secondary)] cursor-pointer"
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
                setConfirmRevoke(true)
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              whileTap={{
                scale:.96
              }}
            >
              Revoke link
            </motion.button>
          )}
        </div>
      ) : (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onAction({ type: "send-link", studentId: student.studentId })
          }}
          disabled={busy}
          className="text-xs font-semibold text-[var(--color-purple)] hover:text-[var(--color-purple-hover)] bg-[var(--color-purple-light)] hover:bg-[var(--color-purple-light)]/80 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          whileTap={{
            scale:.96
          }}
        >
          {busyAction === "send-link" ? (
            <>
              <RefreshCw size={12} className="animate-spin" />
              <span>Sending parent link…</span>
            </>
          ) : (
            <>
              <Send size={12} />
              <span>Send parent link</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  )
}