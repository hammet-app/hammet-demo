import { Suspense } from "react";
import ClaimContent from "@/components/layout/claim-content";


export default function ClaimPage() {
  return (
    <Suspense fallback={<div />}>
      <ClaimContent />
    </Suspense>
  )
}
  