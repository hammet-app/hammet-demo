// lib/sync.ts
// Client-side offline sync layer.
//
// Flow:
//   1. Student submits a lesson reflection
//   2. Saved to IndexedDB (Dexie) immediately — student sees it right away
//   3. We try to POST to FastAPI immediately
//   4. If the POST fails (offline), we register a Background Sync tag
//   5. When connectivity restores, the service worker fires the 'sync' event
//   6. SW posts FLUSH_SUBMISSIONS message to this window
//   7. flushPendingSubmissions() drains the Dexie queue to FastAPI

import Dexie, { type Table } from 'dexie'

// ── Dexie schema ─────────────────────────────────────────────────────────────

export interface LocalSubmission {
  localId:        string    // client-generated UUID — dedup key on server
  studentId:      string
  moduleId:       string
  activityText?: string
  reflectionText?: string
  fileUrl?:       string
  submittedAt:    string    // ISO timestamp
  status:         'pending_sync' | 'synced' | 'failed'
  retryCount:     number
}

export interface LocalPortfolioEntry {
  localId:      string
  studentId:    string
  moduleTitle:  string
  submittedAt:  string
  reflectionText?: string
  skills:       string[]
}

class AIStudiesDB extends Dexie {
  submissions!:     Table<LocalSubmission>
  portfolioEntries!: Table<LocalPortfolioEntry>

  constructor() {
    super('ai-studies-v1')
    this.version(1).stores({
      // localId is the primary key; index studentId and moduleId for queries
      submissions:      'localId, studentId, moduleId, status',
      portfolioEntries: 'localId, studentId',
    })
  }
}

export const db = new AIStudiesDB()

// ── Save a submission locally ─────────────────────────────────────────────────

export async function saveSubmissionLocally(
  submission: Omit<LocalSubmission, 'status' | 'retryCount'>
): Promise<void> {
  await db.submissions.put({
    ...submission,
    status:     'pending_sync',
    retryCount: 0,
  })

  // Also create a local portfolio entry immediately so the student
  // sees their work in the portfolio without waiting for a server round-trip
  await db.portfolioEntries.put({
    localId:        submission.localId,
    studentId:      submission.studentId,
    moduleTitle:    '',    // caller should pass this — see submitLesson() below
    submittedAt:    submission.submittedAt,
    reflectionText: submission.reflectionText,
    skills:         [],   // server fills these in after sync
  })
}

// ── Submit a lesson (main entry point from lesson UI) ─────────────────────────

export async function submitLesson({
  studentId,
  moduleId,
  moduleTitle,
  activityText,
  reflectionText,
  fileUrl,
}: {
  studentId:      string
  moduleId:       string
  moduleTitle:    string
  activityText?: string
  reflectionText?: string
  fileUrl?:       string
}): Promise<{ success: boolean; synced: boolean }> {
  const localId     = crypto.randomUUID()
  const submittedAt = new Date().toISOString()

  // Always save locally first
  await saveSubmissionLocally({ localId, studentId, moduleId, activityText, reflectionText, fileUrl, submittedAt })
  await db.portfolioEntries.put({
    localId, studentId, moduleTitle, submittedAt, reflectionText, skills: [],
  })

  // Try to sync immediately if online
  if (navigator.onLine) {
    const synced = await syncSingleSubmission(localId)
    return { success: true, synced }
  }

  // Offline — register background sync so SW flushes when back online
  await registerBackgroundSync()
  return { success: true, synced: false }
}

// ── Sync a single submission to FastAPI ──────────────────────────────────────

async function syncSingleSubmission(localId: string): Promise<boolean> {
  const submission = await db.submissions.get(localId)
  if (!submission || submission.status === 'synced') return true

  try {
    const res = await fetch('/api/v1/submissions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        local_id:        submission.localId,
        student_id:      submission.studentId,
        module_id:       submission.moduleId,
        reflection_text: submission.reflectionText,
        file_url:        submission.fileUrl,
        submitted_at:    submission.submittedAt,
      }),
    })

    if (res.ok || res.status === 409) {
      // 409 = already exists on server (idempotent dedup) — still mark synced
      await db.submissions.update(localId, { status: 'synced' })
      return true
    }

    // Server error — increment retry count, leave as pending
    await db.submissions.update(localId, {
      retryCount: (submission.retryCount ?? 0) + 1,
    })
    return false
  } catch {
    // Network error — leave as pending_sync
    return false
  }
}

// ── Flush all pending submissions ────────────────────────────────────────────
// Called when:
//   (a) the SW posts FLUSH_SUBMISSIONS after background sync fires, or
//   (b) the app comes back online (window 'online' event)

export async function flushPendingSubmissions(): Promise<void> {
  const pending = await db.submissions
    .where('status')
    .equals('pending_sync')
    .toArray()

  // Process sequentially to avoid hammering the server
  for (const sub of pending) {
    await syncSingleSubmission(sub.localId)
  }
}

// ── Register Background Sync ─────────────────────────────────────────────────

async function registerBackgroundSync(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return
  try {
    const reg = await navigator.serviceWorker.ready
    // 'sync' is available in the ServiceWorkerRegistration
    await (reg as any).sync.register('submissions-sync')
  } catch {
    // Background Sync not supported — online listener handles it instead
  }
}

// ── Online event listener ─────────────────────────────────────────────────────
// Fallback for browsers that don't support Background Sync (iOS Safari).
// When the window comes back online, flush immediately.

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushPendingSubmissions()
  })

  // Also listen for the SW message (from sw.ts flushSubmissionsQueue)
  navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data?.type === 'FLUSH_SUBMISSIONS') {
      flushPendingSubmissions()
    }
  })
}

// ── Getters for UI ────────────────────────────────────────────────────────────

export async function getLocalPortfolio(studentId: string): Promise<LocalPortfolioEntry[]> {
  return db.portfolioEntries
    .where('studentId')
    .equals(studentId)
    .reverse()
    .sortBy('submittedAt')
}

export async function getPendingCount(): Promise<number> {
  return db.submissions.where('status').equals('pending_sync').count()
}
