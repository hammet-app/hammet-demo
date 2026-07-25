"use client"

import { Bot, Star, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { wordCount, FONT_BODY, FONT_HEAD, LessonMode } from "@/lib/student/lessons/build";
import { type AiFormPage } from "@/lib/student/lessons/build";
import { AiFormNoReason, AiFormState, AiFormPromptChoice } from "@/lib/api/types";
import { RequiredBadge } from "./common";
import { CurriculumModuleBlock } from "@/lib/api/types";

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

export function AiPromptBlock({ block }: { block: CurriculumModuleBlock }) {
  return (
    <section className="my-8 border border-purple-light bg-purple-light/40 rounded-xl p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex w-10 h-10 rounded-lg bg-purple items-center justify-center text-white">
          <HelpCircle size={18} />
        </div>

        <div>
          <p 
            className="text-xs font-semibold uppercase tracking-wide text-purple"
            style={{ fontFamily: FONT_HEAD}}
          >
            Ask AI
          </p>
        </div>
      </div>

      <blockquote
        className="border-l-4 border-purple pl-4 text-[16px] leading-relaxed text-text-primary italic"
        style={{ fontFamily: FONT_BODY }}
      >
        "{block.content}"
      </blockquote>
      
        <div className="mt-5 flex justify-end">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-purple px-4 py-2
            text-sm font-semibold text-button transition-all duration-200 hover:bg-purple-hover active:scale-[0.98]"
            style={{ fontFamily: FONT_BODY }}
          >
            Copy Prompt
          </button>
        </div>
    </section>
  );
}

export function AiFormPageView({
  page,
  aiForm,
  onAiFormChange,
  lessonMode
}: {
  page: AiFormPage;
  aiForm: AiFormState;
  onAiFormChange: (next: AiFormState) => void;
  lessonMode: LessonMode;
  isTeacher?: boolean;
}) {
  const readOnly = lessonMode === LessonMode.REVIEW
  const interactionProps = readOnly ? { disabled: true } : {};
  const textProps = readOnly ? { readOnly: true } : {};
  const set = (patch: Partial<AiFormState>) =>
    onAiFormChange({ ...aiForm, ...patch });

  const toolOptions = [
    ...page.toolNames.map((name) => ({ value: name, label: name })),
    { value: "other", label: "Other" },
  ];

  let noOtherWC = 0;
  // Word count helpers
  if (aiForm.noReasonOther){
    noOtherWC = wordCount(aiForm.noReasonOther);
  }
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
              {...interactionProps}
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
                  : "border-border bg-bg-card text-text-primary hover:border-[#5B21B6]/50",
                readOnly
                  ? "cursor-default opacity-80"
                  : "hover:border-[#5B21B6]/50" 
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
          <>
            <div className="flex flex-col gap-1.5">
              {NO_REASON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  {...interactionProps}
                  onClick={() =>
                    set({ noReason: opt.value, noReasonOther: "" })
                  }
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border text-left transition-all",
                    aiForm.noReason === opt.value
                      ? "bg-[#3B0764] border-[#3B0764] text-white"
                      : "border-border bg-bg-card text-text-primary hover:border-[#5B21B6]/50",
                      readOnly
                        ? "cursor-default opacity-80"
                        : "hover:border-[#5B21B6]/50"
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
                  {...textProps}
                  value={aiForm.noReasonOther}
                  onChange={(e) => set({ noReasonOther: e.target.value })}
                  placeholder="Briefly explain (max 20 words)…"
                  rows={2}
                  className={cn(
                    "w-full resize-none border border-border rounded-[10px] px-3.5 py-2.5",
                    "text-[15px] leading-[1.6] outline-none transition-colors bg-bg-card text-text-primary",
                    "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10",
                    noOtherWC > 20 && "border-[#D85A30] focus:border-[#D85A30]",
                    readOnly
                      ? "cursor-default opacity-80"
                      : "hover:border-[#5B21B6]/50"
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
          </>
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
                  {...interactionProps}
                  key={opt.value}
                  onClick={() =>
                    set({ toolUsed: opt.value, toolOther: "" })
                  }
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border text-left transition-all",
                    aiForm.toolUsed === opt.value
                      ? "bg-[#3B0764] border-[#3B0764] text-white"
                      : "border-border bg-bg-card text-text-primary hover:border-[#5B21B6]/50",
                    readOnly
                      ? "cursor-default opacity-80"
                      : "hover:border-[#5B21B6]/50"
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
                  {...textProps}
                  type="text"
                  value={aiForm.toolOther}
                  onChange={(e) => set({ toolOther: e.target.value })}
                  placeholder="Name the AI tool (max 10 words)…"
                  className={cn(
                    "w-full border border-border rounded-[10px] px-3.5 py-2.5",
                    "text-[15px] leading-[1.6] outline-none transition-colors bg-bg-card text-text-primary",
                    "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10",
                    toolOtherWC > 10 && "border-[#D85A30] focus:border-[#D85A30]",
                    readOnly
                      ? "cursor-default opacity-80"
                      : "hover:border-[#5B21B6]/50"
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
              {...textProps}
              value={aiForm.taskDesc}
              onChange={(e) => set({ taskDesc: e.target.value })}
              placeholder="Describe what you asked the AI to help with…"
              rows={3}
              className={cn(
                "w-full resize-y border border-border rounded-[10px] px-3.5 py-2.5",
                "text-[15px] leading-[1.6] outline-none transition-colors bg-bg-card text-text-primary",
                "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10",
                readOnly
                  ? "cursor-default opacity-80"
                  : "hover:border-[#5B21B6]/50"
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
                  {...interactionProps}
                  key={opt.value}
                  onClick={() =>
                    set({ promptChoice: opt.value, editedPrompt: "" })
                  }
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border text-left transition-all",
                    aiForm.promptChoice === opt.value
                      ? "bg-[#3B0764] border-[#3B0764] text-white"
                      : "border-border bg-bg-card text-text-primary hover:border-[#5B21B6]/50",
                    readOnly
                      ? "cursor-default opacity-80"
                      : "hover:border-[#5B21B6]/50"
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
                  {...textProps}
                  value={aiForm.editedPrompt}
                  onChange={(e) => set({ editedPrompt: e.target.value })}
                  placeholder="Paste or write the prompt you used…"
                  rows={3}
                  className={cn(
                    "w-full resize-y border border-border rounded-[10px] px-3.5 py-2.5",
                    "text-[15px] leading-[1.6] outline-none transition-colors bg-bg-card text-text-primary",
                    "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10",
                  readOnly
                    ? "cursor-default opacity-80"
                    : "hover:border-[#5B21B6]/50"
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
                  {...interactionProps}
                  key={star}
                  onClick={() => set({ rating: star })}
                  className={`flex flex-col items-center gap-1 flex-1 group
                    ${readOnly
                      ? "cursor-default opacity-80"
                      : "hover:border-[#5B21B6]/50"}
                    `}
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
                {...textProps}
                value={aiForm.ratingComment}
                onChange={(e) => set({ ratingComment: e.target.value })}
                placeholder="Share anything else about your experience…"
                rows={2}
                className={cn(
                  "w-full resize-none border border-border rounded-[10px] px-3.5 py-2.5",
                  "text-[15px] leading-[1.6] outline-none transition-colors bg-bg-card text-text-primary",
                  "focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10",
                  readOnly
                    ? "cursor-default opacity-80"
                    : "hover:border-[#5B21B6]/50"
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