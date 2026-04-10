"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getAdminTeachers, deleteTeacher } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { AdminTeacher } from "@/lib/api/api-types";

function TeacherRow({
  teacher,
  deleting,
  onDelete,
}: {
  teacher: AdminTeacher;
  deleting: boolean;
  onDelete: () => void;
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
            <p className="font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-jakarta)] truncate">
              {teacher.full_name}
            </p>
            {isAdmin && (
              <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-purple-light)] text-[var(--color-purple)]">
                Admin
              </span>
            )}
            <span
              className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
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
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 truncate">
            {teacher.email}
          </p>
        </div>

        {/* Delete control */}
        {confirmDelete ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[var(--color-text-muted)]">Remove?</span>
            <button
              onClick={() => { onDelete(); setConfirmDelete(false); }}
              disabled={deleting}
              className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-40"
            >
              {deleting ? "Removing…" : "Confirm"}
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
            disabled={deleting}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors shrink-0"
            aria-label="Remove teacher"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        )}
      </div>

      {/* Assigned classes */}
      {classLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-muted)] mr-1 self-center">
            Classes:
          </span>
          {classLabels.map((label) => (
            <span
              key={label}
              className="text-xs font-medium px-2 py-0.5 rounded-md bg-[var(--color-bg-page)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
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

  return (
    <PageShell
      title="Teachers"
      description={`${teachers.length} registered`}
      actions={
        <button
          onClick={() =>
            router.push("/admin/teachers/new")
          }
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-purple)] text-white text-sm font-semibold hover:opacity-90 transition"
        >
          Add teacher
        </button>
      }
    >
      {isLoading ? (
        <ListSkeleton rows={5} />
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

          {teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="font-semibold text-[var(--color-text-primary)] mb-1">
                No teachers yet
              </p>

              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Register your first teacher.
              </p>

              <button
                onClick={() =>
                  router.push("/admin/teachers/new")
                }
                className="px-4 py-2 rounded-xl bg-[var(--color-purple)] text-white text-sm font-semibold"
              >
                Add teacher
              </button>
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
                />
              ))}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}