"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { PageShell } from "@/components/layout/page-shell";
import { apiClient, ApiError } from "@/lib/api/api-client";

// ── Types ────────────────────────────────────────────────────
type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success" }
  | { status: "error"; errors: { row: number; message: string }[] }
  | { status: "invalid"; reason: string };

const REQUIRED_COLUMNS = [
  "week",
  "term",
  "class_level",
  "title",
  "body",
  "learning_objectives",
];

const OPTIONAL_COLUMNS = [
  "activity",
  "reflection",
  "prompt",
  "task",
  "video_link",
  "url",
  "tool_name",
  "tool_link",
];

const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

// ── Component ────────────────────────────────────────────────
export default function BulkModulesPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateFile(f: File): string | null {
    if (!f.name.endsWith(".csv")) return "Only .csv files are accepted.";
    if (f.size > 5 * 1024 * 1024) return "File must be under 5 MB.";
    return null;
  }

  function handleFileSelect(f: File) {
    const reason = validateFile(f);
    if (reason) {
      setFile(null);
      setUploadState({ status: "invalid", reason });
      return;
    }
    setFile(f);
    setUploadState({ status: "idle" });
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }

  async function handleUpload() {
    if (!file || !accessToken) return;
    setUploadState({ status: "uploading" });

    try {
      const form = new FormData();
      form.append("file", file);

      await apiClient.postForm<{ success: boolean }>(
        "/admin/modules",
        form,
        accessToken,
        { onRefresh: refreshToken }
      );

      setUploadState({ status: "success" });
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : String(err);
      const parsed = tryParseErrorDetail(detail);
      if (parsed) {
        setUploadState({ status: "error", errors: parsed });
      } else {
        setUploadState({
          status: "error",
          errors: [{ row: -1, message: detail || "Upload failed. Please try again." }],
        });
      }
    }
  }

  function reset() {
    setFile(null);
    setUploadState({ status: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const isUploading = uploadState.status === "uploading";

  return (
    <PageShell
      title="Bulk Module Upload"
      backHref="/hammet/modules"
      actions={
        uploadState.status === "success" ? (
          <button
            onClick={() => router.push("/hammet/modules")}
            className="px-4 py-2 rounded-xl bg-[var(--color-purple)] text-white text-sm font-semibold hover:opacity-90 transition"
          >
            View modules
          </button>
        ) : undefined
      }
    >
      <div className="max-w-2xl flex flex-col gap-6">

        {/* CSV column reference */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            CSV column reference
          </p>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
              Required
            </p>
            <div className="flex flex-wrap gap-2">
              {REQUIRED_COLUMNS.map((col) => (
                <span
                  key={col}
                  className="px-2.5 py-1 rounded-lg bg-[var(--color-purple-light)] text-[var(--color-purple)] text-xs font-mono font-medium"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
              Optional
            </p>
            <div className="flex flex-wrap gap-2">
              {OPTIONAL_COLUMNS.map((col) => (
                <span
                  key={col}
                  className="px-2.5 py-1 rounded-lg bg-[var(--color-bg-page)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-mono"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-1 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Each row is one module. Missing optional columns produce no block.{" "}
              <span className="font-medium text-[var(--color-text-secondary)]">video_link</span>{" "}
              and{" "}
              <span className="font-medium text-[var(--color-text-secondary)]">tool_link</span>{" "}
              both pull from the shared{" "}
              <span className="font-medium text-[var(--color-text-secondary)]">url</span>{" "}
              column. All modules are published immediately on upload.
            </p>
          </div>

          <button
            onClick={downloadTemplate}
            className="self-start flex items-center gap-1.5 text-xs text-[var(--color-cyan)] font-medium hover:underline"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download blank template
          </button>
        </div>

        {/* Drop zone */}
        {uploadState.status !== "success" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={[
              "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-10",
              "flex flex-col items-center gap-3 text-center select-none",
              isDragging
                ? "border-[var(--color-purple)] bg-[var(--color-purple-light)]"
                : file
                ? "border-[var(--color-purple)] bg-[var(--color-purple-light)]/40"
                : "border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-purple-mid)] hover:bg-[var(--color-purple-light)]/20",
            ].join(" ")}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />

            {file ? (
              <>
                <div className="w-12 h-12 rounded-full bg-[var(--color-purple)] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{file.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB · Click to replace
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[var(--color-bg-page)] border border-[var(--color-border)] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    Drop your CSV here, or{" "}
                    <span className="text-[var(--color-purple)] font-semibold">browse</span>
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">CSV files only · max 5 MB</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Invalid file notice */}
        {uploadState.status === "invalid" && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {uploadState.reason}
          </div>
        )}

        {/* Success state */}
        {uploadState.status === "success" && (
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-[var(--color-text-primary)]">
                Modules uploaded successfully
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                All modules from{" "}
                <span className="font-medium text-[var(--color-text-secondary)]">{file?.name}</span>{" "}
                are now published.
              </p>
            </div>
            <button
              onClick={reset}
              className="text-sm text-[var(--color-purple)] font-medium hover:underline"
            >
              Upload another file
            </button>
          </div>
        )}

        {/* Error results */}
        {uploadState.status === "error" && (
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Upload failed — {uploadState.errors.length}{" "}
                  {uploadState.errors.length === 1 ? "error" : "errors"}
                </p>
              </div>
              <button
                onClick={reset}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition"
              >
                Try again
              </button>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {uploadState.errors.map((err, idx) => (
                <div key={idx} className="px-6 py-4 flex items-start gap-4">
                  {err.row >= 0 && (
                    <span className="shrink-0 mt-0.5 text-xs font-mono font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded px-2 py-0.5">
                      row {err.row + 1}
                    </span>
                  )}
                  <p className="text-sm text-[var(--color-danger)] leading-relaxed">
                    {typeof err.message === "string"
                      ? err.message
                      : JSON.stringify(err.message)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {uploadState.status !== "success" && (
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || isUploading || uploadState.status === "invalid"}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-purple)] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition"
            >
              {isUploading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isUploading ? "Uploading…" : "Upload modules"}
            </button>
            <button
              onClick={() => router.back()}
              className="px-5 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-sm hover:border-[var(--color-purple)] transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function tryParseErrorDetail(
  detail: string
): { row: number; message: string }[] | null {
  try {
    const match = detail.match(/Error uploading modules:\s*(\[.*\])/s);
    if (!match) return null;
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function downloadTemplate() {
  const header = ALL_COLUMNS.join(",");
  const example = [
    "1", "1", "SS1",
    "Introduction to AI",
    "AI stands for Artificial Intelligence...",
    "Students will understand what AI is",
    "", "", "", "", "", "", "", "",
  ]
    .map((v) => (v.includes(",") ? `"${v}"` : v))
    .join(",");

  const csv = `${header}\n${example}\n`;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hammet_modules_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
