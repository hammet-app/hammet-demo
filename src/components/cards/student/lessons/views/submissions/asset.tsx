"use client"

import { FONT_BODY } from "@/lib/student/lessons/build";
import { AssetPreviewProps, AssetPreviewModalProps } from "./types";
import { ExternalLink, FileText, Globe, Play, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { getArtifactMetadata } from "@/lib/student/artifacts";
import { ModalShell } from "@/components/modals/ModalShell";


export function AssetPreview({
  artifact,
  className
}: AssetPreviewProps) {
  const isFile = artifact.type === "file"
  const isLink = artifact.type === "link"
  const { name, extension} = getArtifactMetadata(artifact.url)
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension ?? "");
  const isVideo = ["mp4", "mov", "webm"].includes(extension ?? "");
  const isPdf = extension === "pdf";


  if (isImage && artifact.url && isFile) {
    return (
      <img
        src={artifact.url}
        alt={name}
        className={cn(
          "w-full transition-transform duration-300 hover:scale-105",
          className ?? "h-40 object-contain"
        )}
      />
    )
    }
  if (isVideo && artifact.url && isFile) {
    return (
      <div 
        className={cn("relative w-full h-40")}
      >
        <video
          src={artifact.url}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          muted
          preload="metadata"
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow">
            <Play
              size={20}
              className="ml-0.5 text-text-primary"
              fill="currentColor"
            />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div 
      className={cn(
        "flex h-40 items-center justify-center bg-bg-page"
      )}
    >
      <FileText
        size={36}
        className="text-text-muted"
      />
    </div>
  )
}

export function AssetPreviewModal({
  open, 
  artifact,
  onClose,
}: AssetPreviewModalProps) {
  if (!open || !artifact) return null;
  const isFile = artifact.type === "file"
  const isLink = artifact.type === "link"
  const { name, extension} = getArtifactMetadata(artifact.url)
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension ?? "");

  return (
    <ModalShell
      open={open}
      title={artifact.title ?? "Submitted File"}
      subtitle={extension}
      onClose={onClose}
    >

      {isFile && (
        <div className="flex-1 bg-bg-page">
          {isImage ? (
            <div className="flex h-[70vh] items-center justify-center rounded-xl bg-bg-card border border-border p-6">
              <img
                src={artifact.url}
                alt={name}
                className="max-h-full max-w-full object-contain rounded-lg"
                title="Preview"
              />
            </div>
          ) :(
            <div className="h-[70vh] overflow-hidden rounded-xl border border-border bg-white">
              <iframe
                src={artifact.url}
                className="h-full w-full border-0"
                title={artifact.title ?? "Preview"}
              />
            </div>
          )}
          </div>
        )}

    
      {isLink && (
        <>
          <div className="flex flex-col items-center text-center">
            {artifact.faviconUrl ? (
              <img
                src={artifact.faviconUrl}
                alt=""
                className="mb-4 h-14 w-14 rounded-xl"
              />
            ) : (
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-bg-page">
                <Globe size={28} />
              </div>
            )}

            <h2 
              className="text-xl font-semibold text-text-primary"
              style={{ fontFamily: FONT_BODY }}
            >
              {artifact.title ?? "Website"}
            </h2>

            <p 
              className="mt-2 break-all text-sm text-text-muted"
              style={{ fontFamily: FONT_BODY }}
            >
              {artifact.url}
            </p>

            <a 
              href={artifact.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-5 text-white transition hover:opacity-90"
            >
              <ExternalLink size={16} />
              Open Website
            </a>

          </div>
        </>
      )}
    </ModalShell>
  )
}