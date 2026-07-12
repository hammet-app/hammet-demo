"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const DISMISS_KEY = "hammet_cookie_notice_dismissed";

export function CookieNoticeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // sessionStorage on purpose — devices are shared, this must
    // reappear for the next person once this tab/session ends.
    const dismissed = sessionStorage.getItem(DISMISS_KEY);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-[var(--color-purple-dark)] text-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
        <p className="text-sm text-white/90 flex-1">
          We use essential cookies to keep Hammet working correctly. Cookie
          preferences for your school are managed by your school administrator.{" "}
          <Link href="/cookie-policy" className="underline underline-offset-2 hover:text-white">
            Learn more
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-lg bg-white/10 hover:bg-white/20 transition-colors p-2"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}