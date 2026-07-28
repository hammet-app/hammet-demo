"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

const DISMISS_KEY = "hammet_cookie_notice_dismissed";

export function CookieNoticeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    
    const dismissed = localStorage.getItem(DISMISS_KEY);

    if (!dismissed) {
      queueMicrotask(() => {
        setVisible(true);
      });
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
          className="fixed bottom-0 inset-x-0 z-50 bg-[var(--color-purple-dark)] text-white">
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-5xl px-4 py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <p className="text-sm text-white/90 flex-1">
              We use essential cookies to keep Hammet working correctly. Cookie
              preferences for your school are managed by your school administrator.{" "}
              <Link href="/cookie-policy" className="underline underline-offset-2 hover:text-white">
                Learn more
              </Link>
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              onClick={dismiss}
              className="shrink-0 rounded-lg bg-white/10 hover:bg-white/20 transition-colors p-2"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </motion.div>
    )}
    </AnimatePresence>
  );
}