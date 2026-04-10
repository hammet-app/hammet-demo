import { cn } from "@/lib/utils/utils";

interface AuthShellProps {
  children: React.ReactNode;
  /** Narrow card (login, claim) vs wider layout */
  className?: string;
}

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-bg-page flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2.5 mb-8 no-underline">
        <div className="w-8 h-8 rounded-[8px] bg-cyan flex items-center justify-center">
          <LogoMark />
        </div>
        <div className="flex flex-col leading-none">
          <span
            className="text-[16px] font-bold text-purple-dark"
            style={{ fontFamily: "var(--font-head)" }}
          >
            Hammet<span className="text-purple-mid">Labs</span>
          </span>
          <span className="text-[11px] text-text-muted">AI Studies</span>
        </div>
      </a>

      {/* Card */}
      <div
        className={cn(
          "w-full max-w-[420px] bg-bg-card border border-border rounded-[14px] p-8",
          className
        )}
      >
        {children}
      </div>

      {/* Footer */}
      <p className="mt-6 text-[12px] text-text-muted text-center">
        © {new Date().getFullYear()} HammetLabs · AI Studies
      </p>
    </div>
  );
}

export function AuthHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h1
        className="text-[22px] font-bold text-text-primary leading-tight"
        style={{ fontFamily: "var(--font-head)" }}
      >
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 text-[13px] text-text-secondary leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[12px] text-text-muted">or</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-[12px] text-danger flex items-center gap-1">
      <span className="inline-block w-1 h-1 rounded-full bg-danger shrink-0" />
      {message}
    </p>
  );
}

export function AuthAlert({
  message,
  variant = "error",
}: {
  message: string;
  variant?: "error" | "success";
}) {
  return (
    <div
      className={cn(
        "rounded-[8px] px-4 py-3 text-[13px] mb-4 leading-relaxed",
        variant === "error"
          ? "bg-danger-light text-danger-dark border border-danger/20"
          : "bg-success-light text-success-dark border border-success/20"
      )}
    >
      {message}
    </div>
  );
}

function LogoMark() {
  return (
    <img
      src="/favicon.ico"
      alt="logo"
      className="w-8 h-8"
    />
  );
}