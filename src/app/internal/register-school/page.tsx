"use client";

import { useState } from "react";
import { CheckCircle2, Building2, ShieldAlert } from "lucide-react";
import {
  AuthShell,
  AuthCard,
  HammetLogo,
  AuthInput,
  AuthButton,
  AuthAlert,
} from "@/components/auth/ui";
import { registerSchool } from "@/lib/auth-api";
import type { RegisterSchoolResponse } from "@/types/api";
import { cn } from "@/lib/utils";

type Tier = "pilot" | "annual";

export default function RegisterSchoolPage() {
  const [name, setName] = useState("");
  const [tier, setTier] = useState<Tier>("pilot");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RegisterSchoolResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "School name is required";
    if (!adminName.trim()) e.adminName = "Admin full name is required";
    if (!adminEmail.trim()) e.adminEmail = "Admin email is required";
    else if (!/\S+@\S+\.\S+/.test(adminEmail)) e.adminEmail = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await registerSchool({
        name: name.trim(),
        tier,
        admin_full_name: adminName.trim(),
        admin_email: adminEmail.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setName("");
    setAdminName("");
    setAdminEmail("");
    setTier("pilot");
    setError("");
  }

  if (result) {
    return (
      <AuthShell>
        <HammetLogo />
        <AuthCard className="text-center">
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white mb-1">School registered</h1>
              <p className="text-sm text-slate-400">Invite sent to the admin.</p>
            </div>

            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-left flex flex-col gap-3">
              <Row label="School ID" value={result.school_id} mono />
              <Row label="Admin ID" value={result.admin_id} mono />
              <Row label="Status" value={result.message} />
            </div>

            <button
              onClick={handleReset}
              className="text-sm text-[#06B6D4] hover:text-[#22D3EE] font-medium transition-colors"
            >
              Register another school
            </button>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <HammetLogo />

      <AuthCard>
        {/* Internal badge */}
        <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg w-fit">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
            Internal — HammetLabs only
          </span>
        </div>

        <div className="flex flex-col gap-1 mb-7">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#5B21B6]" />
            <h1 className="text-xl font-semibold text-white">Register a school</h1>
          </div>
          <p className="text-sm text-slate-400">
            Creates the school record and sends an invite to the first admin.
          </p>
        </div>

        {error && <div className="mb-5"><AuthAlert type="error" message={error} /></div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <AuthInput
            label="School name"
            type="text"
            placeholder="e.g. Greensprings School"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          {/* Tier selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Tier</label>
            <div className="grid grid-cols-2 gap-2">
              {(["pilot", "annual"] as Tier[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={cn(
                    "py-2.5 px-4 rounded-xl text-sm font-medium border transition-all duration-150 capitalize",
                    tier === t
                      ? "bg-[#5B21B6]/20 border-[#5B21B6] text-purple-300"
                      : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              {tier === "pilot"
                ? "Pilot: limited term access, no payment required yet."
                : "Annual: full access, billed annually."}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-white/8 pt-2">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">
              First admin account
            </p>
            <div className="flex flex-col gap-4">
              <AuthInput
                label="Admin full name"
                type="text"
                placeholder="e.g. Chidi Okeke"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                error={errors.adminName}
              />
              <AuthInput
                label="Admin email"
                type="email"
                placeholder="admin@school.edu.ng"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                error={errors.adminEmail}
                hint="An invite link will be sent to this address."
              />
            </div>
          </div>

          <div className="pt-1">
            <AuthButton type="submit" loading={loading}>
              Register school & send invite
            </AuthButton>
          </div>
        </form>
      </AuthCard>

      <p className="text-xs text-slate-600 text-center">
        © {new Date().getFullYear()} HammetLabs — Internal tools
      </p>
    </AuthShell>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={cn("text-sm text-white break-all", mono && "font-mono text-xs text-slate-300")}>
        {value}
      </span>
    </div>
  );
}
