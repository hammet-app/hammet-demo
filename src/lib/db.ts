// lib/db.ts
// Local-first database using Dexie (IndexedDB wrapper).
// This is where all student work lives on the device.
// Everything here is available offline, 100% of the time.

import Dexie, { type Table } from 'dexie'
import { useAuth } from '@/lib/auth/auth-context'
import { AuthUser } from '@/lib/utils/roles'
import { CurriculumContentJson, ModuleSummary } from './api/types'

// ── Types ────────────────────────────────────────────────────────────────────

export interface CachedSession {
  id: 'current'                // singleton row
  user: AuthUser
  accessToken: string
  cachedAt: string
}

export interface LocalSubmission {
  localId: string           // client-generated UUID — used for server dedup
  studentId: string
  moduleId: string
  activityText?: string
  reflectionText?: string
  fileUrls: string[]       // uploaded Supabase Storage URLs (may be empty)
  submittedAt: string       // ISO timestamp
  syncStatus: 'pending' | 'synced' | 'failed'
  syncAttempts: number
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
      submissions:      'localId, studentId, moduleId, syncStatus',
      portfolioEntries: 'localId, studentId, moduleId',
      modules:          'id, term, level, [term+level]',
      moduleSummaries:  'id, term, level, [term+level]',
      fileQueue:        'id, studentId, moduleId, blockId, uploadStatus',
      session:          'id',
      pendingProgress:  'moduleId',   // ← one row per module, upserted on every page turn
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
export async function submitLesson({
  studentId,
  moduleId,
  activityText,
  reflectionText,
  fileUrls,
}: {
  studentId:      string
  moduleId:       string
  moduleTitle:    string
  activityText?: string
  reflectionText?: string
  fileUrls:       string[]
}): Promise<{ success: boolean; synced: boolean }|undefined> {
  const localId     = crypto.randomUUID()
  const submittedAt = new Date().toISOString()

  // Always save locally first
  await saveSubmissionLocally({ localId, studentId, moduleId, activityText, reflectionText, fileUrls, submittedAt })

  // Try to sync immediately if online
  if (navigator.onLine) {
    const {accessToken, refreshToken} = useAuth()
    const token = accessToken ?? await refreshToken()
    if (!token) return 
    const synced = await syncPendingSubmissions(studentId,process.env.NEXT_PUBLIC_API_URL!, token)
  }

  // Offline — register background sync so SW flushes when back online
  return { success: true, synced: false }
}

export async function saveSubmissionLocally(
  submission: Omit<LocalSubmission, 'syncStatus' | 'syncAttempts'>
): Promise<void> {
  await db.submissions.put({
    ...submission,
    syncStatus: 'pending',
    syncAttempts: 0,
  })
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
 * Checks if there is an pending submission
 */
export async function hasPendingSubmission(
  studentId: string,
  moduleId: string
): Promise<boolean> {
  try {
    const result = await db.submissions
      .where('moduleId').equals(moduleId)
      .and((s) => s.syncStatus === 'pending' && s.studentId === studentId)
      .first()
    return !!result
  } catch {
    return false
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
export async function clearPendingProgress(moduleId: string): Promise<void> {
  try {
    await db.pendingProgress.delete(moduleId)
  } catch {
    // best-effort
  }
}
// ── Sync function ─────────────────────────────────────────────────────────────
// Call this:
// 1. When the app comes back online (useOnlineStatus hook)
// 2. On app startup
// 3. After every successful page load

export async function syncPendingSubmissions(
  studentId: string,
  apiBaseUrl: string,
  accessToken: string,
): Promise<void> {
  const pending = await getPendingSubmissions(studentId)
  if (pending.length === 0) return

  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/sync/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ submissions: pending }),
    })

    if (res.ok) {
      await Promise.all(pending.map((s) => markSubmissionSynced(s.localId)))
      // Prune synced records so the DB doesn't grow indefinitely
      await clearSyncedSubmissions()
    } else {
      await Promise.all(pending.map((s) => markSubmissionFailed(s.localId)))
    }
  } catch {
    // Network error — mark failed, will retry on next sync cycle
    await Promise.all(pending.map((s) => markSubmissionFailed(s.localId)))
  }
}