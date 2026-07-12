import { AuthGuard } from "@/components/layout/auth-guard";
import { DashboardLayoutInner } from "@/components/layout/DashboardLayoutInner";

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
