"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { z } from "zod";
import { registerSchool } from "@/lib/api/hammet";
import { PageShell } from "@/components/layout/common/PageShell";
import { AuthInput } from "@/components/ui/auth-input";
import { ApiError } from "@/lib/api/api-client";

import type { RegisterSchoolRequest } from "@/lib/api/types";
import type { UserRole } from "@/lib/utils/roles";
import { FormSection, SelectField, TIER_OPTIONS } from "@/components/forms";
import { registerSchoolSchema } from "@/lib/validation";

type FormErrors = Partial<Record<keyof RegisterSchoolRequest, string>> & {
  form?: string;
};

function parseArms(input: string): string[] |undefined {
  if (!input.trim()) return undefined;

  return input
    .split(",")
    .map(a => a.trim().toUpperCase())
    .filter(a => /^[A-Z]{1,3}$/.test(a));
}

function zodErrorsToFormErrors(
  error: z.ZodError
): FormErrors {
  const errors: FormErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as keyof RegisterSchoolRequest;

    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export default function NewSchoolPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [armsInput, setArmsInput] = useState("");

  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");

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
  const [success, setSuccess] = useState<string | null>(null);

  const schoolNameRef = useRef<HTMLInputElement>(null)

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

    const finalRoles: UserRole[] = ["school_admin"]

    const payload: RegisterSchoolRequest = {
      ...form,
      phoneNumber: finalPhone,
      roles: finalRoles,
      arms: parseArms(armsInput),
    };

    const result = registerSchoolSchema.safeParse(payload)

    if (!result.success) {
      setErrors(zodErrorsToFormErrors(result.error))
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
      rounded={true}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* SCHOOL INFO */}
        <FormSection
          title="School Information"
          description="Basic details about the school"
        >

          <AuthInput
            id="school-name"
            ref={schoolNameRef}
            label="School name"
            placeholder="Hammet Group of Schools"
            value={form.name}
            onChange={(e) => set("name", e)}
            error={errors.name}
          />

          <AuthInput
            id="school-email"
            label="School email"
            placeholder="school@youremail.com"
            value={form.schoolEmail}
            onChange={(e) => set("schoolEmail", e)}
            error={errors.schoolEmail}
          />

          <AuthInput
            id="school-address"
            label="Address"
            placeholder="10, John Doe street, Ikeja, Lagos"
            value={form.schoolAddress}
            onChange={(e) => set("schoolAddress", e)}
            error={errors.schoolAddress}
          />

          <AuthInput
            id="school-website"
            label="Website (optional)"
            placeholder="www.yourwebsite.com"
            value={form.schoolWebsite || ""}
            onChange={(e) => set("schoolWebsite", e)}
          />
        </FormSection>

        {/* CONTACT */}
        <FormSection
          title="Contact Information"
          description="How Hammet can reach the school"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <AuthInput
              id="country-code"
              label=""
              placeholder="+234"
              defaultValue="+234"
              type="tel"
              value={countryCode}
              onChange={(e) => setCountryCode(e)}
              className="w-24 shrink-0"
            />

            <AuthInput 
              id="contact"
              value={phone}
              onChange={(e) => setPhone(e)}
              label=""
              placeholder="Phone number"
              type="number"
              className="flex-1"
            />

          </div>
          {errors.phoneNumber && (
            <p className="text-xs text-red-600">{errors.phoneNumber}</p>
          )}
        </FormSection>

        {/* ADMIN */}
        <FormSection
          title="School Administrator"
          description="The first administrator who will manage this school"
        >

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
        </FormSection>

        {/* CONFIG */}
        <FormSection
          title="School Configuration"
          description="Subscription tier and optional class arms"
        >

          {/* Tier */}
          <div className="flex flex-col gap-4">
            <SelectField
              id="tier"
              label="Tier"
              value={form.tier}
              options={TIER_OPTIONS}
              error={errors.tier}
              onChange={(value) => set("tier", value)}
            />
          </div>

          {/* Arms */}
          <AuthInput
            id="arms"
            label="Arms (optional)"
            placeholder="A, B, C"
            value={armsInput}
            onChange={(e) => setArmsInput(e)}
          />

        </FormSection>

        <button
          type="submit"
          disabled={isLoading}
          className="h-11 rounded-sm bg-purple text-white flex items-center justify-center gap-2 text-md cursor-pointer"
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