"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { StepperPage } from "@/lib/student/lessons/build";

type LessonCoachProps = {
  page: StepperPage;
  hasTools?: boolean;
  onClose?: () => void;
};

type CoachContent = {
  title: string;
  message: string;
};

function getCoachContent(page: StepperPage, hasTools?: boolean): CoachContent {
  switch (page.kind) {
    case "content":
      return {
        title: "Take your time",
        message:
          "Read through this page and focus on the main ideas. When you're ready, move on to the next page.",
      };

    case "question":
      return hasTools
      ? {
        title: "Time to practise",
        message: "Follow the instructions, then write your response below. You can open the tools provided for this activity if you need them."
      }
      :{
        title: "Think it through",
        message:
          "Take a moment to think about the question before answering. Use what you've learned in the lesson to guide your answer.",
      };

    case "activity":
      return {
        title: "Time to practise",
        message:
          "Follow the instructions in the activity, then write your response below. Focus on showing what you understand.",
      };

    case "reflection":
      return {
        title: "Reflect on what you learned",
        message:
          "Think about the lesson and put your thoughts into your own words. This is a chance to connect what you've learned with your own understanding.",
      };

    case "task":
      return {
        title: "Complete your task",
        message:
          "Complete the required work for this lesson and upload your files or add any links requested.",
      };

    case "ai_form":
      return {
        title: "Tell us about your AI use",
        message:
          "This quick check-in asks how you used AI during the lesson. Answer honestly based on what you actually did.",
      };

    case "submit":
      return {
        title: "You're almost done",
        message:
          "You've reached the end of the lesson. Make sure you've completed everything, then use the navigation below to submit your work.",
      };
  }
}

export function LessonCoach({
  page,
  hasTools,
  onClose,
}: LessonCoachProps) {
  const [collapsed, setCollapsed] = useState(false);

  const content = useMemo(
    () => getCoachContent(page, hasTools),
    [page, hasTools]
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-purple/20 bg-purple/5",
        "transition-all"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple">
          <Bot className="h-4 w-4 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className="text-sm font-semibold text-text-primary"
                style={{ fontFamily: "var(--font-head)" }}
              >
                {content.title}
              </p>

              {!collapsed && (
                <p
                  className="mt-1 text-sm leading-6 text-text-secondary"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {content.message}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setCollapsed((value) => !value)}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-card hover:text-text-primary"
                aria-label={
                  collapsed
                    ? "Expand coach"
                    : "Collapse coach"
                }
              >
                {collapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-card hover:text-text-primary"
                  aria-label="Close coach"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}