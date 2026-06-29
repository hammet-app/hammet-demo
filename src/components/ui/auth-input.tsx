"use client";

/**
 * AuthInput
 *
 * Styled form input for auth pages.
 * - Focus: purple ring + animated underline trace
 * - Password: toggle visibility + live strength meter (opt-in via showStrength)
 * - Error: red ring + inline FieldError
 *
 * File location: src/components/ui/auth-input.tsx
 * Props contract is IDENTICAL to the original — no changes needed in page files.
 */

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { FieldError } from "@/components/ui/auth-shell";

interface AuthInputProps {
  id: string;
  label: string;
  type?: "text" | "number" | "email" | "password";
  value: string;
  onChange: (v: string) => void;
  style?: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
  hint?: string;
  /** Opt-in: show live strength bar when the user is creating a password */
  showStrength?: boolean;
}

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: "Weak",   color: "#E24B4A" },
    { label: "Fair",   color: "#F59E0B" },
    { label: "Good",   color: "#06B6D4" },
    { label: "Strong", color: "#059669" },
  ] as const;

  return { score, ...levels[Math.min(score, 3)] };
}

export function AuthInput({
  id,
  label,
  type,
  value,
  defaultValue,
  onChange,
  style,
  placeholder,
  error,
  autoComplete,
  disabled,
  hint,
  showStrength = false,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  const strength = isPassword && showStrength && value ? getStrength(value) : null;
  const strengthPct = strength ? [25, 50, 75, 100][Math.min(strength.score, 3)] : 0;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[12.5px] font-medium text-text-secondary">
        {label}
      </label>

      {hint && (
        <p className="text-[11.5px] text-text-muted -mt-0.5">{hint}</p>
      )}

      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className={cn(
            "w-full h-10 px-3 rounded-[10px] border text-[13.5px] text-text-primary",
            "placeholder:text-text-muted/70 bg-white/80 focus:bg-white dark:bg-black/20 outline-none",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/10"
              : cn(
                  "border-border hover:border-purple/30 focus:border-purple focus:ring-2 focus:ring-purple/8",
                  // Purple-on-dark-card has weak contrast — cyan takes over as the
                  // focus accent only in dark mode, matching the logo's accent swap.
                  "dark:hover:border-cyan/40 dark:focus:border-cyan dark:focus:ring-cyan/10"
                ),
            isPassword && "pr-10",
            style && style
          )}
        />

        {/* animated underline trace */}
        {/* <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 left-3 right-3 h-[2px] rounded-full pointer-events-none",
            error ? "bg-danger" : "bg-purple dark:bg-cyan"
          )}
          style={{
            transform: focused ? "scaleX(1)" : "scaleX(0)",
            opacity: focused ? 1 : 0,
            transition: "transform 0.3s ease, opacity 0.2s",
            transformOrigin: "left",
          }}
        /> */}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-purple dark:hover:text-cyan transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>

      {strength && value && (
        <div className="flex flex-col gap-1 mt-1" aria-live="polite" aria-atomic="true">
          <div className="h-[3px] rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${strengthPct}%`,
                background: strength.color,
                transition: "width 0.4s ease, background 0.4s",
              }}
            />
          </div>
          <p className="text-[11px]" style={{ color: strength.color }}>
            {strength.label}
          </p>
        </div>
      )}

      <FieldError message={error} />
    </div>
  );
}