import { PreviewLink } from "../student";

export type SubmissionStatus = "submitted" | "approved" | "flagged";

// ─────────────────────────────────────────────────────────────────────────────
// Task file state — keyed by block ID
// ─────────────────────────────────────────────────────────────────────────────

export type TaskFileEntry = {
  id: string;
  /** Id of the task the file is connected to */
  taskId: string;
  /** Uploaded URL (online path) or null if pending */
  url: string | null;
  /** Local File object — present until uploaded or queued */
  file?: File;
  fileName: string;
  type?: string;
  /** Dexie offline queue ID — set when queued offline */
  dexieId?: string;
  /** Upload state */
  status: "uploading" | "done" | "queued" | "error";
  errorMsg?: string; // set when status === "error"
};

export type SubmittedAsset = {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  size: number;
}

export type SubmissionLink = {
  taskId: string;
  url: string;
}

export type TaskLinksState = Record<string, SubmissionLink[]>; // blockId -> entries
export type TaskFilesState = Record<string, TaskFileEntry[]>; // blockId → entries

export type UploadRequest = {
  name: string;
  type: string;
  moduleId: string
}

export type UploadRequests = {
  files: UploadRequest[]
}

export type UploadResponse = {
  signed: {
    path: string;
    signed_url: string;
    signedUrl: string;
    token: string;
  }
}

export type UploadResponses = {
  signeds: UploadResponse[]
}

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

export type QuestionAnswer = {
  questionId: string;
  optionId: string;
};

// POST /submissions — online submission
export type CreateSubmissionRequest = {
  moduleId: string;
  activityText: string;
  reflectionText: string | null;
  fileUrls: PreviewLink[] | null;
  otherUrls: PreviewLink[] | null;
  aiForm?: AiFormState | null;
  questionAnswers?: QuestionAnswer[];
  localId: string;    // client UUID for offline dedup
};

export type CreateSubmissionResponse = {
  id: string;
  studentId: string
  moduleId: string;
  status: SubmissionStatus;
  activityText: string | null;
  reflectionText: string | null;
  aiForm: AiFormState | null;
  fileUrls: PreviewLink[] | null;
  otherUrls: PreviewLink[] | null;
  questionAnswers?: QuestionAnswer[];
  submittedAt: string;
  syncedAt: string;
  localId: string;  // echoed back so client can reconcile with Dexie
  teacherNote: string | null
  approvedBy: string
  approvedAt: string | null
};

export type CreateSubmissionResponses = {
  submissions: CreateSubmissionResponse[]
}

export type Resubmission = {
  id: string;
  activityText: string;
  reflectionText: string | null;
  fileUrls: PreviewLink[] | null;
  otherUrls: PreviewLink[] | null;
  aiForm: AiFormState | null;
  localId: string;
}


// POST /sync/submissions — batch offline sync
// Fires on reconnect via useOnlineStatus hook
// JWT extracted server-side — no user_id needed in body
// If JWT expired, refresh token silently renews it before sync fires
export type SyncSubmissionItem = {
  moduleId: string;
  activityText: string | null;
  reflectionText: string;
  fileUrls: string[] | null;
  otherUrls: string[] | null;
  aiForm: AiFormState | null;
  questionAnswers?: QuestionAnswer[];
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