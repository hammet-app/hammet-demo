"use client";

import { cn } from "@/lib/utils/utils";
import { navConfig } from "./sidebar-config";
import Link from "next/link";
import { CircleHelp, LogOut } from "lucide-react";
import type { UserRole } from "@/lib/utils/roles";
import type { NavItem } from "./sidebar-config";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useOnboardingContext } from "@/components/onboarding/onboarding-provider";

interface SidebarProps {
  activeRole: UserRole;
  activePath: string;
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({
  activeRole,
  activePath,
  onNavigate,
  className,
}: SidebarProps) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const { startTour } = useOnboardingContext();

  if (!user) return null;

  const entries = navConfig[activeRole];

  return (
    <aside
      className={cn(
        "flex h-full w-[240px] flex-col bg-[var(--color-bg-sidebar)] px-4 py-4 text-purple-dark",
        className
      )}
    >
      <nav className="flex overflow-y-auto flex-1 flex-col gap-4 pr-1">
        {entries.map((entry, i) => {
          
          const item = entry as NavItem;

          const isActive = activePath === item.href || activePath.startsWith(item.href + "/");

          const Icon = item.icon;

          if (!item.href) {
            return null
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "border-l-4 border-cyan bg-[var(--color-purple-active)] text-[var(--color-text-primary)]"
                  : item.danger
                  ? "bg-white/90 text-red-600 hover:bg-red-100 hover:text-red-700"
                  : "bg-[var(--color-button)] text-[var(--color-purple-dark)] hover:bg-white"
                  // : "text-[var(--color-text-primary)] hover:bg-white/60"
              )}
            >
              <Icon size={16} className="shrink-0" />

              <span className="flex-1 leading-none">
                {item.label}
              </span>

              {item.badge != null && item.badge > 0 && (
                <span className="min-w-[18px] rounded-full bg-cyan px-1.5 py-[1px] text-center text-[10px] font-bold leading-[16px] text-[#4B0081]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="pt-4 border-t shrink-0 space-y-4">
        <button
          type="button"
          onClick={() => {
            startTour();
          }}
          className={cn(
            "flex items-center gap-[10px] rounded-md px-3 py-2 text-sm font-medium transition-all w-full",
            "bg-[var(--color-button)] text-[var(--color-purple-dark)] hover:bg-white"
          )}
        >
          <CircleHelp size={16} className="shrink-0" />
          <span className="text-sm font-medium leading-none">Help</span>
        </button>
        <Button
          variant="ghost"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className={cn(
            "h-auto w-full justify-start rounded-md bg-[var(--color-purple)] px-5 py-3 text-white shadow-sm",
            "hover:bg-[var(--color-purple-hover)]"
          )}
        >
          <LogOut size={16} className="mr-3 shrink-0" />
          <span className="text-sm font-medium leading-none">
            Log Out
          </span>
        </Button>
      </div>
    </aside>
  );
}