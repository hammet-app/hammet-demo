import { BulkRegisterResponse } from "@/lib/api/types";
import { useState } from "react";

type ImportedCredentialListProps = {
    codes: BulkRegisterResponse["codes"];
};

export function ImportedCredentialList({
  codes
}: ImportedCredentialListProps) {
  const [expanded, setExpanded] =
    useState(false);

  const visible =
    expanded
        ? codes
        : codes.slice(0, 5);

  return (
    <div className="border-t border-border px-8 py-6">
    <div className="flex items-center justify-between">
      <div>
        <h3
          className="text-lg font-semibold"
          style={{
            fontFamily:
              "var(--font-head)",
          }}
        >
          Generated Credentials
        </h3>

        <p className="mt-1 text-sm text-text-muted">
          Save these credentials before they expire.
        </p>

      </div>

      <span className="rounded-full bg-purple-light px-3 py-1 text-xs font-semibold text-purple-mid">
        {codes.length} Students
      </span>
    </div>
  </div>

  );
}

