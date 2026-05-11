"use client";

import { cn } from "@/lib/utils/utils"
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getModule, getTeacherModules } from "@/lib/api/teacher";
import { LessonStepper, buildPages, isPageBlocked } from "@/components/cards/lesson-stepper"; 
import { PageShell } from "@/components/layout/page-shell";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import type {
  CurriculumModule,
  ModulesResponse,
} from "@/lib/api/api-types";

// ─────────────────────────────────────────────────────────────────────────────
// Font constants (match lesson-stepper.tsx)
// ─────────────────────────────────────────────────────────────────────────────

const FONT_BODY = "var(--font-body)";


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

  // Stepper page state lives here so the fixed footer can access it
  const [currentPage, setCurrentPage] = useState(0);


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

  const pages = module ? buildPages(module.content_json.sections, module.title) : [];
  const total = pages.length;
  const isLastPage = currentPage === total - 1;
  const blocked = module ? isPageBlocked(pages[currentPage], activityText, reflectionText, isTeacher) : false;

  const goNext = useCallback(() => {
      if (blocked) return;
      if (isLastPage) { handleSubmit(); return; }
      setCurrentPage((p) => Math.min(total - 1, p + 1));
    }, [blocked, isLastPage, total]); // eslint-disable-line react-hooks/exhaustive-deps
  
    const goBack = useCallback(() => {
      if (currentPage === 0) {
        if (prevMod) router.push(`/teacher/lessons/${prevMod.id}`);
        return;
      }
      setCurrentPage((p) => Math.max(0, p - 1));
    }, [currentPage, prevMod, router]);


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

  // Tool names — derived from tool_link blocks across all sections
  const toolNames = module.content_json.sections
    .flatMap((s) => s.blocks)
    .filter((b) => b.type === "tool_link")
    .map((b) => b.tool_name || b.content)
    .filter(Boolean) as string[];

  const showStepper = isTeacher

  return (
    <>
      {/*
        Content area — pb-[72px] ensures content is never hidden behind the
        fixed footer bar. The main element in DashboardLayoutInner is already
        overflow-y-auto so this scrolls correctly.
      */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-5 pb-[72px]">
        <div className="w-full max-w-[680px] mx-auto flex flex-col gap-4">
          
          {/* Lesson */}
          {showStepper && (
            <LessonStepper
              title={module.title}
              description={module.description}
              weekNumber={module.week_number}
              term={module.term}
              toolNames={toolNames}
              sections={module.content_json.sections}
              activityText={activityText}
              onActivityChange={setActivityText}
              reflectionText={reflectionText}
              onReflectionChange={setReflectionText}
              onPrevLesson={
                prevMod
                  ? () => router.push(`/teacher/lessons/${prevMod.id}`)
                  : undefined
              }
              currentPage={currentPage}
              onSwipeNext={goNext}
              onSwipeBack={goBack}
              isTeacher={true}
            />
          )}
        </div>
      </div>

      {/*
        Fixed footer — always visible at the bottom of the viewport, above
        the sidebar on desktop (ml-[240px] matches sidebar width).
        Never depends on content height, works identically on every page.
      */}
      {showStepper && (
        <div className="fixed bottom-0 left-0 right-0 md:left-[240px] z-10 bg-bg-page border-t border-border">
          <div className="w-full max-w-[680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">

            {/* Nav buttons */}
            <div className="flex items-center gap-2">
              {(currentPage > 0 || prevMod) && (
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-1 text-[13px] font-bold text-text-secondary border border-border px-3 py-1.5 rounded-[8px] hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: FONT_BODY }}
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}

              {isLastPage ? (
                <button
                  onClick={()=>{
                    router.push("/teacher/lessons")
                  }}
                  disabled={isSubmitting}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-1.5 rounded-[8px] transition-colors"
                  )}
                  style={{ fontFamily: FONT_BODY }}
                >
                  
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={blocked}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-1.5 rounded-[8px] transition-colors"
                  )}
                  style={{ fontFamily: FONT_BODY }}
                >
                  Next <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}