"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { PageShell } from "@/components/layout/PageShell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const [tier, setTier] = useState("")
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

      await apiClient.postForm<true>(
        `/hammet/modules/${tier}`,
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
      rounded={false}
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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Upload lesson modules
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
          Upload a CSV containing lesson
          modules. Select the subscription
          tier first, then upload your file.
          Every successfully imported module
          is published immediately.
        </p>
      </div>

      {/* Upload Settings */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">

        <div className="mb-6">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            Upload Settings
          </h3>

          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Choose the subscription tier these
            modules belong to.
          </p>
        </div>

        <div className="max-w-sm">

          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Tier
          </label>

          <Select
            value={tier}
            onValueChange={(value) => setTier(value ?? "")}
          >
            <SelectTrigger className="h-11 w-full bg-white border-[var(--color-border)]">

              <SelectValue placeholder="Select a subscription tier" />

            </SelectTrigger>

            <SelectContent>

              <SelectItem value="pilot">
                Pilot
              </SelectItem>

              <SelectItem value="summer">
                Summer
              </SelectItem>

              <SelectItem value="spark">
                Spark
              </SelectItem>

              <SelectItem value="academy">
                Academy
              </SelectItem>

              <SelectItem value="premier">
                Premier
              </SelectItem>

              <SelectItem value="global">
                Global
              </SelectItem>

            </SelectContent>
          </Select>

          <p className="mt-3 text-xs text-[var(--color-text-muted)]">
            The uploaded modules will only be
            available for this tier.
          </p>

        </div>

      </section>

      {/* CSV Reference */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-6 border-b border-[var(--color-border)] px-6 py-5">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              CSV Template Reference
            </h3>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-2xl">
              Your CSV must contain the required columns below.
              Optional columns are only needed when a module includes
              additional resources or activities.
            </p>
          </div>

          <button
            onClick={downloadTemplate}
            className="
              shrink-0
              rounded-lg
              border
              border-[var(--color-border)]
              bg-white
              px-4
              py-2
              text-sm
              font-medium
              text-[var(--color-purple)]
              transition
              hover:border-[var(--color-purple)]
              hover:bg-[var(--color-purple-light)]
            "
          >
            Download Template
          </button>
        </div>

        <div className="grid gap-8 p-6 lg:grid-cols-2">

          {/* Required */}
          <div>
            <div className="mb-3 flex items-center gap-2">

              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />

              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Required Columns
              </h4>

            </div>

            <div className="flex flex-wrap gap-2">

              {REQUIRED_COLUMNS.map((column) => (
                <span
                  key={column}
                  className="
                    rounded-lg
                    bg-[var(--color-purple-light)]
                    px-3
                    py-1.5
                    font-mono
                    text-xs
                    font-medium
                    text-[var(--color-purple)]
                  "
                >
                  {column}
                </span>
              ))}

            </div>

            <p className="mt-4 text-xs leading-6 text-[var(--color-text-muted)]">
              Every row must contain values for each required column.
              Missing values will cause that row to fail validation.
            </p>

          </div>

          {/* Optional */}
          <div>

            <div className="mb-3 flex items-center gap-2">

              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />

              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Optional Columns
              </h4>

            </div>

            <div className="flex flex-wrap gap-2">

              {OPTIONAL_COLUMNS.map((column) => (
                <span
                  key={column}
                  className="
                    rounded-lg
                    border
                    border-[var(--color-border)]
                    bg-white
                    px-3
                    py-1.5
                    font-mono
                    text-xs
                    text-[var(--color-text-secondary)]
                  "
                >
                  {column}
                </span>
              ))}

            </div>

            <p className="mt-4 text-xs leading-6 text-[var(--color-text-muted)]">
              Leave these columns blank if they don't apply.
              Empty optional fields won't create empty lesson blocks.
            </p>

          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-page)] px-6 py-4">

          <div className="flex items-start gap-3">

            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-purple-light)]">
              <svg
                className="h-3.5 w-3.5 text-[var(--color-purple)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01"
                />
              </svg>
            </div>

            <div className="text-sm leading-6 text-[var(--color-text-secondary)]">

              <p>
                <strong>Tip:</strong> Both{" "}
                <span className="font-mono text-[var(--color-text-primary)]">
                  video_link
                </span>{" "}
                and{" "}
                <span className="font-mono text-[var(--color-text-primary)]">
                  tool_link
                </span>{" "}
                read from the shared{" "}
                <span className="font-mono text-[var(--color-text-primary)]">
                  url
                </span>{" "}
                column.
              </p>

              <p className="mt-1">
                Successfully imported modules are published immediately.
              </p>

            </div>

          </div>

        </div>

      </section>

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
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[var(--color-purple)] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
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
              className="px-5 py-3 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-sm hover:border-[var(--color-purple)] transition cursor-pointer"
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
    "1", "1", "SSS1",
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
