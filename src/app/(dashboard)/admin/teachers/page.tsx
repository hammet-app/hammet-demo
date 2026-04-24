"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getAdminTeachers, deleteTeacher } from "@/lib/api/admin";
import { resendCode } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { AdminTeacher } from "@/lib/api/api-types";

function TeacherRow({
  teacher,
  deleting,
  onDelete,
  onResend,
}: {
  teacher: AdminTeacher;
  deleting: boolean;
  onDelete: () => void;
  onResend: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAdmin = teacher.roles.includes("school_admin");
  const classLabels = teacher.assigned_classes.map((c) =>
    c.arm ? `${c.level} ${c.arm}` : c.level
  );

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">
              {teacher.full_name}
            </p>

            {isAdmin && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-purple-light)] text-[var(--color-purple)]">
                Admin
              </span>
            )}

            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                teacher.status === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : teacher.status === "pending"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {teacher.status}
            </span>
          </div>

          <p className="text-sm mt-0.5 truncate">
            {teacher.email}
          </p>

          {/* 🔥 Resend invite (only pending) */}
          {teacher.status === "pending" && (
            <button
              onClick={onResend}
              disabled={deleting}
              className="mt-1 text-xs text-[var(--color-purple)] hover:underline disabled:opacity-40"
            >
              Resend invite
            </button>
          )}
        </div>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs">Remove?</span>

            <button
              onClick={() => {
                onDelete();
                setConfirmDelete(false);
              }}
              disabled={deleting}
              className="text-xs text-red-600"
            >
              {deleting ? "Removing…" : "Confirm"}
            </button>

            <button onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
            className="p-1.5 rounded-lg hover:text-red-500 disabled:opacity-40"
          >
            Delete
          </button>
        )}
      </div>

      {/* Classes */}
      {classLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t">
          <span className="text-xs mr-1 self-center">
            Classes:
          </span>

          {classLabels.map((label) => (
            <span
              key={label}
              className="text-xs px-2 py-0.5 rounded-md border"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTeachersPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // 🔥 Success feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getAdminTeachers(accessToken, refreshToken)
      .then((res: any) => setTeachers(res.teachers ?? []))
      .catch(() => setError("Failed to load teachers."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  async function handleDelete(teacherId: string) {
    if (!accessToken) return;

    setDeletingId(teacherId);
    setActionError(null);
    setSuccessMessage(null);

    try {
      await deleteTeacher(teacherId, accessToken, refreshToken);

      setTeachers((prev) =>
        prev.filter((t) => t.teacher_id !== teacherId)
      );
    } catch {
      setActionError("Failed to remove teacher.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleResend(teacherId: string) {
    if (!accessToken) return;

    setActionError(null);
    setSuccessMessage(null);

    try {
      const teacher = teachers.find(
        (t) => t.teacher_id === teacherId
      );
      if (!teacher) return;

      const res = await resendCode(
        { id: teacherId, role: "teacher" },
        accessToken,
        async () => {
          const token = await refreshToken();
          if (!token) throw new Error("Auth expired");
          return token;
        }
      );

      if (typeof res.message === "boolean") {
        setSuccessMessage(`Invite resent to ${teacher.email}`);
      }
    } catch {
      setActionError("Failed to resend invite.");
    }
  }

  return (
    <PageShell
      title="Teachers"
      description={`${teachers.length} registered`}
      actions={
        <button
          onClick={() => router.push("/admin/teachers/new")}
          className="px-4 py-2 rounded-xl bg-[var(--color-purple)] text-white text-sm"
        >
          Add teacher
        </button>
      }
    >
      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <div className="text-sm text-red-700">{error}</div>
      ) : (
        <>
          {/* 🔥 Success */}
          {successMessage && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border text-emerald-700 text-sm">
              {successMessage}
            </div>
          )}

          {/* Existing error */}
          {actionError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border text-red-700 text-sm">
              {actionError}
            </div>
          )}

          {teachers.length === 0 ? (
            <div className="py-24 text-center">
              <p>No teachers yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {teachers.map((teacher) => (
                <TeacherRow
                  key={teacher.teacher_id}
                  teacher={teacher}
                  deleting={deletingId === teacher.teacher_id}
                  onDelete={() =>
                    handleDelete(teacher.teacher_id)
                  }
                  onResend={() =>
                    handleResend(teacher.teacher_id)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}