"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell, AuthHeading, AuthAlert } from "@/components/ui/auth-shell";
import { AuthInput } from "@/components/ui/auth-input";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient, ApiError } from "@/lib/api/api-client";
import { getDefaultRoute } from "@/lib/auth/routes";
import {
  type LoginRequestDto,
  type LoginResponseDto,
  toLoginResponse,
} from "@/lib/api/types";
import { getDeviceId } from "@/lib/auth/device-id";
import { cn } from "@/lib/utils/utils";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { fadeUp } from "@/components/animations/home";

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
      const response = await apiClient.post<LoginResponseDto>(
        "/auth/login",
        ({ email, password, device_id: deviceId }) satisfies LoginRequestDto
      );
      const data = toLoginResponse(response);
      setSession(data.user, data.accessToken);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrors({ form: "Incorrect email or password. Please try again." });
        } else if (err.status === 403) {
          setErrors({ form: "Your account has been suspended. Contact your school admin." });
        } else if (err.status === 422) {
          setErrors({ form: `Please check your details and try again.` });
        } else {
          setErrors({ form: err.message });
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
}, [accessToken, user, isResolved, router]);

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0}}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-6"
      >
        <AuthHeading 
          title="Welcome back"
          description="Sign in to your AI Studies account"
        />

        <AnimatePresence mode="wait">
          {errors.form && (
            <motion.div
              initial={{ opacity: 0, y: -8, }}
              animate={{ opacity: 1, y: 0, }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <AuthAlert message={errors.form} />
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <motion.fieldset
            disabled={isLoading}
            animate={{ opacity: isLoading ? .8: 1 }}
          >
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
            <motion.button
              type="submit"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              disabled={isLoading}
              className={cn(
                "mt-2 w-full h-10 rounded-[10px] text-[13.5px] font-semibold text-white",
                "transition-all duration-200",
                "hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(59,7,100,0.38)]",
                "active:scale-[0.985]",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none",
                "flex items-center justify-center gap-2",
                "shadow-[0_4px_16px_rgba(59,7,100,0.3)]",
                "relative overflow-hidden"
              )}
              style={{ background: "linear-gradient(135deg,#5B21B6,#3B0764)" }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <motion.span
                    animate={{ opacity: [1, .7, 1], }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    Signing in… 
                  </motion.span>
                </>
              ) : (
                "Sign in")}

              {!isLoading && (
                <motion.span
                  aria-hidden
                  className="absolute top-0 bottom-0 w-10 rounded-full blur-md bg-white/20 dark:bg-white/30 -skew-x-12 pointer-events-none"
                  initial={{ x: -80 }}
                  animate={{ x:  420 }}
                  transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 6, ease: "easeInOut", }}
                />
              )}
            </motion.button>
          </motion.fieldset>
        </form>
  
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: .08
              }
            }
          }}
          className="flex flex-col gap-2 mt-1"
        >
          <motion.p 
            variants={fadeUp} 
            className="text-center text-[12px] text-text-muted leading-relaxed"
          >
            Haven&apos;t received your invite?{" "}
            <span className="text-text-secondary font-medium">Contact your school admin.</span>
          </motion.p>
          <motion.p 
            variants={fadeUp}
            className="text-center text-[12px] text-text-muted leading-relaxed"
          >
            Forgot your password?{" "}
            <Link href="/reset-password" className="text-purple dark:text-cyan font-medium hover:text-purple-dark dark:hover:text-cyan-light transition-colors">
              Reset Your Password
            </Link>
          </motion.p>
          <motion.p 
            variants={fadeUp}
            className="text-center text-[12px] text-text-muted leading-relaxed"
          >
            New student?{" "}
            <Link href="/claim" className="text-purple dark:text-cyan font-medium hover:text-purple-dark dark:hover:text-cyan-light transition-colors">
              Activate with a claim code
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </AuthShell>
  );
}