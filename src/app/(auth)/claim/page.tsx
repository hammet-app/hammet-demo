import { Suspense } from "react";
import ClaimContent from "@/components/pages/ClaimContent";


export default function ClaimPage() {
  return (
    <Suspense fallback={<div />}>
      <ClaimContent />
    </Suspense>
  )
}
  