"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AlertCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils/utils";

// ── AuthShell ────────────────────────────────────────────────────────────────

interface AuthShellProps {
  children: ReactNode;
  /** Optionally widen the card for multi-column steps */
  wide?: boolean;
}

export function AuthShell({ children, wide = false }: AuthShellProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const bounds = useRef<DOMRect | null>(null);
  const raf = useRef<number>(0);
  const current = useRef({ rx: 0, ry: 0 });
  const target = useRef({ rx: 0, ry: 0 });

  const { theme, toggle } = useTheme();

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    function onMouseMove(e: MouseEvent) {
      if (!bounds.current) return;
      const cx = bounds.current.left + bounds.current.width / 2;
      const cy = bounds.current.top + bounds.current.height / 2;
      target.current.rx = ((e.clientY - cy) / bounds.current.height) * 5;
      target.current.ry = -((e.clientX - cx) / bounds.current.width) * 5;
    }

    function onMouseEnter() {
      bounds.current = card!.getBoundingClientRect();
    }

    function onMouseLeave() {
      target.current = { rx: 0, ry: 0 };
    }

    function animate() {
      const lerp = 0.08;
      current.current.rx += (target.current.rx - current.current.rx) * lerp;
      current.current.ry += (target.current.ry - current.current.ry) * lerp;
      card!.style.transform = `perspective(1000px) rotateX(${current.current.rx}deg) rotateY(${current.current.ry}deg)`;
      raf.current = requestAnimationFrame(animate);
    }

    card.addEventListener("mouseenter", onMouseEnter);
    card.addEventListener("mousemove", onMouseMove);
    card.addEventListener("mouseleave", onMouseLeave);
    animate();

    return () => {
      cancelAnimationFrame(raf.current);
      card.removeEventListener("mouseenter", onMouseEnter);
      card.removeEventListener("mousemove", onMouseMove);
      card.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div className="relative flex flex-1 items-center justify-center px-4 py-12">
      <button
        onClick={toggle}
        className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div
        ref={cardRef}
        className={cn(
          "w-full rounded-2xl",
          // One surface definition. Light/dark difference comes entirely
          // from --color-bg-card and --color-border flipping via the
          // app's existing .dark variable overrides — not a separate
          // hand-picked dark palette.
          "bg-bg-card/70 backdrop-blur-2xl",
          "border border-border",
          "shadow-[0_8px_40px_rgba(30,27,75,0.08),0_1px_0_rgba(255,255,255,0.6)_inset]",
          "dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.04)_inset]",
          "p-8 flex flex-col gap-5",
          "transition-colors duration-300 will-change-transform",
          wide ? "max-w-lg" : "max-w-sm"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <AuthLogo />
        {children}
      </div>
    </div>
  );
}

// ── AuthLogo ─────────────────────────────────────────────────────────────────

function AuthLogo() {
  return (
    <div className="flex items-center gap-2.5 mb-1">
      <div
        className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
        style={{
          background: "linear-gradient(135deg, #5B21B6, #3B0764)",
          boxShadow: "0 2px 8px rgba(91,33,182,0.35)",
        }}
        aria-hidden="true"
      >
        <img
          src="/favicon.ico"
          alt=""
          className="w-5 h-5 rounded-[5px]"
        />
      </div>
      <span
        className="text-[13.5px] font-bold text-text-primary tracking-tight"
        style={{ fontFamily: "var(--font-head)" }}
      >
        AI Studies <span className="text-purple dark:text-cyan-light">by Hammet</span>
      </span>
    </div>
  );
}

// ── AuthHeading ───────────────────────────────────────────────────────────────

interface AuthHeadingProps {
  title: string;
  description?: string;
}

export function AuthHeading({ title, description }: AuthHeadingProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1
        className="text-[22px] font-extrabold text-text-primary leading-tight tracking-tight"
        style={{ fontFamily: "var(--font-head)" }}
      >
        {title}
      </h1>
      {description && (
        <p className="text-[13px] text-text-muted leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

// ── AuthAlert ─────────────────────────────────────────────────────────────────

interface AuthAlertProps {
  message: string;
}

export function AuthAlert({ message }: AuthAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-3.5 py-3",
        "bg-danger-light/40 border border-danger/20",
        "dark:bg-danger/10 dark:border-danger/25",
        "text-[12.5px] text-danger leading-relaxed"
      )}
    >
      <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

// ── AuthDivider ───────────────────────────────────────────────────────────────

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px] text-text-muted uppercase tracking-widest">
      <div className="flex-1 h-px bg-border" />
      {label}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ── FieldError ────────────────────────────────────────────────────────────────

interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p className="text-[11.5px] text-danger leading-snug mt-0.5" role="alert">
      {message}
    </p>
  );
}