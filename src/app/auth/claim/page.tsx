"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import {
  AuthShell,
  AuthCard,
  HammetLogo,
  AuthInput,
  AuthButton,
  AuthDivider,
  AuthAlert,
} from "@/components/auth/ui";
import { claimAccount, resendVerification, getDashboardPath } from "@/lib/auth-api";

type Step = "form" | "success";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-500", "bg-amber-500", "bg-emerald-500"];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? colors[score - 1] : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1">
            <CheckCircle2
              className={`w-3 h-3 ${c.pass ? "text-emerald-400" : "text-slate-600"}`}
            />
            <span className={`text-xs ${c.pass ? "text-slate-400" : "text-slate-600"}`}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClaimPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [step, setStep] = useState<Step>("form");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState(""); // for resend fallback
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const isTokenMissing = !token;

  function validate() {
    const e: typeof errors = {};
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "At least 8 characters required";
    if (!confirm) e.confirm = "Please confirm your password";
    else if (confirm !== password) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePasswordClaim(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await claimAccount({ token, password });
      setStep("success");
      // Short delay so user sees the success state
      setTimeout(() => {
        router.push(getDashboardPath(data.user.roles));
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim account. Your link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleClaim() {
    setGoogleLoading(true);
    setError("");
    try {
      // Backend handles the OAuth flow with the claim token as state
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?claim_token=${token}`;
    } catch {
      setError("Failed to initiate Google sign-in.");
      setGoogleLoading(false);
    }
  }

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setResendLoading(true);
    setResendSuccess("");
    setError("");
    try {
      await resendVerification({ email });
      setResendSuccess("Invite email sent! Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend. Try again.");
    } finally {
      setResendLoading(false);
    }
  }

  if (step === "success") {
    return (
      <AuthShell>
        <HammetLogo />
        <AuthCard className="text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white mb-1">
                Account claimed!
              </h1>
              <p className="text-sm text-slate-400">
                Taking you to your dashboard…
              </p>
            </div>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  if (isTokenMissing) {
    return (
      <AuthShell>
        <HammetLogo />
        <AuthCard>
          <div className="flex flex-col items-center gap-4 mb-7 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white mb-1">
                No invite link detected
              </h1>
              <p className="text-sm text-slate-400">
                Your invite link should come from your school or HammetLabs.
                If you think this is a mistake, request a new one below.
              </p>
            </div>
          </div>

          {error && <div className="mb-4"><AuthAlert type="error" message={error} /></div>}
          {resendSuccess && <div className="mb-4"><AuthAlert type="success" message={resendSuccess} /></div>}

          <form onSubmit={handleResend} className="flex flex-col gap-4">
            <AuthInput
              label="Your email address"
              type="email"
              placeholder="you@yourschool.edu.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AuthButton type="submit" loading={resendLoading}>
              Resend invite
            </AuthButton>
          </form>

          <p className="text-sm text-slate-500 text-center mt-5">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#06B6D4] hover:text-[#22D3EE] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <HammetLogo />

      <AuthCard>
        <div className="flex flex-col gap-1 mb-7">
          <h1 className="text-xl font-semibold text-white">Claim your account</h1>
          <p className="text-sm text-slate-400">
            Set a password to activate your invite
          </p>
        </div>

        {error && <div className="mb-5"><AuthAlert type="error" message={error} /></div>}

        <form onSubmit={handlePasswordClaim} className="flex flex-col gap-4" noValidate>
          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">New password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className={`w-full px-4 py-3 pr-11 rounded-xl text-sm text-white placeholder:text-slate-500 bg-white/5 border transition-all duration-200 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/10 focus:border-[#5B21B6] focus:ring-[#5B21B6]/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            <PasswordStrength password={password} />
          </div>

          {/* Confirm */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className={`w-full px-4 py-3 pr-11 rounded-xl text-sm text-white placeholder:text-slate-500 bg-white/5 border transition-all duration-200 focus:outline-none focus:ring-2 ${
                  errors.confirm
                    ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/10 focus:border-[#5B21B6] focus:ring-[#5B21B6]/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirm && <p className="text-xs text-red-400">{errors.confirm}</p>}
          </div>

          <div className="pt-1">
            <AuthButton type="submit" loading={loading}>
              Claim account
            </AuthButton>
          </div>
        </form>

        <div className="flex flex-col gap-4 mt-5">
          <AuthDivider label="or claim with" />
          <AuthButton
            type="button"
            variant="google"
            loading={googleLoading}
            onClick={handleGoogleClaim}
          >
            <FcGoogle className="w-4 h-4" />
            Continue with Google
          </AuthButton>
        </div>

        <div className="mt-7 pt-6 border-t border-white/8 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#06B6D4] hover:text-[#22D3EE] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </AuthCard>

      <p className="text-xs text-slate-600 text-center">
        © {new Date().getFullYear()} HammetLabs. All rights reserved.
      </p>
    </AuthShell>
  );
}
