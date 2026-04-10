"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getClassStudents } from "@/lib/api/teacher";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { TeacherStudentRowCard } from "@/components/cards/student-row-card";
import type { ClassStudent } from "@/lib/api/api-types";

export default function ClassStudentsNoArmPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const params = useParams<{ level: string }>();
  const level = decodeURIComponent(params.level);

  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [term, setTerm] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getClassStudents(level, null, accessToken, refreshToken)
      .then((res) => {
        setStudents(res.students);
        setTerm(res.term);
      })
      .catch(() => setError("Failed to load students."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken, level]);

  const title = level;
  const subtitle = term != null ? `Term ${term}` : undefined;

  return (
    <PageShell
      title={title}
      description={subtitle}
      backHref="/teacher/classes"
    >
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          {error}
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-[var(--color-text-secondary)] text-sm">
            No students in this class yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((student) => (
            <TeacherStudentRowCard
              key={student.student_id}
              student={student}
              onClick={() =>
                router.push(
                  `/teacher/students/${student.student_id}`
                )
              }
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}