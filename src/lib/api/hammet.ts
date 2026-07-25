import { apiClient } from "@/lib/api/api-client";
import {
  type AdminModulesResponse,
  type CurriculumModule,
  type CreateModuleRequest,
  type UpdateModuleResponse,
  type RegisterSchoolRequest,
  type RegisterSchoolResponse,
  type SchoolsListResponseDto,
  type RegisterSchoolResponseDto,
  type DeactivateSchoolResponseDto,
  type CurriculumModuleDto,
  type AdminModulesResponseDto,
  type SchoolsListResponse,
  type DeactivateSchoolResponse,
  type SchoolDetailsItemDto,
  type SchoolDetailsItem,
  toSchoolListResponse,
  toRegisterSchoolResponse,
  toDeactivateSchoolResponse,
  toCurriculumModule,
  toAdminModulesResponse,
  fromRegisterSchoolRequest,
  toSchoolDetailsItem,
  RegisterAdminRequest,
  fromRegisterAdminRequest,
  fromCurriculumModule,
  Disputes,
  DisputesDto,
  toDisputes,
  DisputeReviewPayload,
  fromDisputeReviewPayload,
} from "@/lib/api/types";

// ------------------------------------------------------------
// SCHOOLS
// ------------------------------------------------------------

export async function getSchools(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<SchoolsListResponse> {
  const response = await apiClient.get<SchoolsListResponseDto>("/hammet/schools", token, {
    onRefresh,
  });

  return toSchoolListResponse(response)
}
export async function getSchool(
  schoolId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<SchoolDetailsItem> {
  const response = await apiClient.get<SchoolDetailsItemDto>(`/hammet/schools/${schoolId}`, token, { onRefresh })
  return toSchoolDetailsItem(response)
}



export async function registerSchool(
  body: RegisterSchoolRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<RegisterSchoolResponse> {
  const payload = fromRegisterSchoolRequest(body)
  const response = await apiClient.post<RegisterSchoolResponseDto>(
    "/auth/register/school",
    payload,
    token,
    { onRefresh }
  );

  return toRegisterSchoolResponse(response)
}

export async function registerAdmin(
  body: RegisterAdminRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<boolean> {
  const payload = fromRegisterAdminRequest(body)
  return await apiClient.post<boolean>("/auth/register/admin", payload, token, { onRefresh })
}

export async function deactivateSchool(
  schoolId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<DeactivateSchoolResponse> {
  const response = await apiClient.post<DeactivateSchoolResponseDto>(
    `/hammet/schools/${schoolId}/deactivate`,
    {},
    token,
    { onRefresh }
  );

  return toDeactivateSchoolResponse(response)
}


export async function createModule(
  body: CreateModuleRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<CurriculumModule> {
  const response = await apiClient.post<CurriculumModuleDto>("/hammet/modules", body, token, {
    onRefresh,
  });

  return toCurriculumModule(response)
}

export async function updateModule(
  body: CreateModuleRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<UpdateModuleResponse> {
  return apiClient.put<UpdateModuleResponse>(
    `/hammet/modules`,
    body,
    token,
    { onRefresh }
  );
}


// ------------------------------------------------------------
// MODULES
// ------------------------------------------------------------

export async function getHammetModules(
  tier:string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<AdminModulesResponse> {
  const response = await apiClient.get<AdminModulesResponseDto>(`/hammet/modules?tier=${tier}`, token, {
    onRefresh,
  });

  return toAdminModulesResponse(response)
}

export async function getModule(
  tier: string,
  moduleId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<CurriculumModule> {
  const lessonModule = await apiClient.get<CurriculumModuleDto>(
    `/modules/${moduleId}?tier=${tier}`,
    token,
    { onRefresh }
  )

  return toCurriculumModule(lessonModule)
}

export async function editModule(
  moduleId: string,
  body: CurriculumModule,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<boolean> {
  const payload = fromCurriculumModule(body)
  return await apiClient.patch<boolean>(
    `/hammet/modules/${moduleId}`,
    payload,
    token,
    { onRefresh }
  )
}

// ------------------------------------------------------------
// DISPUTES
// ------------------------------------------------------------
export async function fetchDisputes(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<Disputes> {
  const response = await apiClient.get<DisputesDto>(
    "/hammet/disputes",
    token,
    { onRefresh }
  )
  return toDisputes(response)
}

export async function reviewDispute(
  review: DisputeReviewPayload,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<boolean> {
  const payload = fromDisputeReviewPayload(review)
  return await apiClient.post<boolean>(
    "/hammet/review-dispute",
    payload,
    token,
    { onRefresh }
  )
}