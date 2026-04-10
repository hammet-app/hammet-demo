/**
 * (auth) group layout — public pages (login, claim, resend).
 * No sidebar, no topbar. Standalone branding shell.
 * File location: src/app/(auth)/layout.tsx
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-page flex flex-col">
      {children}
    </div>
  );
}
