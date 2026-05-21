type SubmissionStatus = "submitted" | "approved" | "flagged";

// POST /submissions — online submission
export type CreateSubmissionRequestDto = {
  module_id: string;
  activity_text: string;
  reflection_text: string;
  file_urls: string[] | null;
  local_id: string;             // client UUID for offline dedup
};

export type CreateSubmissionResponseDto = {
  id: string;
  module_id: string;
  status: SubmissionStatus;
  submitted_at: string;
  synced_at: string;
  local_id: string;             // echoed back so client can reconcile with Dexie
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