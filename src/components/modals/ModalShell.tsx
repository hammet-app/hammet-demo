"use client";

import { X } from "lucide-react";
import { FONT_BODY } from "@/lib/student/lessons/build";

type ModalShellProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
};

export function ModalShell({
  open,
  title,
  subtitle,
  maxWidth = "max-w-5xl",
  footer,
  children,
  onClose,
}: ModalShellProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div
        className={`w-full ${maxWidth} max-h-[90vh] bg-bg-card rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden`}
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2
              className="text-xl font-semibold text-text-primary"
              style={{ fontFamily: FONT_BODY }}
            >
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-sm text-text-muted">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-bg-page transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-bg-page">
          {children}
        </div>

        {footer && (
          <div className="border-t border-border px-6 py-4 bg-bg-card">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}