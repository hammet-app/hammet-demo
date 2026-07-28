"use client";

import { cn } from "@/lib/utils/utils";

type CSVPasteCardProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const PLACEHOLDER = `Chisom Obi,chisom@school.edu.ng,SSS1,A,parent@email.com,+2348001234567,2011-01-09
Motilola Lambo,moti@school.edu.ng,JSS2,B,dad@email.com,+2347012345678,2014-04-10
Aisha Bello,aisha@school.edu.ng,SSS3,,mum@email.com,+2348098765432,2010-09-21`;

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