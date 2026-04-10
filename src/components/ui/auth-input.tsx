"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { FieldError } from "@/components/ui/auth-shell";

interface AuthInputProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
  hint?: string;
}

export function AuthInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  disabled,
  hint,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[13px] font-medium text-text-primary"
      >
        {label}
      </label>

      {hint && (
        <p className="text-[12px] text-text-muted -mt-0.5">{hint}</p>
      )}

      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className={cn(
            "w-full h-10 px-3 rounded-[8px] border text-[13.5px] text-text-primary",
            "placeholder:text-text-muted bg-bg-card outline-none transition-colors",
            "focus:border-purple-mid focus:ring-2 focus:ring-purple-mid/10",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-danger focus:border-danger focus:ring-danger/10"
              : "border-border",
            isPassword && "pr-10"
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>

      <FieldError message={error} />
    </div>
  );
}
