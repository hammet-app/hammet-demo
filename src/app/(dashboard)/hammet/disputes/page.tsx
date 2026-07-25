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

  const [disputes, setDisputes] = useState<Disputes>({ disputes: [], });
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [showReviewed, setShowReviewed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    const loadDisputes = async () => {
      const response = await fetchDisputes(
        accessToken,
        refreshToken
      )

      if (response) {
        setDisputes(response)
      }
    }

    loadDisputes()

  }, [accessToken, refreshToken])

  async function handleSaveReview() {
    if (!selectedDispute || !accessToken) return;
    setIsSaving(true);
    
    const review = {
      id: selectedDispute.id,
      reviewNote: reviewNote,
    }

    await reviewDispute(review, accessToken, refreshToken)
  }

  function openReview(dispute: Dispute) {
    setSelectedDispute(dispute);
    setReviewNote(dispute.reviewNote ?? "");
  }

  function closeReview() {
    setSelectedDispute(null);
    setReviewNote("")
  }

  const visibleDisputes = showReviewed
    ? disputes.disputes
    : disputes.disputes.filter(
      (dispute) => !dispute.reviewed
    )

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
              onClick={() =>
                setShowReviewed(!showReviewed)
              }
            >
              {showReviewed
                ? "Show Pending"
                : "Show All"}
            </Button>

          </div>

          <DisputeTable
            disputes={visibleDisputes}
            onReview={openReview}
          />

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