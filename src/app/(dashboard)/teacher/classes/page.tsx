"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getTeacherClasses } from "@/lib/api/teacher";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { TeacherClass } from "@/lib/api/api-types";

export default function TeacherClassesPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getTeacherClasses(accessToken, refreshToken)
      .then((res) =>{
        setClasses(res.classes)})
      .catch(() => setError("Failed to load classes."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  function handleClassClick(cls: TeacherClass) {
    const path =
      cls.arm != null
        ? `/teacher/classes/${cls.level}/${cls.arm}/students`
        : `/teacher/classes/${cls.level}/students`;

    router.push(path);
  }

  return (
    <PageShell title="My Classes">
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          {error}
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-purple-light)] flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-[var(--color-purple)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
              />
            </svg>
          </div>

          <p className="text-[var(--color-text-secondary)] text-sm">
            No classes assigned yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const label = cls.arm
              ? `${cls.level} ${cls.arm}`
              : cls.level;

            const initials = cls.arm
              ? `${cls.level.replace(/[^A-Z0-9]/gi, "")}${cls.arm}`
              : cls.level.replace(/[^A-Z0-9]/gi, "");

            return (
              <button
                key={`${cls.level}-${cls.arm ?? "solo"}`}
                onClick={() => handleClassClick(cls)}
                className="group w-full text-left bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[var(--color-purple)] hover:shadow-md transition-all duration-200"
              >
                {/* Monogram badge */}
                <div className="w-12 h-12 rounded-xl bg-[var(--color-purple-light)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-purple)] transition-colors duration-200">
                  <span className="text-sm font-bold text-[var(--color-purple)] group-hover:text-white transition-colors duration-200 font-[family-name:var(--font-jakarta)]">
                    {initials}
                  </span>
                </div>

                <p className="text-[var(--color-text-primary)] font-semibold text-lg font-[family-name:var(--font-jakarta)] mb-1">
                  {label}
                </p>

                <p className="text-[var(--color-text-secondary)] text-sm">
                  Term {cls.term} &middot; {cls.student_count}{" "}
                  {cls.student_count === 1 ? "student" : "students"}
                </p>

                <div className="mt-4 flex items-center gap-1 text-[var(--color-purple)] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  View students
                  <svg
                    className="w-4 h-4 translate-x-0 group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}