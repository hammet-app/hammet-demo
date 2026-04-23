import { apiClient } from "./api-client";
import type {
  TeacherClassesResponse,
  ClassStudentsResponse,
  PendingSubmissionsResponse,
  SubmissionDetail,
  SubmissionReviewResponse,
  FlagSubmissionRequest,
  StudentDetail,
  ModulesResponse,
  CurriculumModule,
} from "@/lib/api/api-types";

export async function getTeacherClasses(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<TeacherClassesResponse> {
  return apiClient.get<TeacherClassesResponse>("/teacher/classes", token, {
    onRefresh,
  });
}

export async function getTeacherModules(
  level: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<ModulesResponse> {
    return apiClient.get<ModulesResponse>(
      `/teacher/lessons/${encodeURIComponent(level)}`,
      token,
      { onRefresh }
    );
}

export async function getModule(
    moduleId: string,
    token: string,
    onRefresh: () => Promise<string | null>
): Promise<CurriculumModule> {
    return apiClient.get<CurriculumModule>(
      `/modules/${moduleId}`, 
      token, 
      { onRefresh }
    );
}

export async function getClassStudents(
  level: string,
  arm: string | null,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<ClassStudentsResponse> {
  const path =
    arm != null
      ? `/teacher/classes/students?level=${level}&arm=${arm}`
      : `/teacher/classes/students?level=${level}`;
  return apiClient.get<ClassStudentsResponse>(path, token, { onRefresh });
}

export async function getPendingSubmissions(
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<PendingSubmissionsResponse> {
  return apiClient.get<PendingSubmissionsResponse>(
    "/teacher/submissions/pending",
    token,
    { onRefresh }
  );
}

export async function getSubmissionDetail(
  id: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<SubmissionDetail> {
  return apiClient.get<SubmissionDetail>(
    `/teacher/submissions/${id}`,
    token,
    { onRefresh }
  );
}

export async function approveSubmission(
  id: string,
  reviewed_at: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<SubmissionReviewResponse> {
  return apiClient.post<SubmissionReviewResponse>(
    `/teacher/submissions/${id}/approve`,
    {"status": "approved",
      "reviewed_at": reviewed_at},
    token,
    { onRefresh }
  );
}

export async function flagSubmission(
  id: string,
  body: FlagSubmissionRequest,
  reviewed_at: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<SubmissionReviewResponse> {
  return apiClient.post<SubmissionReviewResponse>(
    `/teacher/submissions/${id}/flag`,
    { 
      "status": "flagged",
      "teacher_note": body.teacher_note,
      "reviewed_at":reviewed_at
    },
    token,
    { onRefresh }
  );
}

export async function getStudentDetail(
  studentId: string,
  token: string,
  onRefresh: () => Promise<string | null>
): Promise<StudentDetail> {
  return apiClient.get<StudentDetail>(
    `/teacher/students/${studentId}`,
    token,
    { onRefresh }
  );
}
