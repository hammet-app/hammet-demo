// lib/file-pipeline.ts
//
// Full file pipeline for task uploads:
//   1. Compress  — images → max 2 MB, videos → max 20 MB (pass-through), docs → pass-through
//   2. Enqueue   — store compressed blob in Dexie so it survives offline
//   3. Upload    — push blob to Supabase Storage with the service key
//   4. Dequeue   — remove from Dexie once confirmed uploaded
//
// The service key is used for uploads only. Viewing files goes through
// backend-generated signed URLs — the service key is never used for reads.

import imageCompression from 'browser-image-compression'
import {
  enqueueFile,
  markFileUploading,
  markFileUploaded,
  markFileFailed,
  dequeueFile,
  getPendingFiles,
  getFilesForModule,
  type LocalFileQueue,
} from '@/lib/db'

// ── Env ───────────────────────────────────────────────────────────────────────

const SUPABASE_URL        = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
const BUCKET              = 'task-files'

// ── Limits ───────────────────────────────────────────────────────────────────

const IMAGE_MAX_MB    = 2
const VIDEO_MAX_MB    = 20
const VIDEO_MAX_BYTES = VIDEO_MAX_MB * 1024 * 1024

// ── File type helpers ─────────────────────────────────────────────────────────

function isImage(file: File): boolean {
  return file.type.startsWith('image/')
}

function isVideo(file: File): boolean {
  return file.type.startsWith('video/')
}

// ── Compression ───────────────────────────────────────────────────────────────

export type CompressionError =
  | { kind: 'video_too_large'; maxMb: number; sizeMb: number }

export type CompressResult =
  | { ok: true; blob: Blob; mimeType: string }
  | { ok: false; error: CompressionError }

/**
 * Compress a file before storing or uploading.
 *
 * - Images:    compressed to max 2 MB via browser-image-compression
 * - Videos:    passed through as-is; rejected if over 20 MB
 * - Documents: passed through as-is (PDFs, Word docs don't compress well)
 */
export async function compressFile(file: File): Promise<CompressResult> {
  if (isImage(file)) {
    const compressed = await imageCompression(file, {
      maxSizeMB: IMAGE_MAX_MB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type as Parameters<typeof imageCompression>[1]['fileType'],
    })
    return { ok: true, blob: compressed, mimeType: compressed.type || file.type }
  }

  if (isVideo(file)) {
    if (file.size > VIDEO_MAX_BYTES) {
      return {
        ok: false,
        error: {
          kind: 'video_too_large',
          maxMb: VIDEO_MAX_MB,
          sizeMb: Math.round(file.size / 1024 / 1024),
        },
      }
    }
    return { ok: true, blob: file, mimeType: file.type }
  }

  // Documents and everything else — pass through
  return { ok: true, blob: file, mimeType: file.type }
}

// ── Storage path ──────────────────────────────────────────────────────────────

function buildPath(studentId: string, file: File): string {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `uploads/${studentId}/${Date.now()}_${safe}`
}

// ── Supabase Storage upload ───────────────────────────────────────────────────

/**
 * Upload a blob directly to Supabase Storage using the service key.
 * Returns the storage path — not a public URL.
 * Views go through backend-generated signed URLs, never through this path.
 */
async function uploadToStorage(
  blob: Blob,
  path: string,
  mimeType: string
): Promise<string> {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': mimeType,
      'x-upsert': 'false',
    },
    body: blob,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Supabase Storage upload failed (${res.status}): ${text}`)
  }

  return path
}

// ── Public API ────────────────────────────────────────────────────────────────

export type EnqueueResult =
  | { ok: true; dexieId: string }
  | { ok: false; error: CompressionError }

/**
 * Compress a file and save the blob to Dexie.
 * Does NOT upload — call uploadFilesForModule() before submission.
 *
 * Returns the Dexie entry ID so the caller (lesson-detail-page) can
 * track or remove the entry via removeQueuedFile().
 */
export async function compressAndEnqueue(
  file: File,
  studentId: string,
  moduleId: string,
  blockId: string,
): Promise<EnqueueResult> {
  const result = await compressFile(file)
  if (!result.ok) return result

  const path = buildPath(studentId, file)

  const dexieId = await enqueueFile({
    id: crypto.randomUUID(),
    studentId,
    moduleId,
    blockId,
    path,
    blob: result.blob,
    fileName: file.name,
    mimeType: result.mimeType,
  })

  return { ok: true, dexieId }
}

export type UploadedFile = {
  dexieId: string
  blockId: string
  path: string   // Supabase Storage path — stored in submission file_urls
}

/**
 * Attempt to upload a single queued Dexie entry to Supabase Storage.
 * Updates Dexie status throughout. Returns null on failure (already marked failed in Dexie).
 */
export async function uploadFile(entry: LocalFileQueue): Promise<UploadedFile | null> {
  try {
    await markFileUploading(entry.id)
    const path = await uploadToStorage(entry.blob, entry.path, entry.mimeType)
    await markFileUploaded(entry.id)
    return { dexieId: entry.id, blockId: entry.blockId, path }
  } catch {
    await markFileFailed(entry.id)
    return null
  }
}

/**
 * Upload all pending/failed files for a specific module.
 * Call this just before submission when online.
 * Returns successfully uploaded entries — use their paths to build file_urls.
 */
export async function uploadFilesForModule(
  moduleId: string
): Promise<UploadedFile[]> {
  const entries = await getFilesForModule(moduleId)
  const toUpload = entries.filter(
    (e) => e.uploadStatus === 'pending' || e.uploadStatus === 'failed'
  )

  const results = await Promise.allSettled(toUpload.map(uploadFile))

  return results
    .filter(
      (r): r is PromiseFulfilledResult<UploadedFile> =>
        r.status === 'fulfilled' && r.value !== null
    )
    .map((r) => r.value)
}

/**
 * Upload ALL pending files across all modules.
 * Call on reconnect (useOnlineStatus) to drain the queue.
 */
export async function uploadAllPendingFiles(): Promise<UploadedFile[]> {
  const pending = await getPendingFiles()
  const results = await Promise.allSettled(pending.map(uploadFile))

  return results
    .filter(
      (r): r is PromiseFulfilledResult<UploadedFile> =>
        r.status === 'fulfilled' && r.value !== null
    )
    .map((r) => r.value)
}

/**
 * Remove a queued file entry from Dexie.
 * Call when the student removes a file from the task upload list before submitting.
 */
export async function removeQueuedFile(dexieId: string): Promise<void> {
  await dequeueFile(dexieId)
}
