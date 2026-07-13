import type { SchoolListItem } from "@/lib/api/types";

export function getDashboardStats(
    schools: SchoolListItem[]
) {
    return schools.reduce(
        (stats, school) => {
            stats.schools++;

            stats.students +=
                school.stats.totalStudents;

            stats.active +=
                school.stats.activeStudents;

            if (school.tier === "suspended") {
                stats.suspended++;
            }

            return stats;
        },
        {
            schools: 0,
            students: 0,
            active: 0,
            suspended: 0,
        }
    );
}