"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { studentApi } from "@/lib/api/student";
import { cn } from "@/lib/utils/utils";
import {
  LessonStepper,
  EMPTY_AI_FORM,
} from "@/components/cards/student/lessons/lesson-stepper";
import { buildPages, isPageBlocked, LessonMode, LessonView } from "@/lib/student/lessons/build";
import {
  compressAndEnqueue,
  uploadFilesForModule,
  removeQueuedFile,
  deleteUploadedFile,
} from "@/lib/file-pipeline";
import {
  clearUploadedFilesForModule,
  getDraftForModule,
  saveSubmissionLocally,
  savePendingProgress,
  clearPendingProgress,
  hasPendingSubmission,
  storeLinks,
  removeLink,
  clearLinksForModule,
} from "@/lib/db";
import { PageShell } from "@/components/layout/common/PageShell";
import {
  Loader2,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  type Submission,
  type TaskFilesState,
  type AiFormState,
  type TaskLinksState,
  type PreviewLinkState,
  DisputeReview,
} from "@/lib/api/types";
import { MissionPage } from "@/components/cards/student/lessons";
import { 
  useLessonMode, 
  useModuleLoader, 
  useResumeLesson 
} from "@/hooks/student/lessons";
import { saveOffline } from "@/lib/student/lessons/build";
import { Alert } from "@/components/ui";
import { ApiError } from "@/lib/api/api-client";

// ─────────────────────────────────────────────────────────────────────────────
// Font constants
// ─────────────────────────────────────────────────────────────────────────────

const FONT_BODY = "var(--font-body)";

// ─────────────────────────────────────────────────────────────────────────────
// Progress dwell threshold — how long the student must stay on a page
// before progress is saved. Short enough to be useful, long enough to
// avoid saving on every quick swipe-through.
// ─────────────────────────────────────────────────────────────────────────────

const PROGRESS_DWELL_MS = 10_000;


// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function LessonDetailPage() {
  
  const { accessToken, refreshToken, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;

  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [activityText, setActivityText] = useState("");
  const [savedOffline, setSavedOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState<string | null>(null) 

  // Is used for the students' feedback for the teacher's note
  const [feedback, setFeedback] = useState<"helpful" | "disagree" | null>(null);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false); // Is used for the students' feedback

  const [taskFiles, setTaskFiles] = useState<TaskFilesState>({});
  const [taskLinks, setTaskLinks] = useState<TaskLinksState>({});
  const [previewLinks, setPreviewLinks]  = useState<PreviewLinkState>([])
  
  const [aiForm, setAiForm] = useState<AiFormState>(EMPTY_AI_FORM);
  const [currentPage, setCurrentPage] = useState(0);
  const [lessonMode, setLessonMode] = useState<LessonMode>(0);
  const [lessonView, setLessonView] = useState<LessonView>(0)

  // Stable ref so saveSectionProgress inside the dwell effect doesn't
  // need to be in the dependency array and re-create the timer on every render
  const saveSectionProgressRef = useRef<((pageIdx: number) => Promise<void>) | null>(null);

  // ── Load ─────────────────────────────────────────────────────────────────
  const { 
    lessonModule, 
    hasDispute,
    allModules, 
    initialData,
    loadState,
  } = useModuleLoader({user: user, moduleId: moduleId, accessToken: accessToken, refreshToken: refreshToken})

  const pages = useMemo(() => {
    if (!lessonModule) return [];
    return buildPages(lessonModule.contentJson.sections, lessonModule.title);
  }, [lessonModule, lessonMode]);

  useEffect(() => {
    if (loadState !== "ready") return;

    setExistingSubmission(initialData.existingSubmission)
    setReflectionText(initialData.reflectionText)
    setActivityText(initialData.activityText)
    setAiForm(initialData.aiForm)
    setTaskFiles(initialData.taskFiles)
    setTaskLinks(initialData.taskLinks)
    setLessonView(initialData.lessonView)
    setPreviewLinks(initialData.previewLinks)
    setStatus(initialData.status)
    console.log(hasDispute)

    if (hasDispute) {
      
      setSubmitted(true)
    }
  }, [loadState, initialData, hasDispute])
  
  // Setup Lesson Mode
  useLessonMode({status, lessonModule, setLessonMode})

  useResumeLesson({lessonModule, pages, setCurrentPage})

  // ── Auto-save text drafts ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !lessonModule) return;
    if (!activityText && !reflectionText) return;

    const t = setTimeout(async () => {
      await saveOffline(
        existingSubmission?.id ?? null,
        user.id,
        moduleId,
        [],
        [],
        aiForm,
        "draft",
        existingSubmission?.status === "flagged" ? "resubmit" : "submit",
        activityText || undefined,
        reflectionText || undefined,
        accessToken || undefined
      );
      setSavedOffline(true);
    }, 800);

    return () => clearTimeout(t);
  }, [activityText, reflectionText, moduleId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Section progress save ─────────────────────────────────────────────────
  const saveSectionProgress = useCallback(
    async (pageIdx: number) => {
      const page = pages[pageIdx];
      if (!page || !user) return;
      if (
        page.kind !== "content" &&
        page.kind !== "activity" &&
        page.kind !== "reflection"
      )
        return;
      if (!page.sectionId) return;
      if (lessonMode !== LessonMode.PROGRESS) return;

      const sectionId = page.sectionId;

      await savePendingProgress(user.id, moduleId, sectionId);

      const isPending = await hasPendingSubmission(user.id, moduleId);
      if (!isPending) {
        try {
          await studentApi.saveProgress(
            { studentId: user.id, moduleId, sectionId },
            accessToken!,
            refreshToken
          );
          await clearPendingProgress(moduleId);
        } catch {
          // Network failed — Dexie has it, sync will pick it up
        }
      }
    },
    [pages, lessonMode, moduleId, accessToken, refreshToken, user]
  );

  // Keep the ref in sync so the dwell timer always calls the latest version
  // without needing to be in the effect's dependency array
  useEffect(() => {
    saveSectionProgressRef.current = saveSectionProgress;
  }, [saveSectionProgress]);

  // ── Dwell-based progress saving ───────────────────────────────────────────
  // After the student lands on a page, wait PROGRESS_DWELL_MS (10 s).
  // If they're still there, save progress. If they navigate away first,
  // the cleanup cancels the timer — no save fires.
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSectionProgressRef.current?.(currentPage);
    }, PROGRESS_DWELL_MS);

    return () => clearTimeout(timer);
  }, [currentPage]); // only re-arm when the page changes

  const handleHelpful = async () => {
    if (!existingSubmission?.id) return;
    await studentApi.raiseDispute({
      submissionId: existingSubmission?.id,
      note: undefined,
      review: "helpful"
    } satisfies DisputeReview,
    accessToken!,
    refreshToken)

    setFeedback("helpful")
    setSubmitted(true);
  }

  const handleDisagree = async () => {
    if (!existingSubmission?.id) return;
    if (review.trim().length < 10) return;

    await studentApi.raiseDispute({
      submissionId: existingSubmission?.id,
      note: review,
      review: "disagree"
    },
    accessToken!,
    refreshToken)

    setSubmitted(true)
  }

  // ── Task file handlers ────────────────────────────────────────────────────
  const handleTaskFilesSelected = useCallback(
    async (blockId: string, files: FileList) => {
      if (!user) return;

      const incoming = Array.from(files);
      const placeholders = incoming.map(file => ({
          id: crypto.randomUUID(),
          taskId: blockId,
          url: null,
          file,
          fileName: file.name,
          status: "uploading" as const,
        }))

      setTaskFiles((prev) => {
        const existing = prev[blockId] ?? [];
        return { ...prev, [blockId]: [...existing, ...placeholders] };
      });

      for (let i = 0; i < incoming.length; i++) {
        const placeholder = placeholders[i];
        const file = incoming[i];

        const enqueueResult = await compressAndEnqueue(file, user.id, moduleId, blockId);

        if (!enqueueResult.ok) {
          const msg =
            enqueueResult.error.kind === "video_too_large"
              ? `Video too large (${enqueueResult.error.sizeMb} MB). Max is ${enqueueResult.error.maxMb} MB.`
              : "File could not be processed.";

          setTaskFiles(prev => ({
            ...prev,
            [blockId]: (prev[blockId] ?? []).map(entry =>
              entry.id === placeholder.id
                ? {
                    ...entry,
                    status: "error",
                    errorMsg: msg,
                  }
                : entry
            ),
          }));
          continue;
        }

        const { dexieId } = enqueueResult;
        const uploaded = await uploadFilesForModule(moduleId, accessToken);
        const match = uploaded.find((u) => u.dexieId === dexieId);

        setTaskFiles(prev => ({
          ...prev,
          [blockId]: (prev[blockId] ?? []).map(entry =>
            entry.id === placeholder.id
              ? {
                  ...entry,
                  url: match?.path ?? null,
                  dexieId,
                  status: match ? "done" : "queued",
                }
              : entry
          ),
        }));
      }
    },
    [user, moduleId, taskFiles, accessToken]
  );

  const handleTaskFileRemove = useCallback(
    async (blockId: string, index: number) => {
      setTaskFiles((prev) => {
        const entries = [...(prev[blockId] ?? [])];
        const removed = entries[index];
        const id = user?.id

        if (removed?.url) {
          deleteUploadedFile(
            removed.url,
            id!,
            moduleId,
            blockId,
            accessToken,
            removed.dexieId
          ).catch(() => {});
        } else if (removed?.dexieId) {
          removeQueuedFile(removed.dexieId).catch(() => {});
        }

        entries.splice(index, 1);
        return { ...prev, [blockId]: entries };
      });
    },
    [user?.id, moduleId, accessToken]
  );

  const handleTaskLinkAdd = useCallback(
    (blockId: string, url: string) => {
      if (!user) return;
      setTaskLinks((prev) => {
        const existing = prev[blockId] ??[];
        return{  
          ...prev,
          [blockId]: [
            ...existing,
            {
              taskId: blockId,
              url
            },
          ],};
      });
      storeLinks({
        id: crypto.randomUUID(),
        studentId: user?.id,
        moduleId,
        blockId,
        url: [url]
      })
    },
    [user, moduleId]
  )

  const handleTaskLinkRemove = useCallback(
    (blockId: string, index: number) => {
      if (!user) return;

      const link = taskLinks[blockId]?.[index];
      if (!link) return;

      setTaskLinks((prev) => {
        const links = [...(prev[blockId] ?? [])];
        links.splice(index, 1);

        return {
          ...prev,
          [blockId]: links,
        };
      });

      removeLink(user.id, moduleId, blockId, link.url);
    },
    [taskLinks, user, moduleId]
  );

  function toPreview(file: {taskId: string,  url: string}) {
    return {
      taskId: file.taskId,
      url: file.url
    }
  }

  // ── Navigation helpers ────────────────────────────────────────────────────
  const sortedModules = [...allModules].sort((a, b) => a.weekNumber - b.weekNumber);
  const currentIdx = sortedModules.findIndex((m) => m.id === moduleId);
  const nextMod =
    currentIdx !== -1 && currentIdx < sortedModules.length - 1
      ? sortedModules[currentIdx + 1]
      : null;
  const prevMod = currentIdx > 0 ? sortedModules[currentIdx - 1] : null;

  // ── Stepper page state ────────────────────────────────────────────────────
  const total = pages.length;
  const isLastPage = currentPage === total - 1;
  const blocked = lessonModule
    ? isPageBlocked(pages[currentPage], activityText, reflectionText, taskFiles, aiForm)
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

  function handleSetMode(mode: number) {
    setLessonMode(mode as LessonMode)
    setLessonView(mode as LessonView)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!lessonModule || !user) return;
    if (lessonMode === LessonMode.REVIEW) {
      setIsReviewing(true);
      setLessonView(LessonView.SUBMITTED); 
      setIsReviewing(false);
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");

    const freshUploads = await uploadFilesForModule(moduleId, accessToken);

    if (freshUploads.length > 0) {
      setTaskFiles((prev) => {
        const next = { ...prev };
        for (const u of freshUploads) {
          const entries = [...(next[u.blockId] ?? [])];
          const idx = entries.findIndex((e) => e.dexieId === u.dexieId);
          if (idx !== -1) {
            entries[idx] = { ...entries[idx], url: u.path, status: "done" };
          }
          next[u.blockId] = entries;
        }
        return next;
      });
    }

    const uploadedFiles = Object.values(taskFiles)
      .flat()
      .filter((e) => e.status === "done" && e.url)
      .map((e) => ({
        taskId: e.taskId,
        url: e.url!,
      }));

    for (const u of freshUploads) {
      if (!uploadedFiles.some((f) => f.url === u.path)) {
        uploadedFiles.push({
          taskId: u.blockId,
          url: u.path,
        });
      }
    }

    const allOtherPaths = Object.values(taskLinks)
      .flat()
      .map((e) =>({
        taskId: e.taskId,
        url: e.url!
      }));

    const existing = await getDraftForModule(user.id, moduleId);

    const payload = {
      moduleId,
      activityText,
      reflectionText,
      fileUrls: uploadedFiles.length > 0 ? uploadedFiles.map(toPreview) : null,
      otherUrls: allOtherPaths.length > 0 ? allOtherPaths.map(toPreview) : null,
      aiForm: aiForm.used != null ? aiForm : null,
      localId: existing?.localId ?? crypto.randomUUID(),
    };

    let backendError = "";

    // Try backend first
    if (accessToken) {
      let res;
      
      try {
        if (existingSubmission?.status === "flagged") {
          const resubmission = {
            id: existingSubmission.id,
            activityText: activityText,
            reflectionText: reflectionText,
            fileUrls: existingSubmission.fileUrls ?? (uploadedFiles.length > 0 ? uploadedFiles.map(toPreview) : null),
            otherUrls: existingSubmission.otherUrls ?? (allOtherPaths.length > 0 ? allOtherPaths.map(toPreview) : null),
            aiForm: existingSubmission.aiForm,
            localId: existingSubmission.localId,
          };
          res = await studentApi.resubmitModule(user.id, resubmission, accessToken, refreshToken);
        } else {
          res = await studentApi.submitModule(user.id, payload, accessToken, refreshToken);
        }
        setExistingSubmission({
          id: res.id,
          moduleTitle: lessonModule.title,
          term: lessonModule.term,
          weekNumber: lessonModule.weekNumber,
          aiForm: res.aiForm,
          moduleId: lessonModule.id,
          activityText,
          reflectionText: reflectionText || null,
          fileUrls: uploadedFiles.length > 0 ? uploadedFiles.map(toPreview) : null,
          otherUrls: allOtherPaths.length > 0 ? allOtherPaths.map(toPreview) : null,
          syncedAt: null,
          localId: payload.localId,
          submittedAt: new Date().toISOString(),
          status: "submitted",
          teacherNote: null,
        });
        setStatus("submitted")
        setLessonView(LessonView.SUBMITTED)
        await clearUploadedFilesForModule(moduleId);
        await clearLinksForModule(user.id, moduleId)

        setIsSubmitting(false);
        return;
      } catch (err) {
        console.log(err)
        console.log()
        // Fall through to Dexie
        if (err instanceof ApiError) {
          console.log(err)
          backendError = err.message
        }
      }
    }

    // Backend failed or no token — save to Dexie for later sync
    try {
      await saveSubmissionLocally({
        id: existingSubmission?.id ?? null,
        localId: payload.localId,
        studentId: user.id,
        moduleId,
        activityText: activityText || undefined,
        reflectionText: reflectionText || undefined,
        aiForm,
        fileUrls: uploadedFiles.map(toPreview),
        otherUrls: allOtherPaths.map(toPreview),
        submittedAt: new Date().toISOString(),
        syncStatus: "pending",
        submissionType: existingSubmission?.status === "flagged" ? "resubmit" : "submit",
      });
      setSavedOffline(true);
      console.log(backendError)
      const errorMessage = [
        backendError,
        "Your work has been saved, so you won't lose it. Once this issue is resolved, you can submit again."
      ].filter(Boolean).join("\n\n");
      console.log(errorMessage)
      setSubmitError(errorMessage);
    } catch {
      setSubmitError("Failed to save your work. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLessonView(LessonView.LESSON)
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

  if (loadState === "error" || !lessonModule) {
    return (
      <PageShell title="Lesson" backHref="/student/lessons" backLabel="My Lessons">
        <Alert variant="error" title="Loading Failed">
          Failed to load this lesson. Please try again.
        </Alert>
      </PageShell>
    );
  }
  
  const toolNames = lessonModule.contentJson.sections
    .flatMap((s) => s.blocks)
    .filter((b) => b.type === "toolLink")
    .map((b) => b.toolName || b.content)
    .filter(Boolean) as string[];

  const showStepper = status === null || status === "flagged" || (lessonView === LessonView.LESSON );
  const submitLabel = status === "flagged" ? "Resubmit revision" : lessonMode === LessonMode.REVIEW ? "Complete Review" : undefined;

  if (lessonView === LessonView.MISSION) {
    return(
      <MissionPage 
        title={lessonModule.title}
        description={lessonModule.description}
        outcomes={[lessonModule.outcome]}
        onStart={() => handleSetMode(1)}
      />
    )
  }

  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-5 pb-[72px]" id="lesson-scroll">
        <div className="w-full max-w-[680px] mx-auto flex flex-col gap-4">

          {submitError && (
            <Alert variant="error" title="Submission Failed">
              {submitError}
            </Alert>
          )}

          {(lessonView === LessonView.SUBMITTED && 
            status === "approved" || status === "submitted") && (
            <LessonCompletionPage
              lessonMode={lessonMode}
              status={status}
              submittedAt={existingSubmission!.submittedAt}
              onNext={nextMod ? () => router.push(`/student/lessons/${nextMod.id}`) : undefined}
              onBack={() => router.push("/student/lessons")}
            />
          )}

          {status === "flagged" && existingSubmission?.teacherNote && (
            <div className="border-l-[3px] border-warning bg-warning-light rounded-r-[10px] px-4 py-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-warning">
                Teacher feedback — revision required
              </p>

              <p className="text-[13px] leading-[1.6] text-warning-dark">
                {existingSubmission.teacherNote}
              </p>

              {!submitted ? (
                <>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleHelpful}
                      className="rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      👍 Helpful
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeedback("disagree")}
                      className="rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      👎 I disagree
                    </button>
                  </div>

                  {feedback === "disagree" && (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Tell us what seems incorrect about this feedback..."
                        className="min-h-[110px] w-full rounded-md border border-border bg-white p-3 text-sm outline-none focus:border-warning"
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFeedback(null);
                            setReview("");
                          }}
                          className="rounded-md border border-border bg-white px-4 py-2 text-sm"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={review.trim().length < 10}
                          onClick={handleDisagree}
                          className="rounded-md bg-warning px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Send feedback
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-success">
                  ✓ Thanks! Your feedback has been recorded.
                </p>
              )}
            </div>
          )}

          {showStepper && (
            <LessonStepper
              title={lessonModule.title}
              weekNumber={lessonModule.weekNumber}
              toolNames={toolNames}
              sections={lessonModule.contentJson.sections}
              activityText={activityText}
              onActivityChange={setActivityText}
              reflectionText={reflectionText}
              onReflectionChange={setReflectionText}
              taskFiles={taskFiles}
              onTaskFilesSelected={handleTaskFilesSelected}
              onTaskFileRemove={handleTaskFileRemove}
              taskLinks={taskLinks}
              onLinkAdd={handleTaskLinkAdd}
              onLinkRemove={handleTaskLinkRemove}
              previewLinks={previewLinks}
              aiForm={aiForm}
              onAiFormChange={setAiForm}
              savedOffline={savedOffline}
              onPrevLesson={prevMod ? () => router.push(`/student/lessons/${prevMod.id}`) : undefined}
              currentPage={currentPage}
              onSwipeNext={goNext}
              onSwipeBack={goBack}
              lessonMode={lessonMode}
            />
          )}
        </div>
      </div>

      {showStepper && (
        <div className="fixed bottom-0 left-0 right-0 md:left-[240px] z-10 bg-bg-page border-t border-border">
          <div className="w-full max-w-[680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">

            <div className="flex items-center gap-1.5 text-[12px] text-[#0F6E56]" style={{ fontFamily: FONT_BODY }}>
              <span className="w-[6px] h-[6px] rounded-full bg-[#1D9E75] shrink-0" />
              {savedOffline ? "Saved offline · syncs automatically" : "Saving…"}
            </div>

            <div className="flex items-center gap-2">
              {(currentPage > 0 || prevMod) && (
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-1 text-[13px] font-bold text-text-secondary border border-border px-3 py-1.5 rounded-[8px] hover:bg-gray-50 transition-all-duration"
                  style={{ fontFamily: FONT_BODY }}
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}

              {isLastPage ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || blocked || isReviewing}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-1.5 rounded-[8px] transition-colors",
                    !isSubmitting && !blocked
                      ? "bg-[#1D9E75] text-white hover:bg-[#178a65]"
                      : "bg-[#1D9E75]/50 text-white/60 cursor-not-allowed"
                  )}
                  style={{ fontFamily: FONT_BODY }}
                >
                  {isSubmitting 
                    ? "Submitting…"
                    : isReviewing
                    ? "Reviewing…"
                    : (submitLabel ?? "Submit lesson")}
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

type LessonCompletionPageProps = {
  lessonMode: LessonMode;
  status: "submitted" | "approved";
  submittedAt: string;
  onNext?: () => void;
  onBack: () => void;
};

function LessonCompletionPage({
  lessonMode,
  status,
  submittedAt,
  onNext,
  onBack,
}: LessonCompletionPageProps) {
  const date = new Date(submittedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const isReview = lessonMode === LessonMode.REVIEW
  const isApproved = status === "approved";

  return (
    <div className="bg-bg-card border border-border rounded-[14px] overflow-hidden">
      <div className="flex flex-col items-center text-center gap-4 py-12 px-8">
        {isReview || isApproved ? (
          <CheckCircle2 size={44} className="text-success" />
        ) : (
          <Clock size={44} className="text-purple-mid" />
        )}
        <div>
          <p
            className="text-[18px] font-bold text-text-primary mb-1.5"
            style={{ fontFamily: "var(--font-head)" }}
          >
            {isReview
                ? "Lesson Complete"
                : isApproved 
                ? "Module approved" 
                : "Submitted — awaiting review"}
          </p>
          <p className="text-[13px] text-text-muted leading-[1.6]">
            {isReview
                ? "You've completed this lesson. Your work has been saved and can be reviewed anytime."
                : isApproved
                ? `Approved and added to your portfolio. Submitted ${date}.`
                : `Submitted ${date}. Your teacher will review this soon.`}
          </p>
        </div>
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
              Next Module
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}