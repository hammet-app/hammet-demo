"use client"

import { Users2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SchoolInformationCard,  SchoolAdminsCard } from "@/components/cards/hammet/school";
import { StatCard } from "@/components/cards/stat-card";
import { ListSkeleton, PageShell } from "@/components/layout/common/PageShell";
import { Alert } from "@/components/ui";
import { getSchool } from "@/lib/api/hammet";
import { AdminDetails, SchoolDetails, } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { TIER_CONFIG } from "@/lib/schools/tier-config";


type TierConfig = (typeof TIER_CONFIG)[keyof typeof TIER_CONFIG]

export default function HammetSchoolPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [school, setSchool] = useState<SchoolDetails>();
  const [admins, setAdmins] = useState<AdminDetails[]>([])
  const [error, setError] = useState("")
  

  const tier = school ? TIER_CONFIG[school.tier] : undefined;
  const params = useParams();

  const schoolId = params.schoolId as string;

  useEffect (() => {
    if (!accessToken)  return;

    getSchool(schoolId, accessToken, refreshToken)
      .then((res) => {
        setSchool(res.school); 
        setAdmins(res.admins);
      })
      .catch(() => setError("Failed to load schools."))
      .finally(() => setIsLoading(false));
  }, [schoolId, accessToken, refreshToken]);

  if (isLoading) {
    return (
      <PageShell  
        title="Loading"
        backHref="/hammet"
      >
        <ListSkeleton rows={2} />
      </PageShell>
    )
  }

  return (
    <PageShell
      title={school?.name ?? ""}
      description={`${tier?.label} School`}
      backHref="/hammet"
      actions= {
        <div className="flex gap-2">
          {/**<Button
            variant="secondary"
            onClick={() =>
              router.push(`/hammet/schools/${school?.id}/edit`)
            }
          >
            Edit School
          </Button>
          */}
        </div>
      }
    >
      {error && (
        <Alert title="Loading Failed">
          {error}
        </Alert>
      )}
        <div className="grid gap-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Students"
              value={school?.stats.totalStudents ?? 0}
              icon={Users2}
              iconVariant="purple"
            />

            <StatCard
              label="Active"
              value={school?.stats.activeStudents ?? 0}
              icon={Users2}
              iconVariant="green"
            />

            <StatCard
              label="Pending"
              value={school?.stats.pendingStudents ?? 0}
              icon={Users2}
              iconVariant="amber"
            />
            
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr">
            <SchoolInformationCard
              school={school!}
              tierLabel={tier?.label ?? ""}
            />

            <SchoolAdminsCard
              admins={admins}
              onAddAdmin={() => 
                router.push(`/hammet/schools/${school?.id}/admin/new`)
              }
            />
          </div>
        </div>
    </PageShell>
  )
}