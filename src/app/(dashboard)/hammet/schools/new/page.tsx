"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { registerSchool } from "@/lib/api/hammet";
import { PageShell } from "@/components/layout/PageShell";
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
  const [success, setSuccess] = useState<string | null>(null);

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
    console.log(finalPhone)

    const finalRoles: UserRole[] = isTeacher
      ? ["school_admin"]
      : ["school_admin"];

    const payload: RegisterSchoolRequest = {
      ...form,
      phoneNumber: finalPhone,
      roles: finalRoles,
      arms: parseArms(armsInput),
    };

    console.log(payload)

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
      rounded={true}
    >
      <form onSubmit={handleSubmit} className="w-full p-6 rounded-lg flex flex-col gap-8 bg-purple-light/50">

        {/* SCHOOL INFO */}
        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase text-muted">School Info</p>

          <AuthInput
            id="school-name"
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
        </div>

        {/* CONTACT */}
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase text-muted">Contact</p>

          <div className="flex gap-2 justify-start">
            <AuthInput
              id="country-code"
              label=""
              placeholder="+234"
              defaultValue="+234"
              type="number"
              value={countryCode}
              onChange={(e) => setCountryCode(e)}
              style="w-1/3"
            />

            <AuthInput 
              id="contact"
              value={phone}
              onChange={(e) => setPhone(e)}
              label=""
              placeholder="Phone number"
              type="number"
              style="w-100 -ml-36"
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
                className={`flex-1 py-2.5 rounded-sm cursor-pointer ${
                  form.tier === t.toLowerCase() ? "bg-[rgba(91,33,182,0.15)] " : " bg-white/40"
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
          {/* <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isTeacher}
              onChange={(e) => setIsTeacher(e.target.checked)}
            />
            Also assign as teacher
          </label> */}
        </div>

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