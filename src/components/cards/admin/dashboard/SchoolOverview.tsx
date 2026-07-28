"use client";

import { motion } from "motion/react";
import type { SchoolProfile } from "@/lib/api/types";
import { TIER_CONFIG } from "@/lib/schools/tier-config";
import { CalendarDays } from "lucide-react";

type SchoolOverviewProps = {
  profile: SchoolProfile;
  onManageTerm?: () => void;
};

export function SchoolOverview({
  profile,
  onManageTerm,
}: SchoolOverviewProps) {

  const tier = TIER_CONFIG[profile.tier];

  const start = new Date(profile.termStart);
  const end = new Date(profile.termEnd);
  const today = new Date();

  const total =
    end.getTime() - start.getTime();

  const elapsed =
    today.getTime() - start.getTime();

  const progress = Math.max(
    0,
    Math.min(
      100,
      Math.round((elapsed / total) * 100)
    )
  );

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (end.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
    )
  );

  return (
    <motion.section 
        className="rounded-3xl border border-border bg-bg-card p-7"
        initial={{ opacity: 0, y: 12, }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, }}
        transition={{ duration: 0.43, ease: "easeOut", }}
    >

      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-semibold text-text-primary"
            style={{ fontFamily: "var(--font-head)", }}
          >
            School Overview
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            Academic information for the current session.
          </p>

        </div>

        <button
          onClick={onManageTerm}
          className="flex items-center gap-2 rounded-xl bg-purple-light
            px-4 py-2 text-sm font-medium text-purple-mid transition hover:opacity-90
          "
        >
          <CalendarDays size={16} />
          Manage Term
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase text-text-muted">
            Session
          </p>

          <p className="mt-2 text-lg font-semibold">
            {profile.session}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-text-muted">
            Tier
          </p>

          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1
              text-xs font-semibold ${tier.bg} ${tier.text}`}
          >
            {tier.label}
          </span>
        </div>
        <div>

          <p className="text-xs uppercase text-text-muted">
            Current Term
          </p>

          <p className="mt-2 text-lg font-semibold">
            Term {profile.term}
          </p>

        </div>
        <div>
          <p className="text-xs uppercase text-text-muted">
            Arms
          </p>

          <p className="mt-2 text-lg font-semibold">
            {profile.availableArms && profile.availableArms.length
              ? profile.availableArms.join(", ")
              : "—"}
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-bg-page p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Academic Timeline
            </p>

            <p className="mt-1 text-xs text-text-muted">
              {start.toLocaleDateString()} — {end.toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-text-primary">
              {progress}%
            </p>

            <p className="text-xs text-text-muted">
              Complete
            </p>
          </div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-purple-mid"
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true, }}
            transition={{ duration: 0.8, ease: "easeOut", }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-text-secondary">
            {daysRemaining} days remaining
          </span>

          <span className="text-text-secondary">
            Ends {end.toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.section>
  );
}