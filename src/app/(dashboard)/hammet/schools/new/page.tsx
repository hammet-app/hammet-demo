"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { registerSchool } from "@/lib/api/hammet";
import { PageShell } from "@/components/layout/page-shell";
import { AuthInput } from "@/components/ui/auth-input";
import { ApiError } from "@/lib/api/api-client";

import type { RegisterSchoolRequest } from "@/lib/api/types";
import type { UserRole } from "@/lib/utils/roles";

type FormErrors = Partial<Record<keyof RegisterSchoolRequest, string>> & {
  form?: string;
};

function parseArms(input: string): string[] | undefined {
  if (!input.trim()) return undefined;

  return input
    .split(",")
    .map((a) => a.trim().toUpperCase())
    .filter(Boolean);
}

function validate(form: RegisterSchoolRequest): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = "School name is required.";
  if (!form.adminFullName.trim())
    errors.adminFullName = "Admin full name is required.";

  if (!form.adminEmail.trim())
    errors.adminEmail = "Admin email is required.";

  if (!form.schoolEmail.trim())
    errors.schoolEmail = "School email is required.";

  if (!form.schoolAddress.trim())
    errors.schoolAddress = "School address is required.";

  if (!form.phoneNumber.trim())
    errors.phoneNumber = "Phone number is required.";

  return errors;
}

export default function NewSchoolPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [armsInput, setArmsInput] = useState("");

  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");

  const [isTeacher, setIsTeacher] = useState(false);

  const [form, setForm] = useState<RegisterSchoolRequest>({
    name: "",
    tier: "pilot",
    schoolEmail: "",
    schoolAddress: "",
    schoolWebsite: "",
    phoneNumber: "",
    adminFullName: "",
    adminEmail: "",
    arms: undefined,
    roles: ["school_admin"],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  function set<K extends keyof RegisterSchoolRequest>(
    key: K,
    value: RegisterSchoolRequest[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const finalPhone = `${countryCode}${phone}`;

    const finalRoles: UserRole[] = isTeacher
      ? ["school_admin"]
      : ["school_admin"];

    const payload: RegisterSchoolRequest = {
      ...form,
      phoneNumber: finalPhone,
      roles: finalRoles,
      arms: parseArms(armsInput),
    };

    const validationErrors = validate(payload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!accessToken) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await registerSchool(payload, accessToken, refreshToken);
      if(res.message) {
        setSuccess("School Registered Successfully");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ form: err.message });
      } else {
        setErrors({ form: "Network error." });
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <PageShell title="School Registered" backHref="/hammet">
        <button
          onClick={() => router.push("/hammet")}
          className="px-4 py-2 rounded-xl bg-purple text-white"
        >
          Back to schools
        </button>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Register School"
      description="Create a new school and admin account"
      backHref="/hammet"
    >
      <form onSubmit={handleSubmit} className="max-w-xl flex flex-col gap-8">

        {/* SCHOOL INFO */}
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase text-muted">School Info</p>

          <AuthInput
            id="school-name"
            label="School name"
            value={form.name}
            onChange={(e) => set("name", e)}
            error={errors.name}
          />

          <AuthInput
            id="school-email"
            label="School email"
            value={form.schoolEmail}
            onChange={(e) => set("schoolEmail", e)}
            error={errors.schoolEmail}
          />

          <AuthInput
            id="school-address"
            label="Address"
            value={form.schoolAddress}
            onChange={(e) => set("schoolAddress", e)}
            error={errors.schoolAddress}
          />

          <AuthInput
            id="school-website"
            label="Website (optional)"
            value={form.schoolWebsite || ""}
            onChange={(e) => set("schoolWebsite", e)}
          />
        </div>

        {/* CONTACT */}
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase text-muted">Contact</p>

          <div className="flex gap-2">
            <input
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-24 px-3 py-3 rounded-xl border"
            />
            <input
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border"
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-xs text-red-600">{errors.phoneNumber}</p>
          )}
        </div>

        {/* ADMIN */}
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase text-muted">Admin</p>

          <AuthInput
            id="admin-full-name"
            label="Full name"
            value={form.adminFullName}
            onChange={(e) => set("adminFullName", e)}
            error={errors.adminFullName}
          />

          <AuthInput
            id="admin-email"
            label="Email"
            value={form.adminEmail}
            onChange={(e) => set("adminEmail", e)}
            error={errors.adminEmail}
          />
        </div>

        {/* CONFIG */}
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase text-muted">Configuration</p>

          {/* Tier */}
          <div className="flex gap-3">
            {(["pilot", "annual"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => set("tier", t)}
                className={`flex-1 py-2.5 rounded-xl border ${
                  form.tier === t.toLowerCase() ? "bg-purple/10 border-purple" : ""
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Arms */}
          <AuthInput
            id="arms"
            label="Arms (optional)"
            placeholder="A, B, C"
            value={armsInput}
            onChange={(e) => setArmsInput(e)}
          />

          {/* Roles */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isTeacher}
              onChange={(e) => setIsTeacher(e.target.checked)}
            />
            Also assign as teacher
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-11 rounded-xl bg-purple text-white flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Registering…
            </>
          ) : (
            "Register school"
          )}
        </button>

        {/* Error */}
        {errors.form && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {errors.form}
          </div>
        )}
        
      </form>
    </PageShell>
  );
}