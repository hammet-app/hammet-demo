import { apiClient } from "@/lib/api/api-client";
import { cacheModules , getModulesForTerm, getCachedModule} from "@/lib/db";
import type {
  StudentProgress,
  SubmissionHistory,
  StudentPortfolio,
  ModulesResponse,
  CurriculumModule,
  CreateSubmissionRequest,
  CreateSubmissionResponse,
} from "@/lib/api/api-types";

export const studentApi = {
  getProgress: (token: string, onRefresh: () => Promise<string | null>) =>
    apiClient.get<StudentProgress>("/students/me/progress", token, { onRefresh }),

  getSubmissions: (token: string, onRefresh: () => Promise<string | null>) =>
    apiClient.get<SubmissionHistory>("/students/me/submissions", token, { onRefresh }),

  getPortfolio: (token: string, onRefresh: () => Promise<string | null>) =>
    apiClient.get<StudentPortfolio>("/students/me/portfolio", token, { onRefresh }),

  getModules: async (
  term: number,
  level: string,
  token: string,
  onRefresh: () => Promise<string | null>
  ): Promise<ModulesResponse> => {

    // 1. Try cache first
    const cached = await getModulesForTerm(term, level)

    if (cached) {
      // Background refresh (optional)
      void apiClient
        .get<ModulesResponse>(
          `/modules?term=${term}&level=${encodeURIComponent(level)}`,
          token,
          { onRefresh }
        )
        .then(async (fresh) => {
          await cacheModules(fresh.modules)
        })
        .catch(console.error)

      // Return cached immediately
      return { modules: cached, total: cached.length }
    }

    // 2. No cache → fetch backend
    const response = await apiClient.get<ModulesResponse>(
      `/modules?term=${term}&level=${encodeURIComponent(level)}`,
      token,
      { onRefresh }
    )

    // 3. Cache result
    await cacheModules(response.modules)

    return response
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
        .get<CurriculumModule>(
          `/modules/${moduleId}`,
          token,
          { onRefresh }
        )
        .then(async (fresh) => {
          await cacheModules([fresh])
        })
        .catch(console.error)

      return cached
    }

    // 2. Fetch from backend
    const fresh = await apiClient.get<CurriculumModule>(
      `/modules/${moduleId}`,
      token,
      { onRefresh }
    )

    // 3. Cache
    await cacheModules([fresh])

    return fresh
  },
  submitModule: (
    body: CreateSubmissionRequest,
    token: string,
    onRefresh: () => Promise<string | null>
  ) =>
    apiClient.post<CreateSubmissionResponse>("/submissions", body, token, { onRefresh }),
};
