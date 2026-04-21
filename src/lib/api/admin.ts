import { apiClient } from "./api-client";
import type {
  DeleteResponse,
  RegisterTeacherRequest,
  RegisterTeacherResponse,
  RegisterStudentRequest,
  RegisterStudentResponse,
  BulkRegisterResponse,
  ParentLinkSendResponse,
  PromotionPreviewResponse,
  PromotionConfirmRequest,
  PromotionConfirmResponse,
  AdminModulesResponse,
  CurriculumModule,
  SchoolProfile,
  AdminStudentsResponse,
  BulkRegisterRequest,
} from "@/lib/api/api-types";

// ------------------------------------------------------------
// SCHOOL
// ------------------------------------------------------------

export async function getSchoolProfile(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<SchoolProfile> {
  return apiClient.get<SchoolProfile>("/admin/school", token, { onRefresh });
}

// ------------------------------------------------------------
// STUDENTS
// ------------------------------------------------------------

export async function getAdminStudents(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<AdminStudentsResponse> {
  return apiClient.get<AdminStudentsResponse>("/admin/students", token, {
    onRefresh,
  });
}

export async function deleteStudent(
  studentId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(
    `/admin/students/${studentId}`,
    token,
    { onRefresh }
  );
}

export async function registerStudent(
  body: RegisterStudentRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<RegisterStudentResponse> {
  return apiClient.post<RegisterStudentResponse>(
    "/auth/register/student",
    body,
    token,
    { onRefresh }
  );
}

export async function bulkRegisterStudents(
  csvText: BulkRegisterRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<BulkRegisterResponse> {
  return apiClient.post<BulkRegisterResponse>(
    "/auth/register/students/bulk",
    csvText,
    token,
    { onRefresh }
  );
}

// ------------------------------------------------------------
// PROMOTION
// ------------------------------------------------------------

export async function previewPromotion(
  csvText: BulkRegisterRequest,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<PromotionPreviewResponse> {
  console.log(`API ${csvText}`)
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

// ------------------------------------------------------------
// PARENT LINKS
// ------------------------------------------------------------

export async function sendParentLink(
  studentId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<ParentLinkSendResponse> {
  return apiClient.post<ParentLinkSendResponse>(
    `/admin/parent-links/${studentId}/send`,
    {},
    token,
    { onRefresh }
  );
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

// ------------------------------------------------------------
// MODULES (read-only — published only, student-facing endpoint)
// ------------------------------------------------------------

export async function getAdminModules(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<AdminModulesResponse> {
  return apiClient.get<AdminModulesResponse>("/admin/modules", token, {
    onRefresh,
  });
}


export async function getModuleDetail(
  moduleId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<CurriculumModule> {
  return apiClient.get<CurriculumModule>(`/modules/${moduleId}`, token, {
    onRefresh,
  });
}
