import { Mail } from "lucide-react";
import { AuthShell } from "@/components/ui/auth-shell";

/**
 * /auth/check-email
 *
 * Shown after an admin sends/resends an invite.
 * The user landing here has no action to take — just check their email.
 * No sensitive params are passed or displayed.
 */
export default function CheckEmailPage() {
  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center gap-5 py-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-purple-light flex items-center justify-center">
          <Mail size={26} className="text-purple-mid" />
        </div>

        {/* Copy */}
        <div>
          <h1
            className="text-[20px] font-bold text-text-primary mb-2 leading-snug"
            style={{ fontFamily: "var(--font-head)" }}
          >
            Check your email
          </h1>
          <p className="text-[13px] text-text-secondary leading-relaxed max-w-[300px] mx-auto">
            Your invite link has been sent. Open the email and click the link
            to activate your account.
          </p>
        </div>

        {/* What to do next */}
        <div className="w-full bg-bg-page rounded-[10px] p-4 text-left flex flex-col gap-3 border border-border">
          <Step number={1} text="Open the email from HammetLabs" />
          <Step number={2} text="Click the activation link inside" />
          <Step number={3} text="Set your password and you're in" />
        </div>

        {/* Nudge */}
        <p className="text-[12px] text-text-muted leading-relaxed">
          Didn&apos;t receive it? Check your spam folder or contact your school
          admin to resend the invite.
        </p>

        {/* Back to login */}
        <a
          href="/login"
          className="text-[13px] font-medium text-purple-mid hover:text-purple transition-colors no-underline"
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
      <div className="w-6 h-6 rounded-full bg-purple-light text-purple-mid text-[11px] font-bold flex items-center justify-center shrink-0">
        {number}
      </div>
      <p className="text-[13px] text-text-secondary">{text}</p>
    </div>
  );
}
