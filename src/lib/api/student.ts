import { apiClient } from "@/lib/api/api-client";
import { 
  getCachedModuleSummaries, 
  getCachedModule, 
  getCachedModuleState,
  cacheModuleSummaries, 
  cacheModule,
  cacheModuleState,
  markSubmissionSynced,
  clearPendingProgress,
  clearSyncedSubmissions
} from "@/lib/db";
import {
  type Resubmission,
  type StudentProgress,
  type SubmissionHistory,
  type StudentPortfolio,
  type ModulesResponse,
  type CurriculumModule,
  type Submission,
  type CreateSubmissionRequest,
  type CreateSubmissionResponse,
  type SectionProgress,
  type SubmissionDto,
  type SubmissionHistoryDto,
  type StudentPortfolioDto,
  type CurriculumModuleDto,
  type ModulesResponseDto,
  type StudentProgressDto,
  type ModuleStateResponseDto,
  type CreateSubmissionResponseDto,
  toStudentProgress,
  toSubmissionHistory,
  toStudentPortfolio,
  toCurriculumModule,
  toModuleResponse,
  toModuleStateResponse,
  fromSectionProgress,
  fromCreateSubmissionRequest,
  toCreateSubmissionResponse, 
  fromResubmission,
  ModuleSummary,
  DisputeReview,
  fromDisputeReview,
  toSubmission,
} from "@/lib/api/types";
import { useModuleStateStore, useModuleStore, useSubmissionStore } from "@/lib/store"

export const studentApi = {
  getProgress: async (token: string, onRefresh: () => Promise<string | null>): Promise<StudentProgress> =>{
    const progress = await apiClient.get<StudentProgressDto>("/students/me/progress", token, { onRefresh })

    return toStudentProgress(progress)
  },
  getSubmission: async (moduleId:string, token: string, onRefresh: () => Promise<string | null>) => {
    const submission = await apiClient.get<SubmissionDto | null>(`/students/me/submissions/${moduleId}`, token, { onRefresh })
    if (submission) {
      useSubmissionStore.getState().setSubmission(toSubmission(submission))
    } else {
      useSubmissionStore.getState().setSubmission(submission)
    }
  },
  getSubmissions: async (token: string, onRefresh: () => Promise<string | null>): Promise<SubmissionHistory> =>{
    const history = await apiClient.get<SubmissionHistoryDto>("/students/me/submissions", token, { onRefresh })
    return toSubmissionHistory(history)
  }, 
  getPortfolio: async (token: string, onRefresh: () => Promise<string | null>): Promise<StudentPortfolio> =>{
    const portfolio = await apiClient.get<StudentPortfolioDto>("/students/me/portfolio", token, { onRefresh })
    return toStudentPortfolio(portfolio)
  },
  getDispute: async (moduleId: string, token: string, onRefresh: () => Promise<string | null>): Promise<boolean> => {
    return await apiClient.get<boolean>(`/students/me/dispute?module_id=${moduleId}`, token, {onRefresh})
  },
  getModules: async (
    term: number,
    level: string,
    token: string,
    onRefresh: () => Promise<string | null>,
  ) => {

    // 1. Try cache first
    const cached = await getCachedModuleSummaries(term, level)

    if (cached.length > 0) {
      useModuleStore.getState().setModules(cached)
      // Background refresh (optional)
      void apiClient
        .get<ModulesResponseDto>(
          `/modules?term=${term}&level=${encodeURIComponent(level)}`,
          token,
          { onRefresh }
        )
        .then(async (fresh) => {
          const freshed = toModuleResponse(fresh)
          await cacheModuleSummaries(freshed.modules)
        })
        .catch(console.error)

      // Return cached immediately
      return 
    }

    // 2. No cache → fetch backend
    const response = await apiClient.get<ModulesResponseDto>(
      `/modules?term=${term}&level=${encodeURIComponent(level)}`,
      token,
      { onRefresh }
    )
    const modules = toModuleResponse(response)

    // 3. Cache result
    await cacheModuleSummaries(modules.modules)

    useModuleStore.getState().setModules(modules.modules)
  },

  getModule: async (
    moduleId: string,
    token: string,
    onRefresh: () => Promise<string | null>
  ) => {

    // 1. Check cache
    const cached = await getCachedModule(moduleId)

    if (cached) {
      useModuleStore.getState().setCurrentModule(cached)
      // Background refresh
      void apiClient
        .get<CurriculumModuleDto>(
          `/modules/${moduleId}`,
          token,
          { onRefresh }
        )
        .then(async (fresh) => {
          const freshed = toCurriculumModule(fresh)
          await cacheModule(freshed)
        })
        .catch(console.error)
        return
    }

    // 2. Fetch from backend
    const fresh = await apiClient.get<CurriculumModuleDto>(
      `/modules/${moduleId}`,
      token,
      { onRefresh }
    )
    const lessonModule = toCurriculumModule(fresh)
    // 3. Cache
    await cacheModule(lessonModule)

    useModuleStore.getState().setCurrentModule(lessonModule)
  },
  getModuleState: async (studentId: string, token: string, onRefresh: () => Promise<string | null>) => {

    const cached = await getCachedModuleState(studentId)

    if (cached) {
      useModuleStateStore.getState().setModuleStates(
        cached.currentTerm,
        cached.states
      )

      // Background refresh
      void apiClient
        .get<ModuleStateResponseDto>(
          '/students/me/module-state', token, { onRefresh }
        )
        .then(async (fresh) => {
          const freshed = toModuleStateResponse(fresh)
          await cacheModuleState(studentId, freshed)
        })
        .catch(console.error)
        return
    }
    const fresh = await apiClient.get<ModuleStateResponseDto>('/students/me/module-state', token, { onRefresh })
    const res = toModuleStateResponse(fresh)

    await cacheModuleState(studentId, res)
    
    useModuleStateStore.getState().setModuleStates(
      res.currentTerm,
      res.states
    )
  },

  saveProgress: (
    body: SectionProgress,
    token: string,
    onRefresh: () => Promise<string | null>
  ): Promise<boolean> => {
    const payload = fromSectionProgress(body)
    return apiClient.patch<boolean>(
      `/students/me/progress/${payload.module_id}/${payload.section_id}`, 
      undefined,
      token, 
      { onRefresh })
  },

  saveLearningMode: (
    mode: "focus" | "guided",
    token: string,
    onRefresh: () => Promise<string | null>
  ): Promise<boolean> => {
    return apiClient.patch<boolean>(
      `/students/me/learning-mode`,
      {mode: mode},
      token,
      { onRefresh }
    )
  },

  raiseDispute: (
    body: DisputeReview,
    token: string,
    onRefresh: () => Promise<string | null>
  ): Promise<boolean> => {
    const payload = fromDisputeReview(body)

    return apiClient.post<boolean>(
      '/submissions/dispute', payload, token, { onRefresh }
    )
  },

  submitModule: async(
    studentId: string,
    body: CreateSubmissionRequest,
    token: string,
    onRefresh: () => Promise<string | null>
  ): Promise<CreateSubmissionResponse> =>{
    const payload = fromCreateSubmissionRequest(body)
    const res= await apiClient.post<CreateSubmissionResponseDto>("/submissions", payload, token, { onRefresh })
    const response = toCreateSubmissionResponse(res)    

    await markSubmissionSynced(response.localId)
    await clearPendingProgress(studentId)
    await clearSyncedSubmissions()

    return response
  },

  resubmitModule: async(
    studentId: string,
    body: Resubmission,
    token: string,
    onRefresh: () => Promise<string | null>
  ): Promise<CreateSubmissionResponse> => {
    const payload = fromResubmission(body)
    const res = await apiClient.patch<CreateSubmissionResponseDto>(`/submissions/resubmit/${body.id}`, payload, token, { onRefresh })
    const response = toCreateSubmissionResponse(res)

    await markSubmissionSynced(response.localId)
    await clearPendingProgress(studentId)
    await clearSyncedSubmissions()

    return response
  }
};
