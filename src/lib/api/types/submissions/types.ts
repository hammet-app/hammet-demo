export type SubmissionStatus = "submitted" | "approved" | "flagged";

// ─────────────────────────────────────────────────────────────────────────────
// Task file state — keyed by block ID
// ─────────────────────────────────────────────────────────────────────────────

export type TaskFileEntry = {
  /** Uploaded URL (online path) or null if pending */
  url: string | null;
  /** Local File object — present until uploaded or queued */
  file?: File;
  /** Dexie offline queue ID — set when queued offline */
  dexieId?: string;
  /** Upload state */
  status: "uploading" | "done" | "queued" | "error";
  errorMsg?: string; // set when status === "error"
};

export type TaskFilesState = Record<string, TaskFileEntry[]>; // blockId → entries

// ─────────────────────────────────────────────────────────────────────────────
// AI Form state
// ─────────────────────────────────────────────────────────────────────────────

export type AiFormNoReason =
  | "forgot"
  | "didnt_need"
  | "no_access"
  | "not_comfortable"
  | "other";

export type AiFormPromptChoice = "same" | "edited";

export type AiFormState = {
  used: boolean | null;
  // if used === false
  noReason: AiFormNoReason | null;
  noReasonOther: string; // max 20 words — for "other"
  // if used === true
  toolUsed: string; // tool_name from lesson or "other"
  toolOther: string; // max 10 words
  taskDesc: string; // free-text: what did you use it for
  promptChoice: AiFormPromptChoice | null;
  editedPrompt: string; // if promptChoice === "edited"
  rating: number | null; // 1–5
  ratingComment: string; // optional
};

// POST /submissions — online submission
export type CreateSubmissionRequest = {
  moduleId: string;
  activityText: string | null;
  reflectionText: string | null;
  fileUrls: string[] | null;
  aiForm: AiFormState | null;
  localId: string;             // client UUID for offline dedup
};

export type CreateSubmissionResponse = {
  id: string;
  studentId: string
  moduleId: string;
  status: SubmissionStatus;
  activityText: string | null;
  reflectionText: string | null;
  fileUrls: string[] | null;
  submittedAt: string;
  syncedAt: string;
  localId: string;  // echoed back so client can reconcile with Dexie
  teacherNote: string | null
  approvedBy: string
  approvedAt: string | null
};


// POST /sync/submissions — batch offline sync
// Fires on reconnect via useOnlineStatus hook
// JWT extracted server-side — no user_id needed in body
// If JWT expired, refresh token silently renews it before sync fires
export type SyncSubmissionItem = {
  moduleId: string;
  reflectionText: string;
  fileUrls: string[] | null;
  aiForm: AiFormState
  localId: string;
};

export type SyncSubmissionsRequest = {
  submissions: SyncSubmissionItem[];
};

export type SyncSubmissionResult = {
  localId: string;
  id: string | null;            // null if server rejected
  status: "synced" | "duplicate" | "failed";
  // duplicate = server already has this local_id, treated as success
  // client marks Dexie record as synced in both synced + duplicate cases
  submittedAt: string | null;
};

export type SyncSubmissionsResponse = {
  results: SyncSubmissionResult[];
};