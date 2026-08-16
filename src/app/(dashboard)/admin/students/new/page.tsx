"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError } from "@/lib/api/api-client";
import { getSchoolProfile, registerStudent } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/common/PageShell";
import { AuthInput } from "@/components/ui/auth-input";
import { FieldError } from "@/components/ui/auth-shell";
import { RegisterStudentResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils/utils";
import { FormSection } from "@/components/forms/FormSection";
import { motion, AnimatePresence } from "motion/react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SelectField, LEVEL_OPTIONS, GENDER_OPTIONS } from "@/components/forms";

const upperTiers = ["premier", "global"]

type FormState = {
  firstName: string;
  lastName: string;
  classLevel: string;
  classArm: string;
  gender: string;
  parentEmail: string;
  parentPhone: string;
  dateOfBirth: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState, availableArms: string[], tier: string): FormErrors {
  const errs: FormErrors = {};
  
  if (!form.firstName.trim()) errs.firstName = "First name is required";
  if (!form.lastName.trim()) {
    errs.lastName = "Last Name is required";
  }
  if (!form.classLevel) errs.classLevel = "Select level";
  if (availableArms.length > 0 && !form.classArm) errs.classArm = "Select arm";
  if (upperTiers.includes(tier)) {
    if (!form.parentEmail.trim()) errs.parentEmail = "Parent email is required";
    if (!form.parentPhone.trim()) errs.parentPhone = "Phone is required";
  }
  if (!form.dateOfBirth.trim()) errs.dateOfBirth = "Date of Birth";
  return errs;
}

export default function NewStudentPage() {
  const { accessToken, refreshToken } = useAuth();

  const [availableArms, setAvailableArms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false)

  const [countryCode, setCountryCode] = useState("+234");

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    classLevel: "",
    classArm: "",
    gender: "",
    parentEmail: "",
    parentPhone: "",
    dateOfBirth: "",
  });

  const [created, setCreated] = useState<RegisterStudentResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [tier, setTier] = useState<string | null>("")

  const fullNameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!accessToken) return;

    getSchoolProfile(accessToken, refreshToken)
      .then((p) => {
        setAvailableArms(p.availableArms ?? []);
        setTier(p.tier)
      })
      .catch(() => setAvailableArms([]))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    if (error) {setError(null)};
  }

  async function handleSubmit() {
    if (!accessToken || !tier ) return;

    setCreated(null)

    const errs = validate(form, availableArms, tier);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitting(true);
    setError(null);

    let finalPhone = null
    let finalEmail = null

    if (upperTiers.includes(tier)) {
      const clean = form.parentPhone.replace(/^0/, "");

      finalPhone = `${countryCode}${clean}`;
      finalEmail = form.parentEmail
    } else {
      finalPhone = "";
      finalEmail = ""; 
    }

    

    try {
      const { firstName, lastName, ...rest } = form
      const res = await registerStudent(
        {
          ...rest,
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          parentPhone: finalPhone,
          parentEmail: finalEmail,
        },
        accessToken,
        refreshToken
      );

      setCreated(res);

      setForm({
        firstName: "",
        lastName: "",
        classLevel: "",
        classArm: "",
        gender: "",
        parentEmail: "",
        parentPhone: "",
        dateOfBirth: "",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(err.message);
        } else if (err.status === 403) {
          setError(err.message);
        } else if (err.status === 404) {
          setError(err.message);
        } else if (err.status === 409) {
          setError(err.message);
        } else if (err.status === 400 || err.status === 422) {
          setError(err.message);
        } else if (err.status === 500) {
          setError("Server error. Please try again.");
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(`Unable to connect. ${err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function downloadTXT() {
    if (!created) return;

    const content = `Name: ${created.fullName}\nUsername: ${created.username}\nCode: ${created.password}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${created.fullName}.txt`;
    a.click();
  }

  function downloadCSV() {
    if (!created) return;

    const content = `fullName,username,code\n${created.fullName},${created.username},${created.password}`;

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `student.csv`;
    a.click();
  }

  function registerAnotherStudent() {
    setCreated(null);

    requestAnimationFrame(() => {
      fullNameRef.current?.focus();
    })
  }

  return (
    <PageShell 
      title="Register Student" 
      rounded
      backHref="/admin/students"
    >
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : (
        <div className="max-w-md flex flex-col gap-6">
          {error && (
           <Alert variant="error" title="Registration Failed">
            • {error}
           </Alert> 
          )}

          {!created && (
            <>
              <FormSection
                title="Student Information"
                description="Basic Information about the student"
              >
                <div className="flex gap-2">
                  <AuthInput
                    ref={fullNameRef}
                    id="first-name"
                    label="First Name"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e)}
                    className="flex-1"
                  />
                  <FieldError message={errors.firstName} />

                  <AuthInput
                    id="last-name"
                    label="Last Name"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e)}
                    className="flex-1"
                  />
                  <FieldError message={errors.lastName} />
                </div>

                <label className="text-sm font-medium mb-1 block">
                  Date of Birth
                </label>

                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  className={cn("w-full h-10 px-3 rounded-[10px] border text-[13.5px] text-text-primary",
                      "placeholder:text-text-muted/70 bg-white/80 focus:bg-white dark:bg-black/20 outline-none",
                      "transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "border-border hover:border-purple/30 focus:border-purple focus:ring-2 focus:ring-purple/8",
                      "dark:hover:border-cyan/40 dark:focus:border-cyan dark:focus:ring-cyan/10")}
                />

                <FieldError message={errors.dateOfBirth} />

                <SelectField
                  id="gender"
                  label="Gender"
                  value={form.gender}
                  options={GENDER_OPTIONS}
                  error={errors.gender}
                  onChange={(value) => set("gender",value)}
                />
                <FieldError message={errors.gender} />

              </FormSection>

              <FormSection
                title="Academic Information"
                description="Assign the student to a class"
              >
                <SelectField
                  id="level"
                  label="Class"
                  value={form.classLevel}
                  options={LEVEL_OPTIONS}
                  error={errors.classLevel}
                  onChange={(value) => set("classLevel",value)}
                />
                <FieldError message={errors.classLevel} />
              

                {availableArms.length > 0 && (
                  <div>
                    <select
                      value={form.classArm}
                      onChange={(e) => set("classArm", e.target.value)}
                    >
                      <option value="">Select arm</option>
                      {availableArms.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                    <FieldError message={errors.classArm} />
                  </div>
                )}
              </FormSection>
              
              {tier && upperTiers.includes(tier) && (
                <FormSection
                  title="Parent Information"
                  description="Used for progress reports"
                >
                  <AuthInput
                    id="parent-email"
                    label="Parent email"
                    value={form.parentEmail}
                    onChange={(e) => set("parentEmail", e)}
                  />
                  <FieldError message={errors.parentEmail} />
                
                  <div className="flex gap-2">
                    <input
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className={cn("w-24 h-10 px-3 rounded-[10px] border text-[13.5px] text-text-primary",
                        "placeholder:text-text-muted/70 bg-white/80 focus:bg-white dark:bg-black/20 outline-none",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "border-border hover:border-purple/30 focus:border-purple focus:ring-2 focus:ring-purple/8",
                        "dark:hover:border-cyan/40 dark:focus:border-cyan dark:focus:ring-cyan/10")}
                    />

                    <input
                      placeholder="Phone number"
                      value={form.parentPhone}
                      onChange={(e) => set("parentPhone", e.target.value)}
                      className={cn("w-74 h-10 px-3 rounded-[10px] border text-[13.5px] text-text-primary",
                        "placeholder:text-text-muted/70 bg-white/80 focus:bg-white dark:bg-black/20 outline-none",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "border-border hover:border-purple/30 focus:border-purple focus:ring-2 focus:ring-purple/8",
                        "dark:hover:border-cyan/40 dark:focus:border-cyan dark:focus:ring-cyan/10")}
                    />
                  </div>
                  <FieldError message={errors.parentPhone} />
                </FormSection>
              )}

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-purple-600 text-white py-3 rounded-md"
              >
                {submitting ? "Registering..." : "Register student"}
              </Button>
          </>
          )}

          <AnimatePresence>
            {created && (
              <motion.div
                className="rounded-2xl border border-success/20 bg-bg-card p-6 shadow-sm flex flex-col gap-5"
                initial={{ opacity: 0, y:20, }}
                animate={{ opacity:1, y:0, }}
                exit={{ opacity:0, y:-20, }}
                transition={{ duration:.3 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-light text-success-dark">
                    <Check size={22} />
                  </div>

                  <div>
                    <h2
                      className="text-lg font-semibold text-text-primary"
                      style={{ fontFamily:"var(--font-head)", }}
                    >
                      Student registered successfully
                    </h2>

                    <p className="mt-1 text-sm text-text-muted">
                      Please see the student&apos;s password below. They can change it on their profile pages.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">
                      Student
                    </span>
                    <span className="font-medium">
                      {created.fullName}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-text-muted">
                      Email
                    </span>

                    <span className="font-medium">
                      {created.username}
                    </span>
                  </div>
                </div>
                <div>

                  <p className="text-xs uppercase text-text-muted tracking-wide">
                    Student Password
                  </p>

                  <div
                    className="mt-2 flex items-center justify-between rounded-xl
                      border border-purple-mid/20 bg-gradient-to-r from-purple-light
                      to-bg-card px-5 py-4
                  "
                  >
                    <code className="text-xl font-bold tracking-[0.35em] text-purple-dark">
                      {created.password}
                    </code>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(created.password);
                          setCopied(true);
                          setTimeout(
                            () => setCopied(false),
                            2000
                          );
                        }}
                        className="rounded-lg bg-bg-card p-2 text-text-secondary 
                          transition-colors hover:text-purple-mid"
                      >
                        {copied
                          ? <Check size={16}/>
                          : <Copy size={16}/>
                        }
                      </Button>
                      {copied && (
                        <span className="text-xs font-medium text-success-dark">
                          Copied
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs uppercase tracking-wide text-text-muted">
                    Download Credentials
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={downloadTXT}
                      className="flex-1 border rounded p-2"
                    >
                      Download TXT
                    </Button>

                    <Button
                      onClick={downloadCSV}
                      className="flex-1 border rounded p-2"
                    >
                      Download CSV
                    </Button>
                  </div>
                </div>
                <div className="border-t border-border pt-5">
                  <Button
                    variant="outline"
                    onClick={registerAnotherStudent}
                    className="w-full rounded-xl border border-border py-3 text-sm 
                      font-medium text-text-secondary transition-all 
                      hover:border-purple-mid hover:text-purple-mid hover:bg-purple-light
                    "
                  >
                    Register Another Student
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </PageShell>
  );
}
