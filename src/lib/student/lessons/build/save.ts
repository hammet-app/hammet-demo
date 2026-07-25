import { AiFormState, PreviewLink } from "@/lib/api/types";
import { submitLesson } from "@/lib/db";



// ─────────────────────────────────────────────────────────────────────────────
// Offline save helper
// ─────────────────────────────────────────────────────────────────────────────
export async function saveOffline(
  id: string | null,
  studentId: string,
  moduleId: string,
  fileUrls: PreviewLink[],
  otherUrls: PreviewLink[],
  aiForm: AiFormState | null,
  syncStatus: "pending" | "synced" | "failed" | "draft",
  submissionType: "submit" | "resubmit",
  activityText?: string,
  reflectionText?: string,
  accessToken?: string
): Promise<void> {
  try {
    await submitLesson({
      id,
      studentId,
      moduleId,
      fileUrls,
      otherUrls,
      activityText,
      reflectionText,
      aiForm,
      syncStatus,
      submissionType,
      accessToken,
    });
  } catch {
    // best-effort — never throw
  }
}