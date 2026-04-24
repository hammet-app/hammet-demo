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
import { resendCode } from "@/lib/api/admin";
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
  | { type: "delete"; studentId: string }
  | { type: "resend-code"; studentId: string };

type InFlight = { studentId: string; action: RowAction["type"] };

function StudentRow({
  student,
  inFlight,
  onAction,
  created,
}: {
  student: AdminStudent;
  inFlight: InFlight | null;
  onAction: (action: RowAction) => void;
  created?: {
    full_name: string;
    email: string;
    code: string;
  };
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const busy = inFlight?.studentId === student.student_id;
  const busyAction = busy ? inFlight!.action : null;

  const hasLink = student.parent_link_sent_at !== null;
  const classLabel = student.class_arm
    ? `${student.class_level} ${student.class_arm}`
    : student.class_level;

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">
              {student.full_name}
            </p>
            <span className="text-xs px-2 py-0.5 rounded-full">
              {student.status}
            </span>
          </div>
          <p className="text-sm mt-0.5 truncate">{student.email}</p>
          <p className="text-xs mt-0.5">{classLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-1 border-t">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hasLink ? (
            <>
              <span className="text-xs">
                {student.parent_link_sent_at
                  ? `Link sent ${timeAgo(student.parent_link_sent_at)}`
                  : "Link sent 0d ago"}
              </span>

              <button
                onClick={() =>
                  onAction({ type: "send-link", studentId: student.student_id })
                }
                disabled={busy}
                className="text-xs hover:underline"
              >
                {busyAction === "send-link" ? "Sending…" : "Resend"}
              </button>

              <span>·</span>

              {confirmRevoke ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">Revoke?</span>
                  <button
                    onClick={() => {
                      onAction({
                        type: "revoke-link",
                        studentId: student.student_id,
                      });
                      setConfirmRevoke(false);
                    }}
                    disabled={busy}
                    className="text-xs text-red-600"
                  >
                    {busyAction === "revoke-link"
                      ? "Revoking…"
                      : "Confirm"}
                  </button>
                  <button onClick={() => setConfirmRevoke(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmRevoke(true)}>
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
              className="text-xs hover:underline"
            >
              {busyAction === "send-link"
                ? "Sending…"
                : "Send parent link"}
            </button>
          )}
        </div>

        {student.status === "pending" && (
          <button
            onClick={() =>
              onAction({
                type: "resend-code",
                studentId: student.student_id,
              })
            }
            disabled={busy}
            className="text-xs text-[var(--color-purple)] hover:underline"
          >
            {busyAction === "resend-code"
              ? "Sending…"
              : "Resend code"}
          </button>
        )}

        {confirmDelete ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs">Delete student?</span>
            <button
              onClick={() => {
                onAction({
                  type: "delete",
                  studentId: student.student_id,
                });
                setConfirmDelete(false);
              }}
              disabled={busy}
              className="text-xs text-red-600"
            >
              {busyAction === "delete" ? "Deleting…" : "Confirm"}
            </button>
            <button onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)}>
            Delete
          </button>
        )}

        {created && (
  <div className="mt-3 p-3 rounded-xl border bg-[var(--color-bg-page)]">
    <p className="text-xs text-[var(--color-text-muted)]">
      Verification code
    </p>

    <p className="text-sm font-mono mt-1">
      {created.code}
    </p>

    <div className="flex gap-2 mt-2">
      <button
        onClick={() => {
          const content = `Name: ${created.full_name}\nEmail: ${created.email}\nCode: ${created.code}`;
          const blob = new Blob([content], { type: "text/plain" });
          const url = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = `${created.full_name}.txt`;
          a.click();
        }}
        className="text-xs underline"
      >
        TXT
      </button>

      <button
        onClick={() => {
          const content = `full_name,email,code\n${created.full_name},${created.email},${created.code}`;
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
    Record<string, { full_name: string; email: string; code: string }>
  >({});

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
      } else if (action.type === "resend-code") {
        const student = students.find(
          (s) => s.student_id === action.studentId
        );
        if (!student) return;

        const res = await resendCode(
          { id: action.studentId, role: "student" },
          accessToken,
          refreshToken
        );

        if (typeof res.message === "string") {
          const code = res.message;

          setCreatedMap((prev) => ({
            ...prev,
            [action.studentId]: {
              full_name: student.full_name,
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
    <PageShell title="Students" description={`${students.length} registered`}>
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((student) => (
            <StudentRow
              key={student.student_id}
              student={student}
              inFlight={inFlight}
              onAction={handleAction}
              created={createdMap[student.student_id]}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}