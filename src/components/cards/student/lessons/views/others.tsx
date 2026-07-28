"use client"

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { 
  ContentPage, 
  EjectedPage, 
  FONT_BODY, 
  FONT_HEAD, 
  wordCount, 
  REFLECTION_MAX, 
  REFLECTION_MIN 
} from "@/lib/student/lessons/build";
import { ContentBlock, RequiredBadge } from "../blocks";
import { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Page renderers
// ─────────────────────────────────────────────────────────────────────────────

export function IntroCard({
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

function WritingSurface({
  label,
  value,
  onChange,
  placeholder,
  rows,
  footer,
  readOnly
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  footer?: ReactNode
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label
        className="block text-sm font-medium text-text-primary"
        style={{ fontFamily: FONT_HEAD}}
      >
        {label}
      </label>

      <div>
        <textarea 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows ?? 6}
          readOnly={readOnly}
          className={cn(
            "w-full resize-y rounded-xl border border-border bg-bg-card px-4 py-3",
            "text-[16px] leading-relaxed text-text-primary",
            "outline-none transition-all",
            "focus:border-purple focus:ring-2 focus:ring-purple/10",
            "disabled:cursor-not-allowed disabled:opacity-60",
            readOnly && "bg-gray-50"
          )}
          style={{ fontFamily: FONT_BODY}}
        />
      </div>
      {footer && (
        <div className="flex items-center justify-between pt-1">
          {footer}
        </div>
      )}
    </div>
  )
}

export function ContentPageView({
  page,
}: {
  page: ContentPage;
}) {
  return (
    <div className="flex flex-col gap-3">
      {page.heading && (
        <h2
          className="text-[18px] sm:text-[20px] font-bold text-[#534AB7] pb-6 leading-snug"
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

export function ActivityPageView({
  page,
  activityText,
  onActivityChange,
  readOnly,
}: {
  page: EjectedPage;
  activityText: string;
  onActivityChange: (v: string) => void;
  readOnly: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[#FAEEDA] border-l-[3px] border-[#EF9F27] rounded-r-[10px] px-3.5 py-3">
        <p 
            className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary"
            style={{ fontFamily: FONT_HEAD }}
          >
            Practice
          </p>
        <p className="text-[16px] sm:text-[18px] text-[#633806] leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
          {page.block.content}
        </p>
      </div>
      <div>
        <WritingSurface
          label="Your response"
          value={activityText}
          onChange={onActivityChange}
          placeholder="Write your response here..."
        />
      </div>
    </div>
  );
}

export function ReflectionPageView({
  page,
  reflectionText,
  onReflectionChange,
  isTeacher,
  readOnly
}: {
  page: EjectedPage;
  reflectionText: string;
  onReflectionChange: (v: string) => void;
  isTeacher?: boolean;
  readOnly: boolean;
}) {
  const wc = wordCount(reflectionText);
  const wcColor =
    wc >= REFLECTION_MIN && wc <= REFLECTION_MAX
      ? "text-[#1D9E75]"
      : wc > REFLECTION_MAX
      ? "text-[#D85A30]"
      : "text-text-muted";

  return (
    <div className="flex flex-col gap-6">
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p 
            className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary"
            style={{ fontFamily: FONT_HEAD }}
          >
            Reflect
          </p>

          {page.block.required && <RequiredBadge />}
        </div>
        <p 
          className="text-[18px] leading-relaxed text-text-primary" 
          style={{ fontFamily: FONT_BODY }}
        >
          {page.block.content}
        </p>
      </div>
      {!isTeacher && (
        <WritingSurface
          label="Your reflection"
          value={reflectionText}
          onChange={onReflectionChange}
          placeholder="Write your reflection here..."
          footer={
            <p className={cn("text-[12px] text-right mt-1 tabular-nums", wcColor)} style={{ fontFamily: FONT_BODY }}>
              {wc} / {REFLECTION_MAX} words
            </p>
          }
          readOnly={readOnly}
        />
      )}
    </div>
  );
}

export function SubmitPageView({
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