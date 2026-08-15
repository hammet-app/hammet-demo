import { 
  CurriculumModuleBlock,
  CurriculumQuestion,
  CurriculumSection, 
  TaskFilesState,
  AiFormState,
  QuestionAnswer,
  CurriculumSectionItem
} from "@/lib/api/types";
import { StepperPage, REFLECTION_MAX, REFLECTION_MIN } from "./types";


export function wordCount(text: string): number {
  const s = text.trim();
  return s === "" ? 0 : s.split(/\s+/).length;
}

export function buildPages(
  sections: CurriculumSection[],
  moduleTitle: string,
  enableQuestions: boolean = false
): StepperPage[] {
  const pages: StepperPage[] = [];

  const allItems = sections.flatMap((s) => s.blocks);

  const taskBlocks = allItems.filter(
    (b): b is CurriculumModuleBlock => b.type === "task"
  );

  const toolLinkBlocks = allItems.filter(
    (b): b is CurriculumModuleBlock => b.type === "toolLink"
  );

  sections.forEach((section, sectionIdx) => {
    const sectionId = section.id ?? null;

    let contentItems: CurriculumSectionItem[] = [];
    let questionItems: CurriculumQuestion[] = [];

    const flushContent = () => {
      if (contentItems.length === 0) return;

      pages.push({
        kind: "content",
        sectionId,
        heading: section.heading,
        items: contentItems,
        isFirst: sectionIdx === 0 && pages.length === 0,
      });

      contentItems = [];
    };

    const flushQuestions = () => {
      if (questionItems.length === 0) return;

      pages.push({
        kind: "question",
        sectionId,
        questions: questionItems,
      });

      questionItems = [];
    };

    for (const block of section.blocks) {
        if (block.type === "question") {
          if (!enableQuestions) continue; 

          flushContent();
          questionItems.push(block);
          continue;
        }
      
      
        // Questions are only grouped when they are consecutive.
        flushQuestions();


      if (
        block.type === "activity" ||
        block.type === "reflection"
      ) {
        flushContent();

        pages.push({
          kind: block.type,
          sectionId,
          block,
          moduleTitle,
        });

        continue;
      }

      if (
        block.type === "task" ||
        block.type === "toolLink"
      ) {
        continue;
      }

      contentItems.push(block);
    }

    flushContent();
    flushQuestions();
  });

  if (taskBlocks.length > 0) {
    pages.push({
      kind: "task",
      blocks: taskBlocks,
    });
  }

  if (toolLinkBlocks.length > 0) {
    pages.push({
      kind: "ai_form",
      toolNames: toolLinkBlocks
        .map((b) => b.toolName ?? b.content ?? "")
        .filter(Boolean),
    });
  }

  pages.push({ kind: "submit" });

  return pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-page blocking logic
// ─────────────────────────────────────────────────────────────────────────────

export function isPageBlocked(
  page: StepperPage,
  activityText: string,
  reflectionText: string,
  taskFiles: TaskFilesState| null,
  aiForm: AiFormState | null,
  questionAnswers?: QuestionAnswer[],
): boolean {

  if (page.kind === "question") {
    return page.questions.some(
      (question) =>
        (question.required ?? true) &&
        !questionAnswers?.some(
          (answer) => answer.questionId === question.id
        )
    );
  }

  if (page.kind === "activity" && page.block.required) {
    return activityText.trim().length < 5;
  }
  if (page.kind === "reflection" && page.block.required) {
    const wc = wordCount(reflectionText);
    return wc < REFLECTION_MIN || wc > REFLECTION_MAX;
  }
  if (page.kind === "task") {
    if (!taskFiles) return true;
    // Each required task block must have at least one file
    return page.blocks
      .filter((b) => b.required)
      .some((b) => !taskFiles[b.id]?.length);
  }
  if (page.kind === "ai_form") {
    if (!aiForm) return true;
    return !isAiFormComplete(aiForm);
  }
  return false;
}

function isAiFormComplete(f: AiFormState): boolean {
  if (f.used === null) return false;
  if (f.used === false) {
    if (!f.noReason) return false;
    if (f.noReason === "other" && wordCount(f.noReasonOther) === 0) return false;
  }
  if (f.used === true) {
    if (!f.toolUsed) return false;
    if (f.toolUsed === "other" && wordCount(f.toolOther) === 0) return false;
    if (!f.taskDesc.trim()) return false;
    if (!f.promptChoice) return false;
    if (f.promptChoice === "edited" && !f.editedPrompt.trim()) return false;
    if (f.rating === null) return false;
  }
  return true;
}