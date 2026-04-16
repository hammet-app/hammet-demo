"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { cn } from "@/lib/utils/utils";
import { validatePassword } from "@/utils/password";
import type { UserRole } from "@/lib/utils/roles";
import { ClaimAccountResponse } from "@/lib/api/api-types";

interface InviteInfo {
  full_name: string;
  email: string;
  roles: UserRole[];
}

type Step = "identify" | "set_password" | "success";

export default function ClaimPage() {
  const router = useRouter();
  const { setSession } = useAuth();

  const [step, setStep] = useState<Step>("identify");

  const [email, setEmail] = useState("");
  const [claimCode, setClaimCode] = useState("");

  const [invite, setInvite] = useState<InviteInfo | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isStaff =
    invite?.roles?.includes("teacher") ||
    invite?.roles?.includes("school_admin");

  // ── Step 1: Identify (email + code) ──
  async function handleIdentify(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !claimCode) {
      setError("Email and claim code are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.post<InviteInfo>(
        "/auth/claim/verify-code",
        {
          email,
          claim_code: claimCode,
        }
      );

      setInvite(data);
      setStep("set_password");
    } catch {
      setError("Invalid email or claim code");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Step 2: Set password ──
  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();

    if (!password) {
      setError("Password is required");
      return;
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.post<ClaimAccountResponse>("/auth/claim", {
        email,
        claim_code: claimCode,
        password,
        deviceId: getDeviceId(),
      });

      setSession(data.user, data.access_token);
      setStep("success");

      setTimeout(() => {
        router.replace(getDefaultRoute(data.user.roles));
      }, 1200);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ── Google OAuth (staff only) ──
  /**
  function handleGoogleClaim() {
    if (!invite?.email) return;

    setIsGoogleLoading(true);

    const deviceId = getDeviceId();
    const params = new URLSearchParams({
      device_id: deviceId,
      email: invite.email,
    });

    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?${params.toString()}`;
  }
  */

  if (step === "success") {
    return (
      <AuthShell>
        <div className="flex flex-col items-center py-8 gap-4">
          <CheckCircle2 className="text-success" />
          <p className="text-sm">Account activated</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthHeading
        title="Activate your account"
        description={
          step === "identify"
            ? "Enter your email and claim code"
            : invite
            ? `Welcome, ${invite.full_name}`
            : ""
        }
      />

      {/* ── STEP 1: Identify ── */}
      {step === "identify" && (
        <form onSubmit={handleIdentify} className="flex flex-col gap-4">
          <AuthInput
            id="email"
            label="Email"
            value={email}
            onChange={setEmail}
          />

          <AuthInput
            id="code"
            label="Claim code"
            value={claimCode}
            onChange={setClaimCode}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "h-10 rounded bg-purple text-white",
              "flex items-center justify-center"
            )}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Continue"
            )}
          </button>

          {error && <AuthAlert message={error} />}
        </form>
      )}

      {/* ── STEP 2: Set Password ── */}
      {step === "set_password" && invite && (
        <form onSubmit={handleClaim} className="flex flex-col gap-4">
          {/* Identity display */}
          <div className="bg-purple-light rounded px-3 py-2">
            <p className="text-sm font-medium">{invite.full_name}</p>
            <p className="text-xs opacity-70">{invite.email}</p>
          </div>

          {/* Google (staff only) */}
          {/**
          {isStaff && (
            <>
              <button
                type="button"
                onClick={handleGoogleClaim}
                disabled={isGoogleLoading || isLoading}
                className={cn(
                  "w-full h-10 rounded border",
                  "flex items-center justify-center",
                  "text-sm"
                )}
              >
                {isGoogleLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Continue with Google"
                )}
              </button>

              <AuthDivider />
            </>
          )}
          */}

          <AuthInput
            id="password"
            label="Create password"
            type="password"
            value={password}
            onChange={setPassword}
          />

          <AuthInput
            id="confirm"
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={setConfirm}
          />

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className={cn(
              "h-10 rounded bg-purple text-white",
              "flex items-center justify-center"
            )}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Activate account"
            )}
          </button>

          {error && <AuthAlert message={error} />}
        </form>
      )}
    </AuthShell>
  );
}