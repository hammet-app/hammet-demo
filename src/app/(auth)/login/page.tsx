"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell, AuthHeading, AuthAlert } from "@/components/ui/auth-shell";
import { AuthInput } from "@/components/ui/auth-input";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient, ApiError } from "@/lib/api/api-client";
import { getDefaultRoute } from "@/lib/auth/routes";
import type { LoginRequest, LoginResponse } from "@/lib/api/api-types";
import type { UserRole } from "@/lib/utils/roles";
import { getDeviceId } from "@/lib/auth/device-id";
import { cn } from "@/lib/utils/utils";

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

export default function LoginPage() {
  const { setSession, isResolved, accessToken, user } = useAuth();
  const router = useRouter();
  const deviceId = getDeviceId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};

    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address";
    }

    if (!password) {
      next.password = "Password is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const data = await apiClient.post<LoginResponse>(
        "/auth/login",
        { email, password, deviceId } satisfies LoginRequest
      );

      setSession(data.user, data.access_token);

    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrors({ form: `Incorrect email or password. Please try again.` });
        } else if (err.status === 403) {
          setErrors({ form: `Your account has been suspended. Contact your school admin.` });
        } else if (err.status === 422) {
          setErrors({ form: `Please check your details and try again.${err.message}` });
        } else {
          setErrors({ form: `${err.message}` });
        }
      } else if (err instanceof Error) {
        setErrors({ form: `Unable to connect. Check your internet connection. ${err.message}` });
      }
    } finally {
      setIsLoading(false);
    }
  }

useEffect(() => {
  if (!isResolved || !accessToken || !user) return;

  const route = getDefaultRoute(user.roles);

  if (window.location.pathname !== route) {
    router.replace(route);
  }
}, [accessToken, user, isResolved]);

  return (
    <AuthShell>
      <AuthHeading
        title="Welcome back"
        description="Sign in to your AI Studies account"
      />

      {errors.form && <AuthAlert message={errors.form} />}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <AuthInput
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@school.edu.ng"
          autoComplete="email"
          error={errors.email}
          disabled={isLoading}
        />

        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
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
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* Pending invite nudge */}
      <p className="mt-6 text-center text-[12px] text-text-muted leading-relaxed">
        Haven&apos;t received your invite?{" "}
        <span className="text-text-secondary font-medium">
          Contact your school admin.
        </span>
      </p>
    </AuthShell>
  );
}
