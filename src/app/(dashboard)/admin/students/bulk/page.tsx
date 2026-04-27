"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { bulkRegisterStudents } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/api-client";
import { PageShell } from "@/components/layout/page-shell";
import { BulkRegisterRequest, BulkRegisterResponse } from "@/lib/api/api-types";

const PLACEHOLDER = `Chisom Obi,chisom@school.edu.ng,SSS1,A,parent@email.com,+2348001234567
Motilola Lambo,moti@school.edu.ng,JS2,B,dad@email.com,+2347012345678
Aisha Bello,aisha@school.edu.ng,SSS3,,mum@email.com,+2348098765432`;

export default function BulkImportPage() {
  const { accessToken, refreshToken } = useAuth();

  const [csvText, setCsvText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkRegisterResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

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
      const res = await bulkRegisterStudents({csvText: csvText }satisfies BulkRegisterRequest, accessToken, refreshToken);
      setResult(res);
    } catch (err) {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      setServerError("Authentication required. Please log in again.");
    } else if (err.status === 403) {
      setServerError("You are not allowed to perform this action.");
    } else if (err.status === 404) {
      setServerError("School or resource not found.");
    } else if (err.status === 409) {
      setServerError("Some records already exist or conflict with existing data.");
    } else if (err.status === 400 || err.status === 422) {
      setServerError(`Invalid data. ${err.message}`);
    } else if (err.status === 500) {
      setServerError("Server error. Please try again.");
    } else {
      setServerError(err.message);
    }
  } else if (err instanceof Error) {
    setServerError(`Unable to connect. ${err.message}`);
  }

    } finally {
      setSubmitting(false);
    }
  }

  function downloadCSV() {
    if (!result?.codes.length) return;

    const rows = result.codes.map(
      (s) => `${s.full_name},${s.email},${s.code}`
    );

    const content = `full_name,email,code\n${rows.join("\n")}`;

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
  }

  return (
    <PageShell title="Bulk Import Students">
      <div className="max-w-2xl flex flex-col gap-6">

        {/* RESULT */}
        {result && (
          <div className="border rounded-2xl p-5">
            <p className="font-semibold mb-3">
              {result.total} students registered
            </p>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              <p className="font-semibold">Codes will expire in 48 hours</p>
              {result.codes.map((s, i) => (
                <div key={i} className="border rounded p-2">
                  <p className="text-sm">{s.full_name}</p>
                  <p className="text-xs opacity-70">{s.email}</p>
                  <p className="font-mono text-sm">{s.code}</p>
                </div>
              ))}
            </div>

            <button
              onClick={downloadCSV}
              className="mt-4 border rounded p-2 w-full"
            >
              Download CSV
            </button>
          </div>
        )}

        {serverError && (
          <div className="text-red-500 text-sm">{serverError}</div>
        )}

        {!result && (
          <>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={12}
              placeholder={PLACEHOLDER}
              className="w-full border rounded-xl p-3 font-mono"
            />

            <button
              onClick={handleSubmit}
              disabled={submitting || rowCount === 0}
              className="bg-purple-600 text-white py-3 rounded-xl"
            >
              {submitting
                ? "Importing..."
                : `Import ${rowCount} students`}
            </button>
          </>
        )}
      </div>
    </PageShell>
  );
}