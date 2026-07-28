"use client";

import {  useRef, useEffect } from "react";
import { cn } from "@/lib/utils/utils";
import { 
  buildPages, LessonMode
} from "@/lib/student/lessons/build";
import type { 
  CurriculumSection,
  AiFormState,
  TaskFilesState,
  TaskLinksState,
  PreviewLinkState
} from "@/lib/api/types";
import { AiFormPageView } from "./blocks";
import { TaskPageView, ContentPageView, ActivityPageView, SubmitPageView, ReflectionPageView } from "./views";
import { AnimatePresence, motion } from "motion/react";

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
  /** AI form state */
  aiForm?: AiFormState;
  onAiFormChange?: (next: AiFormState) => void;
  savedOffline?: boolean;
  onPrevLesson?: () => void;
  currentPage: number;
  onSwipeNext: () => void;
  onSwipeBack: () => void;
  className?: string;
  lessonMode: number;
}

export function LessonStepper({
  title,
  description,
  weekNumber,
  toolNames,
  sections,
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
  aiForm,
  onAiFormChange,
  savedOffline = false,
  onPrevLesson,
  currentPage,
  onSwipeNext,
  onSwipeBack,
  className,
  lessonMode
}: LessonStepperProps) {
  const pages = buildPages(sections, title);
  const total = pages.length;
  const touchStartX = useRef<number | null>(null);

  const allBlocks = sections.flatMap((s) => s.blocks);
  const hasActivity = allBlocks.some((b) => b.type === "activity");
  const hasReflection = allBlocks.some((b) => b.type === "reflection");
  const hasTask =  allBlocks.some((b) => b.type === "task");
  const hasAiForm =  allBlocks.some((b) => b.type === "toolLink");

  const page = pages[currentPage];

  // Collect tool names from toolLink blocks for AI form
  const lessonToolNames = allBlocks
    .filter((b) => b.type === "toolLink")
    .map((b) => b.toolName ?? b.content ?? "")
    .filter(Boolean);

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
        <div className="flex flex-col gap-2">
          <p 
            className="text-xs font-semibold uppercase tracking-widest text-purple"
            style={{ fontFamily: FONT_BODY }}
          >
            Week {weekNumber}
          </p>
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
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <p
                className="text-sm font-medium text-text-secondary"
                style={{ fontFamily: FONT_BODY }}
              >
                Section {currentPage + 1} of {total}
              </p>
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

          {page.kind === "activity" && (
            <ActivityPageView
              page={page}
              activityText={activityText}
              onActivityChange={onActivityChange}
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