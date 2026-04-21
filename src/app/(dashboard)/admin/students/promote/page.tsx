"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { previewPromotion, confirmPromotion } from "@/lib/api/admin";
import { PageShell } from "@/components/layout/page-shell";
import type {
  BulkRegisterRequest,
  PromotionPreviewResponse,
  PromotionStudentPreview,
} from "@/lib/api/api-types";

type Stage = "input" | "preview" | "confirmed";

const OUTCOME_STYLE: Record<
  PromotionStudentPreview["outcome"],
  { bg: string; text: string; label: string }
> = {
  promoted:    { bg: "bg-emerald-50", text: "text-emerald-700", label: "Promoted" },
  retained:    { bg: "bg-amber-50",   text: "text-amber-700",   label: "Retained" },
  deactivated: { bg: "bg-red-50",     text: "text-red-600",     label: "Deactivated" },
};

export default function PromotionPage() {
  const { accessToken, refreshToken } = useAuth();

  const [stage, setStage] = useState<Stage>("input");
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<PromotionPreviewResponse | null>(null);
  const [outcomeFilter, setOutcomeFilter] = useState<"all" | PromotionStudentPreview["outcome"]>("all");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedResult, setConfirmedResult] = useState<{
    promoted: number;
    retained: number;
    deactivated: number;
  } | null>(null);

  const retainedRowCount = csvText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0).length;

  async function handlePreview() {
    if (!csvText.trim() || !accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await previewPromotion({csvText: csvText} satisfies BulkRegisterRequest, accessToken, refreshToken);
      console.log(res)
      setPreview(res);
      setStage("preview");
    } catch {
      setError("Failed to generate preview. Check your CSV and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!preview || !accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await confirmPromotion(
        { promotion_id: preview.promotion_id },
        accessToken,
        refreshToken
      );
      setConfirmedResult({
        promoted: res.promoted,
        retained: res.retained,
        deactivated: res.deactivated,
      });
      setStage("confirmed");
    } catch {
      setError("Failed to confirm promotion. The preview may have expired — please start again.");
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = preview?.students.filter(
    (s) => outcomeFilter === "all" || s.outcome === outcomeFilter
  ) ?? [];

  // ----------------------------------------------------------------
  // Confirmed state
  // ----------------------------------------------------------------
  if (stage === "confirmed" && confirmedResult) {
    return (
      <PageShell title="Promotion Complete" backHref="/admin">
        <div className="max-w-sm">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <p className="font-semibold text-emerald-800 font-[family-name:var(--font-jakarta)]">
                Promotion applied
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Promoted", value: confirmedResult.promoted, color: "text-emerald-700" },
                { label: "Retained", value: confirmedResult.retained, color: "text-amber-700" },
                { label: "Deactivated", value: confirmedResult.deactivated, color: "text-red-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-2xl font-bold font-[family-name:var(--font-jakarta)] ${color}`}>
                    {value}
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              setStage("input");
              setCsvText("");
              setPreview(null);
              setConfirmedResult(null);
            }}
            className="w-full px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-sm hover:border-[var(--color-purple)] transition"
          >
            Done
          </button>
        </div>
      </PageShell>
    );
  }

  // ----------------------------------------------------------------
  // Preview state
  // ----------------------------------------------------------------
  if (stage === "preview" && preview) {
    const expiresAt = new Date(preview.expires_at);

    return (
      <PageShell
        title="Promotion Preview"
        description={`Expires at ${expiresAt.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`}
        backHref="/admin/students/promote"
      >
        <div className="max-w-2xl flex flex-col gap-6">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Summary stat row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total", value: preview.summary.total_students, bg: "bg-[var(--color-bg-card)]", text: "text-[var(--color-text-primary)]" },
              { label: "Promoted", value: preview.summary.promoted, bg: "bg-emerald-50", text: "text-emerald-700" },
              { label: "Retained", value: preview.summary.retained, bg: "bg-amber-50", text: "text-amber-700" },
              { label: "Deactivated", value: preview.summary.deactivated, bg: "bg-red-50", text: "text-red-600" },
            ].map(({ label, value, bg, text }) => (
              <div key={label} className={`${bg} border border-[var(--color-border)] rounded-2xl p-4 text-center`}>
                <p className={`text-2xl font-bold font-[family-name:var(--font-jakarta)] ${text}`}>{value}</p>
                <p className={`text-xs mt-0.5 ${text} opacity-80`}>{label}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-[var(--color-purple-light)] p-1 rounded-xl w-fit">
            {(["all", "promoted", "retained", "deactivated"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setOutcomeFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  outcomeFilter === key
                    ? "bg-white text-[var(--color-purple)] shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Student table */}
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-5 py-3 border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              <span>Student</span>
              <span>Current</span>
              <span>Next</span>
              <span>Outcome</span>
            </div>
            <div className="divide-y divide-[var(--color-border)] max-h-[400px] overflow-y-auto">
              {filteredStudents.map((s) => {
                const style = OUTCOME_STYLE[s.outcome];
                return (
                  <div
                    key={s.student_id}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-5 py-3 items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {s.full_name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">{s.email}</p>
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)] font-mono">
                      {s.current_level}
                    </span>
                    <span className="text-sm text-[var(--color-text-secondary)] font-mono">
                      {s.next_level ?? "—"}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirm / back */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-purple)] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Applying…" : "Confirm promotion"}
            </button>
            <button
              onClick={() => { setStage("input"); setError(null); }}
              className="px-5 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-sm hover:border-[var(--color-purple)] transition"
            >
              Back
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  // ----------------------------------------------------------------
  // Input state
  // ----------------------------------------------------------------
  return (
    <PageShell
      title="Promote Students"
      description="Upload a list of students being retained. Everyone else moves up."
      backHref="/admin"
    >
      <div className="max-w-lg flex flex-col gap-6">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* How it works */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-sm font-semibold text-amber-800 font-[family-name:var(--font-jakarta)] mb-2">
            How promotion works
          </p>
          <ul className="text-sm text-amber-700 flex flex-col gap-1.5">
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              Students on this list are <strong>retained</strong> (repeat the year).
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              Everyone not listed is <strong>promoted</strong> up one level.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              SS3 students not listed are <strong>deactivated</strong>.
            </li>
          </ul>
        </div>

        {/* CSV paste */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
              Retained students — one email per line
            </label>
            {retainedRowCount > 0 && (
              <span className="text-xs text-[var(--color-text-muted)]">
                {retainedRowCount} {retainedRowCount === 1 ? "student" : "students"}
              </span>
            )}
          </div>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={10}
            placeholder={"chisom@school.edu.ng,\nmotilola@school.edu.ng,\naisha@school.edu.ng"}
            spellCheck={false}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-page)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)] focus:border-transparent resize-y transition font-mono leading-relaxed"
          />
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
            Leave blank to promote all students (no one is retained).
          </p>
        </div>

        <button
          onClick={handlePreview}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-purple)] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? "Generating preview…" : "Preview promotion"}
        </button>
      </div>
    </PageShell>
  );
}
