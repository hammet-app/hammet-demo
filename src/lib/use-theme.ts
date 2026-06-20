"use client";

import { useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const stored = localStorage.getItem("hammet-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    return stored === "dark" || (!stored && prefersDark)
      ? "dark"
      : "light";
  });

  function toggle() {
    const next = theme === "light" ? "dark" : "light";

    setTheme(next);
    localStorage.setItem("hammet-theme", next);
    document.documentElement.classList.toggle(
      "dark",
      next === "dark"
    );
  }

  return { theme, toggle };
}