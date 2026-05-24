type SubmissionStatus = "submitted" | "approved" | "flagged";

type AiFormNoReason =
  | "forgot"
  | "didnt_need"
  | "no_access"
  | "not_comfortable"
  | "other";

type AiFormPromptChoice = "same" | "edited";

export type AiFormStateDto = {
  used: boolean | null;
  // if used === false
  no_reason: AiFormNoReason | null;
  no_reason_other: string; // max 20 words — for "other"
  // if used === true
  tool_used: string; // tool_name from lesson or "other"
  tool_other: string; // max 10 words
  task_desc: string; // free-text: what did you use it for
  prompt_choice: AiFormPromptChoice | null;
  edited_prompt: string; // if promptChoice === "edited"
  rating: number | null; // 1–5
  rating_comment: string; // optional
};

// POST /submissions — online submission
export type CreateSubmissionRequestDto = {
  module_id: string;
  activity_text: string;
  reflection_text: string | null;
  file_urls: string[] | null;
  local_id: string;             // client UUID for offline dedup
};

export type CreateSubmissionResponseDto = {
  id: string
  student_id: string
  module_id: string
  activity_text: string | null
  reflection_text: string
  file_urls: string[]| null
  ai_form: AiFormStateDto|null
  status: SubmissionStatus
  teacher_note: string | null
  approved_by: string
  submitted_at: string
  approved_at: string | null
  synced_at: string
  local_id: string           // echoed back so client can reconcile with Dexie
};


// POST /sync/submissions — batch offline sync
// Fires on reconnect via useOnlineStatus hook
// JWT extracted server-side — no user_id needed in body
// If JWT expired, refresh token silently renews it before sync fires
export type SyncSubmissionItemDto = {
  module_id: string;
  reflection_text: string | null;
  file_urls: string[] | null;
  local_id: string;
};

export type SyncSubmissionsRequestDto = {
  submissions: SyncSubmissionItemDto[];
};

export type SyncSubmissionResultDto = {
  local_id: string;
  id: string | null;            // null if server rejected
  status: "synced" | "duplicate" | "failed";
  // duplicate = server already has this local_id, treated as success
  // client marks Dexie record as synced in both synced + duplicate cases
  submitted_at: string | null;
};

export type SyncSubmissionsResponseDto = {
  results: SyncSubmissionResultDto[];
};