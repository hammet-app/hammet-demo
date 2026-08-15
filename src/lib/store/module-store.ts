import { create } from "zustand";
import { ModuleSummary, CurriculumModule } from "@/lib/api/types";

type ModuleStore = {
  modules: ModuleSummary[];
  currentModule: CurriculumModule | null;

  setModules: (modules: ModuleSummary[]) => void;
  setCurrentModule: (module: CurriculumModule) => void;
}

export const useModuleStore = create<ModuleStore>((set) => ({
  modules: [],
  currentModule: null,

  setModules: (modules) =>
    set({
      modules,
    }),

  setCurrentModule: (module) =>
    set({
      currentModule: module,
    }),
})) 