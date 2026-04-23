"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getModule, getTeacherModules } from "@/lib/api/teacher";
import { LessonContentCard } from "@/components/cards/lesson-content-card";
import { PageShell } from "@/components/layout/page-shell";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import type {
  CurriculumModule,
  ModulesResponse,
} from "@/lib/api/api-types";


type LoadState = "loading" | "error" | "ready";

export default function LessonDetailPage() {
  const { accessToken, refreshToken, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const classLevel = searchParams.get("level");
  const moduleId = params.moduleId as string;

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [module, setModule] = useState<CurriculumModule | null>(null);
  const [allModules, setAllModules] = useState<ModulesResponse["modules"]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean | undefined>(undefined)
  const [activityText, setActivityText] = useState("")
  const [reflectionText, setReflectionText] = useState("")

  const isTeacher = user?.roles.includes("teacher")

  useEffect(() => {
    if (!accessToken || !classLevel || !moduleId) return;

    async function load() {

        try {
        if (!accessToken || !classLevel) return;

        const [mod, list] = await Promise.all([
            getModule(moduleId, accessToken, refreshToken),
            getTeacherModules(classLevel, accessToken, refreshToken),
        ]);

        setModule(mod);
        setAllModules(list.modules);
        setLoadState("ready");
        } catch (err) {
        
        setLoadState("error");
        }
    }

    load();
    }, [accessToken, moduleId, classLevel]);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation ──
  const sortedModules = [...allModules].sort(
    (a, b) => a.week_number - b.week_number
  );
  const currentIdx = sortedModules.findIndex((m) => m.id === moduleId);
  const prevMod = currentIdx > 0 ? sortedModules[currentIdx - 1] : null;

  function handlePrevious() {
    router.push(
      prevMod ? `/teacher/lessons/${prevMod.id}` : "/teacher/lessons"
    );
  }

  // ── Submit ──
  async function handleSubmit() {
    if (!accessToken || !module) return;
  }

  // ── Render states ──
  if (loadState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={28} className="animate-spin text-purple-mid" />
      </div>
    );
  }

  if (loadState === "error" || !module) {
    return (
      <PageShell
        title="Lesson"
        backHref="/teacher/lessons"
        backLabel="My Lessons"
      >
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          Failed to load this lesson. Please try again.
        </div>
      </PageShell>
    );
  }

  const toolBlock = module.content_json.blocks.find(
    (b) => b.type === "tool_link"
  );
  const status = null;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-4xl">
        
        {/* Lesson */}
        {(status === null) && (
          <LessonContentCard
            title={module.title}
            weekNumber={module.week_number}
            term={module.term}
            toolName={toolBlock?.tool_name}
            blocks={module.content_json.blocks}
            activityText={activityText}
            onActivityChange={setActivityText}
            reflectionText={reflectionText}
            onReflectionChange={setReflectionText}
            onPrevious={handlePrevious}
            onSubmit={isTeacher? () => {}: handleSubmit}
            isSubmitting={isTeacher? false : isSubmitting}
            submitLabel={
                isTeacher
                ? undefined
                : status === "flagged"
                ? "Resubmit revision"
                : undefined
            }
            isTeacher={isTeacher}
          />
        )}
      </div>
    </div>
  );
}