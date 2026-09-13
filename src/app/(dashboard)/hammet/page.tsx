"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Building2, Users, UserCheck, Ban, CircleHelp } from "lucide-react";
import type { SchoolListItem, Pagination } from "@/lib/api/types";
import { StatCard } from "@/components/cards/stat-card";
import { SchoolCard, SchoolToolbar } from "@/components/cards/hammet";
import { getTierCounts } from "@/lib/schools/getTierCounts";
import { getSchools, deactivateSchool } from "@/lib/api/hammet";
import { getDashboardStats } from "@/lib/schools/getDashboardStats";
import { PageShell, ListSkeleton } from "@/components/layout/common/PageShell";
import { Button } from "@/components/ui";
import { useOnboardingContext } from "@/components/onboarding/onboarding-provider";

type TierFilter =
  | "all"
  | "pilot"
  | "summer"
  | "spark"
  | "academy"
  | "premier"
  | "global"
  | "suspended";

export default function HammetDashboardPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const { startTour } = useOnboardingContext();

  const [schools, setSchools] = useState<SchoolListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    getSchools(
      accessToken,
      refreshToken,
      page,
      pageSize,
      tierFilter,
      search
    )
      .then((res) => {
        if (cancelled) return;

        setSchools(res.schools);
        setPagination(res.pagination);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;

        setError("Failed to load schools.");
      })
      .finally(() => {
        if (cancelled) return;

        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    refreshToken,
    page,
    tierFilter,
    search,
  ]);

  async function handleDeactivate(schoolId: string) {
    if (!accessToken) return;

    setDeactivatingId(schoolId);
    setActionError(null);

    try {
      await deactivateSchool(schoolId, accessToken, refreshToken);

      setSchools((prev) =>
        prev.map((s) =>
          s.id === schoolId ? { ...s, tier: "suspended" } : s
        )
      );
    } catch {
      setActionError("Failed to deactivate school.");
    } finally {
      setDeactivatingId(null);
    }
  }

  const tierCounts = useMemo(
    () => getTierCounts(schools),
    [schools]
  );

  const dashboardStats = useMemo(
    () => getDashboardStats(schools),
    [schools]
  );

  return (
    <PageShell
      title="Schools"
      description={`${pagination?.total ?? 0} registered`}
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startTour("hammet-dashboard")}
        >
          <CircleHelp className="h-4 w-4 mr-2" />
          Replay Tour
        </Button>
    //   <button
    //     onClick={() => router.push("/hammet/schools/new")}
    //     className="px-4 py-2 rounded-xl bg-[var(--color-purple)] text-white text-sm font-semibold"
    //   >
    //     New school
    //   </button>
      
      }

    >
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      ) : (
        <>
          {actionError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {actionError}
            </div>
          )}

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="platform-overview">
            <StatCard
              label="Schools"
              value={dashboardStats.schools}
              icon={Building2}
              iconVariant="purple"
              animate
            />

            <StatCard
              label="Students"
              value={dashboardStats.students}
              icon={Users}
              iconVariant="cyan"
              animate
            />

            <StatCard
              label="Active Students"
              value={dashboardStats.active}
              icon={UserCheck}
              iconVariant="green"
              animate
            />

            <StatCard
              label="Suspended"
              value={dashboardStats.suspended}
              icon={Ban}
              iconVariant="red"
              animate
            />
          </div>

          {/* Toolbar */}
          {schools.length > 0 && (
            <SchoolToolbar
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1)
                setIsLoading(true);
              }}
              tierFilter={tierFilter}
              onTierChange={(value) => {
                setTierFilter(value);
                setPage(1);
                setIsLoading(true);
              }}
              tierCounts={tierCounts}
              onCreateSchool={() => 
                router.push("/hammet/schools/new")
              }
              
            />
          )}

          {schools.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-sm text-[var(--color-text-secondary)]">
                No schools found.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))]" data-tour="school-directory">
                {schools.map((school, index) => (
                  <div key={school.id} data-tour={index===0 ? "school-card" : undefined}>
                    <SchoolCard
                      school={school}
                      onDeactivate={handleDeactivate}
                      deactivating={deactivatingId === school.id}
                    />
                  </div>
                ))}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => {
                      setIsLoading(true);
                      setPage((prev) => prev - 1)
                    }}
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => {
                      setIsLoading(true)
                      setPage((prev) => prev + 1)
                    }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

    </PageShell>
  );
}