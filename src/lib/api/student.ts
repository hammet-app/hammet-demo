import { apiClient } from "@/lib/api/api-client";
import { getCachedModuleSummaries, getCachedModule, cacheModuleSummaries, cacheModule} from "@/lib/db";
import {
  type StudentProgress,
  type SubmissionHistory,
  type StudentPortfolio,
  type ModulesResponse,
  type CurriculumModule,
  type CreateSubmissionRequest,
  type CreateSubmissionResponse,
  type SectionProgress,
  type SubmissionHistoryDto,
  type StudentPortfolioDto,
  type CurriculumModuleDto,
  type ModulesResponseDto,
  type StudentProgressDto,
  type CreateSubmissionResponseDto,
  toStudentProgress,
  toSubmissionHistory,
  toStudentPortfolio,
  toCurriculumModule,
  toModuleResponse,
  fromSectionProgress,
  fromCreateSubmissionRequest,
  toCreateSubmissionResponse,
} from "@/lib/api/types";

export const studentApi = {
  getProgress: async (token: string, onRefresh: () => Promise<string | null>): Promise<StudentProgress> =>{
    const progress = await apiClient.get<StudentProgressDto>("/students/me/progress", token, { onRefresh })

    return toStudentProgress(progress)
  },
  getSubmissions: async (token: string, onRefresh: () => Promise<string | null>): Promise<SubmissionHistory> =>{
    const history = await apiClient.get<SubmissionHistoryDto>("/students/me/submissions", token, { onRefresh })
    return toSubmissionHistory(history)
  }, 
  getPortfolio: async (token: string, onRefresh: () => Promise<string | null>): Promise<StudentPortfolio> =>{
    const portfolio = await apiClient.get<StudentPortfolioDto>("/students/me/portfolio", token, { onRefresh })
    return toStudentPortfolio(portfolio)
  },
  getModules: async (
    term: number,
    level: string,
    token: string,
    onRefresh: () => Promise<string | null>
  ): Promise<ModulesResponse> => {

    // 1. Try cache first
    const cached = await getCachedModuleSummaries(term, level)

    if (cached) {
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
      return { modules: cached, total: cached.length }
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

    return modules
  },

  getModule: async (
    moduleId: string,
    token: string,
    onRefresh: () => Promise<string | null>
  ): Promise<CurriculumModule> => {

    // 1. Check cache
    const cached = await getCachedModule(moduleId)

    if (cached) {

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

      return cached
    }

    // 2. Fetch from backend
    const fresh = await apiClient.get<CurriculumModuleDto>(
      `/modules/${moduleId}`,
      token,
      { onRefresh }
    )
    const module = toCurriculumModule(fresh)
    // 3. Cache
    await cacheModule(module)

    return module
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

  submitModule: async(
    body: CreateSubmissionRequest,
    token: string,
    onRefresh: () => Promise<string | null>
  ): Promise<CreateSubmissionResponse> =>{
    const payload = fromCreateSubmissionRequest(body)
    const response= await apiClient.post<CreateSubmissionResponseDto>("/submissions", payload, token, { onRefresh })
    return toCreateSubmissionResponse(response)
  }
};
