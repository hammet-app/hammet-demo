"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/utils";
import { ChevronLeft, ChevronRight, ExternalLink, Play, MessageSquare, HelpCircle } from "lucide-react";
import type { CurriculumModuleBlock } from "@/lib/api/api-types";

function getEmbedUrl(url?: string) {
  if (!url) return "";

  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${id}`;
  }

  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1];
    return `https://www.youtube.com/embed/${id}`;
  }

  return url;
}

interface LessonContentCardProps {
  title: string;
  description?: string;
  weekNumber: number;
  term: number;
  toolName?: string;
  blocks: CurriculumModuleBlock[];
  /** Current reflection text (controlled from parent) */
  reflectionText: string;
  onReflectionChange: (text: string) => void;
  /** Whether the lesson has been saved offline */
  savedOffline?: boolean;
  onPrevious?: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  className?: string;
  submitLabel?:string
}

const REFLECTION_MIN = 4;
const REFLECTION_MAX = 10;

export function LessonContentCard({
  title,
  description,
  weekNumber,
  term,
  toolName,
  blocks,
  reflectionText,
  onReflectionChange,
  savedOffline = false,
  onPrevious,
  onSubmit,
  isSubmitting = false,
  className,
  submitLabel,
}: LessonContentCardProps) {
  const wordCount = reflectionText.trim() === ""
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

      {/* ── Header ── */}
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

      {/* ── Body ── */}
      <div className="px-6 py-6 flex flex-col gap-5">
        {blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}

        {/* Reflection textarea — always last */}
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
      </div>

      {/* ── Footer ── */}
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
            {isSubmitting ? "Submitting…" :(submitLabel ?? "Submit & continue")}
            {!isSubmitting && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Individual block renderers ── */

function Block({ block }: { block: CurriculumModuleBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h2
          className="text-[15px] font-bold text-text-primary pb-1.5 border-b-2 border-purple-light"
          style={{ fontFamily: "var(--font-head)" }}
        >
          {block.content}
        </h2>
      );

    case "body":
      return (
        <p
          className="text-[13.5px] text-text-secondary leading-relaxed"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case "activity":
      return (
        <div className="border-l-[3px] border-purple-mid bg-purple-light rounded-r-[10px] px-3.5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-purple-mid mb-1.5">
            Your activity
          </p>
          <p className="text-[13px] text-purple-dark leading-relaxed">{block.content}</p>
        </div>
      );

    case "ai_prompt":
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

    case "tool_link":
      return (
        <div className="border border-border rounded-[10px] px-3.5 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[9px] bg-cyan-light text-cyan-dark flex items-center justify-center shrink-0">
            <ExternalLink size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold text-cyan truncate">{block.tool_name}</p>
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

    case "video_embed":
      return (
        <div className="border border-border rounded-[10px] overflow-hidden">
          <div className="aspect-video w-full">
            <iframe
              src={getEmbedUrl(block.url)}
              className="w-full h-full"
              allowFullScreen
            />
          </div>

          {block.content && (
            <p className="text-[12px] text-text-muted px-3.5 py-2.5 border-t border-border">
              {block.content}
            </p>
          )}
        </div>
      );

    case "reflection":
      /* The main reflection textarea is rendered separately above.
         If Angel adds an extra reflection block as a prompt/label,
         render it as an activity-style hint. */
      return (
        <div className="border-l-[3px] border-text-muted bg-gray-50 rounded-r-[10px] px-3.5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">
            Reflection prompt
          </p>
          <p className="text-[13px] text-text-secondary leading-relaxed">{block.content}</p>
        </div>
      );

    default:
      return null;
  }
}
