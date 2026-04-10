"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { studentApi } from "@/lib/api/student";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { SubmissionCard } from "@/components/cards/submission-card";
import type { Submission } from "@/lib/api/api-types";

type FilterStatus = "all" | "approved" | "submitted" | "flagged";

export default function SubmissionsPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    studentApi
      .getSubmissions(accessToken, refreshToken)
      .then((data) => setSubmissions(data.submissions))
      .catch(() => setError("Failed to load submissions. Please try again."))
      .finally(() => setIsLoading(false));
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered =
    filter === "all"
      ? submissions
      : submissions.filter((s) => s.status === filter);

  const counts = {
    all: submissions.length,
    approved: submissions.filter((s) => s.status === "approved").length,
    submitted: submissions.filter((s) => s.status === "submitted").length,
    flagged: submissions.filter((s) => s.status === "flagged").length,
  };

  const filters: { key: FilterStatus; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "submitted", label: `Pending (${counts.submitted})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "flagged", label: `Flagged (${counts.flagged})` },
  ];

  return (
    <PageShell
      title="Submissions"
      description="Your submitted work across all modules this term"
    >
      {/* Filter tabs */}
      {!isLoading && !error && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[12px] font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                filter === f.key
                  ? "bg-purple text-white border-purple"
                  : "bg-bg-card text-text-secondary border-border hover:border-purple hover:text-purple"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <p className="text-[15px] font-medium text-text-primary">No submissions yet</p>
          <p className="text-[13px] text-text-muted">
            {filter === "all"
              ? "Complete a lesson to see your submissions here."
              : `No ${filter} submissions.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((s) => (
            <SubmissionCard
              key={s.id}
              moduleTitle={s.module_title}
              weekNumber={s.week_number}
              term={s.term}
              submittedAt={s.submitted_at}
              status={s.status}
              teacherNote={s.teacher_note}
              onAction={
                s.status === "flagged"
                  ? () => router.push(`/student/lessons/${s.module_id}`)
                  : s.status === "approved"
                  ? () => router.push(`/student/portfolio`)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
