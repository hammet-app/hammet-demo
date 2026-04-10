"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { type AuthUser, getPrimaryRole, getRoleLabel, getInitials } from "@/lib/utils/roles";
import type { UserRole } from "@/lib/utils/roles";

interface TopbarProps {
  user: AuthUser;
  onMenuClick: () => void;
  className?: string;
}

const roleBadgeStyles: Record<UserRole, string> = {
  student:       "bg-cyan/20 text-cyan",
  teacher:       "bg-purple-mid/25 text-purple-light",
  school_admin:  "bg-success/20 text-emerald-300",
  hammet_admin:  "bg-warning/20 text-yellow-300",
};

const avatarStyles: Record<UserRole, string> = {
  student:       "bg-cyan text-purple-dark",
  teacher:       "bg-purple-mid text-white",
  school_admin:  "bg-success text-white",
  hammet_admin:  "bg-warning text-text-primary",
};

export function Topbar({ user, onMenuClick, className }: TopbarProps) {
  const primaryRole = getPrimaryRole(user.roles as UserRole[]);
  const initials = getInitials(user.full_name);
  const roleLabel = getRoleLabel(primaryRole);

  const metaLine =
    primaryRole === "student" && user.class_level
      ? [user.class_level, user.class_arm].filter(Boolean).join("")
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
      <a href="/" className="flex items-center gap-2 shrink-0 no-underline">
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
      </a>

      <div className="flex-1" />

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
          <span className="text-[13px] font-medium text-white">{user.full_name}</span>
          <span className="text-[11px] text-white/40">{metaLine}</span>
        </div>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
      <path d="M8 1L2 5v6l6 4 6-4V5L8 1zm0 2l4 2.7V10L8 12.7 4 10V5.7L8 3z" />
    </svg>
  );
}
