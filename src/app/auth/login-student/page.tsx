"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, WifiOff } from "lucide-react";
import {
  AuthShell,
  AuthCard,
  HammetLogo,
  AuthInput,
  AuthButton,
  AuthAlert,
} from "@/components/auth/ui";
import { login, getDashboardPath } from "@/lib/auth-api";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await login({ email, password });
      if (!data.user.roles.includes("student")) {
        setError("This login is for students only. Use the staff sign-in page.");
        return;
      }
      router.push(getDashboardPath(data.user.roles));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <HammetLogo />

      <AuthCard>
        <div className="flex flex-col gap-1 mb-7">
          <h1 className="text-xl font-semibold text-white">Student sign in</h1>
          <p className="text-sm text-slate-400">
            Use the email and password from your invite
          </p>
        </div>

        {/* Offline note */}
        <div className="flex items-start gap-2.5 bg-white/5 border border-white/8 rounded-xl px-4 py-3 mb-5">
          <WifiOff className="w-4 h-4 text-[#06B6D4] mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">
            You must be online for your first login. Once you&apos;re in, your
            work saves automatically — even when the internet drops.
          </p>
        </div>

        {error && <div className="mb-5"><AuthAlert type="error" message={error} /></div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
          <AuthInput
            label="Email address"
            type="email"
            placeholder="yourname@school.edu.ng"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          <div className="pt-1">
            <AuthButton type="submit" loading={loading}>
              Sign in
            </AuthButton>
          </div>
        </form>

        <div className="mt-7 pt-6 border-t border-white/8 flex flex-col gap-3 text-center">
          <p className="text-sm text-slate-500">
            Are you a teacher or admin?{" "}
            <Link
              href="/auth/login"
              className="text-[#06B6D4] hover:text-[#22D3EE] font-medium transition-colors"
            >
              Staff sign in →
            </Link>
          </p>
          <p className="text-sm text-slate-500">
            First time here?{" "}
            <Link
              href="/auth/claim"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Claim your invite
            </Link>
          </p>
          <p className="text-sm text-slate-500">
            Didn&apos;t get your invite email?{" "}
            <Link
              href="/auth/resend-verification"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Resend it
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
