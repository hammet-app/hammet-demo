"use client"

import type { BulkRegisterResponse } from "@/lib/api/types";
import { ImportStepper } from "./ImportStepper"
import { useState } from "react";
import { SuccessHero } from "./SuccessHero";
import { SuccessMetrics } from "./SuccessMetrics";
import { SuccessActions } from "./SuccessActions";

type BulkImportSuccessCardProps = {
    result: BulkRegisterResponse;

    onDownloadCSV: () => void;

    onImportAgain: () => void;
};

export function BulkImportSuccessCard({
  result,
  onDownloadCSV,
  onImportAgain,
}: BulkImportSuccessCardProps) {

  const [expanded, setExpanded] = useState(false);

  const visibleCodes =
      expanded
        ? result.passwords
        : result.passwords.slice(0, 5);

  return (
    <>
      <ImportStepper current="complete" />
      <div className="mt-8">
        <div className="rounded-2xl border border-border bg-bg-card">
          <SuccessHero total={result.total} />
          <div className="border-b border-border p-6">

            <p className="mt-2 text-text-muted">
                Successfully registered
                {" "}
                {result.total}
                {" "}
                students.
            </p>

            <SuccessMetrics
              total={result.total}
              codes={result.passwords.length}
            />

            <div className="mt-6 flex flex-col gap-2 max-h-60 overflow-y-auto">
              <p className="font-semibold">Their passwords are shown below</p>
                {visibleCodes.map((s, i) => (
                  <div key={s.username} className="border rounded-2xl p-5 border border-border bg-bg-page">
                    <div>
                      <p className="font-semibold text-text-primary">{s.fullName}</p>
                      <p className="mt-1 text-sm text-text-muted">{s.username}</p>
                    </div>
                    <div className="mt-5 rounded-xl bg-bg-card p-4">
                      <p className="text-xs uppercase tracking-wide text-text-muted"></p>
                      <p className="mt-2 font-mono text-xl font-bold text-purple-mid tracking-widest">{s.password}</p>
                    </div>
                  </div>
                ))}
            </div>


            {result.passwords.length > 5 && (
              <button
                onClick={() =>
                  setExpanded(!expanded)
                }
                className="mt-4 text-sm text-purple-mid hover:underline"
              >
                {expanded
                  ? "Show Less"
                  : `Show All (${result.total})`
                }
              </button>
            )}
            <SuccessActions
              onDownloadCSV={onDownloadCSV}
              onImportAgain={onImportAgain}
            />

          </div>
        </div>
      </div>
    </>
  )
}