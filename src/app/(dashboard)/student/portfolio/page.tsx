"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { studentApi } from "@/lib/api/student";
import { useAuth } from "@/lib/auth/auth-context";
import { PreviewLink, type PortfolioEntry } from "@/lib/api/types";
import { PageShell, ListSkeleton } from "@/components/layout/common/PageShell";
import { FileText, Award } from "lucide-react";
import { StatusPill } from "@/components/ui";
import { AssetPreview, AssetPreviewModal } from "@/components/cards/student/lessons/views";
import { ModalShell } from "@/components/modals/ModalShell";

export default function PortfolioPage() {
  const { accessToken, refreshToken } = useAuth();
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<PortfolioEntry | null>(null);
  

  useEffect(() => {
    if (!accessToken) return;
    studentApi
      .getPortfolio(accessToken, refreshToken)
      .then((data) => setEntries(data.entries))
      .catch(() => setError("Failed to load portfolio. Please try again."))
      .finally(() => setIsLoading(false));
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const approvedCount = entries.filter(
    entry => entry.status === "approved"
  ).length;

  return (
    <PageShell
      title="My Portfolio"
      description="Approved work that showcases your AI literacy journey"
      rounded={true}
    >
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <div className="text-[13px] text-danger bg-danger-light border border-danger/20 rounded-[10px] px-4 py-3">
          {error}
        </div>
      ) : entries.length === 0 ? (
        <EmptyPortfolio />
      ) : (
        <>
          {/* Summary chip */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-1.5 bg-success-light text-success-dark text-[12px] font-semibold px-3 py-1.5 rounded-full">
              <Award size={13} />
              {approvedCount} approved {approvedCount === 1 ? "entry" : "entries"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {entries.map((entry) => (
              <PortfolioEntryCard key={entry.id} entry={entry} onOpen={setSelectedEntry} />
            ))}
          </div>
        </>
      )}
      <PortfolioEntryModal
        open={selectedEntry !== null}
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </PageShell>
  );
}

function PortfolioEntryCard({ entry, onOpen }: { entry: PortfolioEntry, onOpen: (entry: PortfolioEntry) => void; }) {

  

  const approvedDate = new Date(entry.approvedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const files = entry.fileUrls?.filter(Boolean) ?? [];
  const hasFiles = files.length > 0;
  const hasReflection = Boolean(entry.reflectionText?.trim());

  const hasActivity = false;

  const previewArtifacts = files.slice(0, 4);
  const remainingCount = files.length - 4
;
  return (
    <div 
      className="group bg-bg-card border border-border rounded-[14px] overflow-hidden transition-all
      duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-purple/30"
      onClick={() => onOpen(entry)}
    >
      {/** Preview */}
      <div className="border-b border-border p-3">
        {hasFiles ? (
          <div className="grid grid-cols-2 gap-2">
            {previewArtifacts.map((artifact, index) => (
              <div
                key={artifact.url}
                className="relative aspect-square overflow-hidden rounded-lg bg-bg-secondary"
              >
                <AssetPreview artifact={artifact} className="h-full" />

                {index === 3 && remainingCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-lg font-semibold text-white">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="aspect-[4/3] flex items-center justify-center bg-bg-secondary rounded-lg">
            <FileText size={42} className="text-text-muted" />
          </div>
        )}
      </div>

      {/** Body */}
      <div className="p-4 flex flex-col gap-4 flex-1">
        <div>
          <p className="text-[14px] font-semibold text-text-primary line-clamp-2">
            {entry.moduleTitle}
          </p>

          <p className="text-[12px] text-text-muted mt-1">
            Week {entry.weekNumber} · Term {entry.term}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <StatusPill status={entry.status} />

          <span className="text-[11px] text-text-muted">
             {entry.approvedAt ? approvedDate : ""}
          </span>
        </div>
      </div>
    </div>
    
  );
}

function EmptyPortfolio() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-purple-light flex items-center justify-center">
        <Award size={26} className="text-purple-mid" />
      </div>
      <div>
        <p className="text-[15px] font-medium text-text-primary mb-1">
          Your portfolio is empty
        </p>
        <p className="text-[13px] text-text-muted max-w-[260px] mx-auto leading-relaxed">
          Approved submissions are automatically added here. Complete a lesson
          and get it approved by your teacher to get started.
        </p>
      </div>
      <Link
        href="/student/lessons"
        className="mt-2 text-[13px] font-semibold text-purple-mid hover:text-purple transition-colors no-underline"
      >
        Go to My Lessons
      </Link>
    </div>
  );
}
type PortfolioEntryModalProps = {
  open: boolean;
  entry: PortfolioEntry | null;
  onClose: () => void;
}

function PortfolioEntryModal({
  open, 
  entry, 
  onClose
}: PortfolioEntryModalProps) {
  const [selectedArtifact, setSelectedArtifact] = useState<PreviewLink | null>(null);
  
  if (!open || !entry) return null;
  
  const files = entry?.fileUrls?.filter(Boolean) ?? [];
  const approvedDate = new Date(entry.approvedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  

  return (
    <ModalShell
      open={open}
      title={entry.moduleTitle}
      subtitle={`Week ${entry.weekNumber} • Term ${entry.term}`}
      maxWidth="max-w-6xl"
      onClose={onClose}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {files.map((artifact) => (
          <button
            key={artifact.url}
            type="button"
            onClick={() => setSelectedArtifact(artifact)}
            className="group rounded-xl overflow-hidden border border-border bg-bg-card hover:border-purple transition"
          >
            <div className="aspect-square">
              <AssetPreview
                artifact={artifact}
                className="h-full"
              />
            </div>
          </button>
        ))}
        {entry.reflectionText && (
          <section className="mt-8">
            <h3 className="text-sm font-semibold text-text-primary mb-2">
              Reflection
            </h3>

            <div className="rounded-xl border border-border bg-bg-card p-4">
              <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
                {entry.reflectionText}
              </p>
            </div>
          </section>
        )}

      </div>
      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">
          Details
        </h3>

        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-bg-card p-4">
          <div>
            <p className="text-xs text-text-muted">Status</p>
            <StatusPill status={entry.status} />
          </div>

          <div>
            <p className="text-xs text-text-muted">Approved</p>
            <p className="text-sm text-text-primary">
              {approvedDate}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Week</p>
            <p className="text-sm text-text-primary">
              {entry.weekNumber}
            </p>
          </div>

          <div>
            <p className="text-xs text-text-muted">Term</p>
            <p className="text-sm text-text-primary">
              {entry.term}
            </p>
          </div>
        </div>
      </div>

      <AssetPreviewModal
        open={selectedArtifact !== null}
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
      />
    </ModalShell>
  );
}
