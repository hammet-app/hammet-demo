import { Button } from "@/components/ui"
import { ArrowRight, Check, Clock3, Target } from "lucide-react"


type MissionPageProps = {
  title: string
  description?: string
  estimatedTime? : number
  outcomes: string[]
  onStart: () => void
}

export function MissionPage({
  title,
  description,
  estimatedTime,
  outcomes,
  onStart
}: MissionPageProps) {
  return (
    <div 
      className="w-full max-4xl overflow-hidden rounded-3xl border border-border bg-bg-card shadow-sm"
    >
      <div className="px-10 py-12">
        <div className="flex flex-col gap-10">
          {/*Mission Hero*/}
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Target className="h9 w9 text-primary" />
            </div>

            <div className="max-w-2xl space-y-4">
              <span 
                className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold
                uppercase tracking-[0.18em] text-primary"
              >
                Today&apos;s Mission
              </span>

              <h1 className="text-4xl font-bold tracking-tight text-text-primary">
                {title}
              </h1>
              <p className="text-lg leading-8 text-text-secondary">
                {description}
              </p>
            </div>

          </div>
          {/* Mission Details*/}
          <div className="flex flex-col gap-8">
            <div 
              className="flex items-center justify-between rounded-2xl border border-border bg-bg-page px-6 py-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Clock3 className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-text-secondary">
                  Estimated Time
                </p>
                <p className="font-semibold text-text-primary">
                  Complete at your own pace
                </p>

                <p className="text-lg font-bold text-text-primary">
                  {estimatedTime ?? "15 mins"}
                </p>
              </div>
            </div>
            

            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                  By the end of this lesson
                </p>
                <h2 className="text-2xl font-semibold text-text-primary">
                  You&apos;ll be able to...
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {outcomes.map((outcome) => (
                  <div
                    key={outcome}
                    className="flex items-start gap-4 rounded-xl border border-border bg-bg-page px-5 py-4"
                  >
                    <div 
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10"
                    >
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p className="leading-7 text-text-primary">
                      {outcome}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/*Footer Section*/}
          <div className="flex flex-col gap-6 border-t border-border pt-8">
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-semibold text-text-primary">
                Ready to begin?
              </h3>
              <p className="max-w-lg mx-auto leading-7 text-text-secondary">
                Take your time, think critically, and don&apos;t worry about getting everything right on the first try.
              </p>
              <Button onClick={onStart} size="lg" className="w-full h-14 text-base font-semibold">
                Start Learning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}