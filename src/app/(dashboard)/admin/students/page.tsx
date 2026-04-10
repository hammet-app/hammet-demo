"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getAdminStudents,
  deleteStudent,
  sendParentLink,
  revokeParentLink,
} from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { AdminStudent } from "@/lib/api/api-types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 1000 / 60 / 60);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type RowAction =
  | { type: "send-link"; studentId: string }
  | { type: "revoke-link"; studentId: string }
  | { type: "delete"; studentId: string };

type InFlight = { studentId: string; action: RowAction["type"] };

function StudentRow({
  student,
  inFlight,
  onAction,
}: {
  student: AdminStudent;
  inFlight: InFlight | null;
  onAction: (action: RowAction) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const busy =
    inFlight?.studentId === student.student_id;
  const busyAction = busy ? inFlight!.action : null;

  const hasLink = student.parent_link_sent_at !== null;
  const classLabel = student.class_arm
    ? `${student.class_level} ${student.class_arm}`
    : student.class_level;

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-3">
      {/* Top row — identity */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-jakarta)] truncate">
              {student.full_name}
            </p>
            <span
              className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                student.status === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : student.status === "pending"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {student.status}
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 truncate">
            {student.email}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {classLabel}
          </p>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[var(--color-border)]">
        {/* Parent link section */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hasLink ? (
            <>
              <span className="text-xs text-[var(--color-text-muted)]">
                Link sent {timeAgo(student.parent_link_sent_at!)}
              </span>
              <button
                onClick={() =>
                  onAction({ type: "send-link", studentId: student.student_id })
                }
                disabled={busy}
                className="text-xs text-[var(--color-purple)] font-medium hover:underline disabled:opacity-40"
              >
                {busyAction === "send-link" ? "Sending…" : "Resend"}
              </button>
              <span className="text-[var(--color-border)]">·</span>
              {confirmRevoke ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[var(--color-text-muted)]">Revoke?</span>
                  <button
                    onClick={() => {
                      onAction({ type: "revoke-link", studentId: student.student_id });
                      setConfirmRevoke(false);
                    }}
                    disabled={busy}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-40"
                  >
                    {busyAction === "revoke-link" ? "Revoking…" : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmRevoke(false)}
                    className="text-xs text-[var(--color-text-muted)]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmRevoke(true)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-red-600 transition-colors"
                >
                  Revoke
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() =>
                onAction({ type: "send-link", studentId: student.student_id })
              }
              disabled={busy}
              className="text-xs text-[var(--color-purple)] font-medium hover:underline disabled:opacity-40 flex items-center gap-1"
            >
              {busyAction === "send-link" ? (
                "Sending…"
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                  Send parent link
                </>
              )}
            </button>
          )}
        </div>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--color-text-muted)]">Delete student?</span>
            <button
              onClick={() => {
                onAction({ type: "delete", studentId: student.student_id });
                setConfirmDelete(false);
              }}
              disabled={busy}
              className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-40"
            >
              {busyAction === "delete" ? "Deleting…" : "Confirm"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-[var(--color-text-muted)]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
            aria-label="Delete student"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "pending" | "suspended">("all");

  useEffect(() => {
    if (!accessToken) return;

    getAdminStudents(accessToken, refreshToken)
      .then((res) => setStudents(res.students))
      .catch(() => setError("Failed to load students."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  async function handleAction(action: RowAction) {
    if (!accessToken) return;

    setInFlight({ studentId: action.studentId, action: action.type });
    setActionError(null);

    try {
      if (action.type === "send-link") {
        const res = await sendParentLink(
          action.studentId,
          accessToken,
          refreshToken
        );

        setStudents((prev) =>
          prev.map((s) =>
            s.student_id === action.studentId
              ? { ...s, parent_link_sent_at: res.expires_at }
              : s
          )
        );
      } else if (action.type === "revoke-link") {
        await revokeParentLink(
          action.studentId,
          accessToken,
          refreshToken
        );

        setStudents((prev) =>
          prev.map((s) =>
            s.student_id === action.studentId
              ? { ...s, parent_link_sent_at: null }
              : s
          )
        );
      } else if (action.type === "delete") {
        await deleteStudent(
          action.studentId,
          accessToken,
          refreshToken
        );

        setStudents((prev) =>
          prev.filter((s) => s.student_id !== action.studentId)
        );
      }
    } catch {
      setActionError("Action failed. Please try again.");
    } finally {
      setInFlight(null);
    }
  }

  const filtered = students.filter((s) => {
    const matchesSearch =
      !search ||
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.class_level.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusTabs = [
    { key: "all" as const, label: "All", count: students.length },
    {
      key: "active" as const,
      label: "Active",
      count: students.filter((s) => s.status === "active").length,
    },
    {
      key: "pending" as const,
      label: "Pending",
      count: students.filter((s) => s.status === "pending").length,
    },
    {
      key: "suspended" as const,
      label: "Suspended",
      count: students.filter((s) => s.status === "suspended").length,
    },
  ];

  return (
    <PageShell
      title="Students"
      description={`${students.length} registered`}
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/admin/students/bulk")}
            className="px-4 py-2 rounded-xl border text-sm"
          >
            Bulk import
          </button>

          <button
            onClick={() => router.push("/admin/students/new")}
            className="px-4 py-2 rounded-xl bg-[var(--color-purple)] text-white text-sm"
          >
            Add student
          </button>
        </div>
      }
    >
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      ) : (
        <>
          {actionError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {actionError}
            </div>
          )}

          {students.length > 0 && (
            <div className="flex flex-col gap-4 mb-6">
              {/* Search */}
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 rounded-xl border"
              />

              {/* Tabs */}
              <div className="flex gap-1">
                {statusTabs.map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              No students found
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((student) => (
                <StudentRow
                  key={student.student_id}
                  student={student}
                  inFlight={inFlight}
                  onAction={handleAction}
                />
              ))}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}