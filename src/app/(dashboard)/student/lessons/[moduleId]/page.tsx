"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { studentApi } from "@/lib/api/student";
import { cn } from "@/lib/utils/utils";
import {
  LessonStepper,
  buildPages,
  isPageBlocked,
  EMPTY_AI_FORM,
  type TaskFilesState,
  type TaskFileEntry,
  type AiFormState,
} from "@/components/cards/lesson-stepper";
import {
  compressAndEnqueue,
  uploadFilesForModule,
  removeQueuedFile,
} from "@/lib/file-pipeline";
import { clearUploadedFilesForModule, submitLesson, saveSubmissionLocally } from "@/lib/db";
import { PageShell } from "@/components/layout/page-shell";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Loader2,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import type {
  CurriculumModule,
  ModulesResponse,
  Submission,
} from "@/lib/api/api-types";

// ─────────────────────────────────────────────────────────────────────────────
// Font constants (match lesson-stepper.tsx)
// ─────────────────────────────────────────────────────────────────────────────

const FONT_BODY = "var(--font-body)";

// ─────────────────────────────────────────────────────────────────────────────
// Offline save helper
// ─────────────────────────────────────────────────────────────────────────────

async function saveOffline(
  studentId: string,
  moduleId: string,
  moduleTitle: string,
  file_urls: string[],
  activityText?: string,
  reflectionText?: string
): Promise<void> {
  try {
    await submitLesson({
      studentId,
      moduleId,
      moduleTitle,
      file_urls,
      activityText,
      reflectionText,
    });
  } catch {
    // best-effort — never throw
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

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

  const [reflectionText, setReflectionText] = useState("");
  const [activityText, setActivityText] = useState("");
  const [savedOffline, setSavedOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Task file state — keyed by block ID
  // Each entry tracks the file's compress/upload lifecycle shown in the UI
  const [taskFiles, setTaskFiles] = useState<TaskFilesState>({});

  // AI form state
  const [aiForm, setAiForm] = useState<AiFormState>(EMPTY_AI_FORM);

  // Stepper page state lives here so the fixed footer can access it
  const [currentPage, setCurrentPage] = useState(0);

  // ── Load module + list + submission history in parallel ──────────────────
  useEffect(() => {
    if (!accessToken || !user?.class_level || !user?.term) return;

    async function load() {
      try {
        const [mod, list, history] = await Promise.all([
          studentApi.getModule(moduleId, accessToken!, refreshToken),
          // getModules calls cacheModules internally — Dexie is populated here
          studentApi.getModules(user!.term!, user!.class_level!, accessToken!, refreshToken),
          studentApi.getSubmissions(accessToken!, refreshToken).catch(() => ({submissions: []})),
        ]);

        setModule(mod);
        setAllModules(list.modules);

        const existing =
          history.submissions.find((s) => s.module_id === moduleId) ?? null;
        setExistingSubmission(existing);

        // Pre-fill if flagged so student can revise
        if (existing?.status === "flagged") {
          if (existing.reflection_text) setReflectionText(existing.reflection_text);
          if (existing.activity_text)   setActivityText(existing.activity_text);
        }

        setLoadState("ready");
      } catch {
        setLoadState("error");
      }
    }

    load();
  }, [accessToken, moduleId, user?.class_level]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save text to Dexie on change ────────────────────────────────────
  useEffect(() => {
    if (!user || !module) return;
    if (!activityText && !reflectionText) return;

    const t = setTimeout(async () => {
      await saveOffline(
        user.id,
        moduleId,
        module.title,
        [],
        activityText || undefined,
        reflectionText || undefined
      );
      setSavedOffline(true);
    }, 800);

    return () => clearTimeout(t);
  }, [activityText, reflectionText, moduleId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Task file handlers ────────────────────────────────────────────────────

  const handleTaskFilesSelected = useCallback(
    async (blockId: string, files: FileList) => {
      if (!user) return;

      const incoming = Array.from(files);

      // Add placeholder entries immediately so the UI responds
      setTaskFiles((prev) => {
        const existing = prev[blockId] ?? [];
        const placeholders: TaskFileEntry[] = incoming.map((file) => ({
          url: null,
          file,
          status: "uploading",
        }));
        return { ...prev, [blockId]: [...existing, ...placeholders] };
      });

      // Compress → Dexie → Supabase Storage for each file
      for (let i = 0; i < incoming.length; i++) {
        const file = incoming[i];
        // Offset by however many entries existed before we added placeholders
        const entryIdx = (taskFiles[blockId]?.length ?? 0) + i;

        // Step 1: compress + enqueue to Dexie
        const enqueueResult = await compressAndEnqueue(
          file,
          user.id,
          moduleId,
          blockId
        );

        if (!enqueueResult.ok) {
          // Compression rejected the file (e.g. video too large)
          const msg =
            enqueueResult.error.kind === "video_too_large"
              ? `Video too large (${enqueueResult.error.sizeMb} MB). Max is ${enqueueResult.error.maxMb} MB.`
              : "File could not be processed.";

          setTaskFiles((prev) => {
            const entries = [...(prev[blockId] ?? [])];
            entries[entryIdx] = { url: null, file, status: "error", errorMsg: msg };
            return { ...prev, [blockId]: entries };
          });
          continue;
        }

        const { dexieId } = enqueueResult;

        // Step 2: attempt immediate upload to Supabase Storage
        // uploadFilesForModule picks up the Dexie entry we just wrote
        const uploaded = await uploadFilesForModule(moduleId);
        const match = uploaded.find((u) => u.dexieId === dexieId);

        if (match) {
          // Upload succeeded — store the path as the URL
          setTaskFiles((prev) => {
            const entries = [...(prev[blockId] ?? [])];
            entries[entryIdx] = {
              url: match.path,
              file,
              dexieId,
              status: "done",
            };
            return { ...prev, [blockId]: entries };
          });
        } else {
          // Upload failed — blob is safely in Dexie, will retry on reconnect
          setTaskFiles((prev) => {
            const entries = [...(prev[blockId] ?? [])];
            entries[entryIdx] = {
              url: null,
              file,
              dexieId,
              status: "queued",
            };
            return { ...prev, [blockId]: entries };
          });
        }
      }
    },
    [user, moduleId, taskFiles]
  );

  const handleTaskFileRemove = useCallback(async (blockId: string, index: number) => {
    setTaskFiles((prev) => {
      const entries = [...(prev[blockId] ?? [])];
      const removed = entries[index];

      // Remove from Dexie queue if it hasn't uploaded yet
      if (removed?.dexieId) {
        removeQueuedFile(removed.dexieId).catch(() => {});
      }

      entries.splice(index, 1);
      return { ...prev, [blockId]: entries };
    });
  }, []);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const sortedModules = [...allModules].sort(
    (a, b) => a.week_number - b.week_number
  );
  const currentIdx = sortedModules.findIndex((m) => m.id === moduleId);
  const nextMod =
    currentIdx !== -1 && currentIdx < sortedModules.length - 1
      ? sortedModules[currentIdx + 1]
      : null;
  const prevMod = currentIdx > 0 ? sortedModules[currentIdx - 1] : null;

  // ── Stepper page navigation ───────────────────────────────────────────────
  const pages = module
    ? buildPages(module.contentJson.sections, module.title)
    : [];
  const total = pages.length;
  const isLastPage = currentPage === total - 1;
  const blocked = module
    ? isPageBlocked(
        pages[currentPage],
        activityText,
        reflectionText,
        taskFiles,
        aiForm,
        false
      )
    : false;

  const goNext = useCallback(() => {
    if (blocked) return;
    if (isLastPage) { handleSubmit(); return; }
    setCurrentPage((p) => Math.min(total - 1, p + 1));
  }, [blocked, isLastPage, total]); // eslint-disable-line react-hooks/exhaustive-deps

  const goBack = useCallback(() => {
    if (currentPage === 0) {
      if (prevMod) router.push(`/student/lessons/${prevMod.id}`);
      return;
    }
    setCurrentPage((p) => Math.max(0, p - 1));
  }, [currentPage, prevMod, router]);

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
  if (!module || !user) return;
  setIsSubmitting(true);
  setSubmitError("");

  // Retry any queued file uploads first
  const freshUploads = await uploadFilesForModule(moduleId);

  const allPaths = Object.values(taskFiles)
    .flat()
    .filter((e) => e.status === "done" && e.url)
    .map((e) => e.url!);

  for (const u of freshUploads) {
    if (!allPaths.includes(u.path)) allPaths.push(u.path);
  }

  const payload = {
    module_id: moduleId,
    activity_text: activityText,
    reflection_text: reflectionText || null,
    file_urls: allPaths.length > 0 ? allPaths : null,
    local_id: crypto.randomUUID(),
  };

  // Try backend first
  if (accessToken) {
    try {
      await studentApi.submitModule(payload, accessToken, refreshToken);
      await clearUploadedFilesForModule(moduleId);

      setExistingSubmission({
        id: crypto.randomUUID(),
        module_title: module.title,
        term: module.term,
        week_number: module.week_number,
        module_id: moduleId,
        activity_text: activityText,
        reflection_text: reflectionText || null,
        file_urls: allPaths.length > 0 ? allPaths : null,
        synced_at: null,
        local_id: payload.local_id,
        submitted_at: new Date().toISOString(),
        status: "submitted",
        teacher_note: null,
      });

      setIsSubmitting(false);
      return;
    } catch {
      // Fall through to Dexie
    }
  }

  // Backend failed or no token — save to Dexie for later sync
  try {
    await saveSubmissionLocally({
      localId: payload.local_id,
      studentId: user.id,
      moduleId,
      activityText: activityText || undefined,
      reflectionText: reflectionText || undefined,
      file_urls: allPaths,
      submittedAt: new Date().toISOString(),
    });
    setSavedOffline(true);
    setSubmitError(
      "No connection. Your work is saved and will submit automatically when you reconnect."
    );
  } catch {
    setSubmitError("Failed to save your work. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
}

  // ── Render states ─────────────────────────────────────────────────────────
  if (loadState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={28} className="animate-spin text-purple-mid" />
      </div>
    );
  }

  if (loadState === "error" || !module) {
    return (
      <PageShell title="Lesson" backHref="/student/lessons" backLabel="My Lessons">
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          Failed to load this lesson. Please try again.
        </div>
      </PageShell>
    );
  }

  const status = existingSubmission?.status ?? null;

  const toolNames = module.contentJson.sections
    .flatMap((s) => s.blocks)
    .filter((b) => b.type === "tool_link")
    .map((b) => b.tool_name || b.content)
    .filter(Boolean) as string[];

  const showStepper = status === null || status === "flagged";
  const submitLabel = status === "flagged" ? "Resubmit revision" : undefined;

  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-5 pb-[72px]" id="lesson-scroll">
        <div className="w-full max-w-[680px] mx-auto flex flex-col gap-4">

          {submitError && (
            <div className="text-[13px] text-warning-dark bg-warning-light border border-warning/20 rounded-[10px] px-4 py-3">
              {submitError}
            </div>
          )}

          {(status === "submitted" || status === "approved") && (
            <SubmittedNotice
              status={status}
              submittedAt={existingSubmission!.submitted_at}
              onNext={
                nextMod
                  ? () => router.push(`/student/lessons/${nextMod.id}`)
                  : undefined
              }
              onBack={() => router.push("/student/lessons")}
            />
          )}

          {status === "flagged" && existingSubmission?.teacher_note && (
            <div className="border-l-[3px] border-warning bg-warning-light rounded-r-[10px] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-warning mb-1.5">
                Teacher feedback — revision required
              </p>
              <p className="text-[13px] text-warning-dark leading-[1.6]">
                {existingSubmission.teacher_note}
              </p>
            </div>
          )}

          {showStepper && (
            <LessonStepper
              title={module.title}
              description={module.description}
              weekNumber={module.week_number}
              term={module.term}
              toolNames={toolNames}
              sections={module.contentJson.sections}
              activityText={activityText}
              onActivityChange={setActivityText}
              reflectionText={reflectionText}
              onReflectionChange={setReflectionText}
              taskFiles={taskFiles}
              onTaskFilesSelected={handleTaskFilesSelected}
              onTaskFileRemove={handleTaskFileRemove}
              aiForm={aiForm}
              onAiFormChange={setAiForm}
              savedOffline={savedOffline}
              onPrevLesson={
                prevMod
                  ? () => router.push(`/student/lessons/${prevMod.id}`)
                  : undefined
              }
              currentPage={currentPage}
              onSwipeNext={goNext}
              onSwipeBack={goBack}
              isTeacher={false}
            />
          )}
        </div>
      </div>

      {showStepper && (
        <div className="fixed bottom-0 left-0 right-0 md:left-[240px] z-10 bg-bg-page border-t border-border">
          <div className="w-full max-w-[680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">

            <div
              className="flex items-center gap-1.5 text-[12px] text-[#0F6E56]"
              style={{ fontFamily: FONT_BODY }}
            >
              <span className="w-[6px] h-[6px] rounded-full bg-[#1D9E75] shrink-0" />
              {savedOffline ? "Saved offline · syncs automatically" : "Saving…"}
            </div>

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
                  onClick={handleSubmit}
                  disabled={isSubmitting || blocked}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-1.5 rounded-[8px] transition-colors",
                    !isSubmitting && !blocked
                      ? "bg-[#1D9E75] text-white hover:bg-[#178a65]"
                      : "bg-[#1D9E75]/50 text-white/60 cursor-not-allowed"
                  )}
                  style={{ fontFamily: FONT_BODY }}
                >
                  {isSubmitting ? "Submitting…" : (submitLabel ?? "Submit lesson")}
                  {!isSubmitting && <ChevronRight size={14} />}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={blocked}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-1.5 rounded-[8px] transition-colors",
                    !blocked
                      ? "bg-[#5B21B6] text-white hover:bg-[#4c1d95]"
                      : "bg-[#5B21B6]/40 text-white/50 cursor-not-allowed"
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

// ─────────────────────────────────────────────────────────────────────────────
// Submitted / Approved notice
// ─────────────────────────────────────────────────────────────────────────────

function SubmittedNotice({
  status,
  submittedAt,
  onNext,
  onBack,
}: {
  status: "submitted" | "approved";
  submittedAt: string;
  onNext?: () => void;
  onBack: () => void;
}) {
  const date = new Date(submittedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const isApproved = status === "approved";

  return (
    <div className="bg-bg-card border border-border rounded-[14px] overflow-hidden">
      <div className="flex flex-col items-center text-center gap-4 py-12 px-8">
        {isApproved ? (
          <CheckCircle2 size={44} className="text-success" />
        ) : (
          <Clock size={44} className="text-purple-mid" />
        )}
        <div>
          <p
            className="text-[18px] font-bold text-text-primary mb-1.5"
            style={{ fontFamily: "var(--font-head)" }}
          >
            {isApproved ? "Module approved" : "Submitted — awaiting review"}
          </p>
          <p className="text-[13px] text-text-muted leading-[1.6]">
            {isApproved
              ? `Approved and added to your portfolio. Submitted ${date}.`
              : `Submitted ${date}. Your teacher will review this soon.`}
          </p>
        </div>
        <StatusPill status={status} />
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={onBack}
            className="text-[13px] font-bold text-text-secondary border border-border px-4 py-2 rounded-[8px] hover:bg-gray-50 transition-colors"
          >
            Back to lessons
          </button>
          {onNext && (
            <button
              onClick={onNext}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold bg-[#5B21B6] text-white px-4 py-2 rounded-[8px] hover:bg-[#4c1d95] transition-colors"
            >
              Next module
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}