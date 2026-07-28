"use client"

import { 
  X, 
  CheckSquare, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Clock3, 
  FileText, 
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { FONT_BODY, FONT_HEAD, LessonMode } from "@/lib/student/lessons/build";
import { TaskFileEntry, TaskFilesState, SubmissionLink, TaskLinksState, PreviewLinkState } from "@/lib/api/types";
import { TaskPage } from "@/lib/student/lessons/build";
import { BlockMeta } from "../blocks";
import { 
  UploadSurfaceProps, 
  ACCEPTED_TYPES,  
  LinkSubmissionSurfaceProps
} from "@/lib/student/lessons/view";
import { useState } from "react";
import { Button } from "@base-ui/react";
import { SubmittedArtifactSurface } from "./submissions";

function SubmissionPill({
  link,
  onRemove,
}: {
  link: SubmissionLink,
  onRemove: () => void;
}) {
  const displayUrl = (() => {
    try {
      const url = new URL(link.url);
      return `${url.hostname}${url.pathname}`.replace(/\$/, "");
    } catch {
      return link.url;
    }
  })();

  return (
    <div className="flex items-center gap-2.5 bg-bg-page border border-border rounded-[8px] px-3 py-2">
      <Globe size={15} className="text-text-muted shrink-0" />

      <div className="flex-1 min-w-0">
        <p 
          className="text-sm font-medium text-text-primary truncate"
          style={{ fontFamily: FONT_BODY }}
        >
          {displayUrl}
        </p>
      </div>
      <button
        onClick={onRemove}
        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-border transition-all duration-200 shrink-0"
        aria-label="Remove link"
      >
        <X size={11} className="text-text-muted" />
      </button>
    </div>
  )
}
function LinkSubmissionSurface({
  label,
  helperText,
  entries,
  onAdd,
  onRemove
}: LinkSubmissionSurfaceProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("");
  const handleAdd = () => {
    const value = url.trim();

    if (!value) return;

    try {
      new URL(value);
      onAdd(value)
      setUrl("");
      setError("");
    } catch {
      setError("Please enter a valid URL")
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <label
        className="block text-[13px] font-bold text-text-primary"
        style={{ fontFamily: FONT_BODY }}
      >
        {label}
        {helperText && (
          <span className="ml-1.5 text-[12px] font-normal text-text-muted">
            {helperText}
          </span>
        )}
      </label>

      <div 
        className={cn(
          "flex items-center rounded-[10px] border bg-white overflow-hidden",
          error
            ? "border-[#D85A30]"
            : "border-border focus-within:border-[#1D9E75]"
        )}
      >
        <div className="pl-3 text-text-muted">
          <Globe size={16} />
        </div>
        <input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError("")
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="https://hammetlabs.com/..."
          className="flex-1 bg-transparent px-3 py-3 text-sm outline-none"
          style={{ fontFamily: FONT_BODY }}
        />
        <Button
          className="mr-2"
          onClick={handleAdd}
        >
          Add
        </Button>
      </div>

      {error && (
        <p className="text-xs text-[#D85A30]" style={{ fontFamily: FONT_BODY }}>
          {error}
        </p>
      )}

      {entries.length > 0 && (
        <div className="mt-1 flex flex-col gap-1.5">
          {entries.map((entry, index) => (
            <SubmissionPill
              key={entry.taskId + entry.url}
              link={entry}
              onRemove={() => onRemove(index)}
            />
          ))}
          </div>
      )}

    </div>
  )
}

function UploadSurface({
  label,
  helperText,
  entries,
  inputId,
  onFilesSelected,
  onRemove
}: UploadSurfaceProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="block text-[13px] font-bold text-text-primary"
        style={{ fontFamily: FONT_BODY }}
      >
        {label}
        {helperText && (
          <span className="font-normal text-[12px] text-text-muted ml-1.5">
            {helperText}
          </span>
        )}
      </label>

      {/* Upload button */}
      <label
        htmlFor={inputId}
        className={cn(
          "flex items-center justify-center gap-2 border-2 border-dashed border-[#5DCAA5]/60",
          "rounded-[10px] px-4 py-3.5 cursor-pointer transition-all duration-200",
          "hover:border-[#1D9E75] hover:bg-[#E1F5EE]/40",
          "text-sm font-bold text-[#1D9E75]"
        )}
        style={{ fontFamily: FONT_BODY }}
      >
        <Upload size={15} />
        {entries.length === 0 ? "Choose files" : "Add more files"}
        <input
          id={inputId}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) {
              onFilesSelected(e.target.files);
              // Reset so same file can be re-selected
              e.target.value = "";
            }
          }}
        />
      </label>

      {/* File list */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {entries.map((entry, i) => (
            <FilePill
              key={i}
              entry={entry}
              onRemove={() => onRemove(i)}
            />
          ))}
        </div>
      )}
      
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// File pill — shows a single uploaded/queued file
// ─────────────────────────────────────────────────────────────────────────────

function FilePill({
  entry,
  onRemove,
}: {
  entry: TaskFileEntry;
  onRemove: () => void;
}) {
  const name = entry.file?.name ?? entry.url?.split("/").pop() ?? "File";
  const statusColor =
    entry.status === "done"
      ? "text-[#1D9E75]"
      : entry.status === "queued"
      ? "text-[#EF9F27]"
      : entry.status === "error"
      ? "text-[#D85A30]"
      : "text-text-muted";
  const StatusIcon = 
    entry.status === "done"
      ? CheckCircle2
      : entry.status === "queued"
      ? Clock3
      : entry.status === "error"
      ? AlertCircle
      : Loader2
  const statusLabel =
    entry.status === "done"
      ? "Uploaded"
      : entry.status === "queued"
      ? "Queued offline"
      : entry.status === "error"
      ? entry.errorMsg ?? "Error"
      : "Uploading…";

  return (
    <div className="flex items-center gap-2.5 bg-bg-page border border-border rounded-[8px] px-3 py-2">
      <FileText size={15} className="text-text-muted shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-text-primary truncate"
          style={{ fontFamily: FONT_BODY }}
        >
          {name}
        </p>
        <div className={cn("mt-0.5 flex items-center gap-1.5 text-[11px]", statusColor)}>
          <StatusIcon size={12} 
            className={entry.status === "uploading" ? "animate-spin" : undefined }
          />
          <span style={{ fontFamily: FONT_BODY }}>
            {statusLabel}
          </span>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-border transition-all duration-200 shrink-0"
        aria-label="Remove file"
      >
        <X size={11} className="text-text-muted" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Task page view
// ─────────────────────────────────────────────────────────────────────────────

export function TaskPageView({
  page,
  taskFiles,
  previewLinks,
  onFilesSelected,
  onFileRemove,
  taskLinks,
  onLinkAdd,
  onLinkRemove,
  lessonMode,
  isTeacher,
}: {
  page: TaskPage;
  taskFiles?: TaskFilesState;
  previewLinks?: PreviewLinkState | null;
  onFilesSelected: (blockId: string, files: FileList) => void;
  onFileRemove: (blockId: string, index: number) => void;
  taskLinks: TaskLinksState;
  onLinkAdd: (blockId: string, links: string) => void;
  onLinkRemove: (blockId: string, index: number) => void;
  lessonMode: LessonMode;
  isTeacher?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[8px] bg-[#1D9E75] flex items-center justify-center shrink-0">
          <CheckSquare size={15} className="text-white" />
        </div>
        <h2
          className="text-[18px] sm:text-[20px] font-bold text-text-primary leading-snug"
          style={{ fontFamily: FONT_HEAD }}
        >
          Tasks
        </h2>
      </div>

      {page.blocks.map((block) => {
        if (!taskFiles) return;
        const entries = taskFiles[block.id] ?? [];
        const inputId = `task-upload-${block.id}`;
        const links = taskLinks[block.id] ?? [];

        return (
          <div key={block.id} className="flex flex-col gap-3">
            {/* Task instruction */}
            {lessonMode !== LessonMode.REVIEW && (
              <div className="bg-[#E1F5EE] border border-[#5DCAA5]/60 rounded-[10px] px-4 py-3.5 flex gap-3 items-start">
                <div className="w-7 h-7 rounded-[7px] bg-[#1D9E75] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckSquare size={13} className="text-white" />
                </div>
                
                  <div className="flex-1 min-w-0">
                    <BlockMeta className="text-[#0F6E56]" required={block.required}>
                      Your task
                    </BlockMeta>
                  
                    <p
                      className="text-[15px] sm:text-[17px] text-[#085041] leading-[1.6]"
                      style={{ fontFamily: FONT_BODY }}
                    >
                      {block.content}
                    </p>
                  </div>
              </div>
            )}

            {/* Upload area — students only */}
            {(lessonMode === LessonMode.REVIEW && previewLinks) ? (
                <SubmittedArtifactSurface
                  label="Your Submissions"
                  helperText="Files submitted for this task"
                  artifacts={previewLinks}
                />
            ) :(
              <>
                {!isTeacher && (
                  <>
                    <UploadSurface
                      label="Upload your work"
                      helperText="(images, documents, videos)"
                      entries={entries}
                      inputId={inputId}
                      onFilesSelected={(files) =>
                          onFilesSelected(block.id, files)
                      }
                      onRemove={(index) =>
                          onFileRemove(block.id, index)
                      }
                  />
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-border" />
                    <span 
                      className="text-xs font-medium text-text-muted"
                      style={{ fontFamily: FONT_BODY }}
                    >
                      OR
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <LinkSubmissionSurface
                    label="Submit a link"
                    helperText="(GitHub, Portfolio, Figma...)"
                    entries={links}
                    onAdd={(url) => onLinkAdd(block.id, url)}
                    onRemove={(index) => onLinkRemove(block.id, index)}
                  />
                </>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}