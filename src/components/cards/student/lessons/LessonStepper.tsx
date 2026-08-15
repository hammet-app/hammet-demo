"use client";

import {  useRef, useEffect, useState } from "react";
import { Check, Lock, Compass } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { AnimatePresence, motion } from "motion/react";
import { 
  buildPages, LessonMode,
  StepperPage, LearningMode
} from "@/lib/student/lessons/build";
import type { 
  CurriculumSection,
  AiFormState,
  TaskFilesState,
  TaskLinksState,
  PreviewLinkState,
  CurriculumModuleBlock,
  QuestionAnswer
} from "@/lib/api/types";
import { AiFormPageView } from "./blocks";
import { LessonCoach } from "./LessonCoach";
import { TaskPageView, ContentPageView, ActivityPageView, SubmitPageView, ReflectionPageView, QuestionPageView } from "./views";
import { useOnboardingContext } from "@/components/onboarding/onboarding-provider";

// ─────────────────────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────────────────────

const FONT_HEAD = "var(--font-head)";
const FONT_BODY = "var(--font-body)";


export const EMPTY_AI_FORM: AiFormState = {
  used: null,
  noReason: null,
  noReasonOther: "",
  toolUsed: "",
  toolOther: "",
  taskDesc: "",
  promptChoice: null,
  editedPrompt: "",
  rating: null,
  ratingComment: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// LessonStepper
// ─────────────────────────────────────────────────────────────────────────────

export interface LessonStepperProps {
  title: string;
  description?: string;
  weekNumber: number;
  toolNames?: string[];
  sections: CurriculumSection[];
  pages: StepperPage[];
  activityText: string;
  onActivityChange: (text: string) => void;
  reflectionText: string;
  onReflectionChange: (text: string) => void;
  /** Task file state — keyed by block ID */
  taskFiles?: TaskFilesState;
  /** Called when student selects files for a task block */
  onTaskFilesSelected?: (blockId: string, files: FileList) => void;
  /** Called when student removes a file from a task block */
  onTaskFileRemove?: (blockId: string, index: number) => void;
  /** Task links state — keyed by block ID */
  taskLinks?: TaskLinksState;
  /** Called when student inputs a link for a task block */
  onLinkAdd?: (blockId: string, links: string) => void;
  /** Called when student removes a file from a task block */
  onLinkRemove?: (blockId: string, index: number) => void;
  /** Used to view the files the student uploaded */
  previewLinks?: PreviewLinkState | null;
  /** Question answers state - keyed by sectionID */
  questionAnswers?: QuestionAnswer[];
  /** Called when a student answers a question */
  onAnswer?: (answer: QuestionAnswer) => void;
  /** AI form state */
  aiForm?: AiFormState;
  onAiFormChange?: (next: AiFormState) => void;
  savedOffline?: boolean;
  onPrevLesson?: () => void;
  currentPage: number;
  furthestPageSeen:number;
  onPageSelect: (page: number) => void;
  onSwipeNext: () => void;
  onSwipeBack: () => void;
  className?: string;
  lessonMode: number;
  lessonCoachEnabled: boolean;
  learningMode: LearningMode;
}

export function LessonStepper({
  title,
  description,
  weekNumber,
  sections,
  pages,
  activityText,
  onActivityChange,
  reflectionText,
  onReflectionChange,
  taskFiles,
  onTaskFilesSelected,
  onTaskFileRemove,
  taskLinks,
  onLinkAdd,
  onLinkRemove,
  previewLinks,
  questionAnswers,
  onAnswer,
  aiForm,
  onAiFormChange,
  savedOffline = false,
  onPrevLesson,
  currentPage,
  furthestPageSeen,
  onPageSelect,
  onSwipeNext,
  onSwipeBack,
  className,
  lessonMode,
  lessonCoachEnabled,
  learningMode
}: LessonStepperProps) {
  const total = pages.length;
  const touchStartX = useRef<number | null>(null);
  const pagePickerRef = useRef<HTMLDivElement | null>(null);
  const [showPagePicker, setShowPagePicker] = useState(false);

  const { startTour } = useOnboardingContext();

  const allBlocks = sections.flatMap((s) => s.blocks);
  const hasActivity = allBlocks.some((b) => b.type === "activity");
  const hasReflection = allBlocks.some((b) => b.type === "reflection");
  const hasTask =  allBlocks.some((b) => b.type === "task");
  const hasAiForm =  allBlocks.some((b) => b.type === "toolLink");

  const page = pages[currentPage];

  const pageTourMap = {
    content: "student-lesson",
    activity: "student-activity",
    reflection: "student-reflection",
    question: "student-question",
    task: "student-task",
    ai_form: "student-ai-form",
    submit: "student-submit",
  } as const;

  const currentTour = pageTourMap[page.kind];

  useEffect(() => {
    if (!showPagePicker) return;

    function handleOutsideClick(event: MouseEvent) {
      if (pagePickerRef.current && !pagePickerRef.current.contains(event.target as Node)) {
        setShowPagePicker(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [showPagePicker]);

  // Collect tools and toolNames from toolLink blocks for Activity and ToolNames
  const lessonTools = allBlocks
    .filter((b): b is CurriculumModuleBlock => b.type === "toolLink")
    .map((b) => ({
      name: b.toolName || b.content,
      url: b.url,
    }))
    .filter((tool) => Boolean(tool.name) && Boolean(tool.url));

  const lessonToolNames = lessonTools.map((tool) => tool.name);
  const hasTools = lessonTools.length > 0;

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 44) return;
    if (dx < 0) onSwipeNext(); else onSwipeBack();
  }

  const progress = ((currentPage + 1) / total) * 100;

  useEffect(() => {
    document.getElementById("lesson-scroll")?.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div
      className={cn("w-full max-w-[680px] mx-auto flex flex-col gap-5", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col gap-5">
        {/* Lesson Header */}
        <div className="flex flex-col gap-2" data-tour="lesson-header">
          <div className="flex items-center justify-between gap-4">
            <p 
              className="text-xs font-semibold uppercase tracking-widest text-purple"
              style={{ fontFamily: FONT_BODY }}
            >
              Week {weekNumber}
            </p>
            <button 
              type="button"
              onClick={() => {
                if (!hasTools && page.kind === "activity") {
                  startTour("student-activity-no-tools")
                  return;
                }
                startTour(currentTour)
              }}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-purple transition-colors"
              style={{ fontFamily: FONT_BODY }}
            >
              <Compass className="h-3.5 w-3.5" /> Show me around
            </button>
          </div>
          <h1 
            className="text-3xl font-bold text-text-primary leading-tight"
            style={{ fontFamily: FONT_HEAD }}
          >
            {title}
          </h1>
          {description && (
            <p 
              className="max-w-2xl text-sm leading-7 text-text-secondary"
              style={{ fontFamily: FONT_BODY }}
            >
              {description}
            </p>
          )}
          
        </div>

        {/* Progress bar */}
        <div className="rounded-2xl border border-border bg-bg-card p-4" data-tour="lesson-progress">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <p
                className="text-sm font-medium text-text-secondary"
                style={{ fontFamily: FONT_BODY }}
              >
                Page {currentPage + 1} of {total}
              </p>
              {/* Page picker */}
              <div ref={pagePickerRef} className="relative" data-tour="lesson-page-picker">
                <button
                  type="button"
                  onClick={() => setShowPagePicker((open) => !open)}
                  className="text-xs font-semibold text-purple hover: text-purple/80 transition-colors"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Jump to page
                </button>

                {showPagePicker && (
                  <div className="absolute left-0 top-7 z-30 w-64 rounded-xl border border-border bg-bg-card p-2 shadow-lg">
                    <div className="px-2 py-1.5">
                      <p className="text-xs font-semibold text-text-primary" style={{ fontFamily: FONT_BODY }}>
                        Jump to page
                      </p>

                      <p 
                        className="mt-0.5 text-[11px] text-text-muted"
                        style={{ fontFamily: FONT_BODY }}
                      >
                        You can jump back to pages you&apos;ve already seen.
                      </p>
                    </div>

                    <div className="mt-1 max-h-64 overflow-y-auto">
                      {pages.map((page, index) => {
                        const isSeen = index <= furthestPageSeen;
                        const isCurrent = index === currentPage;

                        return (
                          <button
                            key={index}
                            type="button"
                            disabled={!isSeen}
                            onClick={() => {
                              if (!isSeen) return;

                              onPageSelect(index)
                              setShowPagePicker(false);
                            }}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                              isCurrent
                                ? "bg-purple/10 text-purple"
                                : isSeen
                                ? "text-text-primary hover:bg-bg-page"
                                : "cursor-not-allowed text-text-muted/50"
                            )}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                              {isSeen ? (
                                <Check size={14} strokeWidth={2.5} />
                              ) : (
                                <Lock size={13} />
                              )}
                            </span>

                            <span className="text-sm" style={{ fontFamily: FONT_BODY }}>
                              Page {index + 1}
                            </span>

                            {isCurrent && (
                              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide" style={{ fontFamily: FONT_BODY }}>
                                Current
                              </span>
                            )}                              
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <p 
                className="text-sm font-semibold text-purple"
                style={{ fontFamily: FONT_BODY }}
              >
                {Math.round(progress)}%
              </p>
            </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
          </div>
        </div>
      </div>

      {learningMode === "guided" && lessonCoachEnabled && (
        <LessonCoach
          page={page}
          hasTools={lessonTools.length > 0}
          onClose={() => {}}
        />
      )}

      {/* Current page */}
      <AnimatePresence mode="wait">
        <motion.div 
          className="relative" 
          key={currentPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0}}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {page.kind === "content" && (
            <ContentPageView
              page={page}
            />
          )}

          {page.kind === "question" && (
            <QuestionPageView
              page={page}
              questionAnswers={questionAnswers ?? []}
              onAnswer={onAnswer!}
              readOnly={lessonMode === LessonMode.REVIEW}
            />
          )}

          {page.kind === "activity" && (
            <ActivityPageView
              page={page}
              activityText={activityText}
              onActivityChange={onActivityChange}
              tools={lessonTools}
              readOnly={lessonMode === LessonMode.REVIEW}
            />
          )}
          {page.kind === "reflection" && (
            <ReflectionPageView
              page={page}
              reflectionText={reflectionText}
              onReflectionChange={onReflectionChange}
              readOnly={lessonMode === LessonMode.REVIEW}
            />
          )}
          {page.kind === "task" && (
            <TaskPageView
              page={page}
              taskFiles={taskFiles ?? {}}
              previewLinks={previewLinks}
              onFilesSelected={onTaskFilesSelected!}
              onFileRemove={onTaskFileRemove!}
              taskLinks={taskLinks ?? {}}
              onLinkAdd={onLinkAdd!}
              onLinkRemove={onLinkRemove!}
              lessonMode={lessonMode}
            />
          )}
          {page.kind === "ai_form" && (
            <AiFormPageView
              page={{ ...page, toolNames: lessonToolNames }}
              aiForm={aiForm!}
              onAiFormChange={onAiFormChange!}
              lessonMode={lessonMode}
            />
          )}
          {page.kind === "submit" && (
            <SubmitPageView
              hasActivity={hasActivity}
              hasReflection={hasReflection}
              hasTask={hasTask}
              hasAiForm={hasAiForm}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}