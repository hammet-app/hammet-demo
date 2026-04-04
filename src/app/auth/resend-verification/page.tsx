"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";
import {
  AuthShell,
  AuthCard,
  HammetLogo,
  AuthInput,
  AuthButton,
  AuthAlert,
} from "@/components/auth/ui";
import { resendVerification } from "@/lib/auth-api";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sent, setSent] = useState(false);

  function validate() {
    if (!email) { setEmailError("Email is required"); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError("Enter a valid email"); return false; }
    setEmailError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await resendVerification({ email });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell>
        <HammetLogo />
        <AuthCard className="text-center">
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center">
              <Mail className="w-8 h-8 text-[#06B6D4]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white mb-2">
                Check your inbox
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                If an account exists for <span className="text-white font-medium">{email}</span>,
                you&apos;ll receive a new invite link shortly.
              </p>
            </div>

            <div className="w-full pt-2 flex flex-col gap-3">
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Use a different email
              </button>
              <p className="text-sm text-slate-500">
                <Link href="/auth/login" className="text-[#06B6D4] hover:text-[#22D3EE] font-medium transition-colors">
                  Back to sign in
                </Link>
              </p>
            </div>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <HammetLogo />
      <AuthCard>
        <div className="flex flex-col gap-1 mb-7">
          <h1 className="text-xl font-semibold text-white">Resend invite</h1>
          <p className="text-sm text-slate-400">
            Enter your email and we&apos;ll send a fresh invite link
          </p>
        </div>

        {error && <div className="mb-5"><AuthAlert type="error" message={error} /></div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <AuthInput
            label="Email address"
            type="email"
            placeholder="you@yourschool.edu.ng"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            autoComplete="email"
          />
          <div className="pt-1">
            <AuthButton type="submit" loading={loading}>
              Send invite link
            </AuthButton>
          </div>
        </form>

        <div className="mt-7 pt-6 border-t border-white/8 text-center">
          <p className="text-sm text-slate-500">
            Already claimed?{" "}
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
