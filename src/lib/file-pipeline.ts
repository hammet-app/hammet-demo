// lib/file-pipeline.ts
//
// File upload pipeline for task submissions.
//
// Flow:
//   1. Compress  — images → max 2 MB, videos → max 20 MB (pass-through), docs → pass-through
//   2. Enqueue   — store compressed blob in Dexie so it survives offline
//   3. Sign      — batch-request signed upload URLs from backend (POST /upload/sign)
//   4. Upload    — PUT each blob directly to Supabase Storage via its signed URL
//   5. Return    — storage paths to include in the submission's file_urls
//
// The frontend never needs the Supabase service key. All auth for uploads
// goes through the backend signing endpoint.

import imageCompression from 'browser-image-compression'
import {
  db,
  enqueueFile,
  markFileUploading,
  markFileUploaded,
  markFileFailed,
  dequeueFile,
  getPendingFiles,
  getFilesForModule,
  type LocalFileQueue,
} from '@/lib/db'
import { apiClient } from '@/lib/api/api-client'
import {
  type UploadRequests, 
  type UploadResponses, 
  fromUploadRequest } from '@/lib/api/types'

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
 * - Documents: passed through as-is
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

  return { ok: true, blob: file, mimeType: file.type }
}

// ── Signed URL request ────────────────────────────────────────────────────────

/**
 * Batch-request signed upload URLs from the backend.
 * One network call for all files — backend generates the path and signed URL
 * for each, scoped to the student's folder via the JWT on the request.
 */
async function buildPath(
  entries: LocalFileQueue[],
  accessToken: string | null,
): Promise<UploadResponses> {
  const body: UploadRequests = {
    files: entries.map((e) => ({
      name:     e.fileName,
      type:     e.mimeType,
      moduleId: e.moduleId,
    })),
  }

  const payload = { files: body.files.map(fromUploadRequest) }
  return await apiClient.post<UploadResponses>('/submissions/upload', payload, accessToken)
}

// ── Single file upload ────────────────────────────────────────────────────────

async function uploadBlob(
  blob: Blob,
  mimeType: string,
  signedUrl: string
): Promise<void> {
  const res = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body: blob,
  })

  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`)
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export type EnqueueResult =
  | { ok: true; dexieId: string }
  | { ok: false; error: CompressionError }

/**
 * Compress a file and save the blob to Dexie.
 * Does NOT upload — call uploadFilesForModule() when ready to submit.
 * Path is left empty here; the backend assigns the real path at sign time.
 */
export async function compressAndEnqueue(
  file: File,
  studentId: string,
  moduleId: string,
  blockId: string,
): Promise<EnqueueResult> {
  const result = await compressFile(file)
  if (!result.ok) return result

  const dexieId = await enqueueFile({
    id:           crypto.randomUUID(),
    studentId,
    moduleId,
    blockId,
    path:         '', // assigned by backend at sign time
    blob:         result.blob,
    fileName:     file.name,
    mimeType:     result.mimeType,
  })

  return { ok: true, dexieId }
}

export type UploadedFile = {
  dexieId: string
  blockId: string
  moduleId: string
  path: string   // Supabase Storage path returned by backend — stored in file_urls
}

/**
 * Upload all pending/failed files for a module.
 *
 * 1. Fetch all queued entries for the module from Dexie
 * 2. Batch-request signed URLs from backend (one API call)
 * 3. PUT each blob to its signed URL in parallel
 * 4. Update Dexie status for each entry
 *
 * Returns successfully uploaded entries — use their paths to build file_urls.
 * Entries that fail are marked 'failed' in Dexie and excluded from the result.
 */
export async function uploadFilesForModule(
  moduleId: string,
  accessToken: string | null,
): Promise<UploadedFile[]> {
  const entries = await getFilesForModule(moduleId)
  const toUpload = entries.filter(
    (e) => e.uploadStatus === 'pending' || e.uploadStatus === 'failed'
  )

  if (toUpload.length === 0) return []

  // Mark all as uploading immediately
  await Promise.all(toUpload.map((e) => markFileUploading(e.id)))

  // Batch sign
  let signResponse: UploadResponses
  try {
    signResponse = await buildPath(toUpload, accessToken)
  } catch {
    // Can't reach backend — mark all failed, caller will queue offline
    await Promise.all(toUpload.map((e) => markFileFailed(e.id)))
    return []
  }

  const allSigned = signResponse.signeds

  // Upload each file in parallel
  const results = await Promise.allSettled(
    toUpload.map(async (entry: LocalFileQueue, i: number) => {
      const signed = allSigned[i]?.signed
      // Supabase Python client returns signedURL (capital URL)
      const signedUrl = signed?.signedUrl ?? signed?.signedUrl ?? signed?.signed_url
      const path      = signed?.path

      if (!signedUrl || !path) {
        throw new Error('No signed URL or path returned for file')
      }

      // Write path back to Dexie so retries and submission collection
      // can find the correct path even if the upload fails mid-flight
      await db.fileQueue.update(entry.id, { path })
      const file = await db.fileQueue.get(entry.id)

      await uploadBlob(entry.blob, entry.mimeType, signedUrl)
      await markFileUploaded(entry.id)

      return { dexieId: entry.id, moduleId: entry.moduleId, blockId: entry.blockId, path } satisfies UploadedFile
    })
  )

  const uploaded: UploadedFile[] = []

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (result.status === 'fulfilled') {
      uploaded.push(result.value)
    } else {
      await markFileFailed(toUpload[i].id)
    }
  }

  return uploaded
}

/**
 * Upload ALL pending files across all modules.
 * Call on reconnect (useOnlineStatus) to drain the queue.
 */
export async function uploadAllPendingFiles(
  accessToken: string | null,
): Promise<UploadedFile[]> {
  const pending = await getPendingFiles()
  if (pending.length === 0) return []

  // Group by moduleId so we batch per module (each module scoped separately)
  const byModule = new Map<string, LocalFileQueue[]>()
  for (const entry of pending) {
    const group = byModule.get(entry.moduleId) ?? []
    group.push(entry)
    byModule.set(entry.moduleId, group)
  }

  const allUploaded: UploadedFile[] = []
  for (const moduleId of byModule.keys()) {
    const uploaded = await uploadFilesForModule(moduleId, accessToken)
    allUploaded.push(...uploaded)
  }

  return allUploaded
}

/**
 * Remove a queued file entry from Dexie.
 * Call when the student removes a file from the task upload list.
 */
export async function removeQueuedFile(dexieId: string): Promise<void> {
  await dequeueFile(dexieId)
}