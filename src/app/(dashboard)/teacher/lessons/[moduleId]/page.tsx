"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { studentApi } from "@/lib/api/student";
import { submitLesson } from "@/lib/sync";
import { LessonContentCard } from "@/components/cards/lesson-content-card";
import { PageShell } from "@/components/layout/page-shell";
import { StatusPill } from "@/components/ui/status-pill";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import type {
  CurriculumModule,
  ModulesResponse,
  Submission,
} from "@/lib/api/api-types";

async function saveOffline(
  studentId: string,
  moduleId: string,
  moduleTitle: string,
  activityText?: string,
  reflectionText?: string,
  fileUrl?: string
): Promise<void> {
  try {
    await submitLesson({
         studentId,
         moduleId,
         moduleTitle,
         activityText,
         reflectionText,
         fileUrl
       });
  } catch {
    // best-effort
  }
}

type LoadState = "loading" | "error" | "ready";

export default function LessonDetailPage() {
  const { accessToken, refreshToken, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [module, setModule] = useState<CurriculumModule | null>(null);
  const [allModules, setAllModules] = useState<ModulesResponse["modules"]>([]);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined)

  const [reflectionText, setReflectionText] = useState("");
  const [activityText, setActivityText] = useState("");
  const [savedOffline, setSavedOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isTeacher = user?.roles.includes("teacher")

  // ── Load module + all modules + existing submission in parallel ──
  useEffect(() => {
    if (!accessToken || !user?.class_level) return;

    async function load() {
      try {
        const [mod, list, history] = await Promise.all([
          studentApi.getModule(moduleId, accessToken!, refreshToken),
          studentApi.getModules(1, user!.class_level!, accessToken!, refreshToken),
          studentApi.getSubmissions(accessToken!, refreshToken),
        ]);

        setModule(mod);
        setAllModules(list.modules);

        const existing = history.submissions.find(
          (s) => s.module_id === moduleId
        ) ?? null;
        setExistingSubmission(existing);

        // Pre-fill reflection text if flagged so student can revise
        if (existing?.status === "flagged" && existing.reflection_text) {
          setReflectionText(existing.reflection_text);
        }

        setLoadState("ready");
      } catch {
        setLoadState("error");
      }
    }

    load();
  }, [accessToken, moduleId, user?.class_level]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save to Dexie ──
  useEffect(() => {
    if (!user) return;
    if (!module) return 

    if (!moduleId || (!reflectionText && !fileUrl) || !activityText || module.title) return;
    const t = setTimeout(async () => {
      await saveOffline(user.id, module.title, moduleId, activityText, reflectionText);
      setSavedOffline(true);
    }, 800);
    return () => clearTimeout(t);
  }, [reflectionText, moduleId]);

  // ── Navigation ──
  const sortedModules = [...allModules].sort(
    (a, b) => a.week_number - b.week_number
  );
  const currentIdx = sortedModules.findIndex((m) => m.id === moduleId);
  const nextMod =
    currentIdx !== -1 && currentIdx < sortedModules.length - 1
      ? sortedModules[currentIdx + 1]
      : null;
  const prevMod = currentIdx > 0 ? sortedModules[currentIdx - 1] : null;

  function handlePrevious() {
    router.push(
      prevMod ? `/student/lessons/${prevMod.id}` : "/student/lessons"
    );
  }

  // ── Submit ──
  async function handleSubmit() {
    if (!accessToken || !module) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await studentApi.submitModule(
        {
          module_id: moduleId,
          activity_text:activityText,
          reflection_text: reflectionText,
          file_url: null,
          local_id: crypto.randomUUID(),
        },
        accessToken,
        refreshToken
      );

      router.push(
        nextMod ? `/student/lessons/${nextMod.id}` : "/student/lessons"
      );
    } catch {
      setSubmitError(
        "Failed to submit. Your work is saved offline and will sync when you reconnect."
      );
    } finally {
      setIsSubmitting(false);
    }
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
        backHref="/student/lessons"
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
  const status = existingSubmission?.status ?? null;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-4xl">
        
        {/* Non-fatal submit error */}
        {submitError && (
          <div className="mb-4 text-[13px] text-warning-dark bg-warning-light border border-warning/20 rounded-[10px] px-4 py-3">
            {submitError}
          </div>
        )}

        {/* Flagged */}
        {status === "flagged" && existingSubmission?.teacher_note && (
          <div className="mb-4 border-l-[3px] border-warning bg-warning-light rounded-r-[10px] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-warning mb-1.5">
              Teacher feedback — revision required
            </p>
            <p className="text-[13px] text-warning-dark leading-relaxed">
              {existingSubmission.teacher_note}
            </p>
          </div>
        )}

        {/* Lesson */}
        {(status === null || status === "flagged") && (
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
            savedOffline={savedOffline}
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