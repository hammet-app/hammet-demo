"use client";

import { useState } from "react";
import Link from "next/link";

interface CookieConsentModalProps {
  open: boolean;
  onAccept: () => Promise<void> | void;
  onManagePreferences?: () => void;
}

export function CookieConsentModal({ open, onAccept, onManagePreferences }: CookieConsentModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await onAccept();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl">
        <h2 className="font-heading text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
          Your cookie preferences
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">
          Hammet uses cookies to keep you signed in and improve your experience.
          Since this may be a school device, we ask every admin to
          confirm preferences per school. Read our{" "}
          <Link href="/cookie-policy" className="text-[var(--color-purple)] underline underline-offset-2">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          {onManagePreferences && (
            <button
              onClick={onManagePreferences}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Manage preferences
            </button>
          )}
          <button
            onClick={handleAccept}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-purple)] hover:bg-[var(--color-purple-dark)] transition-colors disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Accept and continue"}
          </button>
        </div>
      </div>
    </div>
  );
}