import { Suspense } from "react";
import ResetContent from "@/components/pages/ResetContent";


export default function ResetPassword() {
  return (
    <Suspense fallback={<div />}>
      <ResetContent />
    </Suspense>
  )
}