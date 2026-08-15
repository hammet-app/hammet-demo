import { create } from "zustand";import { SubmissionStatus, ModuleState } from "@/lib/api/types";


type ModuleStateStore = {
  currentTerm: number | null;

  moduleState: Record<string, ModuleState>

  setModuleStates: (
    currentTerm: number,
    states: Record<string, ModuleState>
  ) => void;

  updateProgress: (
    moduleId: string,
    stoppedAt: string | null,
  ) => void;

  updateSubmissionStatus: (
    moduleId: string,
    submissionStatus: SubmissionStatus
  ) => void;

  updateDispute: (
    moduleId: string,
    dispute: boolean,
  ) => void;
}

export const useModuleStateStore = create<ModuleStateStore>((set) => ({
  currentTerm: null,
  moduleState: {},

  setModuleStates: (currentTerm, states) => 
    set ({
      currentTerm: currentTerm,
      moduleState: states,
    }),

  updateProgress: (moduleId, stoppedAt) =>
    set((state) => ({
      moduleState: {
        ...state.moduleState,

        [moduleId]: {
          ...state.moduleState[moduleId],
          stoppedAt,
        }
      }
    })),

  updateSubmissionStatus: (moduleId, submissionStatus) =>
    set((state) => ({
      moduleState: {
        ...state.moduleState,

        [moduleId]: {
          ...state.moduleState[moduleId],
          submissionStatus,
        },
      },
    })),

  updateDispute: (moduleId, dispute) =>
    set((state) => ({
      moduleState: {
        ...state.moduleState,

        [moduleId]: {
          ...state.moduleState[moduleId],
          dispute
        },
      },
    })),
}))