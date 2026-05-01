"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils/utils";
import {
  ExternalLink,
  CheckSquare,
  HelpCircle,
  AlertTriangle,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import type { CurriculumModuleBlock } from "@/lib/api/api-types";

// ─────────────────────────────────────────────────────────────────────────────
// Typography constants
// ─────────────────────────────────────────────────────────────────────────────

const FONT_HEAD = "var(--font-head)"; // Nunito Bold — apply via CSS var in globals
const FONT_BODY = "var(--font-body)"; // Atkinson Hyperlegible — apply via CSS var in globals

// ─────────────────────────────────────────────────────────────────────────────
// Page-grouping logic
//
// Rules:
//   1. Page 0 is always the module intro (header card).
//   2. Each `heading` block starts a new content page.
//      All subsequent non-heading, non-interactive blocks belong to that page.
//   3. `activity`, `reflection`, and `task` blocks always break onto their
//      own individual page, regardless of position.
//   4. `subheading` follows its parent heading (treated as content).
//   5. Blocks before the first heading are ignored (Angel always starts
//      with a heading).
// ─────────────────────────────────────────────────────────────────────────────

type InteractiveType = "activity" | "reflection" | "task";
const INTERACTIVE: InteractiveType[] = ["activity", "reflection", "task"];

export type StepperPage =
  | { kind: "intro" }
  | { kind: "content"; blocks: CurriculumModuleBlock[] }
  | { kind: "interactive"; block: CurriculumModuleBlock; type: InteractiveType }
  | { kind: "submit" };

export function buildPages(blocks: CurriculumModuleBlock[]): StepperPage[] {
  const pages: StepperPage[] = [{ kind: "intro" }];

  let currentContent: CurriculumModuleBlock[] | null = null;

  for (const block of blocks) {
    if (INTERACTIVE.includes(block.type as InteractiveType)) {
      // Flush any open content page first
      if (currentContent && currentContent.length > 0) {
        pages.push({ kind: "content", blocks: currentContent });
        currentContent = null;
      }
      pages.push({
        kind: "interactive",
        block,
        type: block.type as InteractiveType,
      });
      continue;
    }

    if (block.type === "heading") {
      // Flush previous content page and start a new one
      if (currentContent && currentContent.length > 0) {
        pages.push({ kind: "content", blocks: currentContent });
      }
      currentContent = [block];
      continue;
    }

    // body, subheading, image, video_embed, tool_link, ai_prompt
    if (currentContent !== null) {
      currentContent.push(block);
    }
    // blocks before the first heading are discarded (per spec)
  }

  // Flush final content page
  if (currentContent && currentContent.length > 0) {
    pages.push({ kind: "content", blocks: currentContent });
  }

  pages.push({ kind: "submit" });
  return pages;
}

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
      if (!inOl) { result += `<ol class="list-decimal ml-5 space-y-1.5 mt-2 mb-2">`; inOl = true; }
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
// Required badge
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

// ─────────────────────────────────────────────────────────────────────────────
// Individual block renderers
// ─────────────────────────────────────────────────────────────────────────────

function HeadingBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <h2
      className="text-[18px] sm:text-[20px] font-bold text-[#534AB7] pb-2 border-b-2 border-[#EEEDFE] leading-snug"
      style={{ fontFamily: FONT_HEAD }}
    >
      {block.content}
    </h2>
  );
}

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
  const invalid = block.is_valid === false || !block.url;
  if (invalid) {
    return (
      <div className="flex items-center gap-3 border border-dashed border-warning/60 bg-warning/5 rounded-[10px] px-4 py-3.5">
        <ImageOff size={18} className="text-warning shrink-0" />
        <div>
          <p className="text-[12px] font-bold text-warning" style={{ fontFamily: FONT_BODY }}>Image unavailable</p>
          {block.content && <p className="text-[11px] text-text-muted mt-0.5" style={{ fontFamily: FONT_BODY }}>{block.content}</p>}
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
      <div className="hidden items-center gap-2 bg-bg-page px-4 py-3 text-[12px] text-text-muted" aria-hidden="true">
        <ImageOff size={14} />
        <span style={{ fontFamily: FONT_BODY }}>Could not load image</span>
      </div>
      {block.content && (
        <figcaption className="text-[11px] text-text-muted px-3.5 py-2 border-t border-border bg-bg-page" style={{ fontFamily: FONT_BODY }}>
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
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#993556] mb-1" style={{ fontFamily: FONT_BODY }}>
          AI prompt tip
        </p>
        <p className="text-[16px] sm:text-[17px] text-[#72243E] leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
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
        <p className="text-[12px] text-warning font-bold" style={{ fontFamily: FONT_BODY }}>Video URL missing</p>
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
        <p className="text-[12px] text-text-muted px-3.5 py-2.5 border-t border-[#AFA9EC]" style={{ fontFamily: FONT_BODY }}>
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
        <p className="text-[12px] text-warning font-bold" style={{ fontFamily: FONT_BODY }}>Tool link missing</p>
      </div>
    );
  }
  return (
    <div className="border border-border rounded-[10px] px-3.5 py-3 flex items-center gap-3 bg-bg-card">
      <div className="w-9 h-9 rounded-[9px] bg-[#06B6D4] flex items-center justify-center shrink-0">
        <ExternalLink size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-[#06B6D4] truncate" style={{ fontFamily: FONT_BODY }}>
          {block.tool_name || block.content}
        </p>
        <p className="text-[11px] text-text-muted truncate" style={{ fontFamily: FONT_BODY }}>{block.url}</p>
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

// ─────────────────────────────────────────────────────────────────────────────
// Content block dispatcher (non-interactive)
// ─────────────────────────────────────────────────────────────────────────────

function ContentBlock({ block }: { block: CurriculumModuleBlock }) {
  switch (block.type) {
    case "heading":     return <HeadingBlock block={block} />;
    case "subheading":  return <SubheadingBlock block={block} />;
    case "body":        return <BodyBlock block={block} />;
    case "image":       return <ImageBlock block={block} />;
    case "ai_prompt":   return <AiPromptBlock block={block} />;
    case "video_embed": return <VideoEmbedBlock block={block} />;
    case "tool_link":   return <ToolLinkBlock block={block} />;
    default:            return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page renderers
// ─────────────────────────────────────────────────────────────────────────────

function IntroPage({
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
    <div className="flex flex-col gap-4">
      {/* Header card */}
      <div className="bg-[#3B0764] rounded-[14px] px-5 py-5 relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#06B6D4]/20 pointer-events-none" />
        <div className="absolute -bottom-4 left-8 w-16 h-16 rounded-full bg-[#5B21B6]/40 pointer-events-none" />

        <div className="relative z-10 flex flex-wrap gap-2 mb-3">
          <span
            className="text-[11px] font-bold px-2.5 py-[3px] rounded-full bg-white/[0.14] text-white/90"
            style={{ fontFamily: FONT_BODY }}
          >
            Week {weekNumber} · Term {term}
          </span>
          {toolNames?.map((name, i) => (
            <span
              key={i}
              className="text-[11px] font-bold px-2.5 py-[3px] rounded-full bg-[#06B6D4]/25 text-[#a5f3fc]"
              style={{ fontFamily: FONT_BODY }}
            >
              {name}
            </span>
          ))}
        </div>

        <h1
          className="relative z-10 text-[22px] sm:text-[24px] font-bold text-white leading-snug"
          style={{ fontFamily: FONT_HEAD }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="relative z-10 text-[14px] sm:text-[15px] text-white/65 mt-2 leading-[1.6]"
            style={{ fontFamily: FONT_BODY }}
          >
            {description}
          </p>
        )}
      </div>

      <p
        className="text-center text-[12px] text-text-muted"
        style={{ fontFamily: FONT_BODY }}
      >
        Swipe or tap Next to begin
      </p>
    </div>
  );
}

function ContentPage({ blocks }: { blocks: CurriculumModuleBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => (
        <ContentBlock key={i} block={block} />
      ))}
    </div>
  );
}

const REFLECTION_MIN = 4;
const REFLECTION_MAX = 10;

function wordCount(text: string): number {
  const s = text.trim();
  return s === "" ? 0 : s.split(/\s+/).length;
}

function ActivityPage({
  block,
  moduleTitle,
  activityText,
  onActivityChange,
}: {
  block: CurriculumModuleBlock;
  moduleTitle: string;
  activityText: string;
  onActivityChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2
        className="text-[17px] sm:text-[19px] font-bold text-text-primary leading-snug"
        style={{ fontFamily: FONT_HEAD }}
      >
        {moduleTitle}
      </h2>

      <div className="bg-[#FAEEDA] border-l-[3px] border-[#EF9F27] rounded-r-[10px] px-4 py-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#854F0B]" style={{ fontFamily: FONT_BODY }}>
            Activity
          </p>
          {block.required && <RequiredBadge />}
        </div>
        <p className="text-[16px] sm:text-[18px] text-[#633806] leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
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
        <textarea
          value={activityText}
          onChange={(e) => onActivityChange(e.target.value)}
          placeholder="Write your activity here…"
          rows={5}
          className={cn(
            "w-full resize-y border border-border rounded-[10px] px-3.5 py-3",
            "text-[16px] sm:text-[18px] leading-[1.6]",
            "outline-none transition-colors",
            "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
          )}
          style={{ fontFamily: FONT_BODY }}
        />
      </div>
    </div>
  );
}

function ReflectionPage({
  block,
  moduleTitle,
  reflectionText,
  onReflectionChange,
}: {
  block: CurriculumModuleBlock;
  moduleTitle: string;
  reflectionText: string;
  onReflectionChange: (v: string) => void;
}) {
  const wc = wordCount(reflectionText);
  const wcColor =
    wc >= REFLECTION_MIN && wc <= REFLECTION_MAX
      ? "text-[#1D9E75]"
      : wc > REFLECTION_MAX
      ? "text-[#D85A30]"
      : "text-text-muted";

  return (
    <div className="flex flex-col gap-4">
      <h2
        className="text-[17px] sm:text-[19px] font-bold text-text-primary leading-snug"
        style={{ fontFamily: FONT_HEAD }}
      >
        {moduleTitle}
      </h2>

      <div className="bg-[#E6F1FB] border-l-[3px] border-[#378ADD] rounded-r-[10px] px-4 py-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0C447C]" style={{ fontFamily: FONT_BODY }}>
            Reflection prompt
          </p>
          {block.required && <RequiredBadge />}
        </div>
        <p className="text-[16px] sm:text-[18px] text-[#185FA5] leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
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
        <textarea
          value={reflectionText}
          onChange={(e) => onReflectionChange(e.target.value)}
          placeholder="Write your reflection here…"
          rows={5}
          className={cn(
            "w-full resize-y border border-border rounded-[10px] px-3.5 py-3",
            "text-[16px] sm:text-[18px] leading-[1.6]",
            "outline-none transition-colors",
            "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10"
          )}
          style={{ fontFamily: FONT_BODY }}
        />
        <p className={cn("text-[12px] text-right mt-1.5 tabular-nums", wcColor)} style={{ fontFamily: FONT_BODY }}>
          {wc} / {REFLECTION_MAX} words
        </p>
      </div>
    </div>
  );
}

function TaskPage({ block }: { block: CurriculumModuleBlock }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#E1F5EE] border border-[#5DCAA5]/60 rounded-[10px] px-4 py-3.5 flex gap-3 items-start">
        <div className="w-8 h-8 rounded-[8px] bg-[#1D9E75] flex items-center justify-center shrink-0 mt-0.5">
          <CheckSquare size={15} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0F6E56] mb-1.5" style={{ fontFamily: FONT_BODY }}>
            Task
          </p>
          <p className="text-[16px] sm:text-[18px] text-[#085041] leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
            {block.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function SubmitPage({
  hasActivity,
  hasReflection,
}: {
  hasActivity: boolean;
  hasReflection: boolean;
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
          Lesson complete!
        </h2>
        <p
          className="text-[15px] sm:text-[16px] text-text-secondary leading-[1.6]"
          style={{ fontFamily: FONT_BODY }}
        >
          Your work is saved offline and will submit when you reconnect.
        </p>
      </div>
      {(hasActivity || hasReflection) && (
        <div className="w-full bg-bg-page border border-border rounded-[10px] px-4 py-3.5 text-left">
          <p
            className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2.5"
            style={{ fontFamily: FONT_BODY }}
          >
            Summary
          </p>
          {hasActivity && (
            <div className="flex justify-between items-center py-1">
              <span className="text-[14px] text-text-secondary" style={{ fontFamily: FONT_BODY }}>Activity</span>
              <span className="text-[13px] font-bold text-[#1D9E75]" style={{ fontFamily: FONT_BODY }}>Completed</span>
            </div>
          )}
          {hasReflection && (
            <div className="flex justify-between items-center py-1">
              <span className="text-[14px] text-text-secondary" style={{ fontFamily: FONT_BODY }}>Reflection</span>
              <span className="text-[13px] font-bold text-[#1D9E75]" style={{ fontFamily: FONT_BODY }}>Completed</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main LessonStepper component
// ─────────────────────────────────────────────────────────────────────────────

interface LessonStepperProps {
  title: string;
  description?: string;
  weekNumber: number;
  term: number;
  toolNames?: string[];
  blocks: CurriculumModuleBlock[];
  activityText: string;
  onActivityChange: (text: string) => void;
  reflectionText: string;
  onReflectionChange: (text: string) => void;
  savedOffline?: boolean;
  onPrevLesson?: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  className?: string;
}

export function LessonStepper({
  title,
  description,
  weekNumber,
  term,
  toolNames,
  blocks,
  activityText,
  onActivityChange,
  reflectionText,
  onReflectionChange,
  savedOffline = false,
  onPrevLesson,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  className,
}: LessonStepperProps) {
  const pages = buildPages(blocks);
  const total = pages.length;
  const [cur, setCur] = useState(0);

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const isLastPage = cur === total - 1;

  // Per-page validation: some interactive pages require input before advancing
  const isPageBlocked = useCallback((): boolean => {
    const page = pages[cur];
    if (!page) return false;
    if (page.kind === "interactive") {
      if (page.type === "activity" && page.block.required) {
        return activityText.trim().length < 5;
      }
      if (page.type === "reflection" && page.block.required) {
        const wc = wordCount(reflectionText);
        return wc < REFLECTION_MIN || wc > REFLECTION_MAX;
      }
      if (page.type === "task") {
        // Tasks are informational — never blocked
        return false;
      }
    }
    return false;
  }, [cur, pages, activityText, reflectionText]);

  function goNext() {
    if (isPageBlocked()) return;
    if (isLastPage) { onSubmit(); return; }
    setCur((c) => Math.min(total - 1, c + 1));
  }

  function goBack() {
    if (cur === 0) { onPrevLesson?.(); return; }
    setCur((c) => Math.max(0, c - 1));
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 44) return;
    if (dx < 0) goNext();
    else goBack();
  }

  const progress = ((cur + 1) / total) * 100;
  const blocked = isPageBlocked();

  const hasActivity = blocks.some((b) => b.type === "activity");
  const hasReflection = blocks.some((b) => b.type === "reflection");

  const page = pages[cur];

  return (
    <div className={cn("w-full max-w-[680px] mx-auto flex flex-col", className)}>

      {/* Progress bar + step counter */}
      <div className="flex items-center gap-3 px-1 pb-3">
        <div className="flex-1 h-[6px] bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5B21B6] rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span
          className="text-[12px] text-text-muted whitespace-nowrap tabular-nums"
          style={{ fontFamily: FONT_BODY }}
        >
          {cur + 1} of {total}
        </span>
      </div>

      {/* Sliding stage */}
      <div
        ref={stageRef}
        className="overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: `translateX(-${cur * 100}%)` }}
        >
          {pages.map((p, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-full px-0.5 pb-4"
              aria-hidden={i !== cur}
            >
              {p.kind === "intro" && (
                <IntroPage
                  title={title}
                  description={description}
                  weekNumber={weekNumber}
                  term={term}
                  toolNames={toolNames}
                />
              )}
              {p.kind === "content" && <ContentPage blocks={p.blocks} />}
              {p.kind === "interactive" && p.type === "activity" && (
                <ActivityPage
                  block={p.block}
                  moduleTitle={title}
                  activityText={activityText}
                  onActivityChange={onActivityChange}
                />
              )}
              {p.kind === "interactive" && p.type === "reflection" && (
                <ReflectionPage
                  block={p.block}
                  moduleTitle={title}
                  reflectionText={reflectionText}
                  onReflectionChange={onReflectionChange}
                />
              )}
              {p.kind === "interactive" && p.type === "task" && (
                <TaskPage block={p.block} />
              )}
              {p.kind === "submit" && (
                <SubmitPage hasActivity={hasActivity} hasReflection={hasReflection} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border flex-wrap">
        {/* Offline status */}
        <div
          className="flex items-center gap-1.5 text-[12px] text-[#0F6E56]"
          style={{ fontFamily: FONT_BODY }}
        >
          <span className="w-[7px] h-[7px] rounded-full bg-[#1D9E75] shrink-0" />
          {savedOffline ? "Saved offline · syncs automatically" : "Saving…"}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-2">
          {/* Back button — always show except when it would go to a prev lesson and there's none */}
          {(cur > 0 || onPrevLesson) && (
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1 text-[13px] font-bold text-text-secondary border border-border px-3.5 py-2 rounded-[8px] hover:bg-gray-50 transition-colors"
              style={{ fontFamily: FONT_BODY }}
            >
              <ChevronLeft size={14} />
              Back
            </button>
          )}

          {isLastPage ? (
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className={cn(
                "inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-[8px] transition-colors",
                !isSubmitting
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
                "inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-[8px] transition-colors",
                !blocked
                  ? "bg-[#5B21B6] text-white hover:bg-[#4c1d95]"
                  : "bg-[#5B21B6]/40 text-white/50 cursor-not-allowed"
              )}
              style={{ fontFamily: FONT_BODY }}
            >
              Next
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
