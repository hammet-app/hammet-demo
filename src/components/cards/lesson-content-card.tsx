"use client";

import { cn } from "@/lib/utils/utils";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  CheckSquare,
  AlertTriangle,
  ImageOff,
} from "lucide-react";
import type { CurriculumModuleBlock } from "@/lib/api/api-types";

// ── Formatter (ONLY used for body) ────────────────────────────────────────────
function formatInlineText(text?: string): string {
  if (!text) return "";

  const lines = text.split("\n");
  let result = "";
  let inUl = false;
  let inOl = false;

  for (let line of lines) {
    // Inline formatting first
    line = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/!(.*?)!/g, "<em>$1</em>");

    const trimmed = line.trim();

    // ── BULLETS (- ) ─────────────────────
    if (trimmed.startsWith("- ")) {
      if (inOl) {
        result += "</ol>";
        inOl = false;
      }
      if (!inUl) {
        result += `<ul class="list-disc ml-5 space-y-2 mt-2 mb-2">`;
        inUl = true;
      }
      result += `<li>${trimmed.replace(/^- /, "")}</li>`;
      continue;
    }

    // ── NUMBERED (1. 2. etc) ─────────────
    if (/^\s*\d+\.\s+/.test(trimmed)) {
      if (inUl) {
        result += "</ul>";
        inUl = false;
      }
      if (!inOl) {
        result += `<ol class="list-decimal ml-5 space-y-2 mt-2 mb-2">`;
        inOl = true;
      }
      result += `<li>${trimmed.replace(/^\d+\.\s+/, "")}</li>`;
      continue;
    }

    // ── NORMAL TEXT ─────────────────────
    if (inUl) {
      result += "</ul>";
      inUl = false;
    }
    if (inOl) {
      result += "</ol>";
      inOl = false;
    }

    if (trimmed) {
      result += `<p>${trimmed}</p>`;
    }
  }

  // Close any open list
  if (inUl) result += "</ul>";
  if (inOl) result += "</ol>";

  return result;
}

// ── YouTube URL → embed URL ───────────────────────────────────────────────────
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

// ── Block subcomponents ───────────────────────────────────────────────────────

function HeadingBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <h2
      className="text-[15px] font-bold text-text-primary pb-1.5 border-b-2 border-purple-light"
      style={{ fontFamily: "var(--font-head)" }}
    >
      {block.content}
    </h2>
  );
}

function SubheadingBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <p
      className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider"
      style={{ fontFamily: "var(--font-head)" }}
    >
      {block.content}
    </p>
  );
}

function BodyBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <div
      className="text-[13.5px] text-text-secondary leading-relaxed space-y-2"
      dangerouslySetInnerHTML={{
        __html: formatInlineText(block.content),
      }}
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
          <p className="text-[12px] font-semibold text-warning">Image unavailable</p>
          {block.content && (
            <p className="text-[11px] text-text-muted mt-0.5">{block.content}</p>
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
          const target = e.currentTarget;
          target.style.display = "none";
          const fallback = target.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        className="hidden items-center gap-2 bg-bg-page px-4 py-3 text-[12px] text-text-muted"
        aria-hidden="true"
      >
        <ImageOff size={14} />
        <span>Could not load image</span>
      </div>
      {block.content && (
        <figcaption className="text-[11px] text-text-muted px-3.5 py-2 border-t border-border bg-bg-page">
          {block.content}
        </figcaption>
      )}
    </figure>
  );
}

function RequiredBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-danger">
      <span className="w-1 h-1 rounded-full bg-danger" />
      Required
    </span>
  );
}

function ActivityBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <div className="border-l-[3px] border-purple-mid bg-purple-light rounded-r-[10px] px-3.5 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-mid">
          Your activity
        </p>
        {block.required && <RequiredBadge />}
      </div>
      <p className="text-[13px] text-purple-dark leading-relaxed">{block.content}</p>
    </div>
  );
}

function ReflectionBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <div className="border-l-[3px] border-text-muted bg-gray-50 rounded-r-[10px] px-3.5 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
          Reflection prompt
        </p>
        {block.required && <RequiredBadge />}
      </div>
      <p className="text-[13px] text-text-secondary leading-relaxed">{block.content}</p>
    </div>
  );
}

function TaskBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <div className="border border-purple-mid/30 bg-purple-light/50 rounded-[10px] px-3.5 py-3 flex gap-3 items-start">
      <div className="w-7 h-7 rounded-[7px] bg-purple-mid/15 text-purple-mid flex items-center justify-center shrink-0 mt-0.5">
        <CheckSquare size={14} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-mid mb-1.5">
          Task
        </p>
        <p className="text-[13px] text-purple-dark leading-relaxed">{block.content}</p>
      </div>
    </div>
  );
}

function AiPromptBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <div className="border border-cyan bg-cyan-light rounded-[10px] px-3.5 py-3 flex gap-3 items-start">
      <div className="w-8 h-8 rounded-[8px] bg-cyan text-purple-dark flex items-center justify-center shrink-0">
        <HelpCircle size={16} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-dark mb-1">
          AI prompt tip
        </p>
        <p className="text-[13px] text-cyan-dark leading-relaxed">{block.content}</p>
      </div>
    </div>
  );
}

function VideoEmbedBlock({ block }: { block: CurriculumModuleBlock }) {
  if (!block.url) {
    return (
      <div className="flex items-center gap-3 border border-dashed border-warning/60 bg-warning/5 rounded-[10px] px-4 py-3.5">
        <AlertTriangle size={16} className="text-warning shrink-0" />
        <p className="text-[12px] text-warning font-medium">Video URL missing</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-[10px] overflow-hidden">
      <div className="aspect-video w-full">
        <iframe
          src={getEmbedUrl(block.url)}
          className="w-full h-full"
          allowFullScreen
          title={block.content || "Lesson video"}
        />
      </div>
      {block.content && (
        <p className="text-[12px] text-text-muted px-3.5 py-2.5 border-t border-border">
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
        <p className="text-[12px] text-warning font-medium">Tool link missing</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-[10px] px-3.5 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-[9px] bg-cyan-light text-cyan-dark flex items-center justify-center shrink-0">
        <ExternalLink size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-cyan truncate">
          {block.tool_name || block.content}
        </p>
        <p className="text-[11px] text-text-muted truncate">{block.url}</p>
      </div>
      <a
        href={block.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-cyan text-purple-dark px-3 py-1.5 rounded-[8px] hover:bg-cyan-dark hover:text-white transition-colors shrink-0"
      >
        Open tool
        <ExternalLink size={11} />
      </a>
    </div>
  );
}

// ── Block dispatcher ──────────────────────────────────────────────────────────

function Block({ block }: { block: CurriculumModuleBlock }) {
  switch (block.type) {
    case "heading": return <HeadingBlock block={block} />;
    case "subheading": return <SubheadingBlock block={block} />;
    case "body": return <BodyBlock block={block} />;
    case "image": return <ImageBlock block={block} />;
    case "activity": return <ActivityBlock block={block} />;
    case "reflection": return <ReflectionBlock block={block} />;
    case "task": return <TaskBlock block={block} />;
    case "ai_prompt": return <AiPromptBlock block={block} />;
    case "video_embed": return <VideoEmbedBlock block={block} />;
    case "tool_link": return <ToolLinkBlock block={block} />;
    default: return null;
  }
}

// ── Main component ────────────────────────────────────────────────────────────

const REFLECTION_MIN = 4;
const REFLECTION_MAX = 10;

interface LessonContentCardProps {
  title: string;
  description?: string;
  weekNumber: number;
  term: number;
  toolName?: string;
  blocks: CurriculumModuleBlock[];
  activityText: string;
  onActivityChange: (text: string) => void;
  reflectionText: string;
  onReflectionChange: (text: string) => void;
  savedOffline?: boolean;
  onPrevious?: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  className?: string;
  submitLabel?: string;
}

export function LessonContentCard({
  title,
  description,
  weekNumber,
  term,
  toolName,
  blocks,
  activityText,
  onActivityChange,
  reflectionText,
  onReflectionChange,
  savedOffline = false,
  onPrevious,
  onSubmit,
  isSubmitting = false,
  className,
  submitLabel,
}: LessonContentCardProps) {
  const wordCount =
    reflectionText.trim() === ""
      ? 0
      : reflectionText.trim().split(/\s+/).length;

  const wordCountColor =
    wordCount >= REFLECTION_MIN && wordCount <= REFLECTION_MAX
      ? "text-success"
      : wordCount > REFLECTION_MAX
      ? "text-danger"
      : "text-text-muted";

  return (
    <div className={cn("bg-bg-card border border-border rounded-[14px] overflow-hidden", className)}>

      {/* Header */}
      <div className="bg-purple-dark px-6 py-5 flex flex-col gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full bg-white/[0.12] text-white/85 tracking-wide">
            Week {weekNumber} · Term {term}
          </span>
          {toolName && (
            <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full bg-cyan/20 text-cyan tracking-wide">
              {toolName}
            </span>
          )}
        </div>
        <h1
          className="text-[20px] font-bold text-white leading-snug"
          style={{ fontFamily: "var(--font-head)" }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-[13px] text-white/60 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Blocks — rendered in backend order */}
      {blocks.map((block, i) => {
        const nextBlock = blocks[i + 1];

        const addSpacing =
          (block.type === "body" || block.type == "image") && nextBlock?.type === "heading";

        return (
          <div
            key={i}
            className={cn(
              "flex flex-col gap-2",
              addSpacing && "mb-6"
            )}
          >
            <Block block={block} />

            {block.type === "activity" && (
              <div className="flex flex-col gap-2 mt-1">
                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-text-primary">
                  <MessageSquare size={14} className="text-purple-mid" />
                  Activity Box
                </label>

                <textarea
                  value={activityText}
                  onChange={(e) => onActivityChange(e.target.value)}
                  placeholder="Do your activity here…"
                  rows={5}
                  className={cn(
                    "w-full resize-y border border-border rounded-[10px] px-3 py-2.5",
                    "text-[13px] text-text-primary placeholder:text-text-muted",
                    "outline-none transition-colors",
                    "focus:border-purple-mid focus:ring-2 focus:ring-purple-mid/10"
                  )}
                  
                />
              </div>
            )}

            {block.type === "reflection" && (
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-text-primary">
                  <MessageSquare size={14} className="text-purple-mid" />
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
                    "w-full resize-y border border-border rounded-[10px] px-3 py-2.5",
                    "text-[13px] text-text-primary placeholder:text-text-muted",
                    "outline-none transition-colors",
                    "focus:border-purple-mid focus:ring-2 focus:ring-purple-mid/10"
                  )}
                />
                <p className={cn("text-[11px] text-right tabular-nums", wordCountColor)}>
                  {wordCount} / {REFLECTION_MAX} words
                </p>
              </div>
            )}
          </div>
        );
      })}

        
      

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[12px] text-success">
          <span className="w-[7px] h-[7px] rounded-full bg-success shrink-0" />
          {savedOffline ? "Saved offline · syncs automatically" : "Saving…"}
        </div>

        <div className="flex items-center gap-2">
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-secondary border border-border px-3.5 py-2 rounded-[8px] hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={isSubmitting || wordCount < REFLECTION_MIN}
            className={cn(
              "inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-[8px] transition-colors",
              wordCount >= REFLECTION_MIN && !isSubmitting
                ? "bg-purple text-white hover:bg-purple-hover"
                : "bg-purple/50 text-white/60 cursor-not-allowed"
            )}
          >
            {isSubmitting ? "Submitting…" : (submitLabel ?? "Submit & continue")}
            {!isSubmitting && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}