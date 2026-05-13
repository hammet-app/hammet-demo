"use client";

import { cn } from "@/lib/utils/utils";

interface ParentShellProps {
  children: React.ReactNode;
  className?: string;
}

export function ParentShell({ children, className }: ParentShellProps) {
  return (
    <div className="min-h-screen bg-bg-page flex flex-col">
      <main
        className={cn(
          "flex-1 w-full max-w-[560px] mx-auto px-4 py-10 flex flex-col",
          className
        )}
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full py-5 flex items-center justify-center gap-2">
        <div className="w-5 h-5 rounded-[5px] bg-cyan flex items-center justify-center shrink-0">
          <img src="/favicon.ico" alt="" className="w-5 h-5 rounded-[5px]" />
        </div>
        <span className="text-[12px] text-text-muted">
          Powered by{" "}
          <span
            className="font-semibold text-purple-dark"
            style={{ fontFamily: "var(--font-head)" }}
          >
            Hammet<span className="text-purple-mid">Labs</span>
          </span>
        </span>
      </footer>
    </div>
  );
}
