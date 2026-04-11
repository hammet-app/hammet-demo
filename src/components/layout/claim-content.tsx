"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  AuthShell,
  AuthHeading,
  AuthDivider,
  AuthAlert,
} from "@/components/ui/auth-shell";
import { AuthInput } from "@/components/ui/auth-input";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient, ApiError } from "@/lib/api/api-client";
import { getDeviceId } from "@/lib/auth/device-id";
import { getDefaultRoute } from "@/lib/auth/routes";
import type { ClaimAccountRequest, ClaimAccountResponse } from "@/lib/api/api-types";
import type { UserRole } from "@/lib/utils/roles";
import { cn } from "@/lib/utils/utils";
import { validatePassword } from "@/utils/password";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// What the backend returns when we verify the invite token
interface InviteInfo {
  full_name: string;
  email: string;
  roles: UserRole[]; // "student" | "teacher" | "school_admin"
}

type ClaimStep = "loading" | "invalid" | "form" | "success";

interface FormErrors {
  password?: string;
  confirm?: string;
  form?: string;
}

export default function ClaimContent() {
  const { setSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [step, setStep] = useState<ClaimStep>("loading");
  const [invite, setInvite] = useState<InviteInfo | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ── Verify token on mount ──
  useEffect(() => {
    if (!token) {
      setStep("invalid");
      return;
    }

    apiClient
      .get<InviteInfo>(`/auth/claim/${token}`)
      .then((data) => {
        setInvite(data);
        setStep("form");
      })
      .catch(() => setStep("invalid"));
  }, [token]);

  {/**const isTeacher =
    invite?.roles[0] === "teacher" || invite?.roles[0] === "school_admin";*/}

  // ── Validation ──
  function validate(): boolean {
    const next: FormErrors = {};

    if (!password) {
      next.password = "Password is required";
    } else {
      const error = validatePassword(password)
      if (error) {
        next.password = error
      }
    }

    if (!confirm) {
      next.confirm = "Please confirm your password";
    } else if (confirm !== password) {
      next.confirm = "Passwords do not match";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Password claim ──
  async function handlePasswordClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const data = await apiClient.post<ClaimAccountResponse>("/auth/claim", {
        token,
        password,
        deviceId: getDeviceId()
      } satisfies ClaimAccountRequest);

      setSession(data.user, data.access_token);
      setStep("success");

      setTimeout(() => {
        router.replace(getDefaultRoute(data.user.roles as UserRole[]));
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 || err.status === 422) {
          setErrors({
            form: err.message || "Invalid request",
          });
        } else if (err.status === 401) {
          setErrors({
            form: "This invite link is invalid or expired.",
          });
        } else {
          setErrors({ form: "Something went wrong. Please try again." });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Google OAuth — redirect to backend init endpoint ──
  {/**function handleGoogleClaim() {
    if (!invite?.email) return;

    setIsGoogleLoading(true);

    const deviceId = getDeviceId();
    const params = new URLSearchParams({
      device_id: deviceId,
      email: invite.email,
    });

    // Backend sets the refresh token cookie and redirects to /dashboard.
    // The frontend AuthProvider handles the silent refresh from there.
    window.location.href = `${API_BASE}/auth/google?${params.toString()}`;
  }

  // ─── Render ───────────────────────────────────────────────

  if (step === "loading") {
    return (
      <AuthShell>
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 size={28} className="animate-spin text-purple-mid" />
          <p className="text-[13px] text-text-muted">
            Verifying your invite…
          </p>
        </div>
      </AuthShell>
    );
  }

  if (step === "invalid") {
    return (
      <AuthShell>
        <AuthHeading title="Invalid invite link" />
        <AuthAlert message="This invite link is invalid or has expired. Contact your school admin for a new one." />
        <a
          href="/login"
          className="block text-center text-[13px] font-medium text-purple-mid hover:text-purple transition-colors no-underline mt-2"
        >
          Back to sign in
        </a>
      </AuthShell>
    );
  }

  if (step === "success") {
    return (
      <AuthShell>
        <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
          <CheckCircle2 size={44} className="text-success" />
          <div>
            <p
              className="text-[18px] font-bold text-text-primary mb-1"
              style={{ fontFamily: "var(--font-head)" }}
            >
              Account activated!
            </p>
            <p className="text-[13px] text-text-muted">
              Taking you to your dashboard…
            </p>
          </div>
        </div>
      </AuthShell>
    );
  }*/}

  // ── Form ──
  return (
    <AuthShell>
      <AuthHeading
        title="Activate your account"
        description={
          invite
            ? `Welcome, ${invite.full_name}. Set a password to get started.`
            : "Set a password to activate your account."
        }
      />

      {/* Invite info chip */}
      {invite && (
        <div className="flex items-center gap-2 bg-purple-light rounded-[8px] px-3 py-2 mb-5">
          <div className="w-6 h-6 rounded-full bg-purple-mid flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {invite?.full_name?.[0]?.toUpperCase() || ""}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-purple-dark truncate">
              {invite.email}
            </p>
            <p className="text-[11px] text-purple capitalize">
              {invite?.roles?.[0]?.replace("_", " ")}
            </p>
          </div>
        </div>
      )}

      
    {/**
      
      {isTeacher && (
        <>
          <button
            type="button"
            onClick={handleGoogleClaim}
            disabled={isGoogleLoading || isSubmitting}
            className={cn(
              "w-full h-10 rounded-[8px] border border-border bg-bg-card",
              "flex items-center justify-center gap-2.5",
              "text-[13.5px] font-medium text-text-primary",
              "hover:bg-gray-50 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 size={15} className="animate-spin text-text-muted" />
                Redirecting to Google…
              </>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>
          <AuthDivider />
        </>
      )}
      */}
        
      {/* Password form */}
      <form
        onSubmit={handlePasswordClaim}
        noValidate
        className="flex flex-col gap-4"
      >
        <AuthInput
          id="password"
          label="Create a password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password}
          disabled={isSubmitting || isGoogleLoading}
          hint="Minimum 8 characters"
        />

        <AuthInput
          id="confirm"
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirm}
          disabled={isSubmitting || isGoogleLoading}
        />

        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className={cn(
            "mt-2 w-full h-10 rounded-[8px] text-[13.5px] font-semibold",
            "bg-purple text-white transition-colors",
            "hover:bg-purple-hover",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            "flex items-center justify-center gap-2"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Activating…
            </>
          ) : (
            "Activate account"
          )}
        </button>

        {errors.form && <AuthAlert message={errors.form} />}
      </form>
    </AuthShell>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
