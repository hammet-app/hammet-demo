"use client";

import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("hammet-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const active = stored === "dark" || (!stored && prefersDark) ? "dark" : "light";
    setTheme(active);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("hammet-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return { theme, toggle };
}
