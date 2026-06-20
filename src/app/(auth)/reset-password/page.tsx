"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell, AuthHeading, AuthAlert } from "@/components/ui/auth-shell";
import { AuthInput } from "@/components/ui/auth-input";
import { apiClient, ApiError } from "@/lib/api/api-client";
import {
  ResetPasswordRequest,
} from "@/lib/api/types";
import { validatePassword } from "@/utils/password";
import { cn } from "@/lib/utils/utils";

interface FormErrors {
  otp?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export default function ResetPassword() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1)
  const [otp, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validateOTP(): boolean {
    const next: FormErrors = {};

    if (!otp.trim()) {
      next.otp = "Enter OTP";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validatedPassword(): boolean {
    const next: FormErrors = {};

    const pwdError = validatePassword(password);
    const samePassword = password.trim() === confirmPassword.trim();

    if (!samePassword) {
      next.password = "Both passwords must match"
    }

    if (!password.trim()) {
      next.password = "Password is required";
    } else if (!confirmPassword.trim()) {
      next.confirmPassword = "Confirm password";
    } else if (pwdError) {
      next.password = pwdError;
      return false;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const handleVerify = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validateOTP()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiClient.post<boolean>(
        `/auth/reset/${otp}`
      );

      if (response) {
        setStep(2);
      } else {
        setErrors({ form: "Incorrect pin" });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ form: err.message });
      } else if (err instanceof Error) {
        setErrors({
          form: `Unable to connect. Check your internet connection. ${err.message}`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validatedPassword()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiClient.post<boolean>(
        "/auth/reset",
        {
          token: otp,
          password,
        } satisfies ResetPasswordRequest
      );

      if (response) {
        router.push("/login");
      } else {
        setErrors({
          form: "Something went wrong, please try again",
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          setErrors({
            form: `Please check your details and try again. ${err.message}`,
          });
        } else {
          setErrors({ form: err.message });
        }
      } else if (err instanceof Error) {
        setErrors({
          form: `Unable to connect. Check your internet connection. ${err.message}`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  

  return (

    <>

    {
      step == 1 ?

      // STEP 1
      <AuthShell>
        <AuthHeading
          title="Reset password"
          description="Enter the OTP your admin gave you"
        />

        {errors.form && <AuthAlert message={errors.form} />}

        <form onSubmit={handleVerify} noValidate className="flex flex-col gap-4">
          <AuthInput
            id="otp"
            label="OTP"
            type="text"
            value={otp}
            onChange={setOTP}
            placeholder="Enter OTP"
            // autoComplete="email"
            error={errors.otp}
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "mt-2 w-full h-10 rounded-[8px] text-[13.5px] font-semibold",
              "bg-purple text-white transition-colors",
              "hover:bg-purple-hover",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify"
            )}
          </button>
        </form>

        {/* Login nudge  */}
        <p className="mt-2 text-center text-[12px] text-text-muted leading-relaxed">
          Remember password?{" "}
          <Link
            href="/login"
            className="text-purple-mid font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </AuthShell>:

      // STEP 2
      <AuthShell>
        <AuthHeading
          title="Reset password"
          description="Enter new password"
        />

        {errors.form && <AuthAlert message={errors.form} />}

        <form onSubmit={handleReset} noValidate className="flex flex-col gap-4">
        <AuthInput
          id="old_password"
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter new password"
          // autoComplete="email"
          error={errors.password}
          disabled={isLoading}
        />

        <AuthInput
          id="new_password"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm new password"
          autoComplete="current-password"
          error={errors.password}
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "mt-2 w-full h-10 rounded-[8px] text-[13.5px] font-semibold",
            "bg-purple text-white transition-colors",
            "hover:bg-purple-hover",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            "flex items-center justify-center gap-2"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              loading…
            </>
          ) : (
            "Reset"
          )}
        </button>
      </form>

        
        <p className="mt-2 text-center text-[12px] text-text-muted leading-relaxed">
          Remember password?{" "}
          <Link
            href="/login"
            className="text-purple-mid font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>

        <p className="mt-2 text-center text-[12px] text-text-muted leading-relaxed">
          New student?{" "}
          <Link
            href="/claim"
            className="text-purple-mid font-medium hover:underline"
          >
            Activate your account with a claim code
          </Link>
        </p>
      </AuthShell>
    }

      

      
    </>
  );
}
