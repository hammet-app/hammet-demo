"use client";

import { cn } from "@/lib/utils/utils";

type CSVPasteCardProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const PLACEHOLDER = `Chisom Obi,SSS1,A,2011-01-09,M,parent@email.com,+2348001234567
Motilola Lambo,JSS2,B,2014-04-10,F,dad@email.com,+2347012345678
Aisha Bello,SSS3,,2010-09-21,F,mum@email.com,+2348098765432`;

export function CSVPasteCard({
  value,
  onChange,
  placeholder=PLACEHOLDER,
}: CSVPasteCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-6">

      <h3
        className="text-lg font-semibold"
        style={{
          fontFamily: "var(--font-head)",
        }}
      >
        Paste CSV
      </h3>

      <p className="mt-1 text-sm text-text-muted">
        Copy rows directly from Excel or Google Sheets.
      </p>

      <textarea
        id="paste-area"
        rows={12}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-6 w-full rounded-xl border border-border bg-bg-page p-4",
          "text-sm text-text-primary",
          "placeholder:text-text-muted",
          "focus:border-purple-mid focus:outline-none"
        )}
      />

    </div>
  );
}