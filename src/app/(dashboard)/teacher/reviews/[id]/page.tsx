"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getSubmissionDetail,
  approveSubmission,
  flagSubmission,
} from "@/lib/api/teacher";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { StatusPill } from "@/components/ui/status-pill";
import type { SubmissionDetail } from "@/lib/api/api-types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ReviewMode = "idle" | "flagging" | "submitting";

export default function TeacherReviewDetailPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const submissionId = params.id;

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<ReviewMode>("idle");
  const [teacherNote, setTeacherNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getSubmissionDetail(submissionId, accessToken, refreshToken)
      .then(setSubmission)
      .catch(() => setError("Failed to load submission."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken, submissionId]);

  async function handleApprove() {
    if (!accessToken || !submission) return;
    setMode("submitting");
    setActionError(null);

    try {
      const now = new Date().toISOString();
      console.log(submissionId)
      await approveSubmission(submissionId, now, accessToken, refreshToken);
      router.push("/teacher/reviews");
    } catch {
      setActionError("Failed to approve. Please try again.");
      setMode("idle");
    }
  }

  async function handleFlag() {
    if (!accessToken || !submission) return;

    const note = teacherNote.trim();
    if (!note) {
      setNoteError("A note is required so the student knows what to fix.");
      return;
    }

    setNoteError(null);
    setMode("submitting");
    setActionError(null);

    try {
      const now = new Date().toISOString();
      console.log(submissionId)
      await flagSubmission(
        submissionId,
        { teacher_note: note },
        now,
        accessToken,
        refreshToken
      );
      router.push("/teacher/reviews");
    } catch {
      setActionError("Failed to flag submission. Please try again.");
      setMode("flagging"); // small fix (no double setMode)
    }
  }

  const classLabel = submission?.class_arm
    ? `${submission.class_level} ${submission.class_arm}`
    : submission?.class_level;

  const alreadyReviewed =
    submission?.status === "approved" || submission?.status === "flagged";

  return (
    <PageShell
      title="Review Submission"
      backHref="/teacher/reviews"
    >
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          {error}
        </div>
      ) : !submission ? (
        <div className="text-sm text-[var(--color-text-secondary)]">
          Submission not found.
        </div>
      ) : (
        <div className="max-w-2xl flex flex-col gap-5">

          {/* Header */}
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Student</p>
                <p className="font-semibold text-lg">
                  {submission.student_name}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                  {classLabel}
                </p>
              </div>
              <StatusPill status={submission.status} />
            </div>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Module</p>
              <p className="font-medium">{submission.module_title}</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                Week {submission.week_number} · Term {submission.term}
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] mt-4">
              <p className="text-xs text-[var(--color-text-muted)]">
                Submitted {formatDate(submission.submitted_at)}
              </p>
              {submission.reviewed_at && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Reviewed {formatDate(submission.reviewed_at)}
                </p>
              )}
            </div>
          </div>

          {/* Activity */}
          {submission.activity_text && (
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
              <p className="text-xs uppercase mb-3">Activity</p>
              <p className="whitespace-pre-wrap">
                {submission.activity_text}
              </p>
            </div>
          )}

          {/* AI Note */}
          {submission.ai_note && (
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
              <p className="text-xs uppercase mb-3">AI Note</p>
              <p className="whitespace-pre-wrap">
                {submission.ai_note}
              </p>
            </div>
          )}

          {/* AI Score */}
          {submission.ai_score && (
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
              <p className="text-xs uppercase mb-3">AI Score</p>
              <p className="whitespace-pre-wrap">
                {submission.ai_score}
              </p>
            </div>
          )}

          {/* Attachment */}
          {submission.file_url && (
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
              <p className="text-xs uppercase mb-3">Attachment</p>
              <a
                href={submission.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-purple)] text-sm hover:underline"
              >
                View attachment
              </a>
            </div>
          )}

          {/* Actions */}
          {!alreadyReviewed && (
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
              {actionError && (
                <p className="text-[var(--color-danger)] text-sm mb-4">
                  {actionError}
                </p>
              )}

              {/* Flag form */}
              {mode === "flagging" && (
                <textarea
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  className="w-full mb-4"
                />
              )}

              <div className="flex gap-3">
                <button onClick={handleApprove}>Approve</button>

                {mode === "flagging" ? (
                  <button onClick={handleFlag}>Send flag</button>
                ) : (
                  <button onClick={() => setMode("flagging")}>
                    Flag
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}