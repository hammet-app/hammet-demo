import { apiClient } from "./api-client";
import {
  type DeleteResponse,
  //type RegisterTeacherRequest,
  //type RegisterTeacherResponse,
  type RegisterStudentRequest,
  type RegisterStudentResponse,
  type BulkRegisterResponse,
  type ParentLinkSendResponse,
  type SchoolProfileDto,
  //PromotionPreviewResponse,
  //PromotionConfirmRequest,
  //PromotionConfirmResponse,
  type AdminModulesResponse,
  type CurriculumModule,
  type SchoolProfile,
  type AdminModulesResponseDto,
  type CurriculumModuleDto,
  type RegisterStudentResponseDto,
  type BulkRegisterResponseDto,
  type AdminStudentsResponse,
  type BulkRegisterRequest,
  type ResendVerificationRequest,
  type ResendVerificationResponse,
  type UserUpdateRequest,
  type UserUpdateResponse,
  type AdminStudentsResponseDto,
  toAdminModulesResponse,
  toAdminStudentResponse,
  fromUpdateUserRequest,
  fromRegisterStudentRequest,
  toRegisterStudentResponse,
  toBulkRegisterResponse,
  ParentLinkSendResponseDto,
  toParentLinkSendResponse,
  toCurriculumModule,
  toSchoolProfile
} from "@/lib/api/types";

// ------------------------------------------------------------
// SCHOOL
// ------------------------------------------------------------

export async function getSchoolProfile(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<SchoolProfile> {
  const response = await apiClient.get<SchoolProfileDto>("/admin/school", token, { onRefresh });
  return toSchoolProfile(response)
}

// ------------------------------------------------------------
// STUDENTS
// ------------------------------------------------------------

export async function getAdminStudents(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<AdminStudentsResponse> {
  const response = await apiClient.get<AdminStudentsResponseDto>("/admin/students", token, {
    onRefresh,
  });

  return toAdminStudentResponse(response)
}

export async function updateStudent(
  studentId: string,
  body: UserUpdateRequest,
  token: string,
  onRefresh: () => Promise<string | null> 
): Promise<UserUpdateResponse> {
  const payload = fromUpdateUserRequest(body)
  return await apiClient.patch<UserUpdateResponse>(`/admin/students/${studentId}`, payload, token, { onRefresh })
}

export async function deleteStudent(
  studentId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(
    `/admin/students/${studentId}`,
    null,
    token,
    { onRefresh }
  );
}

export async function registerStudent(
  body: RegisterStudentRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<RegisterStudentResponse> {
  const payload = fromRegisterStudentRequest(body)
  const response = await apiClient.post<RegisterStudentResponseDto>(
    "/auth/register/student",
    payload,
    token,
    { onRefresh }
  );

  return toRegisterStudentResponse(response)
}

export async function bulkRegisterStudents(
  csvText: BulkRegisterRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<BulkRegisterResponse> {
  const response = await apiClient.post<BulkRegisterResponseDto>(
    "/auth/register/students/bulk",
    csvText,
    token,
    { onRefresh }
  );

  return toBulkRegisterResponse(response)
}

export async function resendCode(
  body:ResendVerificationRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<ResendVerificationResponse> {
  return apiClient.post<ResendVerificationResponse>(
    "/auth/resend",
    body,
    token,
    { onRefresh }
  );
}

// ------------------------------------------------------------
// PROMOTION
// ------------------------------------------------------------
/**
export async function previewPromotion(
  csvText: BulkRegisterRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<PromotionPreviewResponse> {
  return apiClient.post<PromotionPreviewResponse>(
    "/admin/students/promote/preview",
    csvText,
    token,
    { onRefresh }
  );
}

export async function confirmPromotion(
  body: PromotionConfirmRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<PromotionConfirmResponse> {
  return apiClient.post<PromotionConfirmResponse>(
    "/admin/students/promote/confirm",
    body,
    token,
    { onRefresh }
  );
}
  */

// ------------------------------------------------------------
// PARENT LINKS
// ------------------------------------------------------------

export async function sendParentLink(
  studentId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<ParentLinkSendResponse> {
  const response = await apiClient.post<ParentLinkSendResponseDto>(
    `/admin/parent-links/${studentId}/send`,
    {},
    token,
    { onRefresh }
  );

  return toParentLinkSendResponse(response)
}

export async function revokeParentLink(
  studentId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<DeleteResponse> {
  return apiClient.post<DeleteResponse>(
    `/admin/parent-links/${studentId}/revoke`,
    {},
    token,
    { onRefresh }
  );
}
/**
// ------------------------------------------------------------
// TEACHERS
// ------------------------------------------------------------

export async function getAdminTeachers(
  token: string,
  onRefresh: () => Promise<string | null>
) {
  return apiClient.get("/admin/teachers", token, { onRefresh });
}

export async function deleteTeacher(
  teacherId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(
    `/admin/teachers/${teacherId}`,
    token,
    { onRefresh }
  );
}

export async function registerTeacher(
  body: RegisterTeacherRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<RegisterTeacherResponse> {
  return apiClient.post<RegisterTeacherResponse>(
    "/auth/register/teacher",
    body,
    token,
    { onRefresh }
  );
}
*/
// ------------------------------------------------------------
// MODULES (read-only — published only, student-facing endpoint)
// ------------------------------------------------------------

export async function getAdminModules(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<AdminModulesResponse> {
  const response = await apiClient.get<AdminModulesResponseDto>("/admin/modules", token, {
    onRefresh,
  });

  return toAdminModulesResponse(response)
}


export async function getModuleDetail(
  moduleId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<CurriculumModule> {
  const response = await apiClient.get<CurriculumModuleDto>(`/modules/${moduleId}`, token, {
    onRefresh,
  });

  return toCurriculumModule(response)
}
