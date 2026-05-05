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
      <div className="bg-[#3B0764] rounded-[14px] px-5 py-5 relative overflow-hidden">
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
    <div className="flex flex-col gap-4">
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

function SubmitPage({
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

function isSectionBlocked(
  section: CurriculumSection,
  activityText: string,
  reflectionText: string,
  isTeacher?: boolean
): boolean {
  if (isTeacher) return false;
  for (const block of section.blocks) {
    if (!block.required) continue;
    if (block.type === "activity" && activityText.trim().length < 5) return true;
    if (block.type === "reflection") {
      const wc = wordCount(reflectionText);
      if (wc < REFLECTION_MIN || wc > REFLECTION_MAX) return true;
    }
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
  /** Sections from content_json.sections */
  sections: CurriculumSection[];
  activityText: string;
  onActivityChange: (text: string) => void;
  reflectionText: string;
  onReflectionChange: (text: string) => void;
  savedOffline?: boolean;
  /** Called when Back is pressed on page 0 — navigate to previous lesson */
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
  // Pages: [intro, ...one per section, submit]
  const total = sections.length + 2;
  const [cur, setCur] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isLastPage = cur === total - 1;
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [height, setHeight] = useState(0);

  // Current section — null on intro (0) and submit (total-1) pages
  const currentSection: CurriculumSection | null =
    cur > 0 && cur <= sections.length ? sections[cur - 1] : null;

  const isPageBlocked = useCallback((): boolean => {
    if (!currentSection) return false;
    return isSectionBlocked(currentSection, activityText, reflectionText);
  }, [currentSection, activityText, reflectionText]);

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
  const blocked = isTeacher ? false : isPageBlocked();
  const allBlocks = sections.flatMap((s) => s.blocks);
  const hasActivity = allBlocks.some((b) => b.type === "activity");
  const hasReflection = allBlocks.some((b) => b.type === "reflection");

  useEffect(() => {
    const el = pageRefs.current[cur];
    if (el) {
      setHeight(el.offsetHeight);
    }
  }, [cur]);

  useEffect(() => {
    document.getElementById("lesson-scroll")?.scrollTo(0,0)
  }, [cur]);

  return (
    <div className={cn("w-full max-w-[680px] mx-auto flex flex-col gap-4", className)}>

      {/* Progress bar + step counter */}
      <div className="flex items-center gap-3 px-0.5">
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
        className="overflow-hidden touch-pan-y transition-[height] duration-300"
        style={{ height }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: `translateX(-${cur * 100}%)` }}
        >
          {/* Page 0 — Intro */}
          <div
            ref={(el) => {pageRefs.current[0] = el}}
            className="flex-shrink-0 w-full"
            aria-hidden={cur !== 0}
          >
            <IntroPage
              title={title}
              description={description}
              weekNumber={weekNumber}
              term={term}
              toolNames={toolNames}
            />
          </div>

          {/* Pages 1…N — one per section */}
          {sections.map((section, i) => (
            <div
              key={i}
              ref={(el) => {pageRefs.current[0] = el}}
              className="flex-shrink-0 w-full pb-2"
              aria-hidden={cur !== i + 1}
            >
              <SectionPage
                section={section}
                activityText={activityText}
                onActivityChange={onActivityChange}
                reflectionText={reflectionText}
                onReflectionChange={onReflectionChange}
              />
            </div>
          ))}

          {/* Page N+1 — Submit */}
          <div
            ref={(el) => {pageRefs.current[0] = el}}
            className="flex-shrink-0 w-full pb-2"
            aria-hidden={cur !== total - 1}
          >
            <SubmitPage hasActivity={hasActivity} hasReflection={hasReflection} isTeacher={isTeacher} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border flex-wrap">
        {!isLastPage ? (
          <div
            className="flex items-center gap-1.5 text-[12px] text-[#0F6E56]"
            style={{ fontFamily: FONT_BODY }}
          >
            <span className="w-[7px] h-[7px] rounded-full bg-[#1D9E75] shrink-0" />
            {savedOffline ? "Saved offline · syncs automatically" : "Saving…"}
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
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

          {isTeacher ?(
            <button
              onClick={goNext}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-[8px] bg-[#5B21B6] text-white"
            >
              {isLastPage ? "Finish" : "Next"}
              <ChevronRight size={14} />
            </button>
          ): isLastPage ? (
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
