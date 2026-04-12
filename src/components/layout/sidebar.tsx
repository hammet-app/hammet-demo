"use client";

import { cn } from "@/lib/utils/utils";
import { navConfig } from "./sidebar-config";
import Link from "next/link";
import type { UserRole } from "@/lib/utils/roles";
import type { NavItem } from "./sidebar-config";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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

  return (
    <aside
      className={cn(
        "w-[240px] bg-purple-dark flex flex-col h-full overflow-y-auto shrink-0",
        className
      )}
    >
      {/* Role switcher */}
      {roles.length > 1 && (
        <div className="px-4 py-3">
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as UserRole)}
            className="w-full bg-white/10 text-white px-2 py-1 rounded"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      )}

      <nav className="flex-1 py-4">
        {entries.map((entry, i) => {
          if (entry.type === "section") {
            return (
              <p
                key={i}
                className="px-5 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30"
              >
                {entry.label}
              </p>
            );
          }

          if (entry.type === "divider") {
            return (
              <div
                key={i}
                className="mx-5 my-3 border-t border-white/[0.08]"
              />
            );
          }

          const item = entry as NavItem;
          const isActive =
            activePath === item.href ||
            activePath.startsWith(item.href + "/");
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
                  "w-full justify-start gap-2.5 px-5 py-[9px] text-[13.5px]",
                  "text-red-400 hover:text-red-300 hover:bg-red-500/[0.12]"
                )}
              >
                <Icon size={16} />
                <span className="leading-none">{item.label}</span>
              </Button>
            );
          }

          if (item.href) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-[9px] text-[13.5px]",
                  "border-l-[3px] border-transparent transition-colors duration-100",
                  isActive
                    ? "bg-white/10 text-white border-l-cyan font-medium"
                    : item.danger
                    ? "text-red-400/70 hover:text-red-300 hover:bg-red-500/[0.08]"
                    : "text-white/60 hover:text-white/90 hover:bg-white/[0.07]"
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1 leading-none">{item.label}</span>

                {item.badge != null && item.badge > 0 && (
                  <span className="ml-auto bg-cyan text-purple-dark text-[10px] font-bold px-1.5 py-[1px] rounded-full min-w-[18px] text-center leading-[16px]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          }
        })}
      </nav>
    </aside>
  );
}