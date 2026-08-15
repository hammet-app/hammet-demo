import { Button } from "@/components/ui";
import {
  ArrowRight,
  Check,
  Clock3,
  Compass,
} from "lucide-react";

type MissionPageProps = {
  title: string;
  description?: string;
  estimatedTime?: number;
  outcomes: string[];
  onStart: () => void;
  mode?: "guided" | "focus";
  onShowTour?: () => void;
};

export function MissionPage({
  title,
  description,
  estimatedTime,
  outcomes,
  onStart,
  mode = "guided",
  onShowTour,
}: MissionPageProps) {
  const isGuided = mode === "guided";

  return (
    <div className="w-full">
      <div
        className={
          isGuided
            ? "mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6"
            : "mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6"
        }
      >
        {/* Mission Hero */}
        <section
          data-tour="mission-header"
          className={
            isGuided
              ? "relative rounded-3xl border border-border bg-bg-card p-6 sm:p-8"
              : "relative rounded-2xl border border-border bg-bg-card p-5 sm:p-6"
          }
        >
          <div className="max-w-2xl space-y-5">
            <span
              className={
                isGuided
                  ? "inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                  : "inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary"
              }
            >
              Today&apos;s Mission
            </span>

            <h1
              className={
                isGuided
                  ? "text-3xl font-bold tracking-tight text-text-primary sm:text-4xl"
                  : "text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
              }
            >
              {title}
            </h1>

            {description && (
              <p
                className={
                  isGuided
                    ? "max-w-xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8"
                    : "max-w-xl text-sm leading-6 text-text-secondary sm:text-base"
                }
              >
                {description}
              </p>
            )}

            {isGuided && onShowTour && (
              <button
                type="button"
                onClick={onShowTour}
                className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
              >
                <Compass className="h-4 w-4" />
                Show me around
              </button>
            )}
          </div>

          {/* Quick start */}
          <div className="mt-6 sm:absolute sm:right-8 sm:bottom-8 sm:mt-0">
            <Button
              data-tour="mission-start-top"
              onClick={onStart}
              size="lg"
              className={
                isGuided
                  ? "h-12 w-full px-6 text-sm font-semibold sm:w-auto"
                  : "h-10 w-full px-5 text-sm font-semibold sm:w-auto"
              }
            >
              Start My Lesson
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Mission Details */}
        <section
          data-tour="mission-time"
          className={
            isGuided
              ? "flex items-center gap-4 rounded-2xl border border-border bg-bg-page px-5 py-4 sm:px-6 sm:py-5"
              : "flex items-center gap-3 rounded-xl border border-border bg-bg-page px-4 py-3"
          }
        >
          <div
            className={
              isGuided
                ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10"
                : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
            }
          >
            <Clock3
              className={isGuided ? "h-5 w-5 text-primary" : "h-4 w-4 text-primary"}
            />
          </div>

          <div className="space-y-0.5">
            <p className="text-sm text-text-secondary">
              Estimated time
            </p>

            <p
              className={
                isGuided
                  ? "font-semibold text-text-primary"
                  : "text-sm font-semibold text-text-primary"
              }
            >
              {estimatedTime
                ? `${estimatedTime} minutes`
                : "Complete at your own pace"}
            </p>
          </div>
        </section>

        {/* Outcomes */}
        <section
          data-tour="mission-outcomes"
          className={
            isGuided
              ? "flex flex-col gap-5"
              : "flex flex-col gap-4"
          }
        >
          <div className="space-y-2">
            <p
              className={
                isGuided
                  ? "text-sm font-semibold uppercase tracking-wider text-primary"
                  : "text-xs font-semibold uppercase tracking-wider text-primary"
              }
            >
              What you&apos;ll learn
            </p>

            <h2
              className={
                isGuided
                  ? "text-2xl font-semibold text-text-primary"
                  : "text-xl font-semibold text-text-primary"
              }
            >
              By the end of this lesson, you&apos;ll be able to:
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {outcomes.map((outcome) => (
              <div
                key={outcome}
                className={
                  isGuided
                    ? "flex items-start gap-4 rounded-xl border border-border bg-bg-page px-5 py-4"
                    : "flex items-start gap-3 rounded-xl border border-border bg-bg-page px-4 py-3"
                }
              >
                <div
                  className={
                    isGuided
                      ? "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10"
                      : "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10"
                  }
                >
                  <Check
                    className={
                      isGuided
                        ? "h-4 w-4 text-primary"
                        : "h-3.5 w-3.5 text-primary"
                    }
                  />
                </div>

                <p
                  className={
                    isGuided
                      ? "leading-7 text-text-primary"
                      : "text-sm leading-6 text-text-primary"
                  }
                >
                  {outcome}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Start Area */}
        <section
          data-tour="mission-start"
          className={
            isGuided
              ? "flex flex-col gap-6 border-t border-border pt-8"
              : "flex flex-col gap-4 border-t border-border pt-6"
          }
        >
          <div className="space-y-2 text-center">
            <h3
              className={
                isGuided
                  ? "text-xl font-semibold text-text-primary"
                  : "text-lg font-semibold text-text-primary"
              }
            >
              Ready to begin?
            </h3>

            {isGuided ? (
              <p className="mx-auto max-w-lg leading-7 text-text-secondary">
                Take your time. You&apos;ll be guided through each part of
                the lesson as you go.
              </p>
            ) : (
              <p className="mx-auto max-w-lg text-sm text-text-secondary">
                Start whenever you&apos;re ready.
              </p>
            )}

            <Button
              onClick={onStart}
              size="lg"
              className={
                isGuided
                  ? "mt-2 h-14 w-full text-base font-semibold"
                  : "mt-1 h-12 w-full text-sm font-semibold"
              }
            >
              Start My Lesson
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}