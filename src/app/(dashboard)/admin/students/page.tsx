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
import { PageShell, ListSkeleton } from "@/components/layout/PageShell";
import type { AdminStudent } from "@/lib/api/types";
import {
  Mail,
  BookOpen,
  Key,
  Copy,
  Check,
  Trash2,
  Edit,
  Send,
  RefreshCw,
  FileText,
  Table,
} from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  const busy = inFlight?.studentId === student.studentId;
  const busyAction = busy ? inFlight!.action : null;

  const hasLink = student.parentLinkSentAt !== null;
  const classLabel = student.classArm
    ? `${student.classLevel} ${student.classArm}`
    : student.classLevel;

  const isPending = student.status === "pending";

  const initials = student.fullName
    ? student.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "S";

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-purple)]/60 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-sm">
      {/* Top Profile / Info Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar & Text details */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-purple-mid)] to-[var(--color-purple)] text-white font-semibold text-sm flex items-center justify-center shadow-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-base text-[var(--color-text-primary)] leading-tight truncate">
                {student.fullName}
              </p>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isPending
                    ? "bg-[var(--color-warning-light)] text-[var(--color-warning-dark)] border-[var(--color-warning-dark)]/10"
                    : "bg-[var(--color-success-light)] text-[var(--color-success-dark)] border-[var(--color-success-dark)]/10"
                }`}
              >
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-[var(--color-text-secondary)] min-w-0">
              <Mail size={13} className="text-[var(--color-text-muted)] shrink-0" />
              <p className="truncate">{student.email}</p>
            </div>
          </div>
        </div>

        {/* Right: Class label / details */}
        <div className="flex items-center gap-2 shrink-0 sm:self-start">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--color-purple-light)] text-[var(--color-purple)] border border-[var(--color-purple)]/10 flex items-center gap-1">
            <BookOpen size={12} className="text-[var(--color-purple)]" />
            <span>Class {classLabel}</span>
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[var(--color-border)]" />

      {/* Bottom Row: Actions & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Parent Link Status / Action */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--color-text-secondary)]">
          {hasLink ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[var(--color-text-primary)] font-medium">
                <Send size={12} className="text-[var(--color-success)]" />
                <span>
                  {student.parentLinkSentAt
                    ? `Link sent ${timeAgo(student.parentLinkSentAt)}`
                    : "Link sent 0d ago"}
                </span>
              </span>
              <span className="text-[var(--color-text-muted)]">·</span>
              <button
                onClick={() =>
                  onAction({ type: "send-link", studentId: student.studentId })
                }
                disabled={busy}
                className="text-xs font-semibold text-[var(--color-purple)] hover:text-[var(--color-purple-hover)] hover:underline disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {busyAction === "send-link" ? (
                  <>
                    <RefreshCw size={11} className="animate-spin" />
                    <span>Sending…</span>
                  </>
                ) : (
                  <span>Resend link</span>
                )}
              </button>
              <span className="text-[var(--color-text-muted)]">·</span>
              {confirmRevoke ? (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded border border-red-200/40">
                  <span className="text-red-600 font-medium">Revoke?</span>
                  <button
                    onClick={() => {
                      onAction({
                        type: "revoke-link",
                        studentId: student.studentId,
                      });
                      setConfirmRevoke(false);
                    }}
                    disabled={busy}
                    className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    {busyAction === "revoke-link" ? "Revoking…" : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmRevoke(false)}
                    className="text-xs font-semibold text-[var(--color-text-secondary)] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmRevoke(true)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                >
                  Revoke link
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() =>
                onAction({ type: "send-link", studentId: student.studentId })
              }
              disabled={busy}
              className="text-xs font-semibold text-[var(--color-purple)] hover:text-[var(--color-purple-hover)] bg-[var(--color-purple-light)] hover:bg-[var(--color-purple-light)]/80 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {busyAction === "send-link" ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Sending parent link…</span>
                </>
              ) : (
                <>
                  <Send size={12} />
                  <span>Send parent link</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Side: Account Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Update / Edit */}
          <button
            onClick={() =>
              router.push(`/admin/students/${student.studentId}/edit`)
            }
            className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-purple)] bg-[var(--color-bg-page)] hover:bg-[var(--color-purple-light)] border border-[var(--color-border)] hover:border-[var(--color-purple)]/25 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit size={12} />
            <span>Update</span>
          </button>

          {/* Reset password or Resend code */}
          <button
            onClick={() =>
              onAction({ type: "resend-code", studentId: student.studentId })
            }
            disabled={busy}
            className="text-xs font-semibold text-[var(--color-purple)] hover:text-white bg-[var(--color-purple-light)] hover:bg-[var(--color-purple)] px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {busyAction === "resend-code" ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>{isPending ? "Sending code…" : "Resetting password…"}</span>
              </>
            ) : (
              <>
                <Key size={12} />
                <span>{isPending ? "Resend code" : "Reset password"}</span>
              </>
            )}
          </button>

          {/* Delete student */}
          {confirmDelete ? (
            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-lg border border-red-200/40 text-xs">
              <span className="text-red-600 font-semibold">Delete?</span>
              <button
                onClick={() => {
                  onAction({ type: "delete", studentId: student.studentId });
                  setConfirmDelete(false);
                }}
                disabled={busy}
                className="font-bold text-red-600 hover:text-red-700 cursor-pointer"
              >
                {busyAction === "delete" ? "Deleting…" : "Confirm"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="font-semibold text-[var(--color-text-secondary)] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200/40 hover:border-red-600 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Credentials display box */}
      {created && (
        <div className="mt-1 p-4 rounded-xl border border-[var(--color-purple)]/25 bg-gradient-to-br from-[var(--color-bg-page)] to-[var(--color-bg-card)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] font-semibold">
              <Key size={14} className="text-[var(--color-purple)] shrink-0" />
              <span>{isPending ? "Verification Code" : "Temporary Password"}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <code className="text-sm font-mono font-bold bg-[var(--color-purple-light)]/40 text-[var(--color-purple-dark)] px-2.5 py-1 rounded-md border border-[var(--color-purple)]/10 select-all tracking-wider shadow-sm">
                {created.code}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(created.code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                title="Copy code"
                className="p-1.5 rounded-md hover:bg-[var(--color-purple-light)] text-[var(--color-text-secondary)] hover:text-[var(--color-purple)] transition-colors border border-[var(--color-border)] cursor-pointer bg-white"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
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
                className="text-xs font-semibold px-2.5 py-1.5 border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-purple)] hover:border-[var(--color-purple)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FileText size={12} />
                <span>TXT</span>
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
                className="text-xs font-semibold px-2.5 py-1.5 border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-purple)] hover:border-[var(--color-purple)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Table size={12} />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
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

        if (typeof res.code === "string") {
          const code = res.code;

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
          <div className="flex gap-2 flex-wrap bg-[var(--color-purple-light)] p-6 rounded-b-lg">
            <input
              type="text"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 min-w-0 h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            >
              <option value="">All classes</option>
              {CLASS_LEVELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
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