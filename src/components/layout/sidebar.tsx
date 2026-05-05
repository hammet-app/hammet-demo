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
import { SidebarUI } from "@/components/layout/sidebarui";

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
            onChange={(e) => {
              const newRole = e.target.value as UserRole;

              setActiveRole(newRole);
              router.push(getDashboardRoute(newRole));
            }}
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

      <SidebarUI
        entries={entries}
        activePath={activePath}
        onNavigate={onNavigate}
        onLogout={() => {
          logout();
          router.push("/login");
        }}
      />
    </aside>
  );
}