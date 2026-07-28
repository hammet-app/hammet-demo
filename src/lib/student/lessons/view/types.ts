
import { TaskFileEntry, SubmissionLink } from "@/lib/api/types";

export const ACCEPTED_TYPES = [
  "image/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/*",
].join(",");

export type LinkSubmissionSurfaceProps = {
  label: string;
  helperText?: string;
  entries: SubmissionLink[];
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
}

export type SubmissionPillProps = {
  link: SubmissionLink;
  onRemove: () => void;
}

export type UploadSurfaceProps = {
  label: string;
  helperText?: string;
  entries: TaskFileEntry[];
  inputId: string;
  onFilesSelected: (files: FileList) => void;
  onRemove: (index: number) => void;
}
