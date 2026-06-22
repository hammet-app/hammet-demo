/**
 * /auth/check-email
 * File location: src/app/(auth)/check-email/page.tsx
 *
 * CHANGED: icon container, step pills, card background — styling only.
 * No logic to change (this page has none).
 */

import { Mail } from "lucide-react";
import { AuthShell } from "@/components/ui/auth-shell";

export default function CheckEmailPage() {
  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center gap-5 py-2">
        {/* Animated icon container */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(91,33,182,0.1), rgba(6,182,212,0.08))",
            border: "1px solid rgba(91,33,182,0.12)",
          }}
        >
          <Mail size={28} style={{ color: "#5B21B6" }} />
        </div>

        <div>
          <h1
            className="text-[20px] font-bold text-text-primary mb-2 leading-snug"
            style={{ fontFamily: "var(--font-head)" }}
          >
            Check your email
          </h1>
          <p className="text-[13px] text-text-muted leading-relaxed max-w-[300px] mx-auto">
            Your invite link has been sent. Open the email and click the link to activate your account.
          </p>
        </div>

        {/* Steps */}
        <div className="w-full rounded-xl p-4 text-left flex flex-col gap-3 border border-border bg-bg-page/60 dark:bg-black/15">
          <Step number={1} text="Open the email from HammetLabs" />
          <Step number={2} text="Click the activation link inside" />
          <Step number={3} text="Set your password and you're in" />
        </div>

        <p className="text-[12px] text-text-muted leading-relaxed">
          Didn&apos;t receive it? Check your spam folder or contact your school admin to resend.
        </p>

        <a
          href="/login"
          className="text-[13px] font-medium text-purple dark:text-cyan hover:text-purple-dark dark:hover:text-cyan-light transition-colors"
        >
          Back to sign in
        </a>
      </div>
    </AuthShell>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 text-white"
        style={{ background: "linear-gradient(135deg,#5B21B6,#3B0764)" }}
      >
        {number}
      </div>
      <p className="text-[13px] text-text-secondary">{text}</p>
    </div>
  );
}