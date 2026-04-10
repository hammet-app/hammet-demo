import { DashboardRedirect } from "@/components/layout/auth-guard";

/**
 * /dashboard — immediately redirects to the role-appropriate page.
 * File location: src/app/(dashboard)/page.tsx
 */
export default function DashboardPage() {
  return <DashboardRedirect />;
}
