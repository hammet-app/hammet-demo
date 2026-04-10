import { AuthGuard } from "@/components/layout/auth-guard";
import { DashboardLayoutInner } from "@/components/layout/dashboard-layout-inner";

/**
 * (dashboard) group layout.
 *
 * Every page under app/(dashboard)/ is automatically:
 * 1. Protected by AuthGuard (skeleton → redirect if no session)
 * 2. Wrapped in DashboardLayoutInner (Topbar + Sidebar + Sheet drawer)
 *
 * File location: src/app/(dashboard)/layout.tsx
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AuthGuard>
  );
}
