"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { studentApi } from "@/lib/api/student";
import { LessonWorkspace } from "@/components/cards/student/lessons";
import { PageShell } from "@/components/layout/common/PageShell";
import { Loader2, ChevronDown } from "lucide-react";
import { DisputeReview } from "@/lib/api/types";
import { useLessonLoader } from "@/hooks/student/lessons";
import { Alert } from "@/components/ui";
import { useSubmissionStore } from "@/lib/store";


export default function LessonDetailPage() {
  
  const { accessToken, refreshToken, user } = useAuth();
  const params = useParams();
  const moduleId = params.moduleId as string;


  const submission = useSubmissionStore((s) => s.submission);

  // Is used for the students' feedback for the teacher's note
  const [feedback, setFeedback] = useState<"helpful" | "disagree" | null>(null);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false); // Is used for the students' feedback
  
  const [pageRequiresScroll, setPageRequiresScroll] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  useEffect(() => {
    const container = document.getElementById("lesson-scroll");
    if (!container) return;

    const checkScroll = () => {
      const requiresScroll =
        container.scrollHeight > container.clientHeight + 8;

      const atBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 8;

      setPageRequiresScroll(requiresScroll);
      setHasScrolledToBottom(!requiresScroll || atBottom);
    };

    checkScroll();

    container.addEventListener("scroll", checkScroll);

    const observer = new ResizeObserver(checkScroll);
    observer.observe(container);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      observer.disconnect();
    };
  }, []);

  // ── Load ─────────────────────────────────────────────────────────────────
  const { 
    currentModule,
    initialData,
    loadState,
  } = useLessonLoader({user: user, moduleId: moduleId, accessToken: accessToken, refreshToken: refreshToken})


  const handleHelpful = async () => {
    if (!submission?.id) return;
    await studentApi.raiseDispute({
      submissionId: submission?.id,
      note: undefined,
      review: "helpful"
    } satisfies DisputeReview,
    accessToken!,
    refreshToken)

    setFeedback("helpful")
    setSubmitted(true);
  }

  const handleDisagree = async () => {
    if (!submission?.id) return;
    if (review.trim().length < 10) return;

    await studentApi.raiseDispute({
      submissionId: submission?.id,
      note: review,
      review: "disagree"
    },
    accessToken!,
    refreshToken)

    setSubmitted(true)
  }

  // ── Render states ─────────────────────────────────────────────────────────
  if (loadState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={28} className="animate-spin text-purple-mid" />
      </div>
    );
  }

  if (loadState === "error" || !currentModule || !initialData) {
    return (
      <PageShell title="Lesson" backHref="/student/lessons" backLabel="My Lessons">
        <Alert variant="error" title="Loading Failed">
          Failed to load this lesson. Please try again.
        </Alert>
      </PageShell>
    );
  }

  return (
    <>
      <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-5 pb-[72px]" id="lesson-scroll">
        {pageRequiresScroll && !hasScrolledToBottom && (
          <div className="pointer-events-none fixed bottom-[76px] left-1/2 z-20 -translate-x-1/2">
            <button
              type="button"
              onClick={() => {
                document.getElementById("lesson-scroll")?.scrollTo({
                  top: document.getElementById("lesson-scroll")?.scrollHeight,
                  behavior: "smooth",
                });
              }}
              className="cursor-pointer pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-card shadow-md"
            >
              <ChevronDown size={18} className="text-purple" />
            </button>
          </div>
        )}
        <div className="w-full max-w-[680px] mx-auto flex flex-col gap-4">

          {submission?.status === "flagged" && submission?.teacherNote && (
            <div className="border-l-[3px] border-warning bg-warning-light rounded-r-[10px] px-4 py-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-warning">
                Teacher feedback — revision required
              </p>

              <p className="text-[13px] leading-[1.6] text-warning-dark">
                {submission.teacherNote}
              </p>

              {!submitted ? (
                <>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleHelpful}
                      className="rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      👍 Helpful
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeedback("disagree")}
                      className="cursor-pointer rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      👎 I disagree
                    </button>
                  </div>

                  {feedback === "disagree" && (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Tell us what seems incorrect about this feedback..."
                        className="min-h-[110px] w-full rounded-md border border-border bg-white p-3 text-sm outline-none focus:border-warning"
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFeedback(null);
                            setReview("");
                          }}
                          className="cursor-pointer rounded-md border border-border bg-white px-4 py-2 text-sm"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={review.trim().length < 10}
                          onClick={handleDisagree}
                          className="cursor-pointer rounded-md bg-warning px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Send feedback
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-success">
                  ✓ Thanks! Your feedback has been recorded.
                </p>
              )}
            </div>
          )}
          <LessonWorkspace
            initialData={initialData}
            currentModule={currentModule}
            submission={submission}
            user={user!}
            accessToken={accessToken}
            refreshToken={refreshToken}
            hasScrolledToBottom={hasScrolledToBottom}
          />
        </div>
      </div>

    </>
  );
}