import { Button } from "@/components/ui";
import { Dispute } from "@/lib/api/types";
import { StatusBadge } from "../../../badges/StatusBadge";

type Props = {
  dispute: Dispute | null;
  reviewNote: string;
  onReviewNoteChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
};

export function DisputeReviewModal({
  dispute,
  reviewNote,
  onReviewNoteChange,
  onSave,
  onClose,
  isSaving,
}: Props) {
  if (!dispute) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">

        <div className="border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Review AI Decision
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 text-gray-900 dark:text-gray-100">

          <div className="mb-6 grid grid-cols-2 gap-6">

            <div>
              <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Student
              </label>

              <p className="font-mono">
                {dispute.studentId}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500">
                Module
              </label>

              <p>{dispute.moduleTitle}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500">
                AI Status
              </label>

              <div className="mt-1">
                <StatusBadge status={dispute.aiStatus} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500">
                AI Score
              </label>

              <p>{dispute.aiScore}</p>
            </div>

          </div>

          <div className="space-y-6">

            <div>
              <label className="mb-2 block font-medium">
                Original Submission
              </label>

              <textarea
                readOnly
                rows={6}
                value={dispute.originalResponse}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-3 text-gray-900 dark: text-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                AI Feedback to Student
              </label>

              <textarea
                readOnly
                rows={5}
                value={dispute.studentReview}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-3 text-gray-900 dark: text-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Student Dispute
              </label>

              <textarea
                readOnly
                rows={5}
                value={dispute.studentDisputeNote}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-3 text-gray-900 dark: text-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Admin Review
              </label>

              <textarea
                rows={5}
                value={reviewNote}
                onChange={(e) =>
                  onReviewNoteChange(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-purple"
                placeholder="Explain what the AI got right or wrong..."
              />
            </div>

          </div>

        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-zinc-800 px-6 py-4">

          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : "Save Review"}
          </Button>

        </div>

      </div>
    </div>
  );
}