import { PreviewLink, PreviewLinkState } from "@/lib/api/types";

export enum FileType {
  IMAGE, VIDEO, WEBSITE, PDF,
  AUDIO, DOCUMENT, ARCHIVE, OTHER
}

export type AssetPreviewProps = {
  artifact: PreviewLink
  className?: string
}

export type SubmittedArtifactsSurfaceProps = {
  label: string;
  helperText?: string;
  artifacts: PreviewLinkState;
};

export type SubmittedArtifactsCardProps = {
  artifact: PreviewLink
  onClick?: () => void;
}

export type AssetPreviewModalProps ={
  open: boolean;
  artifact: PreviewLink | null;
  onClose: () => void;
}