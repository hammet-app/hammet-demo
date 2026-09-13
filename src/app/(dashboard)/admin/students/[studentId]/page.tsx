"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  GraduationCap,
  KeyRound,
  Mail,
  Pencil,
  ShieldAlert,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import {
  deleteStudent,
  getAdminStudent,
  getSchoolProfile,
  resendCode,
  revokeParentLink,
  sendParentLink,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/api-client";
import {
  ListSkeleton,
  PageShell,
} from "@/components/layout/common/PageShell";
import {
  SchoolProfile,
  type AdminStudent,
} from "@/lib/api/types";


const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: {
    bg: "var(--color-warning-light)",
    text: "var(--color-warning-dark)",
    label: "Pending",
  },
  active: {
    bg: "var(--color-success-light)",
    text: "var(--color-success-dark)",
    label: "Active",
  },
  suspended: {
    bg: "var(--color-bg-page)",
    text: "var(--color-text-secondary)",
    label: "Suspended",
  },
  graduated: {
    bg: "var(--color-purple-light)",
    text: "var(--color-purple)",
    label: "Graduated",
  },
};


function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


function StatusBadge({ status }: { status: AdminStudent["status"] }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending;

  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {style.label}
    </span>
  );
}


function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        {icon}
        <span>{label}</span>
      </div>

      <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}


export default function AdminStudentPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const params = useParams();

  const studentId = params.studentId as string;

  const [student, setStudent] = useState<AdminStudent | null>(null);
  const [profile, setProfile] = useState<SchoolProfile | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<
    "send-link" | "revoke-link" | "resend-code" | "delete" | null
  >(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!accessToken || !studentId) return;

    let cancelled = false;

    Promise.all([
      getAdminStudent(studentId, accessToken, refreshToken),
      getSchoolProfile(accessToken, refreshToken),
    ])
      .then(([studentResponse, profileResponse]) => {
        if (cancelled) return;

        setStudent(studentResponse);
        setProfile(profileResponse);
      })
      .catch(() => {
        if (cancelled) return;

        setError("Failed to load student.");
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshToken, studentId]);

  const canUseParentLink =
    profile?.tier === "premier" || profile?.tier === "global";

  async function handleSendParentLink() {
    if (!accessToken || !student) return;

    setActionLoading("send-link");
    setActionError(null);

    try {
      const response = await sendParentLink(
        student.studentId,
        accessToken,
        refreshToken
      );

      setStudent((previous) =>
        previous
          ? {
              ...previous,
              parentLinkSentAt: response.expiresAt,
            }
          : previous
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setActionError(
          "Student has not completed any module. Please ensure that the student has completed a class before sending a parent link."
        );
      } else {
        setActionError("Failed to send parent link.");
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRevokeParentLink() {
    if (!accessToken || !student) return;

    setActionLoading("revoke-link");
    setActionError(null);

    try {
      await revokeParentLink(
        student.studentId,
        accessToken,
        refreshToken
      );

      setStudent((previous) =>
        previous
          ? {
              ...previous,
              parentLinkSentAt: null,
            }
          : previous
      );
    } catch {
      setActionError("Failed to revoke parent link.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResendCode() {
    if (!accessToken || !student) return;

    setActionLoading("resend-code");
    setActionError(null);
    setCreatedCode(null);

    try {
      const response = await resendCode(
        {
          id: student.studentId,
          role: "student",
          reset: student.status === "active",
        },
        accessToken,
        refreshToken
      );

      if (typeof response.password === "string") {
        setCreatedCode(response.password);
      }
    } catch {
      setActionError("Failed to generate a new access code.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!accessToken || !student) return;

    setActionLoading("delete");
    setActionError(null);

    try {
      await deleteStudent(
        student.studentId,
        accessToken,
        refreshToken
      );

      router.push("/admin/students");
    } catch {
      setActionError("Failed to delete student.");
      setActionLoading(null);
    }
  }

  if (isLoading) {
    return (
      <PageShell title="Student">
        <ListSkeleton rows={5} />
      </PageShell>
    );
  }

  if (error || !student) {
    return (
      <PageShell title="Student Details">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {error ?? "Student not found."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/admin/students")}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--color-purple)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <ArrowLeft size={16} />
            Back to Students
          </button>
        </div>
      </PageShell>
    );
  }

  const classLabel = student.classArm
    ? `${student.classLevel} ${student.classArm}`
    : student.classLevel;

  const initials =
    student.fullName
      .split(" ")
      .map((name) => name[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "S";

  const hasParentLink = Boolean(student.parentLinkSentAt);

  if (!student && !error) {
    return (
      <PageShell title="Student">
        <ListSkeleton rows={5} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Student"
      actions={
        <button
          type="button"
          onClick={() => router.push("/admin/students")}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-page)]"
        >
          <ArrowLeft size={16} />
          Back to Students
        </button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5"
      >
        {/* Student header */}
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-purple-light)] text-lg font-semibold text-[var(--color-purple)]">
                {initials}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className="text-xl font-semibold text-[var(--color-text-primary)]"
                    style={{ fontFamily: "var(--font-head)" }}
                  >
                    {student.fullName}
                  </h2>

                  <StatusBadge status={student.status} />
                </div>

                <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate">{student.email}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(`/admin/students/${student.studentId}/edit`)
              }
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--color-purple)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Pencil size={16} />
              Edit Student
            </button>
          </div>
        </section>

        {/* Account overview */}
        <section>
          <div className="mb-3">
            <h3
              className="text-base font-semibold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-head)" }}
            >
              Account Overview
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <InfoCard
              icon={<GraduationCap size={14} />}
              label="Class"
              value={classLabel}
            />

            <InfoCard
              icon={<ShieldAlert size={14} />}
              label="Status"
              value={
                STATUS_STYLES[student.status]?.label ?? student.status
              }
            />

            <InfoCard
              icon={<CalendarDays size={14} />}
              label="Registered"
              value={formatDate(student.createdAt)}
            />
          </div>
        </section>

        {/* Parent access */}
        {canUseParentLink && (
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-purple-light)] text-[var(--color-purple)]">
                  <Users size={18} />
                </div>

                <div>
                  <h3
                    className="font-semibold text-[var(--color-text-primary)]"
                    style={{ fontFamily: "var(--font-head)" }}
                  >
                    Parent Access
                  </h3>

                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {hasParentLink
                      ? `Link sent ${formatDate(student.parentLinkSentAt!)}`
                      : "No parent access link has been sent."}
                  </p>
                </div>
              </div>

              {hasParentLink ? (
                <button
                  type="button"
                  disabled={actionLoading !== null}
                  onClick={handleRevokeParentLink}
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-page)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading === "revoke-link"
                    ? "Revoking..."
                    : "Revoke Link"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={actionLoading !== null}
                  onClick={handleSendParentLink}
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[var(--color-purple)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading === "send-link"
                    ? "Sending..."
                    : "Send Parent Link"}
                </button>
              )}
            </div>
          </section>
        )}

        {/* Account access */}
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-purple-light)] text-[var(--color-purple)]">
                <KeyRound size={18} />
              </div>

              <div>
                <h3
                  className="font-semibold text-[var(--color-text-primary)]"
                  style={{ fontFamily: "var(--font-head)" }}
                >
                  Account Access
                </h3>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Reset password for this student.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={actionLoading !== null}
              onClick={handleResendCode}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-page)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading === "resend-code"
                ? "Resetting..."
                : "Reset Password"}
            </button>
          </div>

          {createdCode && (
            <div className="mt-4 rounded-xl border border-[var(--color-success-dark)]/20 bg-[var(--color-success-light)] p-4">
              <p className="text-xs font-medium text-[var(--color-success-dark)]">
                Student&apos;s password
              </p>

              <p className="mt-1 font-mono text-lg font-semibold tracking-wider text-[var(--color-text-primary)]">
                {createdCode}
              </p>

              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Make sure the student receives this code securely.
              </p>
            </div>
          )}
        </section>

        {actionError && (
          <p className="rounded-lg bg-[var(--color-warning-light)] px-4 py-3 text-sm text-[var(--color-warning-dark)]">
            {actionError}
          </p>
        )}

        {/* Danger zone */}
        <section className="rounded-2xl border border-red-200 bg-[var(--color-bg-card)] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Trash2 size={18} />
              </div>

              <div>
                <h3
                  className="font-semibold text-[var(--color-text-primary)]"
                  style={{ fontFamily: "var(--font-head)" }}
                >
                  Delete Student
                </h3>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Remove this student&apos;s account from the school.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Delete Student
            </button>
          </div>
        </section>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-red-700">
                  Delete {student.fullName}?
                </p>

                <p className="mt-1 text-sm text-red-600">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={actionLoading === "delete"}
                  className="cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={actionLoading === "delete"}
                  className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading === "delete"
                    ? "Deleting..."
                    : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </PageShell>
  );
}