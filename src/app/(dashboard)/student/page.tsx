"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, ListSkeleton } from "@/components/layout/common/PageShell";
import { FadeIn } from "@/components/animations/FadeIn";
import { useAuth } from "@/lib/auth/auth-context";
import { studentApi } from "@/lib/api/student";
import { ApiError } from "@/lib/api/api-client";
import type { ModuleSummary, StudentProgress } from "@/lib/api/types";
import { 
  Award ,
  BarChart2,
  BookOpen,
  CircleHelp,
  TrendingUp
} from "lucide-react";
import { 
  StudentHero, 
  ContinueLearningCard, 
  NavigationTiles, 
  ProgressOverviewCard, 
  RecentActivity, 
  type StudentActivity 
} from "@/components/cards/student/dashboard";
import { Alert, Button } from "@/components/ui";
import { Section } from "@/components/cards/common";
import { useOnboardingContext } from "@/components/onboarding/onboarding-provider";

export default function StudentHomePage() {
  const { user, accessToken, refreshToken, isResolved } = useAuth();
  const router = useRouter();
  const { startTour } = useOnboardingContext();

  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [activities] = useState<StudentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const firstName = user?.fullName.split(" ")[0]
  const profileIncomplete = !!user && (!user.classLevel || !user.term);

  const actions = [
    {
      title: "My Lessons",
      description: "Continue your learning modules.",
      icon: BookOpen,
      href: "/student/lessons",
    },
    {
      title: "Progress",
      description: "Track your learning journey.",
      icon: BarChart2,
      href: "/student/progress",
    },
    {
      title: "Portfolio",
      description: "View your completed work.",
      icon: Award,
      href: "/student/portfolio",
    },
    {
      title: "Performance",
      description: "See your academic performance.",
      icon: TrendingUp,
      href: "/student/performance",
    },
  ]

  useEffect(() => {
    if (!isResolved) return;

    if (!accessToken || !user || profileIncomplete) {
      return;
    }

    async function load() {
      setError("");

      try {
        if (!accessToken || !user || profileIncomplete || !user.term  || !user.classLevel) {
            return;
        }
        const [modulesData, progressData] = await Promise.all([
          studentApi.getModules(
            user.term,
            user.classLevel,
            accessToken,
            refreshToken,
            (freshModules) => {
              setModules(freshModules);
            }
          ),
          studentApi.getProgress(
            accessToken!,
            refreshToken
          ).catch(() => null),
        ]);

        setModules(modulesData.modules);

        if (progressData) {
          setProgress(progressData);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 401) {
            setError("Authentication required. Please log in again.");
          } else if (err.status === 403) {
            setError("You are not allowed to access these lessons.");
          } else if (err.status === 404) {
            setError("Lessons not found.");
          } else if (err.status === 409) {
            setError("Conflict while loading lessons.");
          } else if (err.status === 400 || err.status === 422) {
            setError(`Invalid request. ${err.message}`);
          } else if (err.status === 500) {
            setError("Server error. Please try again.");
          } else {
            setError(err.message);
          }
        } else if (err instanceof Error) {
          setError(`Unable to connect. ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [accessToken, refreshToken, user, profileIncomplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentModule = useMemo(() => {
    return modules[0] ?? null;
  }, [modules])

  return (
    <PageShell
      title="Home"
      description="Continue your AI learning journey."
    >
      {isLoading ? (
        <>
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-bg-card border border-border rounded-[10px] h-24 animate-pulse" />
            ))}
          </div>
          <ListSkeleton rows={6} />
        </>
      ) : profileIncomplete ? (
        <Alert variant="error" title="Incomplete Profile">
          Reach out to your admin for corrections
        </Alert>
      ) : error ? (
        <Alert variant="error" title="Loading Failed">
          {error}
        </Alert>
      ) : (
        <div className="space-y-10">
          <FadeIn>
            < div data-tour="student-hero">
              <StudentHero 
                firstName={firstName ?? ""}
                classLevel={user?.classLevel ?? ""}
                classArm={user?.classArm ?? ""}
                term={(user?.term)?.toString() ?? ""}            
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={startTour}
              >
                <CircleHelp className="h-4 w-4 mr-2" />
                Replay Tour
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Section
              title="Continue Learning"
              description="Pick up right where you left off"
            >
              <div data-tour="continue-learning">
                <ContinueLearningCard 
                  module={currentModule}
                  onContinue={() => {
                    if (currentModule){
                      router.push(
                        `/student/lessons/${currentModule.id}`
                      )}
                  }}
                />
              </div>
            </Section>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5" data-tour="progress-overview">
                {progress?.termProgress && (
                  <ProgressOverviewCard
                    approvedModules={progress.termProgress.approvedModules}
                    totalModules={progress.termProgress.totalModules}
                    onViewProgress={() => router.push("/student/progress")}
                  />
                )}
              </div>
              <div className="lg:col-span-7" data-tour="student-navigation">
                <NavigationTiles actions={actions} />
              </div>
            </div>
          </FadeIn>
          
          {/*
          <FadeIn delay={0.4}>
            <RecentActivity activities={activities} />
          </FadeIn>

            <FadeIn delay={0.5}>
                <StudentXPCard />
            </FadeIn>

            <FadeIn delay={0.6}>
                <StudentBadgeCard />
            </FadeIn>

            <FadeIn delay={0.7}>
                <StudentStreakCard />
            </FadeIn>

            <FadeIn delay={0.8}>
                <StudentLeaderboardCard />
            </FadeIn>
            */}
        </div>
      )}
    
    </PageShell>
  );
}