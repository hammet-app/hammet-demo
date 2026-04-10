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
  ModulesResponse,
  CurriculumModule,
} from "./api-types";
import type {
  SchoolProfileV2,
  AdminStudentsResponseV2,
} from "../../../../New folder/files/admin-api-types";

// ------------------------------------------------------------
// SCHOOL
// ------------------------------------------------------------

export async function getSchoolProfile(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<SchoolProfileV2> {
  return apiClient.get<SchoolProfileV2>("/admin/school", token, { onRefresh });
}

// ------------------------------------------------------------
// STUDENTS
// ------------------------------------------------------------

export async function getAdminStudents(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<AdminStudentsResponseV2> {
  return apiClient.get<AdminStudentsResponseV2>("/admin/students", token, {
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
  csvText: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<BulkRegisterResponse> {
  // Send as multipart form with a text blob so the backend
  // receives it as a CSV file upload. Adjust if backend
  // prefers raw text body — swap FormData for { csv: csvText }.
  const formData = new FormData();
  const blob = new Blob([csvText], { type: "text/csv" });
  formData.append("file", blob, "students.csv");
  return apiClient.post<BulkRegisterResponse>(
    "/auth/register/students/bulk",
    formData,
    token,
    { onRefresh }
  );
}

// ------------------------------------------------------------
// PROMOTION
// ------------------------------------------------------------

export async function previewPromotion(
  csvText: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<PromotionPreviewResponse> {
  const formData = new FormData();
  const blob = new Blob([csvText], { type: "text/csv" });
  formData.append("file", blob, "retained.csv");
  return apiClient.post<PromotionPreviewResponse>(
    "/admin/students/promote/preview",
    formData,
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

export async function getModulesForLevel(
  term: number,
  level: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<ModulesResponse> {
  return apiClient.get<ModulesResponse>(
    `/modules?term=${term}&level=${encodeURIComponent(level)}`,
    token,
    { onRefresh }
  );
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
