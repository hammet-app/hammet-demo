"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Building2, Users, UserCheck, Ban } from "lucide-react";
import type { SchoolListItem } from "@/lib/api/types";
import { StatCard } from "@/components/cards/stat-card";
import { SchoolCard } from "@/components/cards/hammet/SchoolCard";
import { getTierCounts } from "@/lib/schools/getTierCounts";
import { getSchools, deactivateSchool } from "@/lib/api/hammet";
import { getDashboardStats } from "@/lib/schools/getDashboardStats";
import { PageShell, ListSkeleton } from "@/components/layout/PageShell";
import { SchoolToolbar } from "@/components/cards/hammet/SchoolToolbar";

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

  const [schools, setSchools] = useState<SchoolListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    getSchools(accessToken, refreshToken)
      .then((res) => setSchools(res.schools))
      .catch(() => setError("Failed to load schools."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

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

  const filtered = useMemo(() => {
      return schools
          .filter(
              school =>
                  tierFilter === "all" ||
                  school.tier === tierFilter
          )
          .filter(school =>
              school.name
                  .toLowerCase()
                  .includes(search.toLowerCase())
          );
  }, [schools, tierFilter, search]);

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
      description={`${schools.length} registered`}
    // actions={
    //   <button
    //     onClick={() => router.push("/hammet/schools/new")}
    //     className="px-4 py-2 rounded-xl bg-[var(--color-purple)] text-white text-sm font-semibold"
    //   >
    //     New school
    //   </button>
    // }
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

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Schools"
              value={dashboardStats.schools}
              icon={Building2}
              iconVariant="purple"
            />

            <StatCard
              label="Students"
              value={dashboardStats.students}
              icon={Users}
              iconVariant="cyan"
            />

            <StatCard
              label="Active Students"
              value={dashboardStats.active}
              icon={UserCheck}
              iconVariant="green"
            />

            <StatCard
              label="Suspended"
              value={dashboardStats.suspended}
              icon={Ban}
              iconVariant="red"
            />
          </div>

          {/* Toolbar */}
          {schools.length > 0 && (
            <SchoolToolbar
              search={search}
              onSearchChange={setSearch}
              tierFilter={tierFilter}
              onTierChange={setTierFilter}
              tierCounts={tierCounts}
              onCreateSchool={() => 
                router.push("/hammet/schools/new")
              }
            />
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-sm text-[var(--color-text-secondary)]">
                No schools found.
              </p>
            </div>
          ) : (
            <div
              className="
                grid
                gap-6
                [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))]
              "
            >
              {filtered.map((school) => (
                <SchoolCard
                  key={school.id}
                  school={school}
                  onDeactivate={handleDeactivate}
                  deactivating={deactivatingId === school.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}