"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { studentApi } from "@/lib/api/student";
import { PageShell, ListSkeleton } from "@/components/layout/common/PageShell";
import { SubmissionCard } from "@/components/cards/submission-card";
import type { Pagination, Submission } from "@/lib/api/types";
import { AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type FilterStatus = "all" | "approved" | "submitted" | "flagged";

export default function SubmissionsPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [filter, setFilter] = useState<FilterStatus>("all");

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    studentApi
      .getSubmissions(
        accessToken,
        refreshToken,
        page,
        pageSize
      )
      .then((data) => {
        if (cancelled) return;

        setSubmissions(data.submissions);
        setPagination(data.pagination);
        setError("");
      })
      .catch(() => {
        if (cancelled) return;

        setError("Failed to load submissions. Please try again.");
      })
      .finally(() => {
        if (cancelled) return;

        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshToken, page]);

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

  const hasPreviousPage =
    pagination !== null && pagination.page > 1;

  const hasNextPage =
    pagination !== null &&
    pagination.page < pagination.totalPages;

  return (
    <PageShell
      title="Submissions"
      description="Your submitted work across all modules this term"
      rounded={true}
    >
      {/* Filter tabs */}
      {!isLoading && !error && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`cursor-pointer text-[12px] font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
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
          <p className="text-[15px] font-medium text-text-primary">
            No submissions yet
          </p>

          <p className="text-[13px] text-text-muted">
            {filter === "all"
              ? "Complete a lesson to see your submissions here."
              : `No ${filter} submissions.`}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {filtered.map((s) => (
                <SubmissionCard
                  key={s.id}
                  moduleTitle={s.moduleTitle}
                  weekNumber={s.weekNumber}
                  term={s.term}
                  submittedAt={s.submittedAt}
                  status={s.status}
                  teacherNote={s.teacherNote}
                  onAction={
                    s.status === "flagged"
                      ? () =>
                          router.push(
                            `/student/lessons/${s.moduleId}`
                          )
                      : s.status === "approved"
                      ? () => router.push(`/student/portfolio`)
                      : undefined
                  }
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-xs text-text-muted">
                Showing {submissions.length} of {pagination.total} submissions
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!hasPreviousPage || isLoading}
                  onClick={() => setPage((current) => current - 1)}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary transition-colors hover:border-purple hover:text-purple disabled:opacity-40 disabled:pointer-events-none cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <span className="text-xs text-text-muted px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={!hasNextPage || isLoading}
                  onClick={() => setPage((current) => current + 1)}
                  className="cursor-pointer inline-flex items-center gap-1 rounded-md border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary transition-colors hover:border-purple hover:text-purple disabled:opacity-40 disabled:pointer-events-none cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}