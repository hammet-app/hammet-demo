import { Suspense } from "react";
import ParentPortalClient from "@/components/layout/parent-portal";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <ParentPortalClient />
    </Suspense>
  );
}