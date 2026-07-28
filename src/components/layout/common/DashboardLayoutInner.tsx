"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { consent } from "@/lib/api/admin";
import { Topbar } from "@/components/layout/common/Topbar";
import { Sidebar } from "@/components/layout/common/sidebar";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/lib/utils/roles";
import { CookieConsentModal } from "@/components/layout/legal/CookieConsentModal";
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider'
import { HelpButton } from '@/components/onboarding/help-button'

const CURRENT_COOKIE_POLICY_VERSION = "2026-07-12"; // bump when policy changes materially

export function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, accessToken, refreshToken } = useAuth(); // NOTE: assumes `school` is exposed by auth-context — add it there if not yet present
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  if (!user || !user.roles) return null;

  const activeRole = user.roles[0] as UserRole;

  const isSchoolAdmin = activeRole === "school_admin";
  const hasConsented = !!user?.cookieConsent;

  // First-time gate: blocks the whole dashboard until the admin consents.
  const needsInitialConsent = isSchoolAdmin && !hasConsented;

  const showPolicyUpdateBanner =
    needsInitialConsent && // only nag consenting schools — non-consenting schools get the hard gate on registration instead
    user.cookiePolicyVersion !== CURRENT_COOKIE_POLICY_VERSION &&
    !bannerDismissed;

  return (
    <OnboardingProvider userId={user.id} role={activeRole}>
      <div className="flex flex-col h-screen overflow-hidden">
        <Topbar
          user={user}
          activeRole={activeRole}
          onMenuClick={() => setDrawerOpen(true)}
        />

        {showPolicyUpdateBanner && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-4">
            <p className="text-xs text-amber-800">
              We&apos;ve updated our Cookie Policy. Continued use of Hammet confirms your school&apos;s acceptance of the updated terms.{" "}
              <a href="/cookie-policy" className="underline underline-offset-2 font-medium">
                Review changes
              </a>
            </p>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-xs text-amber-700 hover:text-amber-900 font-medium shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar */}
          <div className="hidden md:block shrink-0">
            <Sidebar
              activeRole={activeRole}
              activePath={pathname}
            />
          </div>

          {/* Page content */}
          <main id="lesson-scroll" className="flex-1 overflow-y-auto bg-bg-page">
            {children}
          </main>
        </div>

        {/* Mobile drawer */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent
            side="left"
            className="p-0 w-[240px] bg-[var(--color-bg-sidebar)] border-r-0 [&>button]:hidden"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>

            <Sidebar
              activeRole={activeRole}
              activePath={pathname}
              onNavigate={() => setDrawerOpen(false)}
              className="h-full"
            />
          </SheetContent>
        </Sheet>
        {/* First-time consent gate — school_admin only, blocks interaction until accepted */}
        <CookieConsentModal
          open={needsInitialConsent}
          onAccept={async () => {
            const saved = await consent(accessToken!, refreshToken);
            if (saved) {
              await refreshToken();
            }
          }}
        />
      </div>
    </OnboardingProvider>
  );
}