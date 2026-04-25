"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getStudentDetail } from "@/lib/api/teacher";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { StatusPill } from "@/components/ui/status-pill";
import type { StudentDetail, SubmissionDetail } from "@/lib/api/api-types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProgressBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-sm font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-jakarta)]">
          {value} / {total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-purple-light)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function RecentSubmissionRow({
  submission,
  onReview,
}: {
  submission: SubmissionDetail;
  onReview: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-[var(--color-border)] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--color-text-primary)] text-sm truncate">
          {submission.module_title}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          Week {submission.week_number} · Term {submission.term} ·{" "}
          {formatDate(submission.submitted_at)}
        </p>
        {submission.teacher_note && (
          <p className="text-xs text-amber-600 mt-1.5 line-clamp-1">
            Note: {submission.teacher_note}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <StatusPill status={submission.status} />
        {submission.status === "submitted" && (
          <button
            onClick={onReview}
            className="text-xs text-[var(--color-purple)] font-medium hover:underline"
          >
            Review
          </button>
        )}
      </div>
    </div>
  );
}

export default function TeacherStudentDetailPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;

  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getStudentDetail(studentId, accessToken, refreshToken)
      .then(setDetail)
      .catch(() => setError("Failed to load student profile."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken, studentId]);

  const classLabel = detail?.class_arm
    ? `${detail.class_level} ${detail.class_arm}`
    : detail?.class_level;

  const subtitle = isLoading
    ? "Loading..."
    : classLabel;

  return (
    <PageShell
      title={detail?.full_name ?? "Student"}
      description={subtitle}
      backHref="/teacher/classes"
    >
      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          {error}
        </div>
      ) : !detail ? (
        <div className="text-sm text-[var(--color-text-secondary)]">
          Student not found.
        </div>
      ) : (
        <div className="max-w-2xl flex flex-col gap-5">

          {/* Profile card */}
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-purple-light)] flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-[var(--color-purple)]">
                  {detail.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
              </div>

              <div>
                <p className="font-semibold text-lg">
                  {detail.full_name}
                </p>
                <p className="text-sm">
                  {detail.email}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-purple-light)] text-[var(--color-purple)]">
                    {classLabel}
                  </span>

                  <span className="text-xs px-2 py-0.5 rounded-full">
                    {detail.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          {detail.progress && (
            <div className="bg-[var(--color-bg-card)] border rounded-2xl p-6">
              <p className="text-xs mb-4">
                Term {detail.progress.term} Progress
              </p>

              <div className="flex flex-col gap-4">
                <ProgressBar
                  label="Approved"
                  value={detail.progress.approved_modules}
                  total={detail.progress.total_modules}
                  color="var(--color-success)"
                />
                <ProgressBar
                  label="Submitted"
                  value={detail.progress.submitted_modules}
                  total={detail.progress.total_modules}
                  color="var(--color-purple)"
                />
              </div>
            </div>
          )}

          {/* Submissions */}
          {detail.recent_submissions && detail.recent_submissions.length === 0 ? (
            <div className="bg-[var(--color-bg-card)] border rounded-2xl p-6 text-center">
              <p className="text-sm">
                No submissions yet this term.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--color-bg-card)] border rounded-2xl p-6">
              {detail.recent_submissions && detail.recent_submissions.map((sub) => (
                <RecentSubmissionRow
                  key={sub.id}
                  submission={sub}
                  onReview={() =>
                    router.push(`/teacher/reviews/${sub.id}`)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}