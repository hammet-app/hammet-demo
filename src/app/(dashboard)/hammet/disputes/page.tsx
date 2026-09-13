"use client"

import { useEffect, useState } from "react"

import { DisputeReviewModal, DisputeTable } from "@/components/cards/hammet/disputes";
import { Dispute, Disputes } from "@/lib/api/types"
import { PageShell } from "@/components/layout/common/PageShell";
import { Alert, Button } from "@/components/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { fetchDisputes, reviewDispute } from "@/lib/api/hammet";


export default function HammetDisputePage() {

  const { accessToken, refreshToken } = useAuth()

  const [disputes, setDisputes] = useState<Disputes>({
    disputes: [],
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    },
  });

  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [showReviewed, setShowReviewed] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    const loadDisputes = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchDisputes(
          accessToken,
          refreshToken,
          page,
          pageSize,
          showReviewed ? undefined : false
        );

        setDisputes(response);
      } catch {
        setError("Failed to load disputes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDisputes();

  }, [accessToken, refreshToken, page, showReviewed])

  async function handleSaveReview() {
    if (!selectedDispute || !accessToken) return;

    setIsSaving(true);
    setError("");

    const review = {
      id: selectedDispute.id,
      reviewNote: reviewNote,
    }

    try {
      await reviewDispute(review, accessToken, refreshToken);

      setSelectedDispute(null);
      setReviewNote("");

      // Reload current page so the reviewed dispute disappears
      // when viewing pending disputes.
      const response = await fetchDisputes(
        accessToken,
        refreshToken,
        page,
        pageSize,
        showReviewed ? undefined : false
      );

      setDisputes(response);
    } catch {
      setError("Failed to save review. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }


  function openReview(dispute: Dispute) {
    setSelectedDispute(dispute);
    setReviewNote(dispute.reviewNote ?? "");
  }


  function closeReview() {
    setSelectedDispute(null);
    setReviewNote("")
  }


  return (
    <PageShell
      title="AI Reviews"
    >

      <div className="flex flex-col gap-6">

        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            AI Review Queue
          </h2>

          <Button
            variant="secondary"
            onClick={() => {
              setShowReviewed((current) => !current);
              setPage(1)
            }}
          >
            {showReviewed
              ? "Show Pending"
              : "Show All"}
          </Button>

        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-text-muted">
            Loading disputes...
          </div>
        ) : (
          <DisputeTable
            disputes={disputes.disputes}
            onReview={openReview}
          />
        )}

        {disputes.pagination && disputes.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-bg-page)] transition"
            >
              Previous
            </button>

            <span className="text-sm text-[var(--color-text-muted)]">
              Page {disputes.pagination.page} of {disputes.pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={page === disputes.pagination.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-bg-page)] transition"
            >
              Next
            </button>
          </div>
        )}

      </div>

      <DisputeReviewModal
        dispute={selectedDispute}
        reviewNote={reviewNote}
        onReviewNoteChange={setReviewNote}
        onClose={closeReview}
        onSave={handleSaveReview}
        isSaving={isSaving}
      />

    </PageShell>
  )
}