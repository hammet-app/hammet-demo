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
} from "lucide-react";
import type { CurriculumModuleBlock, CurriculumSection } from "@/lib/api/api-types";

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

// ─────────────────────────────────────────────────────────────────────────────
// Page-building logic
//
// Each section produces:
//   1. A content page — section heading + all non-interactive blocks + task blocks
//   2. One ejected page per activity block in the section
//   3. One ejected page per reflection block in the section
//
// Page 0 is special: the intro card is merged with the first section's
// content so the opening page isn't just a title card.
// ─────────────────────────────────────────────────────────────────────────────

type ContentPage = {
  kind: "content";
  heading?: string | null;
  blocks: CurriculumModuleBlock[]; // non-interactive + task blocks only
  isFirst: boolean; // true = merged with intro card
};

type EjectedPage = {
  kind: "activity" | "reflection";
  block: CurriculumModuleBlock;
  moduleTitle: string;
};

type SubmitPage = { kind: "submit" };

export type StepperPage = ContentPage | EjectedPage | SubmitPage;

export function buildPages(
  sections: CurriculumSection[],
  moduleTitle: string
): StepperPage[] {
  const pages: StepperPage[] = [];

  sections.forEach((section, sectionIdx) => {
    const contentBlocks = section.blocks.filter(
      (b) => b.type !== "activity" && b.type !== "reflection"
    );
    const ejected = section.blocks.filter(
      (b) => b.type === "activity" || b.type === "reflection"
    );

    pages.push({
      kind: "content",
      heading: section.heading,
      blocks: contentBlocks,
      isFirst: sectionIdx === 0,
    });

    for (const block of ejected) {
      pages.push({
        kind: block.type as "activity" | "reflection",
        block,
        moduleTitle,
      });
    }
  });

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
  const invalid = block.is_valid === false || !block.url;
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
          {block.tool_name || block.content}
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

function TaskBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <div className="bg-[#E1F5EE] border border-[#5DCAA5]/60 rounded-[10px] px-4 py-3.5 flex gap-3 items-start">
      <div className="w-8 h-8 rounded-[8px] bg-[#1D9E75] flex items-center justify-center shrink-0 mt-0.5">
        <CheckSquare size={15} className="text-white" />
      </div>
      <div>
        <BlockLabel className="text-[#0F6E56]">Task</BlockLabel>
        <p
          className="text-[16px] sm:text-[18px] text-[#085041] leading-[1.6]"
          style={{ fontFamily: FONT_BODY }}
        >
          {block.content}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block dispatcher — all block types in one place
// ─────────────────────────────────────────────────────────────────────────────

function Block({
  block,
  activityText,
  onActivityChange,
  reflectionText,
  onReflectionChange,
  isTeacher,
}: {
  block: CurriculumModuleBlock;
  activityText: string;
  onActivityChange: (v: string) => void;
  reflectionText: string;
  onReflectionChange: (v: string) => void;
  isTeacher?: boolean;
}) {
  switch (block.type) {
    case "subheading":  return <SubheadingBlock block={block} />;
    case "body":        return <BodyBlock block={block} />;
    case "image":       return <ImageBlock block={block} />;
    case "ai_prompt":   return <AiPromptBlock block={block} />;
    case "video_embed": return <VideoEmbedBlock block={block} />;
    case "tool_link":   return <ToolLinkBlock block={block} />;
    case "activity":
      return (
        <ActivityBlock
          block={block}
          activityText={activityText}
          onActivityChange={onActivityChange}
          isTeacher={isTeacher}
        />
      );
    case "reflection":
      return (
        <ReflectionBlock
          block={block}
          reflectionText={reflectionText}
          onReflectionChange={onReflectionChange}
          isTeacher={isTeacher}
        />
      );
    case "task": return <TaskBlock block={block} />;
    default:     return null;
  }
}

function ContentBlock({ block }: { block: CurriculumModuleBlock }) {
  switch (block.type) {
    case "subheading":  return <SubheadingBlock block={block} />;
    case "body":        return <BodyBlock block={block} />;
    case "image":       return <ImageBlock block={block} />;
    case "ai_prompt":   return <AiPromptBlock block={block} />;
    case "video_embed": return <VideoEmbedBlock block={block} />;
    case "tool_link":   return <ToolLinkBlock block={block} />;
    case "task":        return <TaskBlock block={block} />;
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

function SectionPage({
  section,
  activityText,
  onActivityChange,
  reflectionText,
  onReflectionChange,
  isTeacher,
}: {
  section: CurriculumSection;
  activityText: string;
  onActivityChange: (v: string) => void;
  reflectionText: string;
  onReflectionChange: (v: string) => void;
  isTeacher?:boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {section.heading && (
        <h2
          className="text-[18px] sm:text-[20px] font-bold text-[#534AB7] pb-2 border-b-2 border-[#EEEDFE] leading-snug"
          style={{ fontFamily: FONT_HEAD }}
        >
          {section.heading}
        </h2>
      )}
      {section.blocks.map((block, i) => (
        <Block
          key={i}
          block={block}
          activityText={activityText}
          onActivityChange={onActivityChange}
          reflectionText={reflectionText}
          onReflectionChange={onReflectionChange}
          isTeacher={isTeacher}
        />
      ))}
    </div>
  );
}

function ActivityPageView({
  page,
  activityText,
  onActivityChange,
}: {
  page: EjectedPage;
  activityText: string;
  onActivityChange: (v: string) => void;
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
    </div>
  );
}

function ReflectionPageView({
  page,
  reflectionText,
  onReflectionChange,
}: {
  page: EjectedPage;
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
    </div>
  );
}

function SubmitPageView({
  hasActivity,
  hasReflection,
  isTeacher,
}: {
  hasActivity: boolean;
  hasReflection: boolean;
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
              <span className="text-[14px] text-text-secondary" style={{ fontFamily: FONT_BODY }}>
                Activity
              </span>
              <span className="text-[13px] font-bold text-[#1D9E75]" style={{ fontFamily: FONT_BODY }}>
                Completed
              </span>
            </div>
          )}
          {hasReflection && (
            <div className="flex justify-between items-center py-1">
              <span className="text-[14px] text-text-secondary" style={{ fontFamily: FONT_BODY }}>
                Reflection
              </span>
              <span className="text-[13px] font-bold text-[#1D9E75]" style={{ fontFamily: FONT_BODY }}>
                Completed
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page-level validation
// Blocks all required interactive inputs in a section before allowing Next
// ─────────────────────────────────────────────────────────────────────────────

function isPageBlocked(
  page: StepperPage,
  activityText: string,
  reflectionText: string,
  isTeacher?: boolean
): boolean {
  if (isTeacher) return false;
  if (page.kind === "activity" && page.block.required) {
    return activityText.trim().length < 5;
  }
  if (page.kind === "reflection" && page.block.required) {
    const wc = wordCount(reflectionText);
    return wc < REFLECTION_MIN || wc > REFLECTION_MAX;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main LessonStepper component
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
  savedOffline?: boolean;
  onPrevLesson?: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
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
  savedOffline = false,
  onPrevLesson,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  className,
  isTeacher,
}: LessonStepperProps) {
  const pages = buildPages(sections, title);
  const total = pages.length;
  const [cur, setCur] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // ── Dynamic height: stage clips to the current page's natural height ──────
  // All pages are rendered off-screen simultaneously for smooth slide animation.
  // Without this, the stage height is set by the tallest page, leaving blank
  // space below short pages.
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [stageHeight, setStageHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = pageRefs.current[cur];
    if (!el) return;
    // ResizeObserver keeps height correct as textareas are resized
    const ro = new ResizeObserver(() => {
      setStageHeight(el.scrollHeight);
    });
    ro.observe(el);
    setStageHeight(el.scrollHeight);
    return () => ro.disconnect();
  }, [cur]);

  const isLastPage = cur === total - 1;

  const blocked = useCallback(
    () => isPageBlocked(pages[cur], activityText, reflectionText),
    [pages, cur, activityText, reflectionText]
  );

  function goNext() {
    if (blocked()) return;
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
    if (dx < 0) goNext(); else goBack();
  }

  const progress = ((cur + 1) / total) * 100;
  const allBlocks = sections.flatMap((s) => s.blocks);
  const hasActivity = allBlocks.some((b) => b.type === "activity");
  const hasReflection = allBlocks.some((b) => b.type === "reflection");

  const introProps = { title, description, weekNumber, term, toolNames };

  useEffect(() => {
    document.getElementById("lesson-scroll")?.scrollTo(0,0)
  }, [cur]);

  return (
    <div className={cn("w-full max-w-[680px] mx-auto flex flex-col gap-3", className)}>

      {/* Progress bar + step counter */}
      <div className="flex items-center gap-3 px-0.5">
        <div className="flex-1 h-[5px] bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5B21B6] rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[12px] text-text-muted whitespace-nowrap tabular-nums" style={{ fontFamily: FONT_BODY }}>
          {cur + 1} of {total}
        </span>
      </div>

      {/* Sliding stage */}
      <div className="overflow-hidden touch-pan-y transition-[height] duration-300 ease-out"
        style={{ height: stageHeight }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: `translateX(-${cur * 100}%)` }}
        >
          {pages.map((page, i) => (
            <div key={i} className="flex-shrink-0 w-full" aria-hidden={i !== cur}>
              {page.kind === "content" && (
                <ContentPageView
                  page={page}
                  introProps={page.isFirst ? introProps : undefined}
                />
              )}
              {!isTeacher && page.kind === "activity" && (
                <ActivityPageView
                  page={page}
                  activityText={activityText}
                  onActivityChange={onActivityChange}
                />
              )}
              {!isTeacher && page.kind === "reflection" && (
                <ReflectionPageView
                  page={page}
                  reflectionText={reflectionText}
                  onReflectionChange={onReflectionChange}
                />
              )}
              {page.kind === "submit" && (
                <SubmitPageView hasActivity={hasActivity} hasReflection={hasReflection} isTeacher={isTeacher}/>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-border flex-wrap">
        {!isLastPage ? (
          <div className="flex items-center gap-1.5 text-[12px] text-[#0F6E56]" style={{ fontFamily: FONT_BODY }}>
            <span className="w-[6px] h-[6px] rounded-full bg-[#1D9E75] shrink-0" />
            {savedOffline ? "Saved offline · syncs automatically" : "Saving…"}
          </div>
        ) : <div />}

        <div className="flex items-center gap-2">
          {(cur > 0 || onPrevLesson) && (
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1 text-[13px] font-bold text-text-secondary border border-border px-3 py-1.5 rounded-[8px] hover:bg-gray-50 transition-colors"
              style={{ fontFamily: FONT_BODY }}
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}
          {isTeacher ?(
            <button
              onClick={goNext}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-[8px] bg-[#5B21B6] text-white"
            >
              {isLastPage ? "Finish" : "Next"}
              <ChevronRight size={14} />
            </button>
          ) : isLastPage ? (
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className={cn(
                "inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-1.5 rounded-[8px] transition-colors",
                !isSubmitting ? "bg-[#1D9E75] text-white hover:bg-[#178a65]" : "bg-[#1D9E75]/50 text-white/60 cursor-not-allowed"
              )}
              style={{ fontFamily: FONT_BODY }}
            >
              {isSubmitting ? "Submitting…" : (submitLabel ?? "Submit lesson")}
              {!isSubmitting && <ChevronRight size={14} />}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={blocked()}
              className={cn(
                "inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-1.5 rounded-[8px] transition-colors",
                !blocked() ? "bg-[#5B21B6] text-white hover:bg-[#4c1d95]" : "bg-[#5B21B6]/40 text-white/50 cursor-not-allowed"
              )}
              style={{ fontFamily: FONT_BODY }}
            >
              Next <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

