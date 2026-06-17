"use client";

import { cn } from "@/lib/utils/utils";
import { navConfig } from "./sidebar-config";
import Link from "next/link";
import type { UserRole } from "@/lib/utils/roles";
import type { NavItem } from "./sidebar-config";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getDashboardRoute } from "@/lib/auth/routes";

interface SidebarProps {
  roles: UserRole[];
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activePath: string;
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({
  roles,
  activeRole,
  setActiveRole,
  activePath,
  onNavigate,
  className,
}: SidebarProps) {
  const { logout, user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const entries = navConfig[activeRole];

  function formatRole(role: string) {
    return role
      .replace("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <aside
      className={cn(
        "flex min-h-screen w-[300px] flex-col bg-[var(--color-bg-sidebar)] px-5 py-[22px] text-purple-dark",
        className
      )}
    >
      {roles.length > 1 && (
        <div className="mb-8">
          <select
            value={activeRole}
            onChange={(e) => {
              const newRole = e.target.value as UserRole;

              setActiveRole(newRole);
              router.push(getDashboardRoute(newRole));
            }}
            className="w-full rounded-md bg-white/90 px-3 py-3 text-sm text-purple-dark outline-none shadow-sm"
          >
            {roles.map((role) => (
              <option
                key={role}
                value={role}
                className="bg-[var(--color-bg-sidebar)] text-purple-dark"
              >
                {formatRole(role)}
              </option>
            ))}
          </select>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-[25px]">
        {entries.map((entry, i) => {
          if (entry.type === "section") {
            return (
              <p
                key={i}
                className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40"
              >
                {entry.label}
              </p>
            );
          }

          if (entry.type === "divider") {
            return (
              <div
                key={i}
                className="my-2 border-t border-white/20"
              />
            );
          }

          const item = entry as NavItem;

          const isActive = activePath === item.href;

          const Icon = item.icon;

          if (item.action === "logout") {
            return (
              <Button
                key={item.label}
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
                <Icon size={16} className="mr-2 shrink-0" />

                <span className="text-sm font-medium leading-none">
                  {item.label}
                </span>
              </Button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={onNavigate}
              {...(item.tourId ? { 'data-tour': item.tourId } : {})}
              className={cn(
                "flex items-center gap-[10px] rounded-md px-5 py-3 text-sm transition-all",
                isActive
                  ? "bg-[rgba(91,33,182,0.15)] text-purple-dark"
                  : item.danger
                  ? "bg-white/90 text-red-600 hover:bg-red-100 hover:text-red-700"
                  : "bg-white/90 text-purple-dark hover:bg-white"
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
    </aside>
  );
}