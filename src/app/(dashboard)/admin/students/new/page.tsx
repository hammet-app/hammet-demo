"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError } from "@/lib/api/api-client";
import { getSchoolProfile, registerStudent } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { AuthInput } from "@/components/ui/auth-input";
import { FieldError } from "@/components/ui/auth-shell";
import { RegisterStudentResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils/utils";

const LEVELS = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];

type FormState = {
  fullName: string;
  email: string;
  classLevel: string;
  classArm: string;
  parentEmail: string;
  parentPhone: string;
  dateOfBirth: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState, availableArms: string[]): FormErrors {
  const errs: FormErrors = {};
  if (!form.fullName.trim()) errs.fullName = "Full name is required";
  if (!form.email.trim()) {
    errs.email = "Email is required";
  }
  if (!form.classLevel) errs.classLevel = "Select level";
  if (availableArms.length > 0 && !form.classArm) errs.classArm = "Select arm";
  if (!form.parentEmail.trim()) errs.parentEmail = "Parent email is required";
  if (!form.parentPhone.trim()) errs.parentPhone = "Phone is required";
  if (!form.dateOfBirth.trim()) errs.dateOfBirth = "Date of Birth";
  return errs;
}

export default function NewStudentPage() {
  const { accessToken, refreshToken } = useAuth();

  const [availableArms, setAvailableArms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [countryCode, setCountryCode] = useState("+234");

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    classLevel: "",
    classArm: "",
    parentEmail: "",
    parentPhone: "",
    dateOfBirth: "",
  });

  const [created, setCreated] = useState<RegisterStudentResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!accessToken) return;

    getSchoolProfile(accessToken, refreshToken)
      .then((p) => setAvailableArms(p.availableArms ?? []))
      .catch(() => setAvailableArms([]))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  async function handleSubmit() {
    if (!accessToken) return;

    const errs = validate(form, availableArms);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitting(true);
    setError(null);

    const clean = form.parentPhone.replace(/^0/, "");
    const finalPhone = `${countryCode}${clean}`;

    try {
      const res = await registerStudent(
        {
          ...form,
          parentPhone: finalPhone,
        },
        accessToken,
        refreshToken
      );

      setCreated(res);

      setForm({
        fullName: "",
        email: "",
        classLevel: "",
        classArm: "",
        parentEmail: "",
        parentPhone: "",
        dateOfBirth: "",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Authentication required. Please log in again.");
        } else if (err.status === 403) {
          setError("You are not allowed to perform this action.");
        } else if (err.status === 404) {
          setError("School or resource not found.");
        } else if (err.status === 409) {
          setError("Some records already exist or conflict with existing data.");
        } else if (err.status === 400 || err.status === 422) {
          setError(`Invalid data. ${err.message}`);
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

    const content = `Name: ${created.fullName}\nEmail: ${created.email}\nCode: ${created.code}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${created.fullName}.txt`;
    a.click();
  }

  function downloadCSV() {
    if (!created) return;

    const content = `fullName,email,code\n${created.fullName},${created.email},${created.code}`;

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `student.csv`;
    a.click();
  }

  return (
    <PageShell title="Register Student" rounded>
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : (
        <div className="max-w-md flex flex-col gap-6">

          <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 flex flex-col gap-4">

            <div>
              <AuthInput
                id="full-name"
                label="Full name"
                value={form.fullName}
                onChange={(e) => set("fullName", e)}
              />
              <FieldError message={errors.fullName} />
            </div>

            <div>
              <AuthInput
                id="email"
                label="Email"
                value={form.email}
                onChange={(e) => set("email", e)}
              />
              <FieldError message={errors.email} />
            </div>

            <div>
              <select
                value={form.classLevel}
                onChange={(e) => set("classLevel", e.target.value)}
              >
                <option value="">Select level</option>
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
              <FieldError message={errors.classLevel} />
            </div>

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

            <div>
              <AuthInput
                id="parent-email"
                label="Parent email"
                value={form.parentEmail}
                onChange={(e) => set("parentEmail", e)}
              />
              <FieldError message={errors.parentEmail} />
            </div>

            <div>
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
            </div>

            <div>
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
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-purple-600 text-white py-3 rounded-md"
            >
              {submitting ? "Registering..." : "Register student"}
            </button>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          {created && (
            <div className="border rounded-2xl p-6 flex flex-col gap-3">
              <p className="font-semibold">Student Created</p>
              <p className="font-semibold">This code will expire in 48 hours</p>
              <p>Name: {created.fullName}</p>
              <p>Email: {created.email}</p>
              <p className="font-mono">Code: {created.code}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={downloadTXT}
                  className="flex-1 border rounded p-2"
                >
                  Download TXT
                </button>

                <button
                  onClick={downloadCSV}
                  className="flex-1 border rounded p-2"
                >
                  Download CSV
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
