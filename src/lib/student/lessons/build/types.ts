import { CurriculumModuleBlock } from "@/lib/api/types";

export const REFLECTION_MIN = 10;
export const REFLECTION_MAX = 300;

export const FONT_HEAD = "var(--font-head)";
export const FONT_BODY = "var(--font-body)";

export enum LessonMode {
  FIRST,
  PROGRESS,
  CORRECTION,
  REVIEW
}

export enum LessonView {
  MISSION,
  LESSON,
  SUBMITTED
}

// ─────────────────────────────────────────────────────────────────────────────
// Page-building logic
//
// Pages in order:
//   • Per section: one content page + ejected activity/reflection pages
//   • One task page (if any task blocks exist)
//   • One AI form page (if any toolLink blocks exist) — before submit
//   • Submit page
// ─────────────────────────────────────────────────────────────────────────────

export type ContentPage = {
  kind: "content";
  sectionId: string | null;
  heading?: string | null;
  blocks: CurriculumModuleBlock[];
  isFirst: boolean;
};

export type EjectedPage = {
  kind: "activity" | "reflection";
  sectionId: string|null;
  block: CurriculumModuleBlock;
  moduleTitle: string;
  isTeacher?: boolean;
};

export type TaskPage = {
  kind: "task";
  blocks: CurriculumModuleBlock[]; // all task blocks across all sections
  isTeacher?: boolean;
};

export type AiFormPage = {
  kind: "ai_form";
  toolNames: string[]; // from toolLink blocks
  isTeacher?: boolean;
};

export type SubmitPage = { kind: "submit" };

export type StepperPage =
  | ContentPage
  | EjectedPage
  | TaskPage
  | AiFormPage
  | SubmitPage;