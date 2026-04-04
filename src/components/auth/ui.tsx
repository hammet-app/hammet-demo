"use client";

import { forwardRef, InputHTMLAttributes, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Logo ─────────────────────────────────────────────────────

export function HammetLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B21B6] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-purple-900/30">
        <span className="text-white font-bold text-sm tracking-tight">H</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[10px] text-purple-400 uppercase tracking-[0.18em] font-medium">
          AI Studies by
        </span>
        <span className="text-white font-semibold text-[15px] tracking-tight">
          Hammet
        </span>
      </div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-500",
            "bg-white/5 border border-white/10",
            "focus:outline-none focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20",
            "transition-all duration-200",
            error && "border-red-500/60 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";

// ─── Primary Button ───────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "ghost" | "google";
}

export function AuthButton({
  children,
  loading,
  variant = "primary",
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#5B21B6] hover:bg-[#4C1D95] text-white shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 active:scale-[0.98]",
    ghost:
      "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white active:scale-[0.98]",
    google:
      "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm active:scale-[0.98]",
  };

  return (
    <button
      className={cn(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-slate-500 uppercase tracking-widest">
        {label}
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────

export function AuthAlert({
  type,
  message,
}: {
  type: "error" | "success" | "info";
  message: string;
}) {
  const styles = {
    error: "bg-red-500/10 border-red-500/30 text-red-400",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    info: "bg-[#06B6D4]/10 border-[#06B6D4]/30 text-[#06B6D4]",
  };

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-xl border text-sm leading-relaxed",
        styles[type]
      )}
    >
      {message}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-md bg-[#0F0A1E]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-8 shadow-2xl shadow-black/60",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07040F] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#3B0764]/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#06B6D4]/10 blur-[120px] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-8 w-full">
        {children}
      </div>
    </div>
  );
}
