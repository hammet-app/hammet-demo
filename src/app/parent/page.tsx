import { Suspense } from "react";
import ParentPortalClient from "@/components/pages/ParentPortal";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <ParentPortalClient />
    </Suspense>
  );
}