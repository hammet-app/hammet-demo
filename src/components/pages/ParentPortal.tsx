"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/api-client";
import { useSearchParams } from "next/navigation";
import { ParentShell } from "@/components/ui/parent-shell";
import { PerformanceChart } from "@/components/cards/performance-chart";
import type {
  ParentPortal,
} from "@/lib/api/types";
import { parentApi } from "@/lib/api/parent";
// ---------------------------------------------------------------------------
// Stage types
// ---------------------------------------------------------------------------

type Stage =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "challenge"; studentName: string; question: string }
  | { type: "submitting" }
  | { type: "wrong_answer"; studentName: string; question: string; error: string }
  | {
      type: "portal";
      availableLevels: string[];
      currentTerm: number;
      currentLevel: string;
      data: ParentPortal | null;
      selectedTerms: number[];
      selectedLevels: string[];
      portalLoading: boolean;
    };

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
      <div className="w-8 h-8 rounded-full border-2 border-purple-mid border-t-transparent animate-spin" />
      <p className="text-[13px] text-text-muted">Verifying link…</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 gap-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: "#FEF3C7" }}
      >
        <span className="text-xl">⏱</span>
      </div>
      <div>
        <h2
          className="text-[18px] font-bold text-text-primary mb-1"
          style={{ fontFamily: "var(--font-head)" }}
        >
          Link unavailable
        </h2>
        <p className="text-[13px] text-text-secondary leading-relaxed max-w-[300px]">
          {message}
        </p>
      </div>
      <p className="text-[12px] text-text-muted mt-2">
        Please contact your child&apos;s school admin for a new link.
      </p>
    </div>
  );
}

function ChallengeForm({
  studentName,
  question,
  error,
  isSubmitting,
  onSubmit,
}: {
  studentName: string;
  question: string;
  error?: string;
  isSubmitting: boolean;
  onSubmit: (answer: string) => void;
}) {
  const [answer, setAnswer] = useState("");

  return (
    <div className="flex-1 flex flex-col justify-center py-10 gap-6">
      <div>
        <p className="text-[12px] font-medium text-cyan uppercase tracking-widest mb-2">
          Parent Portal
        </p>
        <h1
          className="text-[24px] font-bold text-text-primary leading-snug"
          style={{ fontFamily: "var(--font-head)" }}
        >
          {studentName}&apos;s Progress
        </h1>
        <p className="mt-2 text-[13px] text-text-secondary leading-relaxed">
          To protect your child&apos;s information, please answer the security
          question below.
        </p>
      </div>

      <div className="bg-bg-card border border-border rounded-[14px] p-6 flex flex-col gap-4">
        <p className="text-[13px] font-medium text-text-primary">{question}</p>

        <input
          type="tel"
          inputMode="numeric"
          maxLength={4}
          placeholder="Enter 4 digits"
          value={answer}
          onChange={(e) =>
            setAnswer(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && answer.length === 4 && !isSubmitting) {
              onSubmit(answer);
            }
          }}
          className="w-full h-11 rounded-[8px] border border-border bg-bg-page px-4 text-[15px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-cyan/40 focus:border-cyan transition-all tracking-[0.25em] font-mono"
        />

        {error && (
          <p className="text-[12px] text-danger flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
            {error}
          </p>
        )}

        <button
          onClick={() => onSubmit(answer)}
          disabled={answer.length !== 4 || isSubmitting}
          className="w-full h-11 rounded-[8px] bg-purple-dark text-white text-[14px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
          style={{ fontFamily: "var(--font-head)" }}
        >
          {isSubmitting ? "Verifying…" : "View Progress"}
        </button>
      </div>
    </div>
  );
}

function ChipGroup<T extends string | number>({
  label,
  options,
  selected,
  onToggle,
  format,
}: {
  label: string;
  options: T[];
  selected: T[];
  onToggle: (val: T) => void;
  format?: (val: T) => string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-medium text-text-muted uppercase tracking-widest">
        {label}
      </p>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={String(opt)}
              onClick={() => onToggle(opt)}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all"
              style={{
                background: active ? "#3B0764" : "var(--color-bg-card)",
                color: active ? "#fff" : "var(--color-text-secondary)",
                borderColor: active ? "#3B0764" : "var(--color-border)",
              }}
            >
              {format ? format(opt) : String(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number | string;
  total?: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-bg-card border border-border rounded-full px-4 py-2">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span className="text-[12px] text-text-muted">{label}</span>
      <span className="text-[13px] font-semibold text-text-primary">
        {typeof value === "number" && total !== undefined
          ? `${value}/${total}`
          : value}
      </span>
    </div>
  );
}

function PortalView({
  data,
  availableLevels,
  selectedTerms,
  selectedLevels,
  portalLoading,
  onToggleTerm,
  onToggleLevel,
}: {
  data: ParentPortal | null;
  availableLevels: string[];
  selectedTerms: number[];
  selectedLevels: string[];
  portalLoading: boolean;
  onToggleTerm: (t: number) => void;
  onToggleLevel: (l: string) => void;
}) {
  const isSingleSelection =
    selectedTerms.length === 1 && selectedLevels.length === 1;
  const tp = isSingleSelection ? (data?.termProgress ?? null) : null;

  const classLabel = data
    ? data.classArm
      ? `${data.classLevel} ${data.classArm}`
      : data.classLevel
    : null;

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Student header */}
      {data && (
        <div>
          <p className="text-[12px] font-medium text-cyan uppercase tracking-widest mb-1">
            {data.schoolName}
          </p>
          <h1
            className="text-[24px] font-bold text-text-primary"
            style={{ fontFamily: "var(--font-head)" }}
          >
            {data.studentName}
          </h1>
          {classLabel && (
            <p className="text-[13px] text-text-secondary mt-0.5">
              {classLabel}
            </p>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <ChipGroup
          label="Term"
          options={[1, 2, 3]}
          selected={selectedTerms}
          onToggle={onToggleTerm}
          format={(t) => `Term ${t}`}
        />
        <ChipGroup
          label="Level"
          options={availableLevels}
          selected={selectedLevels}
          onToggle={onToggleLevel}
        />
      </div>

      {/* Progress pills — single term + level only */}
      {tp && (
        <div className="flex gap-3 flex-wrap">
          <StatPill
            label="Completed"
            value={tp.approvedModules}
            total={tp.totalModules}
            color="#10B981"
          />
          <StatPill
            label="Submitted"
            value={tp.submittedModules}
            total={tp.totalModules}
            color="#7C3AED"
          />
          <StatPill
            label="Progress"
            value={`${Math.round(tp.completionPercentage * 100)}%`}
            color="#06B6D4"
          />
        </div>
      )}

      {/* Performance chart */}
      <div className="bg-bg-card border border-border rounded-[14px] p-5">
        <p
          className="text-[13px] font-semibold text-text-primary mb-4"
          style={{ fontFamily: "var(--font-head)" }}
        >
          Performance Trend
        </p>

        {portalLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-purple-mid border-t-transparent animate-spin" />
          </div>
        ) : data?.performance?.length ? (
          <PerformanceChart data={data.performance} />
        ) : (
          <p className="text-[13px] text-text-muted text-center py-8">
            No performance data for the selected period.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ParentPortalPage() {
  const params = useSearchParams();
  const linkToken = params.get("token");

  const [stage, setStage] = useState<Stage>({ type: "loading" });

  // Step 1 — validate link token, get challenge
  useEffect(() => {

    if (!linkToken) {
      return;
    }

    parentApi
      .getChallenge(linkToken)
      .then((data) => {
        setStage({
          type: "challenge",
          studentName: data.studentName,
          question: data.question,
        });
      })
      .catch(() => {
        setStage({
          type: "error",
          message:
            "This link has expired or is no longer valid. Links are active for 48 hours.",
        });
      });
  }, [linkToken]);

  // Step 2 — submit answer → available levels + defaults → initial portal fetch
  async function handleAnswer(answer: string) {
    if (!linkToken) return;
    const currentStage = stage;
    if (
      currentStage.type !== "challenge" &&
      currentStage.type !== "wrong_answer"
    )
      return;

    const { studentName, question } = currentStage;
    setStage({ type: "submitting" });

    try {
      const verified = await parentApi.postVerify(linkToken, { answer });
      const {
        availableLevels: availableLevels,
        currentTerm: currentTerm,
        currentLevel: currentLevel,
      } = verified;

      const defaultTerms = [currentTerm];
      const defaultLevels = [currentLevel];

      const portal = await parentApi.getPortal(linkToken, {
        term: defaultTerms,
        level: defaultLevels,
      });

      setStage({
        type: "portal",
        availableLevels,
        currentTerm,
        currentLevel,
        data: portal,
        selectedTerms: defaultTerms,
        selectedLevels: defaultLevels,
        portalLoading: false,
      });
    } catch (err: unknown) {
      if (
        err instanceof ApiError &&
        (err.status === 422 || err.status === 400)
      ) {
        setStage({
          type: "wrong_answer",
          studentName,
          question,
          error: "Incorrect phone number. Please contact your school admin.",
        });
      } else {
        setStage({
          type: "error",
          message: "Something went wrong. Please try again later.",
        });
      }
    }
  }

  function toggleTerm(term: number) {
    if (stage.type !== "portal") return;
    const next = stage.selectedTerms.includes(term)
      ? stage.selectedTerms.filter((t) => t !== term)
      : [...stage.selectedTerms, term];
    if (next.length === 0) return;
    refetchPortal(stage, next, stage.selectedLevels);
  }

  function toggleLevel(level: string) {
    if (stage.type !== "portal") return;
    const next = stage.selectedLevels.includes(level)
      ? stage.selectedLevels.filter((l) => l !== level)
      : [...stage.selectedLevels, level];
    if (next.length === 0) return;
    refetchPortal(stage, stage.selectedTerms, next);
  }

  async function refetchPortal(
    portalStage: Extract<Stage, { type: "portal" }>,
    terms: number[],
    levels: string[]
  ) {
    setStage({
      ...portalStage,
      selectedTerms: terms,
      selectedLevels: levels,
      portalLoading: true,
    });
    if (!linkToken) return;
    try {
      const portal = await parentApi.getPortal(linkToken, {
        term: terms,
        level: levels,
      });
      setStage((prev) => {
        if (prev.type !== "portal") return prev;
        return { ...prev, data: portal, portalLoading: false };
      });
    } catch {
      // Stale data stays visible, just clear the loading spinner
      setStage((prev) => {
        if (prev.type !== "portal") return prev;
        return { ...prev, portalLoading: false };
      });
    }
  }

  return (
    <ParentShell>
      {stage.type === "loading" && <LoadingState />}

      {stage.type === "error" && <ErrorState message={stage.message} />}

      {(stage.type === "challenge" ||
        stage.type === "wrong_answer" ||
        stage.type === "submitting") && (
        <ChallengeForm
          studentName={stage.type === "submitting" ? "" : stage.studentName}
          question={stage.type === "submitting" ? "" : stage.question}
          error={stage.type === "wrong_answer" ? stage.error : undefined}
          isSubmitting={stage.type === "submitting"}
          onSubmit={handleAnswer}
        />
      )}

      {stage.type === "portal" && (
        <PortalView
          data={stage.data}
          availableLevels={stage.availableLevels}
          selectedTerms={stage.selectedTerms}
          selectedLevels={stage.selectedLevels}
          portalLoading={stage.portalLoading}
          onToggleTerm={toggleTerm}
          onToggleLevel={toggleLevel}
        />
      )}
    </ParentShell>
  );
}