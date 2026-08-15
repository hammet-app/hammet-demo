import { create } from "zustand";
import { Submission } from "@/lib/api/types"

type SubmissionStore = {
  submission: Submission | null;

  setSubmission:(submission: Submission | null) => void;

  clearSubmission: () => void;
}

export const useSubmissionStore = create<SubmissionStore>((set) => ({
  submission: null,

  setSubmission: (submission) =>
    set ({
      submission: submission
    }),

  clearSubmission() {
    set ({
      submission: null
    })
  },

}))
