"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageShell, ListSkeleton } from "@/components/layout/common/PageShell";
import { useAuth } from "@/lib/auth/auth-context";
import { UserUpdateRequest } from "@/lib/api/types";
import { updateStudent, getSchoolProfile, getAdminStudent } from "@/lib/api/admin";
import { AuthInput } from "@/components/ui/auth-input";
import { RefreshCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils/utils";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { StudentUpdateSuccessCard } from "@/components/cards/admin/update/UpdateSuccessCard";

const LEVELS = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"] as const;
const UPPER_TIERS = ["premier", "global"]

export default function UpdateStudentPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const params = useParams();

  const studentId = params.studentId as string;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [classArm, setClassArm] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [dateOfBirth, setDOB] = useState("");

  const [availableArms, setAvailableArms] = useState<string[]>([]);
  const [tier, setTier] = useState<string|null>(null)
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<boolean>(false)

  const fullNameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!accessToken || !studentId) return;

    Promise.all([
      getSchoolProfile(accessToken, refreshToken)
        .then((p) => {
          setAvailableArms(p.availableArms ?? [])
          setTier(p.tier)
        })
        .catch(() => {
          setAvailableArms([])
          setTier(null)
        }),
      getAdminStudent(studentId, accessToken, refreshToken)
        .then((res) => {
          setFullName(res.fullName ?? "");
          setEmail(res.email ?? "");
          setClassLevel(res.classLevel ?? "");
          setClassArm(res.classArm ?? "");
        })
        .catch(() => setError("Failed to load student details.")),
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [accessToken, refreshToken, studentId]);

  function editAgain() {
    setUpdated(false);

    requestAnimationFrame(() =>{
      fullNameRef.current?.focus();
    })
  }

  async function handleSubmit() {
    if (!accessToken || !studentId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateStudent(
        studentId,
        {
          fullName: fullName.trim() || undefined,
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
      
      setUpdated(true)
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
      title={"Update Student"}
      description={fullName}
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
          {updated ? (
            <StudentUpdateSuccessCard
              studentName={fullName}
              onBack={() => router.push("/admin/students")}
              onEditAgain={editAgain}
            />
          ) : (
            <>
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                {error && (
                  <Alert variant="error" title="Update Failed">
                    {error}
                  </Alert>
                )}

                <FormSection
                  title="Student Information"
                  description="Basic Information about the student"
                >

                  <AuthInput
                    ref={fullNameRef}
                    id="full-name"
                    label="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e)}
                  />

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
                      className={cn("w-full h-10 px-3 rounded-[10px] border text-[13.5px] text-text-primary",
                        "placeholder:text-text-muted/70 bg-white/80 focus:bg-white dark:bg-black/20 outline-none",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "border-border hover:border-purple/30 focus:border-purple focus:ring-2 focus:ring-purple/8",
                        "dark:hover:border-cyan/40 dark:focus:border-cyan dark:focus:ring-cyan/10")}
                    />
                  </div>
                </FormSection>
                
                <FormSection
                  title="Academic Information"
                  description="Assign the student to a class"
                >
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
                </FormSection>

                {tier && UPPER_TIERS.includes(tier) && (
                  <FormSection
                    title="Parent Information"
                    description="Used for progress reports"
                  >
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
                  </FormSection>
                )}

                {/* Submit Button */}
                <Button
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
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </PageShell>
  );
}