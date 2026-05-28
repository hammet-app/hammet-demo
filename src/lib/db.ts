// lib/db.ts
// Local-first database using Dexie (IndexedDB wrapper).
// This is where all student work lives on the device.
// Everything here is available offline, 100% of the time.

import Dexie, { type Table } from 'dexie'
import { apiClient } from '@/lib/api/api-client'
import { AuthUser } from '@/lib/utils/roles'
import { 
  type CurriculumContentJson, 
  type ModuleSummary, 
  type AiFormState,
  type AiFormStateDto,
  type CreateSubmissionResponse,
  type CreateSubmissionResponseDto,
  type CreateSubmissionResponsesDto,
  type CreateSubmissionResponses,
  fromAiFormState,
  toCreateSubmissionResponse,
  toCreateSubmissionResponses,
} from '@/lib/api/types'

// ── Types ────────────────────────────────────────────────────────────────────

export interface CachedSession {
  id: 'current'                // singleton row
  user: AuthUser
  accessToken: string
  cachedAt: string
}

export interface LocalSubmission {
  id: string | null
  localId: string           // client-generated UUID — used for server dedup
  studentId: string
  moduleId: string
  activityText?: string
  reflectionText?: string
  fileUrls: string[]       // uploaded Supabase Storage URLs (may be empty)
  aiForm: AiFormState |null;
  submittedAt: string       // ISO timestamp
  syncStatus: 'pending' | 'synced' | 'failed' | 'draft'
  syncAttempts: number
  submissionType: 'submit' | 'resubmit'
}

type LocalSubmissionDto = {
  local_id: string
  student_id: string
  module_id: string
  activity_text: string | null
  reflection_text: string
  file_urls: string[]
  ai_form: AiFormStateDto | null,
  submitted_at: string
}

export interface LocalPortfolioEntry {
  localId: string
  studentId: string
  moduleId: string
  moduleTitle: string
  reflectionText?: string
  skillsEarned: string[]
  createdAt: string
  synced: boolean
}

/**
 * Cached after getModules() — powers the lessons list page offline.
 * Mirrors ModuleSummary + submission_status for lock/pill display.
 */
export interface CachedModuleSummary {
  id: string
  term: number
  weekNumber: number
  level: string
  title: string
  published: boolean
  submissionStatus: "not_started" | "submitted" | "approved" | "flagged" | null
  cachedAt: string
}

/**
 * Cached after getModule() — powers the lesson detail page offline.
 * Mirrors CurriculumModule

 */
export interface CachedModule {
  id: string
  term: number
  weekNumber: number
  level: string
  title: string
  description?: string
  contentJson: CurriculumContentJson
  updatedAt: string
  published: boolean
  createdAt: string
  stoppedAt: string | null   // mirrors backend — section_id or null
  cachedAt: string
}

export interface PendingProgress {
  moduleId: string        // primary key
  studentId: string
  sectionId: string       // last section_id the student reached
  updatedAt: string       // ISO timestamp — for debugging, not logic
}

export interface LocalFileQueue {
  id: string              // client UUID — used as dexieId in TaskFileEntry
  studentId: string
  moduleId: string
  blockId: string         // which task block this file belongs to
  path: string            // Supabase Storage path: uploads/{studentId}/{timestamp}_filename
  blob: Blob              // compressed blob ready for upload
  fileName: string        // original file name for display
  mimeType: string
  uploadStatus: 'pending' | 'uploading' | 'done' | 'failed'
  uploadAttempts: number
  createdAt: string
}

// ── Database ─────────────────────────────────────────────────────────────────

class HammetLabsDB extends Dexie {
  submissions!:      Table<LocalSubmission>
  portfolioEntries!: Table<LocalPortfolioEntry>
  modules!:          Table<CachedModule>
  moduleSummaries!:  Table<CachedModuleSummary>
  fileQueue!:        Table<LocalFileQueue>
  session!:          Table<CachedSession>
  pendingProgress!:  Table<PendingProgress>

  constructor() {
    super('hammetlabs-db')

    this.version(1).stores({
      submissions:      'localId, studentId, moduleId, syncStatus',
      portfolioEntries: 'localId, studentId, moduleId',
      modules:          'id, term, level, [term+level]',
    })

    // version 2: adds fileQueue table + activityText/file_urls on submissions
    // Dexie migrations are additive — existing tables and rows are untouched
    this.version(2).stores({
      submissions:      'localId, studentId, moduleId, syncStatus',
      portfolioEntries: 'localId, studentId, moduleId',
      modules:          'id, term, level, [term+level]',
      fileQueue:        'id, studentId, moduleId, blockId, uploadStatus',
    })

    // version 3: singleton session cache for offline auth
    this.version(3).stores({
      submissions:      'localId, studentId, moduleId, syncStatus',
      portfolioEntries: 'localId, studentId, moduleId',
      modules:          'id, term, level, [term+level]',
      fileQueue:        'id, studentId, moduleId, blockId, uploadStatus',
      session:          'id',                 
    })

    // version 4: separate summary cache with submission_status for list page
    this.version(4).stores({
      submissions:      'localId, studentId, moduleId, syncStatus',
      portfolioEntries: 'localId, studentId, moduleId',
      modules:          'id, term, level, [term+level]',
      moduleSummaries:  'id, term, level, [term+level]',  // ← new
      fileQueue:        'id, studentId, moduleId, blockId, uploadStatus',
      session:          'id',
    })

    this.version(5).stores({
      submissions:      'localId, studentId, moduleId, syncStatus, [studentId+moduleId]',
      portfolioEntries: 'localId, studentId, moduleId',
      modules:          'id, term, level, [term+level]',
      moduleSummaries:  'id, term, level, [term+level]',
      fileQueue:        'id, studentId, moduleId, blockId, uploadStatus',
      session:          'id',
      pendingProgress:  'studentId',   // ← one row per student, upserted on every page turn
    })
  }
}

export const db = new HammetLabsDB()

// ── Session cache helpers ─────────────────────────────────────────────────────

/**
 * Persist the authenticated session to IndexedDB.
 * Call this after every successful refresh or login so the student
 * can be recognised offline without a network round-trip.
 */
export async function persistSession(user: AuthUser, accessToken: string): Promise<void> {
  try {
    await db.session.put({
      id: 'current',
      user,
      accessToken,
      cachedAt: new Date().toISOString(),
    })
  } catch {
    // best-effort — never throw
  }
}

/**
 * Read the most recently persisted session.
 * Returns null if nothing is cached or the DB read fails.
 */
export async function getPersistedSession(): Promise<CachedSession | null> {
  try {
    return (await db.session.get('current')) ?? null
  } catch {
    return null
  }
}

/**
 * Wipe the session cache on explicit logout.
 */
export async function clearPersistedSession(): Promise<void> {
  try {
    await db.session.delete('current')
  } catch {
    // best-effort
  }
}

// ── Submission helpers ────────────────────────────────────────────────────────
// submitLesson
//
// accessToken is passed in by the caller (lesson-detail-page) which already
// holds it from useAuth. Never call useAuth here — this is not a component.
// ─────────────────────────────────────────────────────────────────────────────
 
export async function submitLesson({
  id,
  studentId,
  moduleId,
  activityText,
  reflectionText,
  aiForm,
  fileUrls,
  syncStatus,
  submissionType,
  accessToken,
}: {
  id:             string | null
  studentId:      string
  moduleId:       string
  activityText?:  string
  reflectionText?: string
  aiForm: AiFormState | null
  fileUrls:       string[]
  syncStatus: 'pending' | 'synced' | 'failed' | 'draft'
  submissionType: 'submit'  | 'resubmit'
  // Optional — if provided and online, we attempt immediate sync.
  // Not provided for auto-saves (we don't want to sync on every keystroke).
  accessToken?:   string
}): Promise<{ success: boolean; synced: boolean }> {
  const existing = await getDraftForModule(studentId, moduleId)
  const localId     = existing?.localId ?? crypto.randomUUID()

  const submittedAt = new Date().toISOString()
 
  // Always write to Dexie first.
  // saveSubmissionLocally deletes any existing row for this moduleId before
  // inserting — so there is always exactly one pending row per module.
  await saveSubmissionLocally({
    id,
    localId,
    studentId,
    moduleId,
    activityText,
    reflectionText,
    fileUrls: fileUrls,
    aiForm,
    submittedAt,
    syncStatus,
    submissionType
  })
 
  // Only attempt immediate sync on final submit (accessToken provided) + online
  if (accessToken && navigator.onLine) {
    try {
      await syncPendingSubmissions(
        studentId,
        accessToken
      )
      return { success: true, synced: true }
    } catch {
      // Sync failed — row stays pending in Dexie, SW will retry
    }
  }
 
  // Register SW background sync so the queue flushes automatically on reconnect.
  // Falls back silently if the browser doesn't support Background Sync API.
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      if ('sync' in reg) {
        await (reg as any).sync.register('submissions-queue')
      }
    } catch {
      // Background sync not supported or SW not active — Dexie row will be
      // picked up by the useOnlineStatus hook instead
    }
  }
 
  return { success: true, synced: false }
}

/**
 * Upsert a submission draft for a module.
 * There is exactly ONE row per (studentId, moduleId) at any time.
 * If a row already exists for this module, it is replaced entirely —
 * this prevents duplicate pending rows accumulating across auto-saves.
 */
export async function saveSubmissionLocally(
  submission: Omit<LocalSubmission, 'syncAttempts'>
): Promise<void> {
  // Delete any existing rows for this module before inserting the new one.
  // This is the dedup guarantee — one pending row per module, always.
  await db.submissions
    .where('[studentId+moduleId]')
    .equals([submission.studentId, submission.moduleId])
    .delete()
 
  await db.submissions.put({
    ...submission,
    syncAttempts: 0,
  })
}
 
/**
 * Get the current draft/pending submission for a module, if any.
 * Use this on lesson load to restore progress when offline.
 */
export async function getDraftForModule(
  studentId: string,
  moduleId: string
): Promise<LocalSubmission | undefined> {
  return db.submissions
    .where('[studentId+moduleId]')
    .equals([studentId, moduleId])
    .and((s) => s.syncStatus === 'draft')
    .first()
}
 
/**
 * Get only the latest pending submission per module.
 * Since saveSubmissionLocally now guarantees one row per module,
 * this is just getPendingSubmissions — but kept explicit for clarity.
 */
export async function getDedupedPendingSubmissions(): Promise<LocalSubmission[]> {
  const all = await db.submissions.where('syncStatus').equals('pending').toArray()
  const byModule = new Map<string, LocalSubmission>()
  for (const s of all) {
    const key = `${s.studentId}:${s.moduleId}`
    const existing = byModule.get(key)
    if (!existing || s.submittedAt > existing.submittedAt) {
      byModule.set(key, s)
    }
  }
  return Array.from(byModule.values())
}

/**
 * Checks if there is an pending submission
 */
export async function hasPendingSubmission(
  studentId: string,
  moduleId: string
): Promise<boolean> {
  try {
    const result = await db.submissions
      .where('[studentId+moduleId]').equals([studentId,moduleId])
      .and((s) => s.syncStatus === 'pending')
      .first()
    return !!result
  } catch {
    return false
  }
}

export async function getPendingSubmissions(studentId: string): Promise<LocalSubmission[]> {
  return db.submissions
  .where('syncStatus').equals('pending')
  .and((s) => s.studentId === studentId)
  .toArray()
}

export async function markSubmissionSynced(localId: string): Promise<void> {
  const submission = await db.submissions.get(localId)
  await db.submissions.update(localId, { syncStatus: 'synced' })
  if (submission?.moduleId) {
    await clearPendingProgress(submission.moduleId)
  }
}

export async function markSubmissionFailed(localId: string): Promise<void> {
  await db.submissions.where('localId').equals(localId).modify((s) => {
    s.syncStatus = 'failed'
    s.syncAttempts += 1
  })
}

/**
 * Remove all synced submissions to keep the DB lean.
 * Call after a successful sync cycle — not before, in case the tab closes mid-sync.
 */
export async function clearSyncedSubmissions(): Promise<void> {
  await db.submissions.where('syncStatus').equals('synced').delete()
}

// ── File queue helpers ────────────────────────────────────────────────────────

export async function enqueueFile(
  entry: Omit<LocalFileQueue, 'uploadStatus' | 'uploadAttempts' | 'createdAt'>
): Promise<string> {
  const record: LocalFileQueue = {
    ...entry,
    uploadStatus: 'pending',
    uploadAttempts: 0,
    createdAt: new Date().toISOString(),
  }
  await db.fileQueue.put(record)
  return record.id
}

export async function getPendingFiles(): Promise<LocalFileQueue[]> {
  return db.fileQueue.where('uploadStatus').equals('pending').toArray()
}

export async function getFilesForModule(moduleId: string): Promise<LocalFileQueue[]> {
  return db.fileQueue.where('moduleId').equals(moduleId).toArray()
}

export async function markFileUploading(id: string): Promise<void> {
  await db.fileQueue.update(id, { uploadStatus: 'uploading' })
}

export async function markFileUploaded(id: string): Promise<void> {
  await db.fileQueue.update(id, { uploadStatus: 'done' })
}

export async function markFileFailed(id: string): Promise<void> {
  await db.fileQueue.where('id').equals(id).modify((f) => {
    f.uploadStatus = 'failed'
    f.uploadAttempts += 1
  })
}

/** Remove a single queued file entry — call when student removes a file before submitting. */
export async function dequeueFile(id: string): Promise<void> {
  await db.fileQueue.delete(id)
}

/**
 * Remove all successfully uploaded file queue entries for a module.
 * Call after the submission for that module is confirmed by the server.
 */
export async function clearUploadedFilesForModule(moduleId: string): Promise<void> {
  await db.fileQueue
    .where('moduleId')
    .equals(moduleId)
    .filter((f) => f.uploadStatus === 'done')
    .delete()
}

// ── Module cache helpers ──────────────────────────────────────────────────────

/**
 * Call inside studentApi.getModules() after every successful fetch.
 * Stores the lightweight list including submission_status for offline display.
 */
export async function cacheModuleSummaries(
  summaries: ModuleSummary[]
): Promise<void> {
  try {
    await db.moduleSummaries.bulkPut(
      summaries.map((s) => ({ ...s, cachedAt: new Date().toISOString() }))
    )
  } catch {
    // best-effort
  }
}

/**
 * Persist modules to Dexie after a successful API fetch.
 * Call this inside studentApi.getModules — not from the SW, which only
 * caches HTTP responses. Dexie is the structured offline store.
 */

export async function getCachedModuleSummaries(
  term: number,
  level: string
): Promise<CachedModuleSummary[]> {
  try {
    return await db.moduleSummaries
      .where('[term+level]')
      .equals([term, level])
      .toArray()
  } catch {
    return []
  }
}

/**
 * After a student submits a module offline, update just the status
 * in the summary cache so the list page reflects it immediately.
 */
export async function updateCachedSubmissionStatus(
  moduleId: string,
  status: CachedModuleSummary['submissionStatus']
): Promise<void> {
  try {
    await db.moduleSummaries.update(moduleId, { submissionStatus: status })
  } catch {
    // best-effort
  }
}

// ── Full module cache (lesson detail) ────────────────────────────────────────

/**
 * Call inside studentApi.getModule() after every successful fetch.
 * Only updates if the incoming version is newer than what's cached,
 * but always preserves stepper_progress (client-only field).
 */
export async function cacheModule(incoming: Omit<CachedModule, 'cachedAt'>): Promise<void> {
  try {
    const existing = await db.modules.get(incoming.id)
    await db.modules.put({
      ...incoming,
      // Preserve where the student left off — never overwrite with 0 from a fresh fetch
      cachedAt: new Date().toISOString(),
    })
  } catch {
    // best-effort
  }
}

export async function getCachedModule(
  moduleId: string
): Promise<CachedModule | undefined> {
  return db.modules.get(moduleId)
}

// ── Pending progress helpers ──────────────────────────────────────────────────

/**
 * Upsert progress for a module. Called on every page navigation.
 * Replaces any existing row for the same moduleId.
 */
export async function savePendingProgress(
  studentId: string,
  moduleId: string,
  sectionId: string
): Promise<void> {
  try {
    await db.pendingProgress.put({
      studentId,
      moduleId,
      sectionId,
      updatedAt: new Date().toISOString(),
    })
  } catch {
    // best-effort
  }
}


/**
 * Read all progress rows that need syncing.
 */
export async function getPendingProgress(studentId: string): Promise<PendingProgress[]> {
  try {
    return await db.pendingProgress
    .where('studentId').equals(studentId)
    .toArray()
  } catch {
    return []
  }
}

/**
 * Remove progress for a module — call after a successful PATCH
 * or when a submission for the module is confirmed synced.
 */
export async function clearPendingProgress(studentId: string): Promise<void> {
  try {
    await db.pendingProgress.delete(studentId)
  } catch {
    // best-effort
  }
}

/**
 * Updates the File Urls in each Submission with the paths 
 * after uploading.
 */
export async function updateSubmissionFileUrls(
  moduleId: string,
  studentId: string,
  fileUrls: string[]
): Promise<void> {
  await db.submissions
    .where('[studentId+moduleId]')
    .equals([studentId, moduleId])
    .modify((s) => {
      s.fileUrls = fileUrls
    })
}

/**
 * Mapper for converting LocalSubmission to LocalSubmissionDto
 * to be used for syncing submissions to backend
 */
function fromLocalSubmission(model: LocalSubmission): LocalSubmissionDto {
  return {
    local_id: model.localId,
    student_id: model.studentId,
    module_id: model.moduleId,
    activity_text: model.activityText ?? null,
    reflection_text: model.reflectionText!,
    file_urls: model.fileUrls,
    ai_form: model.aiForm
                ? fromAiFormState(model.aiForm)
                : null,
    submitted_at: model.submittedAt
  }
}


// ── Sync function ─────────────────────────────────────────────────────────────
// Call this:
// 1. When the app comes back online (useOnlineStatus hook)
// 2. On app startup
// 3. After every successful page load

export async function syncPendingSubmissions(
  studentId: string,
  accessToken: string,
): Promise<CreateSubmissionResponses | undefined> {
  const pending = (
    await getPendingSubmissions(studentId)
  ).filter(s => s.syncStatus === "pending" && s.submissionType === "submit")
  if (pending.length === 0) return

  
  const payload = pending.map(fromLocalSubmission)

  const responseDto = await apiClient.post<CreateSubmissionResponsesDto>("/submissions/sync", {"submissions": payload}, accessToken)
  const response = toCreateSubmissionResponses(responseDto)

  for (const r of response.submissions) {
    if (r.status === "approved") {
      await markSubmissionSynced(r.localId)
    } else {
      await markSubmissionFailed(r.localId)
    }
  }

  await clearPendingProgress(studentId)
  await clearSyncedSubmissions()
}

// ── Sync function ─────────────────────────────────────────────────────────────
// Call this:
// 1. When the app comes back online (useOnlineStatus hook)
// 2. On app startup
// 3. After every successful page load

export async function syncPendingRevisions(
  studentId: string,
  accessToken: string,
): Promise<CreateSubmissionResponses|undefined> {
  const pending = (
    await getPendingSubmissions(studentId)
  ).filter(s => s.syncStatus === "pending" && s.submissionType === 'resubmit')
  if (pending.length === 0) return

  pending.map(async (s) => {
    if (!s.id) {
      await markSubmissionFailed(s.localId)
      return
    }
  })
  const payload = pending.map(fromLocalSubmission)

  const responseDto = await apiClient.patch<CreateSubmissionResponsesDto>("/submissions/resync", {"submissions": payload}, accessToken)
  const response = toCreateSubmissionResponses(responseDto)

  for (const r of response.submissions) {
    if (r.status === "approved") {
      await markSubmissionSynced(r.localId)
    } else {
      await markSubmissionFailed(r.localId)
    }
  }
  await clearSyncedSubmissions()
  await clearPendingProgress(studentId)
}