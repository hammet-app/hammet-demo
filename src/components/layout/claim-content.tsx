"use client";


import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  AuthShell,
  AuthHeading,
  AuthAlert,
} from "@/components/ui/auth-shell";
import { LoadingState } from "@/components/layout/parent-portal";
import { AuthInput } from "@/components/ui/auth-input";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient, ApiError } from "@/lib/api/api-client";
import { getDeviceId } from "@/lib/auth/device-id";
import { getDefaultRoute } from "@/lib/auth/routes";
import { cn } from "@/lib/utils/utils";
import { validatePassword } from "@/utils/password";
import {
  type InviteInfo,
  type InviteInfoDto,
  toInviteInfo,
  fromClaimAccountRequest,
  toClaimAccountResponse,
  ClaimAccountResponseDto,
} from "@/lib/api/types";

type Step = "identify" | "set_password" | "success";

export default function ClaimPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { setSession } = useAuth();

  const [step, setStep] = useState<Step>(token ? "set_password" : "identify");
  const [email, setEmail] = useState("");
  const [claimCode, setClaimCode] = useState("");
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(!!token);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Token flow: fetch invite directly
  useEffect(() => {
    if (!token) return;
    apiClient
      .get<InviteInfoDto>(`/auth/claim/${token}`)
      .then((data) => { setInvite(toInviteInfo(data)); })
      .catch(() => { setError("Invalid or expired link"); setStep("identify"); })
      .finally(() => setIsVerifying(false));
  }, [token]);

  async function handleIdentify(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !claimCode) { setError("Email and claim code are required"); return; }
    setIsLoading(true);
    setError(null);
    try {
      const dataDto = await apiClient.post<InviteInfoDto>("/auth/claim/verify-code", {
        email, claim_code: claimCode,
      });
      const data = toInviteInfo(dataDto);
      if (!data.roles.includes("student")) {
        setError("This account must be activated via invite link");
        return;
      }
      setInvite(data);
      setStep("set_password");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError("Invalid or expired link");
        else if (err.status === 403) setError("This account cannot be activated with a code. Use your invite link.");
        else if (err.status === 404) setError("User or invite not found");
        else if (err.status === 409) setError("This account has already been claimed");
        else if (err.status === 400 || err.status === 422) setError(`Invalid input. ${err.message}`);
        else if (err.status === 500) setError("Server error. Please try again.");
        else setError(err.message);
      } else if (err instanceof Error) {
        setError(`Unable to connect. ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!password) { setError("Password is required"); return; }
    const pwdError = validatePassword(password);
    if (pwdError) { setError(pwdError); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setIsLoading(true);
    setError(null);
    try {
      const payload = token
        ? {
          token,
          password,
          deviceId: getDeviceId(),
        }
        : {
          email,
          claimCode,
          password,
          deviceId: getDeviceId(),
        };

      console.log(fromClaimAccountRequest(payload))

      const raw_data = await apiClient.post<ClaimAccountResponseDto>(
        "/auth/claim",
        fromClaimAccountRequest(payload)
      );
      const data  = toClaimAccountResponse(raw_data)
      setSession(data.user, data.accessToken);
      setStep("success");
      setTimeout(() => { router.replace(getDefaultRoute(data.user.roles)); }, 1200);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError("Invalid or expired token");
        else if (err.status === 403) setError("You are not allowed to activate this account");
        else if (err.status === 404) setError("User or invite not found");
        else if (err.status === 409) setError("This account has already been claimed");
        else if (err.status === 400 || err.status === 422) setError(`Invalid input. ${err.message}`);
        else if (err.status === 500) setError("Server error. Please try again.");
        else setError(err.message || err.data?.details);
      } else if (err instanceof Error) {
        setError(`Unable to connect. ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (step === "success") {
    return (
      <AuthShell>
        <div className="flex flex-col items-center py-6 gap-4 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center dark:bg-emerald-500/15"
            style={{ background: "rgba(5,150,105,0.1)" }}
          >
            <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[17px] font-bold text-text-primary" style={{ fontFamily: "var(--font-head)" }}>
              Account activated
            </p>
            <p className="text-[13px] text-text-muted mt-1">Taking you in…</p>
          </div>
        </div>
      </AuthShell>
    );
  }

  const submitBtnClass = cn(
    "w-full h-10 rounded-[10px] text-[13.5px] font-semibold text-white",
    "transition-all duration-200",
    "hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(59,7,100,0.38)]",
    "active:scale-[0.985]",
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none",
    "flex items-center justify-center gap-2",
    "shadow-[0_4px_16px_rgba(59,7,100,0.3)]"
  );
  const submitBtnStyle = { background: "linear-gradient(135deg,#5B21B6,#3B0764)" };

  if (isVerifying) {
    return (
      <AuthShell>
        <LoadingState />
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
              ? `Welcome, ${invite.fullName}`
              : ""
        }
      />

      {/* STEP 1 */}
      {!token && step === "identify" && (
        <form onSubmit={handleIdentify} className="flex flex-col gap-4">
          <AuthInput id="email" label="Email" value={email} onChange={setEmail} />
          <AuthInput id="code" label="Claim code" value={claimCode} onChange={setClaimCode} />
          {error && <AuthAlert message={error} />}
          <button type="submit" disabled={isLoading} className={submitBtnClass} style={submitBtnStyle}>
            {isLoading ? <><Loader2 size={15} className="animate-spin" />Checking…</> : "Continue"}
          </button>
        </form>
      )}

      {/* STEP 2 */}
      {step === "set_password" && invite && (
        <form onSubmit={handleClaim} className="flex flex-col gap-4">
          {/* Identity pill */}
          <div className={cn(
            "rounded-xl px-4 py-3 flex flex-col gap-0.5",
            "border border-purple/10 dark:border-border",
            "bg-gradient-to-r from-purple/5 to-transparent dark:from-white/[0.03]"
          )}>
            <p className="text-[13.5px] font-semibold text-text-primary">{invite.fullName}</p>
            <p className="text-[12px] text-text-muted">{invite.email}</p>
          </div>

          <AuthInput
            id="password"
            label="Create password"
            type="password"
            value={password}
            onChange={setPassword}
            showStrength
          />
          <AuthInput
            id="confirm"
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={setConfirm}
          />

          {error && <AuthAlert message={error} />}

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className={submitBtnClass}
            style={submitBtnStyle}
          >
            {isLoading ? <><Loader2 size={15} className="animate-spin" />Activating…</> : "Activate account"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}