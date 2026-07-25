"use client"

import { FONT_BODY } from "@/lib/student/lessons/build";
import { AssetPreview, AssetPreviewModal } from "./asset";
import { SubmittedArtifactsCardProps, SubmittedArtifactsSurfaceProps } from "./types";
import { useState } from "react";
import { PreviewLink } from "@/lib/api/types";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { getArtifactMetadata } from "@/lib/student/artifacts";

export function SubmittedArtifactCard({
  artifact,
  onClick,
}: SubmittedArtifactsCardProps) {
  const isFile = artifact.type === "file"
  const isLink = artifact.type === "link"
  let name: string | undefined;
  let extension: string | undefined;

  if (isFile) {
    const metadata = getArtifactMetadata(artifact.url)
    name = metadata.name
    extension = metadata.extension

  }

  return (
    <div 
      className={cn("overflow-hidden rounded-[12px] border border-border",
        "bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
        "rounded-[10px]"
      )}
      onClick={onClick}
    >
      {/* Preview */}
      <div className="border-b border-border">
        {
          isFile && (
            <>
              <AssetPreview artifact={artifact} />
          
              {/* Metadata */}
              <div className="flex flex-col gap-3 p-4">
                <div>
                  <h4 
                    className="truncate text-sm font-semibold text-text-primary"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    {name}
                  </h4>

                  <p className="mt-1 text-xs text-text-muted" style={{ fontFamily: FONT_BODY }}>
                    {extension}
                  </p>
                </div>

              </div>
            </>
        )} 
        {isLink && (
          <div className={cn("flex flex-col items-center justify-center bg-bg-page px-4")}>
            {artifact.faviconUrl ? (
              <img
                src={artifact.faviconUrl}
                alt=""
                className="mb-3 h-12 w-12 rounded-xl"
              />
            ) : (
              <Globe size={36} className="mb-3 text-text-muted" />
            )}
            <p 
              className="line-clamp-2 text-center text-sm font-medium text-text-primary"
              style={{ fontFamily: FONT_BODY }}
            >
              {artifact.title ?? "Website"}
            </p>
            
          </div>
        )}

      </div>
    </div>
  )
}

export function SubmittedArtifactSurface({
  label,
  helperText,
  artifacts
}: SubmittedArtifactsSurfaceProps) {
  console.log(artifacts)
  const [selectedArtifact, setSelectedArtifact] = useState<PreviewLink | null>(null)
  const files = artifacts.filter((artifact) => artifact.type === "file");
  const links = artifacts.filter((artifact) => artifact.type === "link");
  return (
    <div className="flex flex-col gap-3">
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

      {artifacts.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-border px-4 py-8 text-center">
          <p
            className="text-sm text-text-muted"
            style={{ fontFamily: FONT_BODY }}
          >
            No files were submitted.
          </p>
        </div>
      ) : (
        <>
          {files.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 
                className="text-sm font-semibold text-text-primary"
                style={{ fontFamily: FONT_BODY }}
              >
                Uploaded Files
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {files.map((artifact,index) => (
                  <SubmittedArtifactCard
                    key={artifact.url ?? index}
                    artifact={artifact}
                    onClick={() => setSelectedArtifact(artifact)}
                  />
                ))}
              </div>
            </div>
          )}
          {links.length > 0 && (  
            <div className="flex flex-col gap-3">
              <h3
                className="text-sm font-semibold text-text-primary"
                style={{ fontFamily: FONT_BODY }}
              >
                Submitted Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {links.map((artifact,index) => (
                  <SubmittedArtifactCard
                    key={artifact.url ?? index}
                    artifact={artifact}
                    onClick={() => setSelectedArtifact(artifact)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <AssetPreviewModal
        open={selectedArtifact !== null}
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
      />
    </div>
  )
}

