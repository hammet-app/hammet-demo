import { 
  CurriculumSection, 
  TaskFilesState,
  AiFormState
} from "@/lib/api/types";
import { StepperPage, REFLECTION_MAX, REFLECTION_MIN } from "./types";


export function wordCount(text: string): number {
  const s = text.trim();
  return s === "" ? 0 : s.split(/\s+/).length;
}

export function buildPages(
  sections: CurriculumSection[],
  moduleTitle: string,
): StepperPage[] {
  const pages: StepperPage[] = [];

  const allBlocks = sections.flatMap((s) => s.blocks);
  const taskBlocks = allBlocks.filter((b) => b.type === "task");
  const toolLinkBlocks = allBlocks.filter((b) => b.type === "toolLink");

  sections.forEach((section, sectionIdx) => {
    const sectionId = section.id ?? null
    // Content page — exclude task, activity, reflection blocks
    const contentBlocks = section.blocks.filter(
      (b) =>
        b.type !== "activity" &&
        b.type !== "reflection" &&
        b.type !== "task"
    );
    const ejected = section.blocks.filter(
      (b) => b.type === "activity" || b.type === "reflection"
    );

    pages.push({
      kind: "content",
      sectionId,
      heading: section.heading,
      blocks: contentBlocks,
      isFirst: sectionIdx === 0,
    });

    for (const block of ejected) {
      pages.push({
        kind: block.type as "activity" | "reflection",
        sectionId,
        block,
        moduleTitle,
      });
    }
  });

  // Single task page for all task blocks
  if (taskBlocks.length > 0) {
    pages.push({ kind: "task", blocks: taskBlocks });
  }

  // AI form page — only if lesson has tool links
  if (toolLinkBlocks.length > 0 || taskBlocks.length > 0) {
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
): boolean {
  if (!taskFiles || !aiForm) return false;

  if (page.kind === "activity" && page.block.required) {
    return activityText.trim().length < 5;
  }
  if (page.kind === "reflection" && page.block.required) {
    const wc = wordCount(reflectionText);
    return wc < REFLECTION_MIN || wc > REFLECTION_MAX;
  }
  if (page.kind === "task") {
    // Each required task block must have at least one file
    return page.blocks
      .filter((b) => b.required)
      .some((b) => !taskFiles[b.id]?.length);
  }
  if (page.kind === "ai_form") {
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