import { AuthGuard } from "@/components/layout/common/auth-guard";
import { DashboardLayoutInner } from "@/components/layout/common/DashboardLayoutInner";

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
