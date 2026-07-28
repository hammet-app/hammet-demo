"use client";

import { Building2 } from "lucide-react";
import { motion } from "motion/react";
import { StatCard } from "@/components/cards/stat-card";
import { Users, UserCheck, Hourglass } from "lucide-react";
import { TIER_CONFIG } from "@/lib/schools/tier-config";
import type { SchoolProfile } from "@/lib/api/types";

export function SchoolHero({
  profile,
}: {
  profile: SchoolProfile;
}) {
  const tier = TIER_CONFIG[profile.tier];

  return (
    <motion.section 
      className="overflow-hidden rounded-3xl border border-border bg-bg-card"
      initial={{ opacity: 0, y: 12, }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", }}
    >

      {/* Hero */}
      <div className="px-8 py-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-1 flex-col">

            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tier.iconBg} `}
            >
              <Building2
                className={tier.iconText}
                size={28}
              />
            </div>

            <div>

              <div className="flex items-center gap-3">

                <h1
                  className="text-3xl font-bold text-text-primary"
                  style={{ fontFamily: "var(--font-head)" }}
                >
                  {profile.name}
                </h1>

              </div>

              <p className="mt-2 text-sm text-text-secondary">
                Session {profile.session}
                {" • "}
                Term {profile.term}
                {profile.availableArms && profile.availableArms.length > 0 &&
                  ` • Arms: ${profile.availableArms?.join(", ")}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 border-t border-border p-6 md:grid-cols-3">
        <StatCard
          label="Total Students"
          value={profile.stats.totalStudents}
          icon={Users}
          iconVariant="cyan"
          animate
        />

        <StatCard
          label="Active Students"
          value={profile.stats.activeStudents}
          icon={UserCheck}
          iconVariant="green"
          animate
        />

        <StatCard
          label="Pending Students"
          value={profile.stats.pendingStudents}
          icon={Hourglass}
          iconVariant="amber"
          animate
        />
      </div>
    </motion.section>
  );
}