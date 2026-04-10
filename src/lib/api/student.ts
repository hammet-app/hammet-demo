import { apiClient } from "@/lib/api/api-client";
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

  getModules: (
    term: number,
    level: string,
    token: string,
    onRefresh: () => Promise<string | null>
  ) =>
    apiClient.get<ModulesResponse>(
      `/modules?term=${term}&level=${encodeURIComponent(level)}`,
      token,
      { onRefresh }
    ),

  getModule: (
    moduleId: string,
    token: string,
    onRefresh: () => Promise<string | null>
  ) =>
    apiClient.get<CurriculumModule>(`/modules/${moduleId}`, token, { onRefresh }),

  submitModule: (
    body: CreateSubmissionRequest,
    token: string,
    onRefresh: () => Promise<string | null>
  ) =>
    apiClient.post<CreateSubmissionResponse>("/submissions", body, token, { onRefresh }),
};
