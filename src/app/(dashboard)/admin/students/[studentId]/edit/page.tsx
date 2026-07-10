"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { UserUpdateRequest } from "@/lib/api/types";
import { updateStudent, getSchoolProfile, getAdminStudents } from "@/lib/api/admin";
import { AuthInput } from "@/components/ui/auth-input";
import { RefreshCw } from "lucide-react";

const LEVELS = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"] as const;

export default function UpdateStudentPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const params = useParams();

  const studentId = params.studentId as string;

  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [classArm, setClassArm] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [dateOfBirth, setDOB] = useState("");

  const [availableArms, setAvailableArms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !studentId) return;

    Promise.all([
      getSchoolProfile(accessToken, refreshToken)
        .then((p) => setAvailableArms(p.availableArms ?? []))
        .catch(() => setAvailableArms([])),
      getAdminStudents(accessToken, refreshToken)
        .then((res) => {
          const found = res.students.find((s) => s.studentId === studentId);
          if (found) {
            setStudentName(found.fullName);
            setEmail(found.email ?? "");
            setClassLevel(found.classLevel ?? "");
            setClassArm(found.classArm ?? "");
          }
        })
        .catch(() => setError("Failed to load student details.")),
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [accessToken, refreshToken, studentId]);

  async function handleSubmit() {
    if (!accessToken || !studentId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateStudent(
        studentId,
        {
          email: email.trim() || undefined,
          dateOfBirth: dateOfBirth.trim() || undefined,
          parentPhone: parentPhone.trim() || undefined,
          classLevel: classLevel.trim() || undefined,
          classArm: classArm.trim() || undefined,
          parentEmail: parentEmail.trim() || undefined,
        } satisfies UserUpdateRequest,
        accessToken,
        refreshToken
      );

      router.push("/admin/students");
    } catch (err) {
      setError(`Failed to update student. ${err instanceof Error ? err.message : err}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectStyle =
    "w-full h-10 px-3 rounded-[10px] border border-border text-[13.5px] text-text-primary bg-white/80 focus:bg-white dark:bg-black/20 outline-none transition-all duration-200 hover:border-purple/30 focus:border-purple focus:ring-2 focus:ring-purple/8 dark:hover:border-cyan/40 dark:focus:border-cyan dark:focus:ring-cyan/10";

  return (
    <PageShell
      title={studentName ? `Update: ${studentName}` : "Update Student"}
      description="Edit student details"
      rounded={true}
      backHref="/admin/students"
      backLabel="Back to Students"
    >
      {isLoading ? (
        <div className="max-w-md w-full">
          <ListSkeleton rows={5} />
        </div>
      ) : (
        <div className="max-w-md w-full flex flex-col gap-6">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Email */}
            <AuthInput
              id="student-email"
              label="Student Email"
              type="email"
              value={email}
              onChange={(val) => setEmail(val)}
              placeholder="Enter student email"
            />

            {/* Date of Birth */}
            <div className="flex flex-col gap-1">
              <label className="text-[12.5px] font-medium text-text-secondary">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDOB(e.target.value)}
                className={selectStyle}
              />
            </div>

            {/* Class Level and Arm side-by-side */}
            <div className={availableArms.length > 0 ? "grid grid-cols-2 gap-4" : "w-full"}>
              <div className="flex flex-col gap-1">
                <label className="text-[12.5px] font-medium text-text-secondary">
                  Class Level
                </label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className={selectStyle}
                >
                  <option value="">Select Class Level</option>
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {availableArms.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="text-[12.5px] font-medium text-text-secondary">
                    Class Arm
                  </label>
                  <select
                    value={classArm}
                    onChange={(e) => setClassArm(e.target.value)}
                    className={selectStyle}
                  >
                    <option value="">Select Class Arm</option>
                    {availableArms.map((arm) => (
                      <option key={arm} value={arm}>
                        {arm}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Parent Email */}
            <AuthInput
              id="parent-email"
              label="Parent Email"
              type="email"
              value={parentEmail}
              onChange={(val) => setParentEmail(val)}
              placeholder="Enter Parent email"
            />

            {/* Parent Phone */}
            <AuthInput
              id="parent-phone"
              label="Parent Phone"
              type="text"
              value={parentPhone}
              onChange={(val) => setParentPhone(val)}
              placeholder="Enter Parent phone"
            />

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-2 w-full h-11 rounded-md bg-[var(--color-purple)] hover:bg-[var(--color-purple-hover)] text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Updating…</span>
                </>
              ) : (
                <span>Update student</span>
              )}
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}