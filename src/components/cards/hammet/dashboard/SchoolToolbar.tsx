"use client";

import { Plus, Search, SlidersHorizontal } from "lucide-react";

type TierFilter =
  | "all"
  | "pilot"
  | "summer"
  | "spark"
  | "academy"
  | "premier"
  | "global"
  | "suspended";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;

  tierFilter: TierFilter;
  onTierChange: (value: TierFilter) => void;

  tierCounts: Record<TierFilter, number>;

  onCreateSchool: () => void;
}

const filters: TierFilter[] = [
  "all",
  "pilot",
  "summer",
  "spark",
  "academy",
  "premier",
  "global",
  "suspended",
];

export function SchoolToolbar({
  search,
  onSearchChange,
  tierFilter,
  onTierChange,
  tierCounts,
  onCreateSchool,
}: Props) {
  return (
    <div className="mb-8 space-y-6">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="space-y-3">

          <div>
            <h2 className="text-xl font-semibold">
              School Directory
            </h2>

            <p className="text-sm text-[var(--color-text-muted)]">
              Manage registered schools
            </p>
          </div>

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by school name..."
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] pl-10 pr-4 
                outline-none transition focus:border-[var(--color-purple)] focus:ring-2 focus:ring-[var(--color-purple)]
              "
            />
          </div>

        </div>

        <button
          onClick={onCreateSchool}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-purple)] px-5 py-2.5
            font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg
            active:translate-y-0
          "
          data-tour="school-toolbar"
        >
          <Plus size={18} />
          New School
        </button>

      </div>

      <div className="space-y-3">

        <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)]">

            <SlidersHorizontal size={16} />

            Filters

        </div>

        <div className="flex flex-wrap gap-2">

          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => onTierChange(filter)}
              className={`rounded-full border px-4 py-2 text-sm transition-all duration-200
                ${tierFilter === filter
                    ? "border-[var(--color-purple)] bg-[var(--color-purple)] text-white shadow-sm"
                    : "border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:border-[var(--color-purple)] hover:text-[var(--color-purple)]"
                }
              `}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}

              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs 
                  ${tierFilter === filter
                    ? "bg-white/20"
                    : "bg-[var(--color-bg-page)]"
                  }
                `}
              >
                {tierCounts[filter]}
              </span>
            </button>
          ))}
      </div>

      </div>

    </div>
  );
}