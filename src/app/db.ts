// lib/db.ts
// Local-first database using Dexie (IndexedDB wrapper).
// This is where all student work lives on the device.
// Everything here is available offline, 100% of the time.
//

import Dexie, { type Table } from 'dexie'

// ── Types ────────────────────────────────────────────────────────────────────

export interface LocalSubmission {
  localId: string          // client-generated UUID — used for server dedup
  studentId: string
  moduleId: string
  reflectionText?: string
  fileUrl?: string
  submittedAt: string      // ISO timestamp
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
  weekNumber: number
  sessionNumber: number
  level: string
  title: string
  learningObjective: string
  contentJson: object
  aiTools: string[]
  portfolioArtefactType: string
  version: number
  cachedAt: string
}

// ── Database ─────────────────────────────────────────────────────────────────

class HammetLabsDB extends Dexie {
  submissions!: Table<LocalSubmission>
  portfolioEntries!: Table<LocalPortfolioEntry>
  modules!: Table<CachedModule>

  constructor() {
    super('hammetlabs-db')

    this.version(1).stores({
      // localId is the primary key for all local tables
      submissions:      'localId, studentId, moduleId, syncStatus',
      portfolioEntries: 'localId, studentId, moduleId',
      // Module cache: keyed by id, indexed by term+level for fast lookup
      modules:          'id, term, level, [term+level]',
    })
  }
}

export const db = new HammetLabsDB()

// ── Submission helpers ────────────────────────────────────────────────────────

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

// ── Module cache helpers ──────────────────────────────────────────────────────

export async function cacheModules(modules: CachedModule[]): Promise<void> {
  // bulkPut: insert or update. Existing modules are overwritten only if
  // the incoming version is higher (prevents downgrade).
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

// ── Sync function ─────────────────────────────────────────────────────────────
// Call this:
// 1. When the app comes back online (useOnlineStatus hook)
// 2. On app startup
// 3. After every successful page load

export async function syncPendingSubmissions(apiBaseUrl: string): Promise<void> {
  const pending = await getPendingSubmissions()
  if (pending.length === 0) return

  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/sync/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissions: pending }),
    })

    if (res.ok) {
      // Mark all as synced on success
      await Promise.all(pending.map((s) => markSubmissionSynced(s.localId)))
    } else {
      // Mark all as failed — will retry next sync cycle
      await Promise.all(pending.map((s) => markSubmissionFailed(s.localId)))
    }
  } catch {
    // Network error — mark failed, background sync will retry
    await Promise.all(pending.map((s) => markSubmissionFailed(s.localId)))
  }
}
