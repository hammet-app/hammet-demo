"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, RefreshCw, } from "lucide-react";

import { InFlight, RowAction } from "./types";
import { AdminStudent } from "@/lib/api/types";
import { AccountActionSection } from "./AccountActionsSection";
import { CredentialSection } from "./CredentialSection";
import { ParentLinkSection } from "./ParentLinkSection";

type StudentDetailsProps ={
  student: AdminStudent;
  inFlight: InFlight | null;
  onAction: (action: RowAction) => void;
  created?: { fullName: string; email: string; password: string };
  canUseParentLink: boolean;
  expanded: boolean;
}

export function StudentDetails({
  student,
  inFlight,
  onAction,
  created,
  canUseParentLink,
  expanded
}: StudentDetailsProps) {

  const isPending = student.status === "pending";

  return (
    <AnimatePresence>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0, }}
          animate={{ height: "auto", opacity: 1, }}
          exit={{ height: 0, opacity: 0, }}
          transition={{ duration: .25, }}
          className="overflow-hidden"
        >

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {canUseParentLink && (
              <ParentLinkSection 
                student={student}
                inFlight={inFlight}
                onAction={onAction}
              />
            )}
            <AccountActionSection
              student={student}
              inFlight={inFlight}
              onAction={onAction}
            />
          </div>

          {/* Credentials display box */}
          <CredentialSection
            created={created}
            isPending={isPending}
          />
        </motion.div>

      )}

  </AnimatePresence>
  )
}