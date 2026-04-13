"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { getSchoolProfile, registerStudent } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { AuthInput } from "@/components/ui/auth-input";
import { FieldError } from "@/components/ui/auth-shell";

const LEVELS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];

type FormState = {
  full_name: string;
  email: string;
  class_level: string;
  class_arm: string;
  parent_email: string;
  parent_phone: string; // now LOCAL number only
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState, availableArms: string[]): FormErrors {
  const errs: FormErrors = {};

  if (!form.full_name.trim()) errs.full_name = "Full name is required.";

  if (!form.email.trim()) {
    errs.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errs.email = "Enter a valid email.";
  }

  if (!form.class_level) errs.class_level = "Select a level.";

  if (availableArms.length > 0 && !form.class_arm) {
    errs.class_arm = "Select an arm.";
  }

  if (!form.parent_email.trim()) {
    errs.parent_email = "Parent email is required.";
  }

  if (!form.parent_phone || !/^\d{7,15}$/.test(form.parent_phone)) {
    errs.parent_phone = "Enter a valid phone number.";
  }

  return errs;
}

export default function NewStudentPage() {
  const { accessToken, refreshToken } = useAuth();

  const [availableArms, setAvailableArms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 NEW
  const [countryCode, setCountryCode] = useState("+234");

  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    class_level: "",
    class_arm: "",
    parent_email: "",
    parent_phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getSchoolProfile(accessToken, refreshToken)
      .then((p) => setAvailableArms(p.available_arms ?? []))
      .catch(() => setAvailableArms([]))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  async function handleSubmit() {
    const errs = validate(form, availableArms);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (!accessToken) return;

    const finalPhone = `${countryCode}${form.parent_phone.trim()}`;

    setSubmitting(true);
    setServerError(null);

    try {
      await registerStudent(
        {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          class_level: form.class_level,
          class_arm: availableArms.length > 0 ? form.class_arm : null,
          parent_email: form.parent_email.trim(),
          parent_phone: finalPhone,
        },
        accessToken,
        refreshToken
      );

      setSuccess(form.full_name);

      setForm({
        full_name: "",
        email: "",
        class_level: "",
        class_arm: "",
        parent_email: "",
        parent_phone: "",
      });
    } catch {
      setServerError("Failed to register student.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      title="Register Student"
      description="An invite link will be emailed to the student."
      backHref="/admin/students"
    >
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : (
        <div className="max-w-md flex flex-col gap-6">

          {/* Student */}
          <div className="border rounded-2xl p-6 flex flex-col gap-5">
            <AuthInput
              id="full-name"
              label="Full name"
              value={form.full_name}
              onChange={(e) => set("full_name", e)}
            />
            <FieldError message={errors.full_name} />

            <AuthInput
              id="email"
              label="Email"
              value={form.email}
              onChange={(e) => set("email", e)}
            />
            <FieldError message={errors.email} />

            <select
              value={form.class_level}
              onChange={(e) => set("class_level", e.target.value)}
            >
              <option value="">Select level</option>
              {LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>

            {availableArms.length > 0 && (
              <select
                value={form.class_arm}
                onChange={(e) => set("class_arm", e.target.value)}
              >
                <option value="">Select arm</option>
                {availableArms.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            )}
          </div>

          {/* Parent */}
          <div className="border rounded-2xl p-6 flex flex-col gap-5">
            <AuthInput
              id="parent-email"
              label="Parent email"
              value={form.parent_email}
              onChange={(e) => set("parent_email", e)}
            />
            <FieldError message={errors.parent_email} />

            {/* 🔥 COUNTRY CODE + PHONE */}
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
            className="w-full bg-purple-600 text-white py-3 rounded-xl"
          >
            {submitting ? "Registering…" : "Register student"}
          </button>
        </div>
      )}
    </PageShell>
  );
}