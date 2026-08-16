"use client"

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { studentApi } from "@/lib/api/student";
import { ApiError } from "@/lib/api/api-client";
import { LessonStepper } from "@/components/cards/student/lessons/LessonStepper";
import { LessonMode, LessonView, buildPages, isPageBlocked, } from "@/lib/student/lessons/build";
import { LessonInitialData, useLessonMode, useResumeLesson } from "@/hooks/student/lessons";
import { 
  Submission, 
  AiFormState,
  TaskFilesState,
  TaskLinksState,
  CurriculumModule, 
  PreviewLinkState,
  QuestionAnswer,
} from "@/lib/api/types";
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
import { isFeatureEnabled } from "@/lib/features/flags";
import { useModuleStateStore, useModuleStore, useSubmissionStore } from "@/lib/store";
import { AuthUser } from "@/lib/utils/roles";
import { Alert } from "@/components/ui";
import { MissionPage } from "./MissionPage";
import { useOnboardingContext } from "@/components/onboarding/onboarding-provider";



type LessonWorkspaceProps = {
  initialData: LessonInitialData;
  currentModule: CurriculumModule;
  submission: Submission | null;
  user: AuthUser;
  accessToken: string | null;
  refreshToken: () => Promise<string | null>;
}

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

export function LessonWorkspace({
  initialData,
  currentModule,
  submission,
  user,
  accessToken,
  refreshToken,
}: LessonWorkspaceProps) {

  const router = useRouter();
  const { moduleState } = useModuleStateStore();
  const { modules } = useModuleStore();
  const { startTour } = useOnboardingContext();

  const [reflectionText, setReflectionText] = useState(initialData.reflectionText);
  const [activityText, setActivityText] = useState(initialData.activityText);
  const [taskFiles, setTaskFiles] = useState<TaskFilesState>(initialData.taskFiles);
  const [taskLinks, setTaskLinks] = useState<TaskLinksState>(initialData.taskLinks);
  const [previewLinks, setPreviewLinks]  = useState<PreviewLinkState>(initialData.previewLinks)
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>([]);
  
  const [aiForm, setAiForm] = useState<AiFormState>(initialData.aiForm);
  const [lessonView, setLessonView] = useState<LessonView>(initialData.lessonView)
  const [lessonMode, setLessonMode] = useState<LessonMode>(0);
  const [furthestPageSeen, setFurthestPageSeen] = useState(0);

  const [showCompletion, setShowCompletion] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const lessonCoachEnabled = isFeatureEnabled(
    "lesson_coach",
    user.schoolId
  );

  const lessonQuestionsEnabled = isFeatureEnabled(
    "lesson_questions",
    user.schoolId,
  )

  // Stable ref so saveSectionProgress inside the dwell effect doesn't
  // need to be in the dependency array and re-create the timer on every render
  const saveSectionProgressRef = useRef<((pageIdx: number) => Promise<void>) | null>(null);

  const pages = useMemo(() => {
    if (!currentModule) return [];
    return buildPages(currentModule.contentJson.sections, currentModule.title, lessonQuestionsEnabled);
  }, [currentModule, lessonQuestionsEnabled]);

  const stoppedAt = moduleState[currentModule.id]?.stoppedAt

  // Setup Lesson Mode
  useLessonMode({status:submission?.status ?? null, stoppedAt, setLessonMode})

  useResumeLesson({currentModule, stoppedAt, pages, setCurrentPage, setFurthestPageSeen});

  // ── Section progress save ─────────────────────────────────────────────────
  const saveSectionProgress = useCallback(
    async (pageIdx: number) => {
      const page = pages[pageIdx];
      if (!page) return;
      if (
        page.kind !== "content" &&
        page.kind !== "activity" &&
        page.kind !== "reflection"
      )
        return;
      if (!page.sectionId) return;
      if (lessonMode !== LessonMode.PROGRESS) return;

      const sectionId = page.sectionId;

      await savePendingProgress(user.id, currentModule.id, sectionId);

      const isPending = await hasPendingSubmission(user.id, currentModule.id);
      if (!isPending) {
        try {
          await studentApi.saveProgress(
            { studentId: user.id, moduleId:currentModule.id, sectionId },
            accessToken!,
            refreshToken
          );
          await clearPendingProgress(user.id);
        } catch {
          // Network failed — Dexie has it, sync will pick it up
        }
      }
    },
    [pages, lessonMode, currentModule.id, accessToken, refreshToken, user]
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

        const enqueueResult = await compressAndEnqueue(file, user.id, currentModule.id, blockId);

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
        const uploaded = await uploadFilesForModule(currentModule.id, accessToken);
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
    [user, currentModule.id, accessToken]
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
            currentModule.id,
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
    [user?.id, currentModule.id, accessToken]
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
        moduleId: currentModule.id,
        blockId,
        url: [url]
      })
    },
    [user, currentModule.id]
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

      removeLink(user.id, currentModule.id, blockId, link.url);
    },
    [taskLinks, user, currentModule.id]
  );
  
  function toPreview(file: {taskId: string,  url: string}) {
    return {
      taskId: file.taskId,
      url: file.url
    }
  }

  // ── Navigation helpers ────────────────────────────────────────────────────
  const sortedModules = [...modules].sort((a, b) => a.weekNumber - b.weekNumber);
  const currentIdx = sortedModules.findIndex((m) => m.id === currentModule.id);
  const nextMod =
    currentIdx !== -1 && currentIdx < sortedModules.length - 1
      ? sortedModules[currentIdx + 1]
      : null;
  const prevMod = currentIdx > 0 ? sortedModules[currentIdx - 1] : null;

  // ── Stepper page state ────────────────────────────────────────────────────
  const total = pages.length;
  const isLastPage = currentPage === total - 1;
  const blocked = currentModule
    ? isPageBlocked(pages[currentPage], activityText, reflectionText, taskFiles, aiForm, questionAnswers)
    : false;

  // Saves the furthest part reached so students can jump back to a previous class

  const navigateToPage = useCallback((page: number) => {
    const nextPage = Math.max(0, Math.min(total - 1, page));

    setCurrentPage(nextPage);
    setFurthestPageSeen((prev) => Math.max(prev, nextPage));
  }, [total]);

  const goNext = useCallback(() => {
    if (blocked) return;
    if (isLastPage) { handleSubmit(); return; }
    navigateToPage(currentPage + 1);
  }, [blocked, isLastPage, currentPage, total, navigateToPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const goBack = useCallback(() => {
    if (currentPage === 0) {
      if (prevMod) {
        router.push(`/student/lessons/${prevMod.id}`)
        return;
      }
    }
    navigateToPage(currentPage - 1)
  }, [currentPage, prevMod, navigateToPage]);

  function handleQuestionAnswer(answer: QuestionAnswer) {
    setQuestionAnswers((current) => {
      if (current.some((item) => item.questionId === answer.questionId)) {
        return current;
      }

      return [...current, answer];
    });
  }

  async function handleSubmit() {
    if (!currentModule || !user) return;
    if (lessonMode === LessonMode.REVIEW) {
      setIsReviewing(true);
      setShowCompletion(true);
      setIsReviewing(false);
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");

    const freshUploads = await uploadFilesForModule(currentModule.id, accessToken);

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

    const existing = await getDraftForModule(user.id, currentModule.id);

    const payload = {
      moduleId: currentModule.id,
      activityText,
      reflectionText,
      fileUrls: uploadedFiles.length > 0 ? uploadedFiles.map(toPreview) : null,
      otherUrls: allOtherPaths.length > 0 ? allOtherPaths.map(toPreview) : null,
      questionAnswers,
      aiForm: aiForm.used != null ? aiForm : null,
      localId: existing?.localId ?? crypto.randomUUID(),
    };

    let backendError = "";

    // Try backend first
    if (accessToken) {
      let res;
      
      try {
        if (submission?.status === "flagged") {
          const resubmission = {
            id: submission.id,
            activityText: activityText,
            reflectionText: reflectionText,
            fileUrls: submission.fileUrls ?? (uploadedFiles.length > 0 ? uploadedFiles.map(toPreview) : null),
            otherUrls: submission.otherUrls ?? (allOtherPaths.length > 0 ? allOtherPaths.map(toPreview) : null),
            questionAnswers,
            aiForm: submission.aiForm,
            localId: submission.localId,
          };
          res = await studentApi.resubmitModule(user.id, resubmission, accessToken, refreshToken);
        } else {
          res = await studentApi.submitModule(user.id, payload, accessToken, refreshToken);
        }
        useSubmissionStore.getState().setSubmission({
          id: res.id,
          moduleTitle: currentModule.title,
          term: currentModule.term,
          weekNumber: currentModule.weekNumber,
          aiForm: res.aiForm,
          moduleId: currentModule.id,
          activityText,
          reflectionText: reflectionText || null,
          fileUrls: uploadedFiles.length > 0 ? uploadedFiles.map(toPreview) : null,
          otherUrls: allOtherPaths.length > 0 ? allOtherPaths.map(toPreview) : null,
          questionAnswers,
          syncedAt: null,
          localId: payload.localId,
          submittedAt: new Date().toISOString(),
          status: "submitted",
          teacherNote: null,
          dispute: false,
        })
        setLessonView(LessonView.SUBMITTED)
        await clearUploadedFilesForModule(currentModule.id);
        await clearLinksForModule(user.id, currentModule.id)
        setShowCompletion(true)
        setIsSubmitting(false);
        return;
      } catch (err) {
        // Fall through to Dexie
        if (err instanceof ApiError) {
          backendError = err.message
        }
      }
    }

    // Backend failed or no token — save to Dexie for later sync
    try {
      await saveSubmissionLocally({
        id: submission?.id ?? null,
        localId: payload.localId,
        studentId: user.id,
        moduleId: currentModule.id,
        activityText: activityText || undefined,
        reflectionText: reflectionText || undefined,
        aiForm,
        fileUrls: uploadedFiles.map(toPreview),
        otherUrls: allOtherPaths.map(toPreview),
        questionAnswers,
        submittedAt: new Date().toISOString(),
        syncStatus: "pending",
        submissionType: submission?.status === "flagged" ? "resubmit" : "submit",
      });
      setSavedOffline(true);
      const errorMessage = [
        backendError,
        "Your work has been saved, so you won't lose it. Once this issue is resolved, you can submit again."
      ].filter(Boolean).join("\n\n");
      setSubmitError(errorMessage);
    } catch {
      setSubmitError("Failed to save your work. Please try again.");
    } finally {
      setShowCompletion(true)
      setIsSubmitting(false);
      setLessonView(LessonView.LESSON)
    }
  }
  
  function handleSetMode(mode: number) {
    setLessonMode(mode as LessonMode)
    setLessonView(mode as LessonView)
  }

  const showStepper = submission?.status === null || submission?.status === "flagged" || (lessonView === LessonView.LESSON );
  const submitLabel = submission?.status === "flagged" ? "Resubmit revision" : lessonMode === LessonMode.REVIEW ? "Complete Review" : undefined;

  if (lessonView === LessonView.MISSION) {
    return(
      <MissionPage
        title={currentModule.title}
        description={currentModule.description}
        outcomes={[currentModule.outcome]}
        onStart={() => handleSetMode(1)}
        onShowTour={() => startTour("student-mission")}
      />
    )
  }


  return (
    <>
      {submitError && (
        <Alert variant="error" title="Submission Failed">
          {submitError}
        </Alert>
      )}
      
      {showCompletion && (
        <LessonCompletionPage
          lessonMode={lessonMode}
          status={submission?.status ?? "not_started"}
          submittedAt={submission!.submittedAt}
          onNext={nextMod ? () => router.push(`/student/lessons/${nextMod.id}`) : undefined}
          onBack={() => router.push("/student/lessons")}
        />
      )}
      {!showCompletion && (
        <>
          <LessonStepper
            title={currentModule.title}
            weekNumber={currentModule.weekNumber}
            sections={currentModule.contentJson.sections}
            pages={pages}

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
            questionAnswers={questionAnswers}
            onAnswer={handleQuestionAnswer}

            aiForm={aiForm}
            onAiFormChange={setAiForm}

            savedOffline={savedOffline}

            currentPage={currentPage}
            furthestPageSeen={furthestPageSeen}
            onPageSelect={navigateToPage}
            onSwipeNext={goNext}
            onSwipeBack={goBack}

            lessonMode={lessonMode}
            lessonCoachEnabled={lessonCoachEnabled}
            learningMode={user.learningMode ?? "focus"}
          />
          {showStepper && (
            <div className="fixed bottom-0 left-0 right-0 md:left-[240px] z-10 bg-bg-page border-t border-border">
              <div className="w-full max-w-[680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">

                <div className="flex items-center gap-1.5 text-[12px] text-[#0F6E56]" style={{ fontFamily: FONT_BODY }}>
                  <span className="w-[6px] h-[6px] rounded-full bg-[#1D9E75] shrink-0" />
                  {savedOffline ? "Saved offline · syncs automatically" : "Saving…"}
                </div>

                <div className="flex items-center gap-2" data-tour="lesson-navigation">
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
      )}
    </>
  );

}

// ─────────────────────────────────────────────────────────────────────────────
// Submitted / Approved notice
// ─────────────────────────────────────────────────────────────────────────────

type LessonCompletionPageProps = {
  lessonMode: LessonMode;
  status: string;
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