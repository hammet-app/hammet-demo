"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { bulkRegisterStudents } from "@/lib/api/admin";
import { PageShell } from "@/components/layout/page-shell";
import type { BulkRegisterResponse } from "@/lib/api/api-types";

const PLACEHOLDER = `Chisom Obi,chisom@school.edu.ng,SS1,A,parent@email.com,+2348001234567
Emeka Nwosu,emeka@school.edu.ng,JS2,B,dad@email.com,+2347012345678
Aisha Bello,aisha@school.edu.ng,SS3,,mum@email.com,+2348098765432`;

const COLUMNS = [
  { name: "full_name", desc: "Student's full name", example: "Chisom Obi" },
  { name: "email", desc: "Student's school email", example: "chisom@school.edu.ng" },
  { name: "class_level", desc: "JS1–JS3 or SS1–SS3", example: "SS1" },
  { name: "class_arm", desc: "A, B, C… Leave blank if single-stream", example: "A" },
  { name: "parent_email", desc: "Parent or guardian email", example: "parent@email.com" },
  { name: "parent_phone", desc: "Parent or guardian phone", example: "+2348001234567" },
];

export default function BulkImportPage() {
  const { accessToken, refreshToken } = useAuth();

  const [csvText, setCsvText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkRegisterResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Quick parse to show row count before submitting
  const rowCount = csvText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0).length;

  async function handleSubmit() {
    if (!csvText.trim() || !accessToken) return;
    setSubmitting(true);
    setServerError(null);
    setResult(null);
    try {
      const res = await bulkRegisterStudents(csvText, accessToken, refreshToken);
      setResult(res);
    } catch {
      setServerError("Failed to process import. Please check your data and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      title="Bulk Import Students"
      description="Paste student data below — one student per line."
      backHref="/admin/students"
    >
      <div className="max-w-2xl flex flex-col gap-6">
        {/* Format guide */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Required format — comma separated, one row per student
          </p>
          <div className="flex flex-col gap-2">
            {COLUMNS.map((col, i) => (
              <div key={col.name} className="flex items-start gap-3 text-sm">
                <span className="w-5 h-5 rounded-md bg-[var(--color-purple-light)] text-[var(--color-purple)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <span className="font-mono text-[var(--color-text-primary)] text-xs font-semibold">
                    {col.name}
                  </span>
                  <span className="text-[var(--color-text-muted)] ml-2 text-xs">
                    {col.desc}
                  </span>
                  <span className="text-[var(--color-text-muted)] ml-1 text-xs italic">
                    e.g. {col.example}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result panel */}
        {result && (
          <div className={`rounded-2xl p-5 border ${result.failed === 0 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
            <p className={`font-semibold font-[family-name:var(--font-jakarta)] mb-3 ${result.failed === 0 ? "text-emerald-800" : "text-amber-800"}`}>
              {result.failed === 0
                ? `All ${result.succeeded} students registered successfully.`
                : `${result.succeeded} registered · ${result.failed} failed`}
            </p>

            {result.errors.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">Errors</p>
                {result.errors.map((err) => (
                  <div key={`${err.row}-${err.email}`} className="flex items-start gap-2 text-sm text-amber-800">
                    <span className="shrink-0 font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">
                      Row {err.row}
                    </span>
                    <span className="font-medium">{err.email}</span>
                    <span className="text-amber-600">— {err.reason}</span>
                  </div>
                ))}
              </div>
            )}

            {result.failed > 0 && (
              <button
                onClick={() => setResult(null)}
                className="mt-4 text-xs text-amber-700 font-medium hover:underline"
              >
                Fix errors and re-import
              </button>
            )}
          </div>
        )}

        {serverError && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        {/* Paste area */}
        {!result && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                  Student data
                </label>
                {rowCount > 0 && (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {rowCount} {rowCount === 1 ? "row" : "rows"} detected
                  </span>
                )}
              </div>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={12}
                placeholder={PLACEHOLDER}
                spellCheck={false}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-page)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)] focus:border-transparent resize-y transition font-mono leading-relaxed"
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                Leave class_arm blank (two consecutive commas) for single-stream schools.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || rowCount === 0}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-purple)] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition"
            >
              {submitting && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {submitting
                ? "Importing…"
                : `Import ${rowCount > 0 ? rowCount : ""} ${rowCount === 1 ? "student" : "students"}`}
            </button>
          </>
        )}
      </div>
    </PageShell>
  );
}
