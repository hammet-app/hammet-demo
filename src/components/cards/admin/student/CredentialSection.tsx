import { motion, AnimatePresence } from "motion/react";
import { Key, Check, Copy, FileText, Table } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";

type CredentialSectionProps = {
    created?: {
        fullName: string;
        email: string;
        password: string;
    };

    isPending: boolean;
};

export function CredentialSection({
  created,
  isPending
}: CredentialSectionProps) {
  const [copied, setCopied] = useState(false);

  return (
    <AnimatePresence>
      {created && (
        <motion.div 
          initial={{ opacity:0, height:0, }}
          animate={{ opacity:1, height:"auto" }}
          exit={{ opacity:0, height:0 }}
          className="mt-1 p-4 rounded-xl border border-[var(--color-purple)]/25 
            bg-gradient-to-br from-[var(--color-bg-page)] to-[var(--color-bg-card)] flex flex-col 
            md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] font-semibold">
              <Key size={14} className="text-[var(--color-purple)] shrink-0" />
              <span>{isPending ? "Verification Code" : "Temporary Password"}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <code className="text-sm font-mono font-bold bg-[var(--color-purple-light)]/40 text-[var(--color-purple-dark)] 
                px-2.5 py-1 rounded-md border border-[var(--color-purple)]/10 select-all tracking-wider shadow-sm">
                {created.password}
              </code>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(created.password);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                title="Copy code"
                className="p-1.5 rounded-md hover:bg-[var(--color-purple-light)] text-[var(--color-text-secondary)] 
                hover:text-[var(--color-purple)] transition-colors border border-[var(--color-border)] cursor-pointer bg-white"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </Button>
              {copied && (
                <span className="text-[10px] text-emerald-600 font-semibold animate-pulse">Copied!</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 items-start md:items-end shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold">
              Export Credentials
            </span>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const label = "Password";
                  const content = `Name: ${created.fullName}\nEmail: ${created.email}\n${label}: ${created.password}`;
                  const blob = new Blob([content], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${created.fullName}.txt`;
                  a.click();
                }}
                className="text-xs font-semibold px-2.5 py-1.5 border border-[var(--color-border)] 
                  bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-purple)] hover:border-[var(--color-purple)] 
                  rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FileText size={12} />
                <span>TXT</span>
              </Button>
              <button
                onClick={() => {
                  const label = "password";
                  const content = `full_name,email,${label}\n${created.fullName},${created.email},${created.password}`;
                  const blob = new Blob([content], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `student.csv`;
                  a.click();
                }}
                className="text-xs font-semibold px-2.5 py-1.5 border border-[var(--color-border)] 
                  bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-purple)] 
                  hover:border-[var(--color-purple)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Table size={12} />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}