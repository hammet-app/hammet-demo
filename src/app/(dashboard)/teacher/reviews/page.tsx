"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getPendingSubmissions } from "@/lib/api/teacher";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { PendingSubmission } from "@/lib/api/api-types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PendingSubmissionRow({
  submission,
  onClick,
}: {
  submission: PendingSubmission;
  onClick: () => void;
}) {
  const classLabel = submission.class_arm
    ? `${submission.class_level} ${submission.class_arm}`
    : submission.class_level;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 hover:border-[var(--color-purple)] hover:shadow-md transition-all duration-200"
    >
      {/* same UI unchanged */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold truncate">
              {submission.student_name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-purple-light)] text-[var(--color-purple)]">
              {classLabel}
            </span>
          </div>

          <p className="text-sm mb-3 truncate">
            {submission.module_title}
            <span className="ml-2">
              · Week {submission.week_number}, Term {submission.term}
            </span>
          </p>

          {submission.reflection_text && (
            <p className="text-sm line-clamp-2">
              {submission.reflection_text}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <span className="text-xs">
            {formatDate(submission.submitted_at)}
          </span>
        </div>
      </div>

      {submission.file_url && (
        <div className="mt-3 pt-3 border-t text-xs">
          Attachment included
        </div>
      )}
    </button>
  );
}

export default function TeacherReviewsPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getPendingSubmissions(accessToken, refreshToken)
      .then((res) => setSubmissions(res.submissions))
      .catch(() => setError("Failed to load pending reviews."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  const sorted = [...submissions].sort(
    (a, b) =>
      new Date(a.submitted_at).getTime() -
      new Date(b.submitted_at).getTime()
  );

  const subtitle = isLoading
    ? "Loading..."
    : submissions.length > 0
    ? `${submissions.length} pending ${
        submissions.length === 1 ? "submission" : "submissions"
      }`
    : undefined;

  return (
    <PageShell title="Reviews" description={subtitle}>
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          {error}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="font-semibold mb-1">All caught up</p>
          <p className="text-sm">
            No pending submissions to review.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((submission) => (
            <PendingSubmissionRow
              key={submission.id}
              submission={submission}
              onClick={() =>
                router.push(
                  `/teacher/reviews/${submission.id}`
                )
              }
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}