"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/utils";
import { useTheme } from "@/lib/use-theme";
import { Menu, Sun, Moon } from "lucide-react";
import type { UserRole } from "@/lib/utils/roles";
import { type AuthUser, getRoleLabel, getInitials } from "@/lib/utils/roles";

interface TopbarProps {
  user: AuthUser;
  activeRole: UserRole;
  onMenuClick: () => void;
  className?: string;
}

const roleBadgeStyles: Record<UserRole, string> = {
  student:       "bg-cyan/20 text-cyan",
  //teacher:       "bg-purple-mid/25 text-purple-light",
  school_admin:  "bg-success/20 text-emerald-300",
  hammet_admin:  "bg-warning/20 text-yellow-300",
};

const avatarStyles: Record<UserRole, string> = {
  student:       "bg-cyan text-purple-dark",
  //teacher:       "bg-purple-mid text-white",
  school_admin:  "bg-success text-white",
  hammet_admin:  "bg-warning text-text-primary",
};

export function Topbar({ user, activeRole, onMenuClick, className }: TopbarProps) {
  const initials = getInitials(user.fullName);
  const primaryRole = activeRole;
  const roleLabel = getRoleLabel(primaryRole);

  const { theme, toggle } = useTheme();

  const metaLine =
    primaryRole === "student" && user.classLevel
      ? [user.classLevel, user.classArm].filter(Boolean).join("")
      : roleLabel;

  return (
    <header
      className={cn(
        "h-[56px] bg-purple-dark flex items-center px-5 gap-3 shrink-0 z-30",
        className
      )}
    >
      {/* Hamburger — visible on mobile only */}
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="md:hidden flex items-center justify-center text-white/70 hover:text-white transition-colors p-1 -ml-1"
      >
        <Menu size={20} />
      </button>

      {/* Logo */}
      <Link href="/favicon.ico" className="flex items-center gap-2 shrink-0 no-underline">
        <div className="w-7 h-7 rounded-[7px] bg-cyan flex items-center justify-center">
          <LogoMark />
        </div>
        <div className="hidden sm:flex flex-col leading-none">
          <span
            className="text-[15px] font-bold text-white"
            style={{ fontFamily: "var(--font-head)" }}
          >
            Hammet<span className="text-cyan">Labs</span>
          </span>
          <span className="text-[11px] text-white/40 font-normal">AI Studies</span>
        </div>
      </Link>

      <div className="flex-1" />
      {/* Dark theme */}
      <button
        onClick={toggle}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun size={16} />
        ) : (
          <Moon size={16} />
        )}
      </button>

      <button
        onClick={toggle}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun size={16} />
        ) : (
          <Moon size={16} />
        )}
      </button>

      {/* Role badge */}
      <span
        className={cn(
          "hidden sm:inline-flex text-[11px] font-semibold px-2.5 py-[3px] rounded-full uppercase tracking-wide",
          roleBadgeStyles[primaryRole]
        )}
      >
        {roleLabel}
      </span>

      {/* User */}
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0",
            avatarStyles[primaryRole]
          )}
          style={{ fontFamily: "var(--font-head)" }}
        >
          {initials}
        </div>
        {/* Name + meta — hidden on small screens */}
        <div className="hidden md:flex flex-col leading-none">
          <span className="text-[13px] font-medium text-white">{user.fullName}</span>
          <span className="text-[11px] text-white/40">{metaLine}</span>
        </div>
      </div>
    </header>
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
