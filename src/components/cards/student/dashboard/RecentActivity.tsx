"use client";

import { motion } from "motion/react";
import { CheckCircle2, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "../../common";

export type StudentActivity = {
  id: string;
  title: string;
  timestamp: string;
}

type RecentActivityProps = {
  activities: StudentActivity[];
  viewAllHref?: string;
}

export function RecentActivity({
  activities,
  viewAllHref,
}: RecentActivityProps) {
  return (
    <section className="rounded-[20px] border border-border bg-bg-card p-6 shadow-sm shadow-slate-200/10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            A quick look at your latest learning activity
          </p>
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-purple"
          >
            View All

            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {activities.length === 0 ? (
        <EmptyState
          icon={<Activity size={28} />}
          title="No recent activity yet"
          description="Complete your first lesson to begin building your learning history"
        />
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 8}}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-4"
            >
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-success-light text-success">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-primary">
                  {activity.title}
                </p>

                <p className="mt-1 text-sm text-text-secondary">
                  {activity.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </section>
  );
}