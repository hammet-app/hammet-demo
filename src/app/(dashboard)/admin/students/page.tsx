"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getAdminStudents,
  deleteStudent,
  sendParentLink,
  revokeParentLink,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/api-client";
import { resendCode } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { AdminStudent } from "@/lib/api/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 1000 / 60 / 60);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const CLASS_LEVELS = [
  "JSS1", "JSS2", "JSS3",
  "SSS1", "SSS2", "SSS3",
] as const;

const STATUSES = ["active", "pending"] as const;

type RowAction =
  | { type: "send-link"; studentId: string }
  | { type: "revoke-link"; studentId: string }
  | { type: "delete"; studentId: string }
  | { type: "resend-code"; studentId: string }
  | { type: "update"; studentId: string };

type InFlight = { studentId: string; action: RowAction["type"] };

function StudentRow({
  student,
  inFlight,
  onAction,
  created,
  router,
}: {
  student: AdminStudent;
  inFlight: InFlight | null;
  onAction: (action: RowAction) => void;
  created?: { fullName: string; email: string; code: string };
  router: ReturnType<typeof useRouter>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const busy = inFlight?.studentId === student.studentId;
  const busyAction = busy ? inFlight!.action : null;

  const hasLink = student.parentLinkSentAt !== null;
  const classLabel = student.classArm
    ? `${student.classLevel} ${student.classArm}`
    : student.classLevel;

  const isPending = student.status === "pending";

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">{student.fullName}</p>
            <span className="text-xs px-2 py-0.5 rounded-full">
              {student.status}
            </span>
          </div>
          <p className="text-sm mt-0.5 truncate">{student.email}</p>
          <p className="text-xs mt-0.5">{classLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-1 border-t">
        {/* Parent link section */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hasLink ? (
            <>
              <span className="text-xs">
                {student.parentLinkSentAt
                  ? `Link sent ${timeAgo(student.parentLinkSentAt)}`
                  : "Link sent 0d ago"}
              </span>

              <button
                onClick={() =>
                  onAction({ type: "send-link", studentId: student.studentId })
                }
                disabled={busy}
                className="text-xs hover:underline"
              >
                {busyAction === "send-link" ? "Sending…" : "Resend"}
              </button>

              <button
                onClick={() =>
                  router.push(`/admin/students/${student.studentId}/edit`)
                }
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-purple)]"
              >
                Update
              </button>

              <span>·</span>

              {confirmRevoke ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">Revoke?</span>
                  <button
                    onClick={() => {
                      onAction({
                        type: "revoke-link",
                        studentId: student.studentId,
                      });
                      setConfirmRevoke(false);
                    }}
                    disabled={busy}
                    className="text-xs text-red-600"
                  >
                    {busyAction === "revoke-link" ? "Revoking…" : "Confirm"}
                  </button>
                  <button onClick={() => setConfirmRevoke(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmRevoke(true)}>Revoke</button>
              )}
            </>
          ) : (
            <button
              onClick={() =>
                onAction({ type: "send-link", studentId: student.studentId })
              }
              disabled={busy}
              className="text-xs hover:underline"
            >
              {busyAction === "send-link" ? "Sending…" : "Send parent link"}
            </button>
          )}
        </div>

        {/* Resend code (pending) / Reset password (active) */}
        <button
          onClick={() =>
            onAction({ type: "resend-code", studentId: student.studentId })
          }
          disabled={busy}
          className="text-xs text-[var(--color-purple)] hover:underline"
        >
          {busyAction === "resend-code"
            ? isPending ? "Sending…" : "Resetting…"
            : isPending ? "Resend code" : "Reset password"}
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs">Delete student?</span>
            <button
              onClick={() => {
                onAction({ type: "delete", studentId: student.studentId });
                setConfirmDelete(false);
              }}
              disabled={busy}
              className="text-xs text-red-600"
            >
              {busyAction === "delete" ? "Deleting…" : "Confirm"}
            </button>
            <button onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)}>Delete</button>
        )}

        {created && (
          <div className="mt-3 p-3 rounded-xl border bg-[var(--color-bg-page)] w-full">
            <p className="text-xs text-[var(--color-text-muted)]">
              {isPending ? "Verification code" : "New password"}
            </p>
            <p className="text-sm font-mono mt-1">{created.code}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  const label = isPending ? "Code" : "Password";
                  const content = `Name: ${created.fullName}\nEmail: ${created.email}\n${label}: ${created.code}`;
                  const blob = new Blob([content], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${created.fullName}.txt`;
                  a.click();
                }}
                className="text-xs underline"
              >
                TXT
              </button>
              <button
                onClick={() => {
                  const label = isPending ? "code" : "password";
                  const content = `full_name,email,${label}\n${created.fullName},${created.email},${created.code}`;
                  const blob = new Blob([content], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `student.csv`;
                  a.click();
                }}
                className="text-xs underline"
              >
                CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminStudentsPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inFlight, setInFlight] = useState<InFlight | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [createdMap, setCreatedMap] = useState<
    Record<string, { fullName: string; email: string; code: string }>
  >({});

  // Filter state
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    getAdminStudents(accessToken, refreshToken)
      .then((res) => setStudents(res.students))
      .catch(() => setError("Failed to load students."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return students.filter((s) => {
      const classLabel = s.classArm
        ? `${s.classLevel} ${s.classArm}`
        : s.classLevel;

      const matchQuery =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);

      const matchClass =
        !classFilter || classLabel === classFilter;

      const matchStatus =
        !statusFilter ||
        s.status.toLowerCase() === statusFilter.toLowerCase();

      return matchQuery && matchClass && matchStatus;
    });
  }, [students, query, classFilter, statusFilter]);

  async function handleAction(action: RowAction) {
    if (!accessToken) return;

    setInFlight({ studentId: action.studentId, action: action.type });
    setActionError(null);

    try {
      if (action.type === "send-link") {
        try {
          const res = await sendParentLink(
            action.studentId,
            accessToken,
            refreshToken
          );
          setStudents((prev) =>
            prev.map((s) =>
              s.studentId === action.studentId
                ? { ...s, parentLinkSentAt: res.expiresAt }
                : s
            )
          );
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            setActionError(
              "Student has not completed any module. Please ensure that student has completed a class before attempting to send a parent link."
            );
          } else {
            setActionError("Action failed.");
          }
          return;
        }
      } else if (action.type === "revoke-link") {
        await revokeParentLink(action.studentId, accessToken, refreshToken);
        setStudents((prev) =>
          prev.map((s) =>
            s.studentId === action.studentId
              ? { ...s, parentLinkSentAt: null }
              : s
          )
        );
      } else if (action.type === "delete") {
        await deleteStudent(action.studentId, accessToken, refreshToken);
        setStudents((prev) =>
          prev.filter((s) => s.studentId !== action.studentId)
        );
      } else if (action.type === "resend-code") {
        const student = students.find((s) => s.studentId === action.studentId);
        if (!student) return;

        const res = await resendCode(
          { id: action.studentId, role: "student", reset: student.status === "active" },
          accessToken,
          refreshToken
        );

        if (typeof res.message === "string") {
          const code = res.message;

          setCreatedMap((prev) => ({
            ...prev,
            [action.studentId]: {
              fullName: student.fullName,
              email: student.email,
              code: code,
            },
          }));
        }
      }
    } catch {
      setActionError("Action failed.");
    } finally {
      setInFlight(null);
    }
  }

  return (
    <PageShell
      title="Students"
      description={`${students.length} registered`}
    >
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Filter bar */}
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 min-w-0 h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            >
              <option value="">All classes</option>
              {CLASS_LEVELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            {filtered.length} of {students.length} student
            {students.length !== 1 ? "s" : ""}
          </p>

          {actionError && (
            <p className="text-sm text-red-600">{actionError}</p>
          )}

          {filtered.map((student) => (
            <StudentRow
              key={student.studentId}
              student={student}
              inFlight={inFlight}
              onAction={handleAction}
              created={createdMap[student.studentId]}
              router={router}
            />
          ))}

          {filtered.length === 0 && !isLoading && (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
              No students match your filters.
            </p>
          )}
        </div>
      )}
    </PageShell>
  );
}