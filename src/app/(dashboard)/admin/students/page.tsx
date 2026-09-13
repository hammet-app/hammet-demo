"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getAdminStudents, getSchoolProfile } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/common/PageShell";
import { Pagination, SchoolProfile, type AdminStudent } from "@/lib/api/types";
import { UserPlus, Users, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/cards/common";
import { RowAction, InFlight } from "@/components/cards/admin/student";

const STATUSES = [
  "pending",
  "active",
  "suspended",
  "graduated",
] as const;

const CLASS_LEVELS = [
  "JSS1",
  "JSS2",
  "JSS3",
  "SSS1",
  "SSS2",
  "SSS3",
  "summer",
] as const;

function StudentRow({
  student,
  onClick,
}: {
  student: AdminStudent;
  onClick: () => void;
}) {
  const initials = student.fullName
    .split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const classLabel = student.classArm
    ? `${student.classLevel} ${student.classArm}`
    : student.classLevel;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      data-testid={`student-row-${student.studentId}`}
      whileHover={{ y: -1 }}
      className="w-full text-left bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-purple)]/60 rounded-xl p-4 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[var(--color-purple-light)] text-[var(--color-purple)] font-semibold text-sm flex items-center justify-center shrink-0">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
              {student.fullName}
            </p>

            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-purple-light)] text-[var(--color-purple)]">
              {classLabel}
            </span>
          </div>

          <p className="text-sm text-[var(--color-text-muted)] truncate mt-1">
            {student.email}
          </p>
        </div>

        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
            student.status === "active"
              ? "bg-[var(--color-success-light)] text-[var(--color-success-dark)]"
              : student.status === "pending"
              ? "bg-[var(--color-warning-light)] text-[var(--color-warning-dark)]"
              : "bg-[var(--color-bg-page)] text-[var(--color-text-secondary)]"
          }`}
        >
          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
        </span>

        <ChevronRight
          size={17}
          className="text-[var(--color-text-muted)] shrink-0"
        />
      </div>
    </motion.button>
  );
}

export default function AdminStudentsPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [profile, setProfile] = useState<SchoolProfile>();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!accessToken) return;

    getSchoolProfile(accessToken, refreshToken)
      .then((res) => setProfile(res))
      .catch(() => setError("Failed to load school"))
    getAdminStudents(
      accessToken,
      refreshToken,
      page,
      pageSize,
      debouncedQuery,
      classFilter,
      status ?? undefined
    )
      .then((res) => {
        setStudents(res.students);
        setPagination(res.pagination)
      })
      .catch(() => setError("Failed to load students."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken, page, debouncedQuery, classFilter, status]);

  const tier = profile?.tier;

  const availableClasses =
    tier === "summer"
      ? ["summer"]
      : CLASS_LEVELS.filter((level) => level !== "summer");

  return (
    <PageShell
      title="Students"
      description={`${pagination?.total ?? 0} registered`}
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/students/new")}
            className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-[var(--color-purple)] text-white text-sm font-medium hover:opacity-90 transition"
          >
            <UserPlus size={16} className="mr-2 shrink-0" />
            Add New Student
          </button>

          <button
            onClick={() => router.push("/admin/students/bulk")}
            className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-white/80 text-purple text-sm font-medium hover:opacity-90 transition"
          >
            <Users size={16} className="mr-2 shrink-0" />
            Bulk Register
          </button>
        </div>
      }
    >
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div>{error}</div>
      ) : (
        <motion.div 
          className="flex flex-col gap-3"

          initial="hidden"
          animate="show"
        >
          {/* Filter bar */}
          <motion.div 
            className="flex gap-2 flex-wrap bg-[var(--color-purple-light)] p-6 rounded-b-lg"
            initial={{ opacity: 0, y: 8, }}
            animate={{ opacity: 1, y: 0, }}
            transition={{ duration: 0.3, }}
          >
            <input
              type="text"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              className="flex-1 min-w-0 h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            />
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            >
              <option value="">All classes</option>
              {availableClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={status ?? ""}
              onChange={(e) => {
                const newStatus = e.target.value;

                const params = new URLSearchParams(searchParams.toString());

                if (newStatus) {
                  params.set("status", newStatus);
                } else {
                  params.delete("status");
                }

                params.delete("page");

              const queryString = params.toString();

              router.replace(
                queryString
                  ? `/admin/students?${queryString}`
                  : "/admin/students"
              );
                setPage(1);
              }}
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            >
              <option value="">All statuses</option>

              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </motion.div>
          

          <p className="text-xs text-[var(--color-text-muted)]">
            Showing {students.length} of {pagination?.total ?? 0} students
          </p>   
    

          {students.length === 0 && !isLoading ? (
            <EmptyState
              icon={<Users size={28} />}
              title="No students found"
              description="Try changing your filters or register a new student"
            
            />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {students.map((student) => (
                  <StudentRow
                    key={student.studentId}
                    student={student}
                    onClick={() =>
                      router.push(`/admin/students/${student.studentId}`)
                    }
                  />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="cursor-pointer px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-bg-page)] transition"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-[var(--color-text-muted)]">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="cursor-pointer px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-bg-page)] transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          
        </motion.div>
      )}
    </PageShell>
  );
}