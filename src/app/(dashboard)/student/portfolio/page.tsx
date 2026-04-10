"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { studentApi } from "@/lib/api/student";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { ChevronDown, ChevronUp, FileText, ExternalLink, Award } from "lucide-react";
import type { PortfolioEntry } from "@/lib/api/api-types";
import { cn } from "@/lib/utils/utils";

export default function PortfolioPage() {
  const { accessToken, refreshToken, user } = useAuth();
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    studentApi
      .getPortfolio(accessToken, refreshToken)
      .then((data) => setEntries(data.entries))
      .catch(() => setError("Failed to load portfolio. Please try again."))
      .finally(() => setIsLoading(false));
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageShell
      title="My Portfolio"
      description="Approved work that showcases your AI literacy journey"
    >
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          {error}
        </div>
      ) : entries.length === 0 ? (
        <EmptyPortfolio />
      ) : (
        <>
          {/* Summary chip */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-1.5 bg-success-light text-success-dark text-[12px] font-semibold px-3 py-1.5 rounded-full">
              <Award size={13} />
              {entries.length} approved {entries.length === 1 ? "entry" : "entries"}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <PortfolioEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}

function PortfolioEntryCard({ entry }: { entry: PortfolioEntry }) {
  const [expanded, setExpanded] = useState(false);

  const approvedDate = new Date(entry.approved_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-bg-card border border-border rounded-[10px] overflow-hidden">
      {/* Header — always visible, click to expand */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
      >
        {/* Week badge */}
        <div
          className="w-9 h-9 rounded-[8px] bg-purple-light text-purple flex flex-col items-center justify-center shrink-0 leading-none"
          style={{ fontFamily: "var(--font-head)" }}
        >
          <span className="text-[9px] font-medium opacity-70 uppercase tracking-wide">Wk</span>
          <span className="text-[13px] font-bold">{entry.week_number}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-medium text-text-primary truncate">
            {entry.module_title}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">
            Term {entry.term} · Approved {approvedDate}
          </p>
        </div>

        {/* Approved badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-success-dark bg-success-light px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Approved
          </span>
          {expanded ? (
            <ChevronUp size={16} className="text-text-muted" />
          ) : (
            <ChevronDown size={16} className="text-text-muted" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-4 py-4 flex flex-col gap-4">
          {/* Reflection text */}
          {entry.reflection_text && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                <FileText size={12} />
                Your reflection
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                {entry.reflection_text}
              </p>
            </div>
          )}

          {/* File attachment */}
          {entry.file_url && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                <FileText size={12} />
                Attachment
              </div>
              <a
                href={entry.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-cyan hover:text-cyan-dark transition-colors no-underline"
              >
                <ExternalLink size={13} />
                View uploaded file
              </a>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <p className="text-[11px] text-text-muted">
              {entry.school_name} · {entry.student_name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyPortfolio() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-purple-light flex items-center justify-center">
        <Award size={26} className="text-purple-mid" />
      </div>
      <div>
        <p className="text-[15px] font-medium text-text-primary mb-1">
          Your portfolio is empty
        </p>
        <p className="text-[13px] text-text-muted max-w-[260px] mx-auto leading-relaxed">
          Approved submissions are automatically added here. Complete a lesson
          and get it approved by your teacher to get started.
        </p>
      </div>
      <a
        href="/student/lessons"
        className="mt-2 text-[13px] font-semibold text-purple-mid hover:text-purple transition-colors no-underline"
      >
        Go to My Lessons
      </a>
    </div>
  );
}
