import { Check } from "lucide-react"

type ImportStep =
    | "upload"
    | "review"
    | "importing"
    | "complete";

type ImportStepperProps = {
    current: ImportStep;
};

export function ImportStepper({
    current,
}: ImportStepperProps) {
  const steps = [
    {
      key: "upload",
      label: "Upload",
    },
    {
      key: "review",
      label: "Review",
    },
    {
      key: "importing",
      label: "Import",
    },
    {
      key: "complete",
      label: "Complete",
    },
  ] as const;

  const currentIndex =
    steps.findIndex(
      step => step.key === current
    );

  return (
    <div
      className="grid grid-cols-4 gap-6 items-start"
    >
      {steps.map((step, index) => {

        const complete =
          index < currentIndex;

        const active =
          index === currentIndex;

        const showCheck = complete || current ==="complete"

        return (

          <div
            key={step.key}
          >
            <div className="flex flex-col items-center flex-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2
                  ${complete
                      ? "bg-success border-success text-white"
                      : active
                      ? "border-purple-mid bg-purple-light text-purple-mid"
                      : "border-border bg-bg-card text-text-muted"
                  }
                `}
              >

                {showCheck ?(
                  <Check size={18} strokeWidth={3} />
                ):( 
                  index + 1
                )}

              </div>

              <p className=" mt-3 text-sm font-medium">
                  {step.label}
              </p>

            </div>
          </div>
        );

      })}

    </div>

  );
}