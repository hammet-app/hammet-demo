"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { createModule } from "@/lib/api/hammet";
import { PageShell } from "@/components/layout/page-shell";
import {
  BlockEditor2,
  blocksToContentJson,
  type BlockEditorBlock,
} from "@/components/editor/block-editor";

type FormErrors = {
  title?: string;
  week_number?: string;
  blocks?: string;
};

export default function NewModulePage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const params = useParams<{ level: string; term: string }>();
  const level = decodeURIComponent(params.level);
  const term = Number(params.term);

  const [title, setTitle] = useState("");
  const [weekNumber, setWeekNumber] = useState<string>("");
  const [published, setPublished] = useState(false);
  const [blocks, setBlocks] = useState<BlockEditorBlock[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!title.trim()) errs.title = "Title is required.";
    const wn = Number(weekNumber);
    if (!weekNumber || isNaN(wn) || wn < 1 || !Number.isInteger(wn)) {
      errs.week_number = "Enter a valid week number (1 or above).";
    }
    if (blocks.length === 0) errs.blocks = "Add at least one content block.";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (!accessToken) return;
    setSubmitting(true);
    setServerError(null);
    try {
      await createModule(
        {
          title: title.trim(),
          term,
          week_number: Number(weekNumber),
          level,
          published,
          content_json: { blocks: blocksToContentJson(blocks) },
        },
        accessToken,
        refreshToken
      );
      router.push(`/hammet/modules/${level}/${term}`);
    } catch {
      setServerError("Failed to create module. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const TERM_LABELS: Record<number, string> = {
    1: "First Term",
    2: "Second Term",
    3: "Third Term",
  };

  return (
    <PageShell
      title="New Module"
      description={`${level} — ${TERM_LABELS[term] ?? `Term ${term}`}`}
      backHref={`/hammet/modules/${level}/${term}`}
    >
      <div className="max-w-2xl flex flex-col gap-6">
        {serverError && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        {/* Module metadata */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-5">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Module details
          </p>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
              }}
              placeholder="e.g. Introduction to Machine Learning"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-page)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)] focus:border-transparent transition"
            />
            {errors.title && (
              <p className="text-[var(--color-danger)] text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Week number */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Week number
            </label>
            <input
              type="number"
              min={1}
              value={weekNumber}
              onChange={(e) => {
                setWeekNumber(e.target.value);
                if (errors.week_number)
                  setErrors((p) => ({ ...p, week_number: undefined }));
              }}
              placeholder="e.g. 3"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-page)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)] focus:border-transparent transition"
            />
            {errors.week_number && (
              <p className="text-[var(--color-danger)] text-xs mt-1">
                {errors.week_number}
              </p>
            )}
          </div>

          {/* Publish toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Publish immediately
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Students can see this module once published
              </p>
            </div>
            <button
              onClick={() => setPublished((v) => !v)}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                published ? "bg-[var(--color-purple)]" : "bg-[var(--color-border)]"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  published ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Block editor */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              Content blocks
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
            </p>
          </div>
          {errors.blocks && (
            <p className="text-[var(--color-danger)] text-xs mb-3">{errors.blocks}</p>
          )}
          <BlockEditor2
            blocks={blocks}
            onChange={(updated) => {
              setBlocks(updated);
              if (errors.blocks && updated.length > 0)
                setErrors((p) => ({ ...p, blocks: undefined }));
            }}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-purple)] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition"
          >
            {submitting && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {submitting ? "Saving…" : published ? "Publish module" : "Save as draft"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-5 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-sm hover:border-[var(--color-purple)] transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </PageShell>
  );
}
