"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { getSchoolProfile, registerStudent } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { AuthInput } from "@/components/ui/auth-input";
import { FieldError } from "@/components/ui/auth-shell";
import { RegisterStudentResponse } from "@/lib/api/api-types";

const LEVELS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];

type FormState = {
  full_name: string;
  email: string;
  class_level: string;
  class_arm: string;
  parent_email: string;
  parent_phone: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState, availableArms: string[]): FormErrors {
  const errs: FormErrors = {};
  if (!form.full_name.trim()) errs.full_name = "Full name is required";
  if (!form.email.trim()) {
    errs.email = "Email is required";
  }
  if (!form.class_level) errs.class_level = "Select level";
  if (availableArms.length > 0 && !form.class_arm) errs.class_arm = "Select arm";
  if (!form.parent_email.trim()) errs.parent_email = "Parent email is required";
  if (!form.parent_phone.trim()) errs.parent_phone = "Phone is required";
  return errs;
}

export default function NewStudentPage() {
  const { accessToken, refreshToken } = useAuth();

  const [availableArms, setAvailableArms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [countryCode, setCountryCode] = useState("+234");

  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    class_level: "",
    class_arm: "",
    parent_email: "",
    parent_phone: "",
  });

  const [created, setCreated] = useState<RegisterStudentResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!accessToken) return;

    getSchoolProfile(accessToken, refreshToken)
      .then((p) => setAvailableArms(p.available_arms ?? []))
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

    const clean = form.parent_phone.replace(/^0/, "");
    const finalPhone = `${countryCode}${clean}`;

    try {
      const res = await registerStudent(
        {
          ...form,
          parent_phone: finalPhone,
        },
        accessToken,
        refreshToken
      );

      setCreated(res);

      setForm({
        full_name: "",
        email: "",
        class_level: "",
        class_arm: "",
        parent_email: "",
        parent_phone: "",
      });
    } catch {
      setError("Failed to register student");
    } finally {
      setSubmitting(false);
    }
  }

  function downloadTXT() {
    if (!created) return;

    const content = `Name: ${created.full_name}\nEmail: ${created.email}\nCode: ${created.code}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${created.full_name}.txt`;
    a.click();
  }

  function downloadCSV() {
    if (!created) return;

    const content = `full_name,email,code\n${created.full_name},${created.email},${created.code}`;

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `student.csv`;
    a.click();
  }

  return (
    <PageShell title="Register Student">
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : (
        <div className="max-w-md flex flex-col gap-6">

          <div className="border rounded-2xl p-6 flex flex-col gap-4">

            <div>
              <AuthInput
                id="full-name"
                label="Full name"
                value={form.full_name}
                onChange={(e) => set("full_name", e)}
              />
              <FieldError message={errors.full_name} />
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
                value={form.class_level}
                onChange={(e) => set("class_level", e.target.value)}
              >
                <option value="">Select level</option>
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
              <FieldError message={errors.class_level} />
            </div>

            {availableArms.length > 0 && (
              <div>
                <select
                  value={form.class_arm}
                  onChange={(e) => set("class_arm", e.target.value)}
                >
                  <option value="">Select arm</option>
                  {availableArms.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
                <FieldError message={errors.class_arm} />
              </div>
            )}

            <div>
              <AuthInput
                id="parent-email"
                label="Parent email"
                value={form.parent_email}
                onChange={(e) => set("parent_email", e)}
              />
              <FieldError message={errors.parent_email} />
            </div>

            <div>
              <div className="flex gap-2">
                <input
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-24 px-3 py-3 rounded-xl border"
                />

                <input
                  placeholder="Phone number"
                  value={form.parent_phone}
                  onChange={(e) => set("parent_phone", e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border"
                />
              </div>
              <FieldError message={errors.parent_phone} />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-purple-600 text-white py-3 rounded-xl"
            >
              {submitting ? "Registering..." : "Register student"}
            </button>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          {created && (
            <div className="border rounded-2xl p-6 flex flex-col gap-3">
              <p className="font-semibold">Student Created</p>
              <p className="font-semibold">This code will expire in 48 hours</p>
              <p>Name: {created.full_name}</p>
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
