"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils/utils";
import {
  AlertTriangle,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  ImageOff,
  Paperclip,
  Star,
  Upload,
  X,
  Bot,
} from "lucide-react";
import type { 
  CurriculumModuleBlock, 
  CurriculumSection,
  AiFormNoReason,
  AiFormPromptChoice,
  AiFormState,
  TaskFilesState,
  TaskFileEntry,
} from "@/lib/api/types";

// ─────────────────────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────────────────────

const FONT_HEAD = "var(--font-head)";
const FONT_BODY = "var(--font-body)";

// ─────────────────────────────────────────────────────────────────────────────
// Reflection word-count constants
// ─────────────────────────────────────────────────────────────────────────────

const REFLECTION_MIN = 10;
const REFLECTION_MAX = 300;

function wordCount(text: string): number {
  const s = text.trim();
  return s === "" ? 0 : s.split(/\s+/).length;
}



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
// Page-building logic
//
// Pages in order:
//   • Per section: one content page + ejected activity/reflection pages
//   • One task page (if any task blocks exist)
//   • One AI form page (if any toolLink blocks exist) — before submit
//   • Submit page
// ─────────────────────────────────────────────────────────────────────────────

type ContentPage = {
  kind: "content";
  sectionId: string | null;
  heading?: string | null;
  blocks: CurriculumModuleBlock[];
  isFirst: boolean;
  isTeacher?: boolean;
};

type EjectedPage = {
  kind: "activity" | "reflection";
  sectionId: string|null;
  block: CurriculumModuleBlock;
  moduleTitle: string;
  isTeacher?: boolean;
};

type TaskPage = {
  kind: "task";
  blocks: CurriculumModuleBlock[]; // all task blocks across all sections
  isTeacher?: boolean;
};

type AiFormPage = {
  kind: "ai_form";
  toolNames: string[]; // from toolLink blocks
  isTeacher?: boolean;
};

type SubmitPage = { kind: "submit" };

export type StepperPage =
  | ContentPage
  | EjectedPage
  | TaskPage
  | AiFormPage
  | SubmitPage;

export function buildPages(
  sections: CurriculumSection[],
  moduleTitle: string
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
  isTeacher: boolean = false
): boolean {
  if (isTeacher || !taskFiles || !aiForm) return false;

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

// ─────────────────────────────────────────────────────────────────────────────
// Accepted file types
// ─────────────────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = [
  "image/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/*",
].join(",");

// ─────────────────────────────────────────────────────────────────────────────
// Inline text formatter (body blocks only)
// ─────────────────────────────────────────────────────────────────────────────

function formatInlineText(text?: string): string {
  if (!text) return "";
  const lines = text.split("\n");
  let result = "";
  let inUl = false;
  let inOl = false;

  for (let line of lines) {
    line = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/!(.*?)!/g, "<em>$1</em>");
    const trimmed = line.trim();

    if (trimmed.startsWith("- ")) {
      if (inOl) { result += "</ol>"; inOl = false; }
      if (!inUl) { result += `<ul class="list-disc ml-5 space-y-1.5 mt-2 mb-2">`; inUl = true; }
      result += `<li>${trimmed.replace(/^- /, "")}</li>`;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(trimmed)) {
      if (inUl) { result += "</ul>"; inUl = false; }
      if (!inOl) {
        const start = Number(trimmed.match(/^(\d+)\./)?.[1] || 1);
        result += `<ol start="${start}" class="list-decimal ml-5 space-y-1.5 mt-2 mb-2">`;
        inOl = true;
      }
      result += `<li>${trimmed.replace(/^\d+\.\s+/, "")}</li>`;
      continue;
    }
    if (!trimmed) continue;
    if (inUl) { result += "</ul>"; inUl = false; }
    if (inOl) { result += "</ol>"; inOl = false; }
    result += `<p>${trimmed}</p>`;
  }
  if (inUl) result += "</ul>";
  if (inOl) result += "</ol>";
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// YouTube embed helper
// ─────────────────────────────────────────────────────────────────────────────

function getEmbedUrl(url?: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  return url;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────────────────────────

function RequiredBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#D85A30]"
      style={{ fontFamily: FONT_BODY }}
    >
      <span className="w-[5px] h-[5px] rounded-full bg-[#D85A30]" />
      Required
    </span>
  );
}

function BlockLabel({
  children,
  className,
  required,
}: {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-1.5", className)}>
      <p
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ fontFamily: FONT_BODY }}
      >
        {children}
      </p>
      {required && <RequiredBadge />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block renderers
// ─────────────────────────────────────────────────────────────────────────────

function SubheadingBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <p
      className="text-[13px] sm:text-[14px] font-bold text-text-secondary uppercase tracking-wider leading-snug"
      style={{ fontFamily: FONT_HEAD }}
    >
      {block.content}
    </p>
  );
}

function BodyBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <div
      className="text-[16px] sm:text-[18px] text-text-secondary leading-[1.6] space-y-2"
      style={{ fontFamily: FONT_BODY }}
      dangerouslySetInnerHTML={{ __html: formatInlineText(block.content) }}
    />
  );
}

function ImageBlock({ block }: { block: CurriculumModuleBlock }) {
  const invalid = block.isValid === false || !block.url;
  if (invalid) {
    return (
      <div className="flex items-center gap-3 border border-dashed border-warning/60 bg-warning/5 rounded-[10px] px-4 py-3.5">
        <ImageOff size={18} className="text-warning shrink-0" />
        <div>
          <p className="text-[12px] font-bold text-warning" style={{ fontFamily: FONT_BODY }}>
            Image unavailable
          </p>
          {block.content && (
            <p className="text-[11px] text-text-muted mt-0.5" style={{ fontFamily: FONT_BODY }}>
              {block.content}
            </p>
          )}
        </div>
      </div>
    );
  }
  return (
    <figure className="rounded-[10px] overflow-hidden border border-border">
      <img
        src={block.url || block.content}
        alt={block.content || "Lesson image"}
        className="w-full h-auto object-cover"
        loading="lazy"
        onError={(e) => {
          const t = e.currentTarget;
          t.style.display = "none";
          const fb = t.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = "flex";
        }}
      />
      <div
        className="hidden items-center gap-2 bg-bg-page px-4 py-3 text-[12px] text-text-muted"
        aria-hidden="true"
      >
        <ImageOff size={14} />
        <span style={{ fontFamily: FONT_BODY }}>Could not load image</span>
      </div>
      {block.content && (
        <figcaption
          className="text-[11px] text-text-muted px-3.5 py-2 border-t border-border bg-bg-page"
          style={{ fontFamily: FONT_BODY }}
        >
          {block.content}
        </figcaption>
      )}
    </figure>
  );
}

function AiPromptBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <div className="bg-[#FBEAF0] border border-[#ED93B1]/60 rounded-[10px] px-3.5 py-3 flex gap-3 items-start">
      <div className="w-8 h-8 rounded-[8px] bg-[#D4537E] flex items-center justify-center shrink-0">
        <HelpCircle size={16} className="text-white" />
      </div>
      <div>
        <BlockLabel className="text-[#993556]">AI prompt tip</BlockLabel>
        <p
          className="text-[16px] sm:text-[17px] text-[#72243E] leading-[1.6]"
          style={{ fontFamily: FONT_BODY }}
        >
          {block.content}
        </p>
      </div>
    </div>
  );
}

function VideoEmbedBlock({ block }: { block: CurriculumModuleBlock }) {
  if (!block.url) {
    return (
      <div className="flex items-center gap-3 border border-dashed border-warning/60 bg-warning/5 rounded-[10px] px-4 py-3.5">
        <AlertTriangle size={16} className="text-warning shrink-0" />
        <p className="text-[12px] text-warning font-bold" style={{ fontFamily: FONT_BODY }}>
          Video URL missing
        </p>
      </div>
    );
  }
  return (
    <div className="border border-[#AFA9EC] rounded-[10px] overflow-hidden">
      <div className="aspect-video w-full">
        <iframe
          src={getEmbedUrl(block.url)}
          className="w-full h-full"
          allowFullScreen
          title={block.content || "Lesson video"}
        />
      </div>
      {block.content && (
        <p
          className="text-[12px] text-text-muted px-3.5 py-2.5 border-t border-[#AFA9EC]"
          style={{ fontFamily: FONT_BODY }}
        >
          {block.content}
        </p>
      )}
    </div>
  );
}

function ToolLinkBlock({ block }: { block: CurriculumModuleBlock }) {
  if (!block.url) {
    return (
      <div className="flex items-center gap-3 border border-dashed border-warning/60 bg-warning/5 rounded-[10px] px-4 py-3.5">
        <AlertTriangle size={16} className="text-warning shrink-0" />
        <p className="text-[12px] text-warning font-bold" style={{ fontFamily: FONT_BODY }}>
          Tool link missing
        </p>
      </div>
    );
  }
  return (
    <div className="border border-border rounded-[10px] px-3.5 py-3 flex items-center gap-3 bg-bg-card">
      <div className="w-9 h-9 rounded-[9px] bg-[#06B6D4] flex items-center justify-center shrink-0">
        <ExternalLink size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] font-bold text-[#06B6D4] truncate"
          style={{ fontFamily: FONT_BODY }}
        >
          {block.toolName || block.content}
        </p>
        <p className="text-[11px] text-text-muted truncate" style={{ fontFamily: FONT_BODY }}>
          {block.url}
        </p>
      </div>
      <a
        href={block.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[12px] font-bold bg-[#06B6D4] text-[#3B0764] px-3 py-1.5 rounded-[8px] hover:opacity-90 transition-opacity shrink-0"
        style={{ fontFamily: FONT_BODY }}
      >
        Open tool
        <ExternalLink size={11} />
      </a>
    </div>
  );
}

function ActivityBlock({
  block,
  activityText,
  onActivityChange,
  isTeacher,
}: {
  block: CurriculumModuleBlock;
  activityText: string;
  onActivityChange: (v: string) => void;
  isTeacher?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[#FAEEDA] border-l-[3px] border-[#EF9F27] rounded-r-[10px] px-4 py-3.5">
        <BlockLabel className="text-[#854F0B]" required={block.required}>
          Activity
        </BlockLabel>
        <p
          className="text-[16px] sm:text-[18px] text-[#633806] leading-[1.6]"
          style={{ fontFamily: FONT_BODY }}
        >
          {block.content}
        </p>
      </div>
      <div>
        <label
          className="block text-[13px] font-bold text-text-primary mb-2"
          style={{ fontFamily: FONT_BODY }}
        >
          Activity box
        </label>
        {!isTeacher && (
          <textarea
            value={activityText}
            onChange={(e) => onActivityChange(e.target.value)}
            placeholder="Write your activity here…"
            rows={4}
            className={cn(
              "w-full resize-y border border-border rounded-[10px] px-3.5 py-3",
              "text-[16px] sm:text-[18px] leading-[1.6]",
              "outline-none transition-colors bg-bg-card text-text-primary",
              "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
            )}
            style={{ fontFamily: FONT_BODY }}
          />
        )}
      </div>
    </div>
  );
}

function ReflectionBlock({
  block,
  reflectionText,
  onReflectionChange,
  isTeacher,
}: {
  block: CurriculumModuleBlock;
  reflectionText: string;
  onReflectionChange: (v: string) => void;
  isTeacher?: boolean;
}) {
  const wc = wordCount(reflectionText);
  const wcColor =
    wc >= REFLECTION_MIN && wc <= REFLECTION_MAX
      ? "text-[#1D9E75]"
      : wc > REFLECTION_MAX
      ? "text-[#D85A30]"
      : "text-text-muted";

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[#E6F1FB] border-l-[3px] border-[#378ADD] rounded-r-[10px] px-4 py-3.5">
        <BlockLabel className="text-[#0C447C]" required={block.required}>
          Reflection prompt
        </BlockLabel>
        <p
          className="text-[16px] sm:text-[18px] text-[#185FA5] leading-[1.6]"
          style={{ fontFamily: FONT_BODY }}
        >
          {block.content}
        </p>
      </div>
      <div>
        <label
          className="block text-[13px] font-bold text-text-primary mb-2"
          style={{ fontFamily: FONT_BODY }}
        >
          Your reflection{" "}
          <span className="font-normal text-[12px] text-text-muted">
            ({REFLECTION_MIN}–{REFLECTION_MAX} words)
          </span>
        </label>
        {!isTeacher && (
          <textarea
            value={reflectionText}
            onChange={(e) => onReflectionChange(e.target.value)}
            placeholder="Write your reflection here…"
            rows={4}
            className={cn(
              "w-full resize-y border border-border rounded-[10px] px-3.5 py-3",
              "text-[16px] sm:text-[18px] leading-[1.6]",
              "outline-none transition-colors bg-bg-card text-text-primary",
              "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
            )}
            style={{ fontFamily: FONT_BODY }}
          />
        )}
        <p
          className={cn("text-[12px] text-right mt-1.5 tabular-nums", wcColor)}
          style={{ fontFamily: FONT_BODY }}
        >
          {wc} / {REFLECTION_MAX} words
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// File pill — shows a single uploaded/queued file
// ─────────────────────────────────────────────────────────────────────────────

function FilePill({
  entry,
  onRemove,
}: {
  entry: TaskFileEntry;
  onRemove: () => void;
}) {
  const name = entry.file?.name ?? entry.url?.split("/").pop() ?? "File";
  const statusColor =
    entry.status === "done"
      ? "text-[#1D9E75]"
      : entry.status === "queued"
      ? "text-[#EF9F27]"
      : entry.status === "error"
      ? "text-[#D85A30]"
      : "text-text-muted";
  const statusLabel =
    entry.status === "done"
      ? "Uploaded"
      : entry.status === "queued"
      ? "Queued offline"
      : entry.status === "error"
      ? entry.errorMsg ?? "Error"
      : "Uploading…";

  return (
    <div className="flex items-center gap-2.5 bg-bg-page border border-border rounded-[8px] px-3 py-2">
      <Paperclip size={13} className="text-text-muted shrink-0" />
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-medium text-text-primary truncate"
          style={{ fontFamily: FONT_BODY }}
        >
          {name}
        </p>
        <p className={cn("text-[11px]", statusColor)} style={{ fontFamily: FONT_BODY }}>
          {statusLabel}
        </p>
      </div>
      <button
        onClick={onRemove}
        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-border transition-colors shrink-0"
        aria-label="Remove file"
      >
        <X size={11} className="text-text-muted" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Task page view
// ─────────────────────────────────────────────────────────────────────────────

function TaskPageView({
  page,
  taskFiles,
  onFilesSelected,
  onFileRemove,
  isTeacher,
}: {
  page: TaskPage;
  taskFiles: TaskFilesState;
  onFilesSelected: (blockId: string, files: FileList) => void;
  onFileRemove: (blockId: string, index: number) => void;
  isTeacher?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[8px] bg-[#1D9E75] flex items-center justify-center shrink-0">
          <CheckSquare size={15} className="text-white" />
        </div>
        <h2
          className="text-[18px] sm:text-[20px] font-bold text-text-primary leading-snug"
          style={{ fontFamily: FONT_HEAD }}
        >
          Tasks
        </h2>
      </div>

      {page.blocks.map((block) => {
        const entries = taskFiles[block.id] ?? [];
        const inputId = `task-upload-${block.id}`;

        return (
          <div key={block.id} className="flex flex-col gap-3">
            {/* Task instruction */}
            <div className="bg-[#E1F5EE] border border-[#5DCAA5]/60 rounded-[10px] px-4 py-3.5 flex gap-3 items-start">
              <div className="w-7 h-7 rounded-[7px] bg-[#1D9E75] flex items-center justify-center shrink-0 mt-0.5">
                <CheckSquare size={13} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <BlockLabel className="text-[#0F6E56]" required={block.required}>
                  Task
                </BlockLabel>
                <p
                  className="text-[15px] sm:text-[17px] text-[#085041] leading-[1.6]"
                  style={{ fontFamily: FONT_BODY }}
                >
                  {block.content}
                </p>
              </div>
            </div>

            {/* Upload area — students only */}
            {!isTeacher && (
              <div className="flex flex-col gap-2">
                <label
                  className="block text-[13px] font-bold text-text-primary"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Upload your work
                  <span className="font-normal text-[12px] text-text-muted ml-1.5">
                    (images, documents, videos)
                  </span>
                </label>

                {/* File list */}
                {entries.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {entries.map((entry, i) => (
                      <FilePill
                        key={i}
                        entry={entry}
                        onRemove={() => onFileRemove(block.id, i)}
                      />
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <label
                  htmlFor={inputId}
                  className={cn(
                    "flex items-center justify-center gap-2 border-2 border-dashed border-[#5DCAA5]/60",
                    "rounded-[10px] px-4 py-3.5 cursor-pointer transition-colors",
                    "hover:border-[#1D9E75] hover:bg-[#E1F5EE]/40",
                    "text-[13px] font-bold text-[#1D9E75]"
                  )}
                  style={{ fontFamily: FONT_BODY }}
                >
                  <Upload size={15} />
                  {entries.length === 0 ? "Choose files" : "Add more files"}
                  <input
                    id={inputId}
                    type="file"
                    multiple
                    accept={ACCEPTED_TYPES}
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        onFilesSelected(block.id, e.target.files);
                        // Reset so same file can be re-selected
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Form page view
// ─────────────────────────────────────────────────────────────────────────────

const NO_REASON_OPTIONS: { value: AiFormNoReason; label: string }[] = [
  { value: "forgot", label: "I forgot to use it" },
  { value: "didnt_need", label: "I didn't need it" },
  { value: "no_access", label: "I didn't have access" },
  { value: "not_comfortable", label: "I wasn't comfortable using it" },
  { value: "other", label: "Other" },
];

const STAR_LABELS = ["Poor", "Fair", "Good", "Great", "Excellent"];

function AiFormPageView({
  page,
  aiForm,
  onAiFormChange,
  isTeacher,
}: {
  page: AiFormPage;
  aiForm: AiFormState;
  onAiFormChange: (next: AiFormState) => void;
  isTeacher?: boolean;
}) {
  const set = (patch: Partial<AiFormState>) =>
    onAiFormChange({ ...aiForm, ...patch });

  const toolOptions = [
    ...page.toolNames.map((name) => ({ value: name, label: name })),
    { value: "other", label: "Other" },
  ];

  // Word count helpers
  const noOtherWC = wordCount(aiForm.noReasonOther);
  const toolOtherWC = wordCount(aiForm.toolOther);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[8px] bg-[#5B21B6] flex items-center justify-center shrink-0">
          <Bot size={15} className="text-white" />
        </div>
        <div>
          <h2
            className="text-[18px] sm:text-[20px] font-bold text-text-primary leading-snug"
            style={{ fontFamily: FONT_HEAD }}
          >
            AI Usage Check-in
          </h2>
          <p className="text-[12px] text-text-muted" style={{ fontFamily: FONT_BODY }}>
            This lesson included AI tools. Tell us how it went.
          </p>
        </div>
      </div>

      {/* Q1: Did you use AI? */}
      <AiFormQuestion label="Did you use AI for this lesson?" required>
        <div className="flex gap-2">
          {[
            { value: true, label: "Yes, I did" },
            { value: false, label: "No, I didn't" },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() =>
                set({
                  used: opt.value,
                  // reset downstream on toggle
                  noReason: null,
                  noReasonOther: "",
                  toolUsed: "",
                  toolOther: "",
                  taskDesc: "",
                  promptChoice: null,
                  editedPrompt: "",
                  rating: null,
                  ratingComment: "",
                })
              }
              className={cn(
                "flex-1 px-3 py-2.5 rounded-[10px] border text-[14px] font-bold transition-all",
                aiForm.used === opt.value
                  ? "bg-[#3B0764] border-[#3B0764] text-white"
                  : "border-border bg-bg-card text-text-primary hover:border-[#5B21B6]/50"
              )}
              style={{ fontFamily: FONT_BODY }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </AiFormQuestion>

      {/* No branch: why not? */}
      {aiForm.used === false && (
        <AiFormQuestion label="Why didn't you use AI?" required>
          <div className="flex flex-col gap-1.5">
            {NO_REASON_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  set({ noReason: opt.value, noReasonOther: "" })
                }
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border text-left transition-all",
                  aiForm.noReason === opt.value
                    ? "bg-[#3B0764] border-[#3B0764] text-white"
                    : "border-border bg-bg-card text-text-primary hover:border-[#5B21B6]/50"
                )}
                style={{ fontFamily: FONT_BODY }}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                    aiForm.noReason === opt.value
                      ? "border-white bg-white"
                      : "border-current"
                  )}
                >
                  {aiForm.noReason === opt.value && (
                    <span className="w-2 h-2 rounded-full bg-[#3B0764]" />
                  )}
                </span>
                <span className="text-[14px]">{opt.label}</span>
              </button>
            ))}
          </div>

          {aiForm.noReason === "other" && (
            <div className="mt-2">
              <textarea
                value={aiForm.noReasonOther}
                onChange={(e) => set({ noReasonOther: e.target.value })}
                placeholder="Briefly explain (max 20 words)…"
                rows={2}
                className={cn(
                  "w-full resize-none border border-border rounded-[10px] px-3.5 py-2.5",
                  "text-[15px] leading-[1.6] outline-none transition-colors bg-bg-card text-text-primary",
                  "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10",
                  noOtherWC > 20 && "border-[#D85A30] focus:border-[#D85A30]"
                )}
                style={{ fontFamily: FONT_BODY }}
              />
              <p
                className={cn(
                  "text-[11px] text-right mt-1 tabular-nums",
                  noOtherWC > 20 ? "text-[#D85A30]" : "text-text-muted"
                )}
                style={{ fontFamily: FONT_BODY }}
              >
                {noOtherWC} / 20 words
              </p>
            </div>
          )}
        </AiFormQuestion>
      )}

      {/* Yes branch */}
      {aiForm.used === true && (
        <>
          {/* Q2a: Which AI? */}
          <AiFormQuestion label="Which AI tool did you use?" required>
            <div className="flex flex-col gap-1.5">
              {toolOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    set({ toolUsed: opt.value, toolOther: "" })
                  }
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border text-left transition-all",
                    aiForm.toolUsed === opt.value
                      ? "bg-[#3B0764] border-[#3B0764] text-white"
                      : "border-border bg-bg-card text-text-primary hover:border-[#5B21B6]/50"
                  )}
                  style={{ fontFamily: FONT_BODY }}
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                      aiForm.toolUsed === opt.value
                        ? "border-white bg-white"
                        : "border-current"
                    )}
                  >
                    {aiForm.toolUsed === opt.value && (
                      <span className="w-2 h-2 rounded-full bg-[#3B0764]" />
                    )}
                  </span>
                  <span className="text-[14px]">{opt.label}</span>
                </button>
              ))}
            </div>

            {aiForm.toolUsed === "other" && (
              <div className="mt-2">
                <input
                  type="text"
                  value={aiForm.toolOther}
                  onChange={(e) => set({ toolOther: e.target.value })}
                  placeholder="Name the AI tool (max 10 words)…"
                  className={cn(
                    "w-full border border-border rounded-[10px] px-3.5 py-2.5",
                    "text-[15px] leading-[1.6] outline-none transition-colors bg-bg-card text-text-primary",
                    "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10",
                    toolOtherWC > 10 && "border-[#D85A30] focus:border-[#D85A30]"
                  )}
                  style={{ fontFamily: FONT_BODY }}
                />
                <p
                  className={cn(
                    "text-[11px] text-right mt-1 tabular-nums",
                    toolOtherWC > 10 ? "text-[#D85A30]" : "text-text-muted"
                  )}
                  style={{ fontFamily: FONT_BODY }}
                >
                  {toolOtherWC} / 10 words
                </p>
              </div>
            )}
          </AiFormQuestion>

          {/* Q2b: What did you use it for? */}
          <AiFormQuestion label="What did you use it for?" required>
            <textarea
              value={aiForm.taskDesc}
              onChange={(e) => set({ taskDesc: e.target.value })}
              placeholder="Describe what you asked the AI to help with…"
              rows={3}
              className={cn(
                "w-full resize-y border border-border rounded-[10px] px-3.5 py-2.5",
                "text-[15px] leading-[1.6] outline-none transition-colors bg-bg-card text-text-primary",
                "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
              )}
              style={{ fontFamily: FONT_BODY }}
            />
          </AiFormQuestion>

          {/* Q3: Prompts */}
          <AiFormQuestion label="What prompts did you use?" required>
            <div className="flex flex-col gap-1.5">
              {[
                {
                  value: "same" as AiFormPromptChoice,
                  label: "The same one that was given",
                },
                {
                  value: "edited" as AiFormPromptChoice,
                  label: "I edited the prompt to…",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    set({ promptChoice: opt.value, editedPrompt: "" })
                  }
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border text-left transition-all",
                    aiForm.promptChoice === opt.value
                      ? "bg-[#3B0764] border-[#3B0764] text-white"
                      : "border-border bg-bg-card text-text-primary hover:border-[#5B21B6]/50"
                  )}
                  style={{ fontFamily: FONT_BODY }}
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                      aiForm.promptChoice === opt.value
                        ? "border-white bg-white"
                        : "border-current"
                    )}
                  >
                    {aiForm.promptChoice === opt.value && (
                      <span className="w-2 h-2 rounded-full bg-[#3B0764]" />
                    )}
                  </span>
                  <span className="text-[14px]">{opt.label}</span>
                </button>
              ))}
            </div>

            {aiForm.promptChoice === "edited" && (
              <div className="mt-2">
                <textarea
                  value={aiForm.editedPrompt}
                  onChange={(e) => set({ editedPrompt: e.target.value })}
                  placeholder="Paste or write the prompt you used…"
                  rows={3}
                  className={cn(
                    "w-full resize-y border border-border rounded-[10px] px-3.5 py-2.5",
                    "text-[15px] leading-[1.6] outline-none transition-colors bg-bg-card text-text-primary",
                    "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
                  )}
                  style={{ fontFamily: FONT_BODY }}
                />
              </div>
            )}
          </AiFormQuestion>

          {/* Q4: Experience rating */}
          <AiFormQuestion label="How was your experience using the AI?" required>
            <div className="flex gap-2 justify-between">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => set({ rating: star })}
                  className="flex flex-col items-center gap-1 flex-1 group"
                  aria-label={`Rate ${star} — ${STAR_LABELS[star - 1]}`}
                >
                  <Star
                    size={26}
                    className={cn(
                      "transition-all",
                      (aiForm.rating ?? 0) >= star
                        ? "fill-[#EF9F27] text-[#EF9F27]"
                        : "text-border group-hover:text-[#EF9F27]/60"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-bold transition-colors",
                      (aiForm.rating ?? 0) >= star
                        ? "text-[#EF9F27]"
                        : "text-text-muted"
                    )}
                    style={{ fontFamily: FONT_BODY }}
                  >
                    {STAR_LABELS[star - 1]}
                  </span>
                </button>
              ))}
            </div>

            {/* Optional comment */}
            <div className="mt-3">
              <label
                className="block text-[12px] text-text-muted mb-1.5"
                style={{ fontFamily: FONT_BODY }}
              >
                Any other comments? <span className="italic">(optional)</span>
              </label>
              <textarea
                value={aiForm.ratingComment}
                onChange={(e) => set({ ratingComment: e.target.value })}
                placeholder="Share anything else about your experience…"
                rows={2}
                className={cn(
                  "w-full resize-none border border-border rounded-[10px] px-3.5 py-2.5",
                  "text-[15px] leading-[1.6] outline-none transition-colors bg-bg-card text-text-primary",
                  "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
                )}
                style={{ fontFamily: FONT_BODY }}
              />
            </div>
          </AiFormQuestion>
        </>
      )}
    </div>
  );
}

function AiFormQuestion({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p
          className="text-[14px] font-bold text-text-primary leading-snug"
          style={{ fontFamily: FONT_BODY }}
        >
          {label}
        </p>
        {required && <RequiredBadge />}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ContentBlock dispatcher — task excluded (has its own page)
// ─────────────────────────────────────────────────────────────────────────────

function ContentBlock({ block }: { block: CurriculumModuleBlock }) {
  switch (block.type) {
    case "subheading":  return <SubheadingBlock block={block} />;
    case "body":        return <BodyBlock block={block} />;
    case "image":       return <ImageBlock block={block} />;
    case "aiPrompt":   return <AiPromptBlock block={block} />;
    case "toolLink":   return <ToolLinkBlock block={block} />;
    case "videoEmbed": return <VideoEmbedBlock block={block} />;
    default:            return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page renderers
// ─────────────────────────────────────────────────────────────────────────────

function IntroCard({
  title,
  description,
  weekNumber,
  term,
  toolNames,
}: {
  title: string;
  description?: string;
  weekNumber: number;
  term: number;
  toolNames?: string[];
}) {
  return (
    <div className="bg-[#3B0764] rounded-[14px] px-5 py-4 relative overflow-hidden">
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#06B6D4]/20 pointer-events-none" />
      <div className="absolute -bottom-4 left-8 w-16 h-16 rounded-full bg-[#5B21B6]/40 pointer-events-none" />
      <div className="relative z-10 flex flex-wrap gap-1.5 mb-2.5">
        <span className="text-[11px] font-bold px-2.5 py-[3px] rounded-full bg-white/[0.14] text-white/90" style={{ fontFamily: FONT_BODY }}>
          Week {weekNumber} · Term {term}
        </span>
        {toolNames?.map((name, i) => (
          <span key={i} className="text-[11px] font-bold px-2.5 py-[3px] rounded-full bg-[#06B6D4]/25 text-[#a5f3fc]" style={{ fontFamily: FONT_BODY }}>
            {name}
          </span>
        ))}
      </div>
      <h1 className="relative z-10 text-[20px] sm:text-[22px] font-bold text-white leading-snug" style={{ fontFamily: FONT_HEAD }}>
        {title}
      </h1>
      {description && (
        <p className="relative z-10 text-[13px] sm:text-[14px] text-white/65 mt-1.5 leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
          {description}
        </p>
      )}
    </div>
  );
}

function ContentPageView({
  page,
  introProps,
}: {
  page: ContentPage;
  introProps?: {
    title: string;
    description?: string;
    weekNumber: number;
    term: number;
    toolNames?: string[];
  };
}) {
  return (
    <div className="flex flex-col gap-3">
      {page.isFirst && introProps && <IntroCard {...introProps} />}
      {page.heading && (
        <h2
          className="text-[18px] sm:text-[20px] font-bold text-[#534AB7] pb-2 border-b-2 border-[#EEEDFE] leading-snug"
          style={{ fontFamily: FONT_HEAD }}
        >
          {page.heading}
        </h2>
      )}
      {page.blocks.map((block, i) => (
        <ContentBlock key={i} block={block} />
      ))}
    </div>
  );
}

function ActivityPageView({
  page,
  activityText,
  onActivityChange,
  isTeacher,
}: {
  page: EjectedPage;
  activityText: string;
  onActivityChange: (v: string) => void;
  isTeacher?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2
        className="text-[16px] sm:text-[18px] font-bold text-text-primary leading-snug"
        style={{ fontFamily: FONT_HEAD }}
      >
        {page.moduleTitle}
      </h2>
      <div className="bg-[#FAEEDA] border-l-[3px] border-[#EF9F27] rounded-r-[10px] px-3.5 py-3">
        <BlockLabel className="text-[#854F0B]" required={page.block.required}>Activity</BlockLabel>
        <p className="text-[16px] sm:text-[18px] text-[#633806] leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
          {page.block.content}
        </p>
      </div>
      {!isTeacher && (
        <div>
          <label className="block text-[13px] font-bold text-text-primary mb-1.5" style={{ fontFamily: FONT_BODY }}>
            Activity box
          </label>
          <textarea
            value={activityText}
            onChange={(e) => onActivityChange(e.target.value)}
            placeholder="Write your activity here…"
            rows={4}
            className={cn(
              "w-full resize-y border border-border rounded-[10px] px-3.5 py-2.5",
              "text-[16px] sm:text-[18px] leading-[1.6]",
              "outline-none transition-colors bg-bg-card text-text-primary",
              "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
            )}
            style={{ fontFamily: FONT_BODY }}
          />
        </div>
      )}
    </div>
  );
}

function ReflectionPageView({
  page,
  reflectionText,
  onReflectionChange,
  isTeacher,
}: {
  page: EjectedPage;
  reflectionText: string;
  onReflectionChange: (v: string) => void;
  isTeacher?: boolean;
}) {
  const wc = wordCount(reflectionText);
  const wcColor =
    wc >= REFLECTION_MIN && wc <= REFLECTION_MAX
      ? "text-[#1D9E75]"
      : wc > REFLECTION_MAX
      ? "text-[#D85A30]"
      : "text-text-muted";

  return (
    <div className="flex flex-col gap-3">
      <h2
        className="text-[16px] sm:text-[18px] font-bold text-text-primary leading-snug"
        style={{ fontFamily: FONT_HEAD }}
      >
        {page.moduleTitle}
      </h2>
      <div className="bg-[#E6F1FB] border-l-[3px] border-[#378ADD] rounded-r-[10px] px-3.5 py-3">
        <BlockLabel className="text-[#0C447C]" required={page.block.required}>Reflection prompt</BlockLabel>
        <p className="text-[16px] sm:text-[18px] text-[#185FA5] leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
          {page.block.content}
        </p>
      </div>
      {!isTeacher && (
        <div>
          <label className="block text-[13px] font-bold text-text-primary mb-1.5" style={{ fontFamily: FONT_BODY }}>
            Your reflection{" "}
            <span className="font-normal text-[12px] text-text-muted">({REFLECTION_MIN}–{REFLECTION_MAX} words)</span>
          </label>
          <textarea
            value={reflectionText}
            onChange={(e) => onReflectionChange(e.target.value)}
            placeholder="Write your reflection here…"
            rows={4}
            className={cn(
              "w-full resize-y border border-border rounded-[10px] px-3.5 py-2.5",
              "text-[16px] sm:text-[18px] leading-[1.6]",
              "outline-none transition-colors bg-bg-card text-text-primary",
              "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
            )}
            style={{ fontFamily: FONT_BODY }}
          />
          <p className={cn("text-[12px] text-right mt-1 tabular-nums", wcColor)} style={{ fontFamily: FONT_BODY }}>
            {wc} / {REFLECTION_MAX} words
          </p>
        </div>
      )}
    </div>
  );
}

function SubmitPageView({
  hasActivity,
  hasReflection,
  hasTask,
  hasAiForm,
  isTeacher,
}: {
  hasActivity: boolean;
  hasReflection: boolean;
  hasTask: boolean;
  hasAiForm: boolean;
  isTeacher?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-8 px-4">
      <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center">
        <Check size={28} className="text-[#1D9E75]" strokeWidth={2.5} />
      </div>
      <div>
        <h2
          className="text-[20px] sm:text-[22px] font-bold text-text-primary mb-2 leading-snug"
          style={{ fontFamily: FONT_HEAD }}
        >
          {isTeacher ? "End of lesson" : "Lesson complete!"}
        </h2>
        <p
          className="text-[15px] sm:text-[16px] text-text-secondary leading-[1.6]"
          style={{ fontFamily: FONT_BODY }}
        >
          {isTeacher
            ? "You have reached the end of this lesson."
            : "Your work is saved offline and will submit when you reconnect."}
        </p>
      </div>
      {(hasActivity || hasReflection || hasTask || hasAiForm) && !isTeacher && (
        <div className="w-full bg-bg-page border border-border rounded-[10px] px-4 py-3.5 text-left">
          <p
            className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2.5"
            style={{ fontFamily: FONT_BODY }}
          >
            Summary
          </p>
          {hasActivity && (
            <SummaryRow label="Activity" />
          )}
          {hasReflection && (
            <SummaryRow label="Reflection" />
          )}
          {hasTask && (
            <SummaryRow label="Task uploads" />
          )}
          {hasAiForm && (
            <SummaryRow label="AI check-in" />
          )}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label }: { label: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[14px] text-text-secondary" style={{ fontFamily: FONT_BODY }}>
        {label}
      </span>
      <span className="text-[13px] font-bold text-[#1D9E75]" style={{ fontFamily: FONT_BODY }}>
        Completed
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LessonStepper
// ─────────────────────────────────────────────────────────────────────────────

export interface LessonStepperProps {
  title: string;
  description?: string;
  weekNumber: number;
  term: number;
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
  /** AI form state */
  aiForm?: AiFormState;
  onAiFormChange?: (next: AiFormState) => void;
  savedOffline?: boolean;
  onPrevLesson?: () => void;
  currentPage: number;
  onSwipeNext: () => void;
  onSwipeBack: () => void;
  className?: string;
  isTeacher?: boolean;
}

export function LessonStepper({
  title,
  description,
  weekNumber,
  term,
  toolNames,
  sections,
  activityText,
  onActivityChange,
  reflectionText,
  onReflectionChange,
  taskFiles,
  onTaskFilesSelected,
  onTaskFileRemove,
  aiForm,
  onAiFormChange,
  savedOffline = false,
  onPrevLesson,
  currentPage,
  onSwipeNext,
  onSwipeBack,
  className,
  isTeacher,
}: LessonStepperProps) {
  const pages = buildPages(sections, title);
  const total = pages.length;
  const touchStartX = useRef<number | null>(null);

  const allBlocks = sections.flatMap((s) => s.blocks);
  const hasActivity = allBlocks.some((b) => b.type === "activity");
  const hasReflection = allBlocks.some((b) => b.type === "reflection");
  const hasTask = !isTeacher && allBlocks.some((b) => b.type === "task");
  const hasAiForm = !isTeacher && allBlocks.some((b) => b.type === "toolLink");

  const introProps = { title, description, weekNumber, term, toolNames };
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
      className={cn("w-full max-w-[680px] mx-auto flex flex-col gap-3", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-3 px-0.5">
        <div className="flex-1 h-[5px] bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5B21B6] rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span
          className="text-[12px] text-text-muted whitespace-nowrap tabular-nums"
          style={{ fontFamily: FONT_BODY }}
        >
          {currentPage + 1} of {total}
        </span>
      </div>

      {/* Current page */}
      <div>
        {page.kind === "content" && (
          <ContentPageView
            page={page}
            introProps={page.isFirst ? introProps : undefined}
          />
        )}
        {page.kind === "activity" && (
          <ActivityPageView
            page={page}
            activityText={activityText}
            onActivityChange={onActivityChange}
            isTeacher={isTeacher}
          />
        )}
        {page.kind === "reflection" && (
          <ReflectionPageView
            page={page}
            reflectionText={reflectionText}
            onReflectionChange={onReflectionChange}
            isTeacher={isTeacher}
          />
        )}
        {page.kind === "task" && !isTeacher && (
          <TaskPageView
            page={page}
            taskFiles={taskFiles ?? {}}
            onFilesSelected={onTaskFilesSelected!}
            onFileRemove={onTaskFileRemove!}
            isTeacher={isTeacher}
          />
        )}
        {page.kind === "ai_form" && !isTeacher && (
          <AiFormPageView
            page={{ ...page, toolNames: lessonToolNames }}
            aiForm={aiForm!}
            onAiFormChange={onAiFormChange!}
            isTeacher={isTeacher}
          />
        )}
        {page.kind === "submit" && (
          <SubmitPageView
            hasActivity={hasActivity}
            hasReflection={hasReflection}
            hasTask={hasTask}
            hasAiForm={hasAiForm}
            isTeacher={isTeacher}
          />
        )}
      </div>
    </div>
  );
}