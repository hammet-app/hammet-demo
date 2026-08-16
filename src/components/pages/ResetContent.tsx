"use client";

import { cn } from "@/lib/utils/utils";
import { useEffect, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResetPasswordRequest } from "@/lib/api/types";
import { AuthInput } from "@/components/ui/auth-input";
import { apiClient, ApiError } from "@/lib/api/api-client";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingState } from "@/components/pages/ParentPortal";
import { validatePassword as checkPassword } from "@/utils/password";
import { AuthShell, AuthHeading, AuthAlert } from "@/components/ui/auth-shell";
import { forgotPasswordResponseDto, toForgotPasswordResponse } from "@/lib/api/types";

interface FormErrors {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

const submitBtnClass = cn(
  "mt-2 w-full h-10 rounded-[10px] text-[13.5px] font-semibold text-white",
  "transition-all duration-200",
  "hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(59,7,100,0.38)]",
  "active:scale-[0.985]",
  "disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none",
  "flex items-center justify-center gap-2",
  "shadow-[0_4px_16px_rgba(59,7,100,0.3)]"
);
const submitBtnStyle = { background: "linear-gradient(135deg,#5B21B6,#3B0764)" };

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(!!token);


  // Token flow: fetch invite directly
  useEffect(() => {
    if (!token) return;
    apiClient
      .post<boolean>(`/auth/reset/${token}`)
      .then(() => { setStep(2) })
      .catch(() => { setErrors({otp: "Invalid or expired link"}); setStep(0); })
      .finally(() => setIsVerifying(false));
  }, [token]);

  function validateOTP(): boolean {
    const next: FormErrors = {};
    if (!otp.trim()) next.otp = "Enter OTP";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validatePassword(): boolean {
    const next: FormErrors = {};
    const pwdError = checkPassword(password);

    if (!password.trim()) {
      next.password = "Password is required";
    } else if (!confirmPassword.trim()) {
      next.confirmPassword = "Confirm password";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    } else if (pwdError) {
      next.password = pwdError;
      return false;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateEmail(): boolean {
    const next: FormErrors = {};

    if (!email.trim()) {
      next.email = "Email is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const handleValidateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiClient.post<forgotPasswordResponseDto>(
        `/auth/reset/email`,
        { email }
      );

      if (toForgotPasswordResponse(response).isAdmin) {
        setStep(3)
      } else {
        setErrors({email: "Please contact your school admin for your password"})
      }

    } catch (err) {
      if (err instanceof ApiError) {

        setErrors({ form: `${err.message}` });

      } else if (err instanceof Error) {
        setErrors({ form: `Unable to connect. Check your internet connection. ${err.message}` });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOTP()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await apiClient.post<boolean>(`/auth/reset/${otp}`);
      if (response) {
        setStep(2);
      } else {
        setErrors({ form: "Incorrect pin" });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ form: err.message });
      } else if (err instanceof Error) {
        setErrors({ form: `Unable to connect. Check your internet connection. ${err.message}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await apiClient.post<boolean>(
        "/auth/reset",
        { token: token ?? otp, password } satisfies ResetPasswordRequest
      );
      if (response) {
        router.push("/login");
      } else {
        setErrors({ form: "Something went wrong, please try again" });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          setErrors({ form: `Please check your details and try again. ${err.message}` });
        } else {
          setErrors({ form: err.message });
        }
      } else if (err instanceof Error) {
        setErrors({ form: `Unable to connect. Check your internet connection. ${err.message}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <AuthShell>
        <LoadingState />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AnimatePresence mode="wait">
        {step == 0 && (
            // STEP 0
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
          >
            <AuthHeading
              title="Forgot your password?"
              description="Enter the email address you registered with"
            />

            {errors.form && <AuthAlert message={errors.form} />}

            <form onSubmit={handleValidateEmail} noValidate className="flex flex-col gap-4">
              <AuthInput
                id="email"
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Enter email address"
                autoComplete="email"
                error={errors.email}
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading}
                className={submitBtnClass}
                style={submitBtnStyle}
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
              <a
                href="/login"
                className="text-purple-mid font-medium hover:underline"
              >
                Sign in
              </a>
            </p>
          </motion.div>
        )}
         {/** This was for students before we switched over to normal login flow */}
        {/**step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
          >
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
                error={errors.otp}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading} 
                className={submitBtnClass} 
                style={submitBtnStyle}
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

            <p className="mt-1 text-center text-[12px] text-text-muted leading-relaxed">
              Remember your password?{" "}
              <a 
                href="/login" 
                className="text-purple dark:text-cyan font-medium hover:text-purple-dark dark:hover:text-cyan-light transition-colors"
              >
                Sign in
              </a>
            </p>

          </motion.div>
        )*/} 
       
        {step == 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
          >
            <AuthHeading
              title="New password"
              description="Choose a strong password for your account"
            />

            {errors.form && <AuthAlert message={errors.form} />}

            <form onSubmit={handleReset} noValidate className="flex flex-col gap-4">
              <AuthInput
                id="new_password"
                label="New password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Enter new password"
                error={errors.password}
                disabled={isLoading}
                showStrength
              />
              <AuthInput
                id="confirm_password"
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm new password"
                autoComplete="new-password"
                error={errors.confirmPassword}
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading} className={submitBtnClass} style={submitBtnStyle}>
                {isLoading ? <><Loader2 size={15} className="animate-spin" />Resetting…</> : "Reset password"}
              </button>
            </form>

            <div className="flex flex-col gap-2 mt-1">
              <p className="text-center text-[12px] text-text-muted leading-relaxed">
                Remember your password?{" "}
                <a href="/login" className="text-purple dark:text-cyan font-medium hover:text-purple-dark dark:hover:text-cyan-light transition-colors">
                  Sign in
                </a>
              </p>
              <p className="text-center text-[12px] text-text-muted leading-relaxed">
                New student?{" "}
                <a href="/claim" className="text-purple dark:text-cyan font-medium hover:text-purple-dark dark:hover:text-cyan-light transition-colors">
                  Activate with a claim code
                </a>
              </p>
            </div>
          </motion.div> 
        )}
        {step == 3 && (// STEP 3  For school admins
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
          >
            <div className="bg-[var(--color-bg-card)] rounded-2xl flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
                <MailCheck color="green" />
              </div>
              <div>
                <p className="text-base font-semibold text-[var(--color-text-primary)]">
                  Check your email
                </p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  A reset link has been sent to your email address. <br /> Please click on the link to reset your password.
                </p>
              </div>

              <span>
                Didn&apos;t get reset email? {" "}
                <button
                  onClick={handleValidateEmail}
                  className="text-sm text-[var(--color-purple)] font-medium hover:underline"
                >
                  Resend reset link
                </button>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}