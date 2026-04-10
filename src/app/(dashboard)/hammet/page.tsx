"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getSchools, deactivateSchool } from "@/lib/api/hammet";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import type { SchoolListItem } from "@/lib/api/api-types";

function tierLabel(tier: SchoolListItem["tier"]) {
  switch (tier) {
    case "pilot":
      return { label: "Pilot", bg: "bg-cyan-50", text: "text-cyan-700" };
    case "annual":
      return {
        label: "Annual",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
      };
    case "suspended":
      return { label: "Suspended", bg: "bg-red-50", text: "text-red-600" };
  }
}

function SchoolCard({
  school,
  onDeactivate,
  deactivating,
}: {
  school: SchoolListItem;
  onDeactivate: (id: string) => void;
  deactivating: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const tier = tierLabel(school.tier);
  const isSuspended = school.tier === "suspended";

  return (
    <div
      className={`bg-[var(--color-bg-card)] border rounded-2xl p-6 flex flex-col gap-4 ${
        isSuspended ? "opacity-60" : ""
      } border-[var(--color-border)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-lg truncate">
            {school.name}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Term {school.term} · Since{" "}
            {new Date(school.created_at).getFullYear()}
          </p>
        </div>

        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.bg} ${tier.text}`}
        >
          {tier.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Students", value: school.stats.total_students },
          { label: "Active", value: school.stats.active_students },
          { label: "Pending", value: school.stats.pending_students },
          { label: "Teachers", value: school.stats.total_teachers },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-[var(--color-bg-page)] rounded-xl px-4 py-3"
          >
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
          </div>
        ))}
      </div>

      {!isSuspended && (
        <div className="pt-2 border-t border-[var(--color-border)]">
          {confirming ? (
            <div className="flex items-center gap-3">
              <p className="text-xs flex-1">
                Deactivate this school?
              </p>

              <button
                onClick={() => {
                  onDeactivate(school.id);
                  setConfirming(false);
                }}
                disabled={deactivating}
                className="text-xs font-semibold text-red-600"
              >
                {deactivating ? "Deactivating…" : "Confirm"}
              </button>

              <button
                onClick={() => setConfirming(false)}
                className="text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-xs text-[var(--color-text-muted)] hover:text-red-600"
            >
              Deactivate school
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function HammetDashboardPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [schools, setSchools] = useState<SchoolListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [tierFilter, setTierFilter] = useState<
    "all" | "pilot" | "annual" | "suspended"
  >("all");

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

  const filtered =
    tierFilter === "all"
      ? schools
      : schools.filter((s) => s.tier === tierFilter);

  const tierCounts = {
    all: schools.length,
    pilot: schools.filter((s) => s.tier === "pilot").length,
    annual: schools.filter((s) => s.tier === "annual").length,
    suspended: schools.filter((s) => s.tier === "suspended").length,
  };

  return (
    <PageShell
      title="Schools"
      description={`${schools.length} registered`}
      actions={
        <button
          onClick={() => router.push("/hammet/schools/new")}
          className="px-4 py-2 rounded-xl bg-[var(--color-purple)] text-white text-sm font-semibold"
        >
          New school
        </button>
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

          {/* Filters */}
          {schools.length > 0 && (
            <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit bg-[var(--color-purple-light)]">
              {["all", "pilot", "annual", "suspended"].map((key) => (
                <button
                  key={key}
                  onClick={() => setTierFilter(key as any)}
                  className={`px-4 py-1.5 rounded-lg text-sm ${
                    tierFilter === key
                      ? "bg-white text-[var(--color-purple)]"
                      : ""
                  }`}
                >
                  {key}
                  <span className="ml-1.5 text-xs">
                    {tierCounts[key as keyof typeof tierCounts]}
                  </span>
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-sm text-[var(--color-text-secondary)]">
                No schools found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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