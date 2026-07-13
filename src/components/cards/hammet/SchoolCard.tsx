import { useState } from "react";
import { Building2 } from "lucide-react";
import { TIER_CONFIG } from "@/lib/schools/tier-config";
import { SchoolListItem } from "@/lib/api/types";

export function SchoolCard({
  school,
  onDeactivate,
  deactivating,
}: {
  school: SchoolListItem;
  onDeactivate: (id: string) => void;
  deactivating: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const tier = TIER_CONFIG[school.tier];
  const isSuspended = school.tier === "suspended";

  return (
    <div
      className={`
        rounded-2xl
        border
        border-[var(--color-border)]
        border-t-4
        ${tier.border}
        bg-[var(--color-bg-card)]
        p-6
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
        flex
        flex-col
        gap-5
        ${isSuspended ? "opacity-60" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div
              className={`
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                ${tier.iconBg}
              `}
            >
              <Building2
                size={18}
                className={tier.iconText}
              />
            </div>

            <div className="min-w-0">

              <p className="truncate text-lg font-semibold">
                {school.name}
              </p>

              <p className="text-xs text-[var(--color-text-muted)]">
                Term {school.term} • Since{" "}
                {new Date(school.createdAt).getFullYear()}
              </p>

            </div>

          </div>
        </div>

        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.bg} ${tier.text}`}
        >
          {tier.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Students", value: school.stats.totalStudents },
          { label: "Active", value: school.stats.activeStudents },
          { label: "Pending", value: school.stats.pendingStudents },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="
              rounded-xl
              border
              border-[var(--color-border)]
              bg-[var(--color-bg-page)]
              px-4
              py-3
              text-center
              "
          >
            <p className={`text-2xl font-bold ${tier.statValue}`}>{value}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
          </div>
        ))}
      </div>

      {!isSuspended && (
        <div className="border-t border-[var(--color-border)] pt-4">
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