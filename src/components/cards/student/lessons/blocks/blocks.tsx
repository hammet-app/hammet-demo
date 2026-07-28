"use client"

import Image from "next/image";
import { AlertTriangle, ImageOff, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { 
  formatInlineText, 
  getEmbedUrl,
  FONT_BODY, 
  FONT_HEAD
} from "@/lib/student/lessons/build";
import { CurriculumModuleBlock } from "@/lib/api/types";
import { AiPromptBlock } from "./ai-block";



export function ContentBlock({ block }: { block: CurriculumModuleBlock }) {
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
// Block renderers
// ─────────────────────────────────────────────────────────────────────────────

export function SubheadingBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <h3
      className="mb-4 text-[20px] sm:text-[22px] font-semibold text-text-primary leading-tight"
      style={{ fontFamily: FONT_HEAD }}
    >
      {block.content}
    </h3>
  );
}

export function BodyBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <div
      className="lesson-reading"
      style={{ fontFamily: FONT_BODY }}
      dangerouslySetInnerHTML={{ __html: formatInlineText(block.content) }}
    />
  );
}

export function ImageBlock({ block }: { block: CurriculumModuleBlock }) {
  const invalid = block.isValid === false || !block.url;
  if (invalid) {
    return (
      <motion.div 
        className="flex items-center gap-3 bg-warning/5 rounded-[10px] px-4 py-3.5"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
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
      </motion.div>
    );
  }
  return (
    <figure className="rounded-[10px] overflow-hidden border border-border">
      <Image
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

export function VideoEmbedBlock({ block }: { block: CurriculumModuleBlock }) {
  if (!block.url) {
    return (
      <div className="flex items-center gap-3 border border-dashed border-warning/60 bg-warning/5 rounded-lg px-4 py-3.5">
        <AlertTriangle size={16} className="text-warning shrink-0" />
        <p className="text-sm text-warning font-semibold" style={{ fontFamily: FONT_BODY }}>
          Video unavailable
        </p>
      </div>
    );
  }
  return (
    <section className="my-8">
      <p 
        className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted"
        style={{ fontFamily: FONT_HEAD}}
      >
        Watch
      </p>
      <div className="border border-border bg-bg-card rounded-xl overflow-hidden shadow-sm">
        <div className="aspect-video w-full">
          <iframe
            src={getEmbedUrl(block.url)}
            className="w-full h-full"
            allowFullScreen
            title={block.content || "Lesson video"}
          />
        </div>
        {block.content && (
          <div className="border-t border-border px-5 py-4">
            <p
              className="text-[12px] text-text-muted px-3.5 py-2.5 border-t border-[#AFA9EC]"
              style={{ fontFamily: FONT_BODY }}
            >
              {block.content}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export function ToolLinkBlock({ block }: { block: CurriculumModuleBlock }) {
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
    <div className="border border-border rounded-xl p-5 bg-bg-card">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[9px] bg-[#06B6D4] flex items-center justify-center shrink-0">
          <ExternalLink size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[11px] font-semibold uppercase text-text-secondary tracking-wide"
            style={{ fontFamily: FONT_HEAD }}
          >
            Learning Tool
          </p>

          <p
            className="mt-1 text-[15px] font-semibold text-text-primary truncate"
            style={{ fontFamily: FONT_BODY }}
          >
            {block.toolName || block.content}
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
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
    </div>
  );
}