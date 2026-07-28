import { Button, Alert } from "@/components/ui";
import { Check } from "lucide-react";

type StudentUpdateSuccessCardProps = {
  studentName: string;
  onBack: () => void;
  onEditAgain: () => void;
};

export function StudentUpdateSuccessCard({
  studentName,
  onBack,
  onEditAgain,
}: StudentUpdateSuccessCardProps) {
  return (
    <div className="flex flex-col gap-6">

      <Alert
        variant="success"
        title="Student Updated"
      >
        {studentName}&apos;s information has been updated successfully.
      </Alert>

      <div className="rounded-2xl border border-border bg-bg-card p-6">
        <div className="flex flex-col gap-5">
          {/* Success Icon */}
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-light text-success-dark"
            >
              <Check size={22} />
            </div>

            <div>
              <h2
                className="text-lg font-semibold"
                style={{
                  fontFamily: "var(--font-head)",
                }}
              >
                Changes Saved
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Your changes have been saved successfully.
              </p>
            </div>
          </div>

          {/* Student */}
          <div className="rounded-xl bg-bg-page p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Student
            </p>

            <p className="mt-2 font-semibold text-text-primary">
              {studentName}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onEditAgain}
            >
              Make Another Change
            </Button>

            <Button
              className="flex-1"
              onClick={onBack}
            >
              Back to Students
            </Button>
          </div>

        </div>
      </div>

    </div>
  );
}