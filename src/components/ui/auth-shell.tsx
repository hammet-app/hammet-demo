import { cn } from "@/lib/utils/utils";

interface AuthShellProps {
  children: React.ReactNode;
  /** Narrow card (login, claim) vs wider layout */
  className?: string;
}

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-bg-page flex flex-col lg:flex-row lg:bg-bg-card">
      {/* Left side (Illustration & Branding) */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#0F0728] relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Decorative Gradients/Blobs */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-purple opacity-20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan opacity-25 blur-[100px] pointer-events-none" />

        {/* Brand/Logo in the upper corner */}
        <a href="/" className="flex items-center gap-2.5 no-underline z-10">
          <div className="w-8 h-8 rounded-[8px] bg-cyan flex items-center justify-center">
            <LogoMark />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="text-[16px] font-bold text-white"
              style={{ fontFamily: "var(--font-head)" }}
            >
              Hammet<span className="text-cyan">Labs</span>
            </span>
            <span className="text-[11px] text-purple-light/75">AI Studies</span>
          </div>
        </a>

        {/* Central Illustration / Artwork */}
        <div className="my-auto flex flex-col items-center justify-center z-10">
          <div className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden border border-purple-light/10 shadow-2xl">
            <img
              src="/images/auth-artwork.png"
              alt="Hammet Labs AI Studies"
              className="w-full h-full object-cover"
            />
            {/* Soft gradient overlay on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0728]/40 via-transparent to-transparent" />
          </div>
        </div>

        {/* Footer/Branding message */}
        <div className="z-10">
          <h2 
            className="text-[20px] font-bold text-white mb-2 leading-tight"
            style={{ fontFamily: "var(--font-head)" }}
          >
            Step into the future of learning
          </h2>
          <p className="text-[13px] text-purple-light/80 leading-relaxed max-w-[400px]">
            Empowering students and educators with cutting-edge artificial intelligence learning tools.
          </p>
        </div>
      </div>

      {/* Right side (Form) */}
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center px-4 py-12 lg:px-12 lg:py-16 bg-bg-page lg:bg-bg-card min-h-screen lg:min-h-0 overflow-y-auto">
        {/* Mobile-only Logo */}
        <a href="/" className="flex items-center gap-2.5 mb-8 no-underline lg:hidden">
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
            "lg:border-0 lg:shadow-none lg:p-0 lg:bg-transparent",
            className
          )}
        >
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-[12px] text-text-muted text-center lg:mt-12">
          © {new Date().getFullYear()} HammetLabs · AI Studies
        </p>
      </div>
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