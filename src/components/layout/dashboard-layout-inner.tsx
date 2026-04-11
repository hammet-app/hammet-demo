"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/lib/auth/auth-context";
import { getPrimaryRole } from "@/lib/utils/roles";
import type { UserRole } from "@/lib/utils/roles";

/**
 * Inner dashboard layout — reads user from AuthContext so it needs
 * no props. Renders Topbar, desktop Sidebar, and mobile Sheet drawer.
 *
 * Kept separate from the (dashboard) group layout.tsx so it can be
 * a Client Component without forcing the group layout server → client.
 */
export function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
   

  // AuthGuard guarantees user is non-null by the time we render here
  if (!user || !user.roles) return null;

  const roles = user.roles as UserRole[];
  const [activeRole, setActiveRole] = useState<UserRole>(roles[0]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar 
        user={user} 
        activeRole={activeRole}
        onMenuClick={() => setDrawerOpen(true)} 
        />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:block shrink-0">
          <Sidebar 
          roles={roles} 
          activeRole={activeRole}
          activePath={pathname} />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-bg-page">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="left"
          className="p-0 w-[240px] bg-purple-dark border-r-0 [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <Sidebar
            roles={roles}
            activeRole={activeRole}
            activePath={pathname}
            onNavigate={() => setDrawerOpen(false)}
            className="h-full"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
