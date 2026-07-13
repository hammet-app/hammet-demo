import type { SchoolListItem } from "@/lib/api/types";

export function getTierCounts(schools: SchoolListItem[]) {
    return schools.reduce(
        (counts, school) => {
            counts.all++;

            counts[school.tier]++;

            return counts;
        },
        {
            all: 0,
            pilot: 0,
            summer: 0,
            spark: 0,
            academy: 0,
            premier: 0,
            global: 0,
            suspended: 0,
        }
    );
}