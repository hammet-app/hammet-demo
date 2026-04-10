"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getAdminModules, updateModule } from "@/lib/api/hammet";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import {
  BlockEditor2,
  blocksToContentJson,
  contentJsonToBlocks,
  type BlockEditorBlock,
} from "@/components/editor/block-editor";
import type { CurriculumModule } from "@/lib/api/api-types";

type FormErrors = {
  title?: string;
  week_number?: string;
  blocks?: string;
};

export default function EditModulePage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const params = useParams<{ moduleId: string }>();
  const moduleId = params.moduleId;

  const [module, setModule] = useState<CurriculumModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [weekNumber, setWeekNumber] = useState<string>("");
  const [published, setPublished] = useState(false);
  const [blocks, setBlocks] = useState<BlockEditorBlock[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getAdminModules(accessToken, refreshToken)
      .then((res) => {
        const found = res.modules.find((m) => m.id === moduleId);

        if (!found) {
          setLoadError("Module not found.");
          return;
        }

        setModule(found);
        setTitle(found.title);
        setWeekNumber(String(found.week_number));
        setPublished(found.published);
        setBlocks(contentJsonToBlocks(found.content_json.blocks));
      })
      .catch(() => setLoadError("Failed to load module."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken, moduleId]);

  function validate(): FormErrors {
    const errs: FormErrors = {};

    if (!title.trim()) errs.title = "Title is required.";

    const wn = Number(weekNumber);
    if (!weekNumber || isNaN(wn) || wn < 1 || !Number.isInteger(wn)) {
      errs.week_number = "Enter a valid week number (1 or above).";
    }

    if (blocks.length === 0) {
      errs.blocks = "Add at least one content block.";
    }

    return errs;
  }

  async function handleSubmit() {
    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (!accessToken || !module) return;

    setSubmitting(true);
    setServerError(null);

    try {
      await updateModule(
        moduleId,
        {
          title: title.trim(),
          term: module.term,
          week_number: Number(weekNumber),
          level: module.level,
          published,
          content_json: { blocks: blocksToContentJson(blocks) },
        },
        accessToken,
        refreshToken
      );

      router.push(
        `/hammet/modules/${module.level}/${module.term}`
      );
    } catch {
      setServerError("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const TERM_LABELS: Record<number, string> = {
    1: "First Term",
    2: "Second Term",
    3: "Third Term",
  };

  const subtitle = module
    ? `${module.level} — ${
        TERM_LABELS[module.term] ?? `Term ${module.term}`
      }`
    : undefined;

  const backHref = module
    ? `/hammet/modules/${module.level}/${module.term}`
    : "/hammet/modules";

  return (
    <PageShell title="Edit Module" description={subtitle} backHref={backHref}>
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : loadError ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {loadError}
        </div>
      ) : !module ? (
        <div className="text-sm text-[var(--color-text-secondary)]">
          Module not found.
        </div>
      ) : (
        <div className="max-w-2xl flex flex-col gap-6">
          {serverError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          {/* Metadata */}
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-xs uppercase tracking-wider">
              Module details
            </p>

            {/* Title */}
            <div>
              <label className="block text-sm mb-1.5">Title</label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title)
                    setErrors((p) => ({ ...p, title: undefined }));
                }}
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Week */}
            <div>
              <label className="block text-sm mb-1.5">
                Week number
              </label>
              <input
                type="number"
                min={1}
                value={weekNumber}
                onChange={(e) => {
                  setWeekNumber(e.target.value);
                  if (errors.week_number)
                    setErrors((p) => ({
                      ...p,
                      week_number: undefined,
                    }));
                }}
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />
              {errors.week_number && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.week_number}
                </p>
              )}
            </div>

            {/* Context */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl px-4 py-3 bg-[var(--color-bg-page)]">
                <p className="text-xs">Level</p>
                <p className="text-sm font-medium mt-0.5">
                  {module.level}
                </p>
              </div>

              <div className="rounded-xl px-4 py-3 bg-[var(--color-bg-page)]">
                <p className="text-xs">Term</p>
                <p className="text-sm font-medium mt-0.5">
                  {TERM_LABELS[module.term] ??
                    `Term ${module.term}`}
                </p>
              </div>
            </div>

            {/* Toggle */}
            <div className="flex justify-between items-center">
              <p className="text-sm">Published</p>
              <button
                onClick={() => setPublished((v) => !v)}
                className={`w-10 h-6 rounded-full ${
                  published ? "bg-[var(--color-purple)]" : "bg-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Editor */}
          <div>
            {errors.blocks && (
              <p className="text-xs text-red-600 mb-2">
                {errors.blocks}
              </p>
            )}
            <BlockEditor2
              blocks={blocks}
              onChange={(updated) => {
                setBlocks(updated);
                if (errors.blocks && updated.length > 0) {
                  setErrors((p) => ({ ...p, blocks: undefined }));
                }
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-[var(--color-purple)] text-white text-sm"
            >
              {submitting ? "Saving…" : "Save changes"}
            </button>

            <button
              onClick={() => router.back()}
              className="px-5 py-3 rounded-xl border text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}