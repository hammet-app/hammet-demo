export type SubmissionStatus = "submitted" | "approved" | "flagged";

// POST /submissions — online submission
export type CreateSubmissionRequest = {
  moduleId: string;
  activityText: string;
  reflectionText: string | null;
  fileUrls: string[] | null;
  localId: string;             // client UUID for offline dedup
};

export type CreateSubmissionResponse = {
  id: string;
  moduleId: string;
  status: SubmissionStatus;
  submittedAt: string;
  syncedAt: string;
  localId: string;             // echoed back so client can reconcile with Dexie
};


// POST /sync/submissions — batch offline sync
// Fires on reconnect via useOnlineStatus hook
// JWT extracted server-side — no user_id needed in body
// If JWT expired, refresh token silently renews it before sync fires
export type SyncSubmissionItem = {
  moduleId: string;
  reflectionText: string | null;
  fileUrls: string[] | null;
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