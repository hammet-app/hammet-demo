/**
 * (auth) group layout — login, claim, check-email, reset-password
 * Owns the full-page animated Adire canvas background.
 * File location: src/app/(auth)/layout.tsx
 */
import { AdireBackground } from "@/components/ui/adire-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-bg-page flex flex-col">
      <AdireBackground />
      <div className="relative z-10 flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}