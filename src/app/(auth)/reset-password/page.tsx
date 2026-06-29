import { Suspense } from "react";
import ResetContent from "@/components/layout/reset-content";


export default function ResetPassword() {
  return (
    <Suspense fallback={<div />}>
      <ResetContent />
    </Suspense>
  )
}
