import { apiClient } from "./api-client";
import type {
  AdminModulesResponse,
  CurriculumModule,
  CreateModuleRequest,
  UpdateModuleResponse,
  RegisterSchoolRequest,
  RegisterSchoolResponse,
} from "./api-types";
import type {
  SchoolsListResponse,
  DeactivateSchoolResponse,
} from "@/lib/api/api-types";

// ------------------------------------------------------------
// SCHOOLS
// ------------------------------------------------------------

export async function getSchools(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<SchoolsListResponse> {
  return apiClient.get<SchoolsListResponse>("/admin/schools", token, {
    onRefresh,
  });
}

export async function registerSchool(
  body: RegisterSchoolRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<RegisterSchoolResponse> {
  return apiClient.post<RegisterSchoolResponse>(
    "/auth/register/school",
    body,
    token,
    { onRefresh }
  );
}

export async function deactivateSchool(
  schoolId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<DeactivateSchoolResponse> {
  return apiClient.post<DeactivateSchoolResponse>(
    `/admin/schools/${schoolId}/deactivate`,
    {},
    token,
    { onRefresh }
  );
}


export async function createModule(
  body: CreateModuleRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<CurriculumModule> {
  return apiClient.post<CurriculumModule>("/admin/modules", body, token, {
    onRefresh,
  });
}

export async function updateModule(
  moduleId: string,
  body: CreateModuleRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<UpdateModuleResponse> {
  return apiClient.put<UpdateModuleResponse>(
    `/admin/modules/${moduleId}`,
    body,
    token,
    { onRefresh }
  );
}


// ------------------------------------------------------------
// MODULES
// ------------------------------------------------------------

export async function getAdminModules(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<AdminModulesResponse> {
  return apiClient.get<AdminModulesResponse>("/admin/modules", token, {
    onRefresh,
  });
}
