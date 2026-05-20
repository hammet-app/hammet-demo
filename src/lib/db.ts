// lib/db.ts
// Local-first database using Dexie (IndexedDB wrapper).
// This is where all student work lives on the device.
// Everything here is available offline, 100% of the time.

import Dexie, { type Table } from 'dexie'
import { useAuth } from '@/lib/auth/auth-context'
import { CurriculumContentJson } from './api/api-types'

// ── Types ────────────────────────────────────────────────────────────────────

export interface LocalSubmission {
  localId: string           // client-generated UUID — used for server dedup
  studentId: string
  moduleId: string
  activityText?: string
  reflectionText?: string
  file_urls: string[]       // uploaded Supabase Storage URLs (may be empty)
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

export interface CachedModule {
  id: string
  term: number
  week_number: number
  level: string
  title: string
  learning_objective?: string
  contentJson: CurriculumContentJson
  aiTools?: string[]
  version: number
  updated_at: string
  published: boolean
  progress: string | null
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
  fileQueue!:        Table<LocalFileQueue>

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
  }
}

export const db = new HammetLabsDB()

// ── Submission helpers ────────────────────────────────────────────────────────
export async function submitLesson({
  studentId,
  moduleId,
  activityText,
  reflectionText,
  file_urls,
}: {
  studentId:      string
  moduleId:       string
  moduleTitle:    string
  activityText?: string
  reflectionText?: string
  file_urls:       string[]
}): Promise<{ success: boolean; synced: boolean }|undefined> {
  const localId     = crypto.randomUUID()
  const submittedAt = new Date().toISOString()

  // Always save locally first
  await saveSubmissionLocally({ localId, studentId, moduleId, activityText, reflectionText, file_urls, submittedAt })

  // Try to sync immediately if online
  if (navigator.onLine) {
    const {accessToken, refreshToken} = useAuth()
    const token = accessToken ?? await refreshToken()
    if (!token) return 
    const synced = await syncPendingSubmissions(process.env.NEXT_PUBLIC_API_URL!, token)
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

export async function getPendingSubmissions(): Promise<LocalSubmission[]> {
  return db.submissions.where('syncStatus').equals('pending').toArray()
}

export async function markSubmissionSynced(localId: string): Promise<void> {
  await db.submissions.update(localId, { syncStatus: 'synced' })
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
 * Persist modules to Dexie after a successful API fetch.
 * Call this inside studentApi.getModules — not from the SW, which only
 * caches HTTP responses. Dexie is the structured offline store.
 */
export async function cacheModules(modules: CachedModule[]): Promise<void> {
  const existing = await db.modules.bulkGet(modules.map((m) => m.id))
  const toUpdate = modules.filter((incoming, i) => {
    const cached = existing[i]
    return !cached || incoming.version > cached.version
  })
  if (toUpdate.length > 0) {
    await db.modules.bulkPut(
      toUpdate.map((m) => ({ ...m, cachedAt: new Date().toISOString() }))
    )
  }
}

export async function getModulesForTerm(
  term: number,
  level: string
): Promise<CachedModule[]> {
  return db.modules.where('[term+level]').equals([term, level]).toArray()
}

export async function getCachedModule(
  moduleId: string
): Promise<CachedModule | undefined> {
  return db.modules.get(moduleId)
}
// ── Sync function ─────────────────────────────────────────────────────────────
// Call this:
// 1. When the app comes back online (useOnlineStatus hook)
// 2. On app startup
// 3. After every successful page load

export async function syncPendingSubmissions(
  apiBaseUrl: string,
  accessToken: string,
): Promise<void> {
  const pending = await getPendingSubmissions()
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