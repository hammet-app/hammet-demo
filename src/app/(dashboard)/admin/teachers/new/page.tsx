"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getSchoolProfile, registerTeacher } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { AuthInput } from "@/components/ui/auth-input";
import { FieldError } from "@/components/ui/auth-shell";
import type { AssignedClass } from "@/lib/api/api-types";

const LEVELS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];

type ClassRow = { level: string; arm: string; term: string };
type FormErrors = {
  full_name?: string;
  email?: string;
  classes?: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

function ClassAssignmentRow({
  row,
  index,
  availableArms,
  onChange,
  onRemove,
  canRemove,
}: {
  row: ClassRow & { _id: string };
  index: number;
  availableArms: string[];
  onChange: (updated: ClassRow) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const selectClass =
    "flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-page)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)] focus:border-transparent transition appearance-none";

  return (
    <div className="flex items-center gap-2">
      <span className="w-5 text-xs text-[var(--color-text-muted)] text-center shrink-0">
        {index + 1}
      </span>

      {/* Level */}
      <select
        value={row.level}
        onChange={(e) => onChange({ ...row, level: e.target.value })}
        className={selectClass}
      >
        <option value="">Level</option>
        {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>

      {/* Arm — only if school has arms */}
      {availableArms.length > 0 && (
        <select
          value={row.arm}
          onChange={(e) => onChange({ ...row, arm: e.target.value })}
          className={selectClass}
        >
          <option value="">Arm</option>
          {availableArms.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      )}

      {/* Term */}
      <select
        value={row.term}
        onChange={(e) => onChange({ ...row, term: e.target.value })}
        className={selectClass}
      >
        <option value="">Term</option>
        {[1, 2, 3].map((t) => <option key={t} value={String(t)}>Term {t}</option>)}
      </select>

      {/* Remove */}
      <button
        onClick={onRemove}
        disabled={!canRemove}
        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 disabled:opacity-25 disabled:cursor-not-allowed transition-colors shrink-0"
        aria-label="Remove class"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function NewTeacherPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();

  const [availableArms, setAvailableArms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTerm, setCurrentTerm] = useState<number>(1);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [classes, setClasses] = useState<(ClassRow & { _id: string })[]>([
    { _id: uid(), level: "", arm: "", term: "" },
  ]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getSchoolProfile(accessToken, refreshToken)
      .then((p) => {
        setAvailableArms(p.available_arms ?? []);
        setCurrentTerm(p.term);
        setClasses([
          { _id: uid(), level: "", arm: "", term: String(p.term) },
        ]);
      })
      .catch(() => setAvailableArms([]))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  function updateClass(index: number, updated: ClassRow) {
    setClasses((prev) => prev.map((c, i) => (i === index ? { ...c, ...updated } : c)));
    if (errors.classes) setErrors((p) => ({ ...p, classes: undefined }));
  }

  function addClass() {
    setClasses((prev) => [
      ...prev,
      { _id: uid(), level: "", arm: "", term: String(currentTerm) },
    ]);
  }

  function removeClass(index: number) {
    setClasses((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!fullName.trim()) errs.full_name = "Full name is required.";
    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Enter a valid email address.";
    }
    // Validate all class rows are complete
    const hasIncomplete = classes.some(
      (c) => !c.level || !c.term || (availableArms.length > 0 && !c.arm)
    );
    if (hasIncomplete)
      errs.classes = "Complete all class fields or remove incomplete rows.";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!accessToken) return;

    const assignedClasses: AssignedClass[] = classes.map((c) => ({
      level: c.level,
      arm: availableArms.length > 0 ? c.arm || null : null,
      term: Number(c.term),
    }));

    setSubmitting(true);
    setServerError(null);
    try {
      await registerTeacher(
        {
          full_name: fullName.trim(),
          email: email.trim(),
          roles: isAdmin ? ["teacher", "school_admin"] : ["teacher"],
          assigned_classes: assignedClasses,
        },
        accessToken,
        refreshToken
      );
      setSuccess(fullName.trim());
      setFullName("");
      setEmail("");
      setIsAdmin(false);
      setClasses([{ _id: uid(), level: "", arm: "", term: String(currentTerm) }]);
      setErrors({});
    } catch {
      setServerError("Failed to register teacher. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      title="Register Teacher"
      description="An invite link will be emailed to the teacher."
      backHref="/admin/teachers"
    >
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : (
        <div className="max-w-md flex flex-col gap-6">
          {success && (
            <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
              {success} registered. Invite email sent.
            </div>
          )}

          {serverError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          {/* Teacher details */}
          <div className="bg-[var(--color-bg-card)] border rounded-2xl p-6 flex flex-col gap-5">
            <AuthInput
              id="full-name"
              label="Full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e);
                if (errors.full_name)
                  setErrors((p) => ({ ...p, full_name: undefined }));
              }}
            />
            <FieldError message={errors.full_name} />

            <AuthInput
              id="email"
              label="Email"
              value={email}
              onChange={(e) => {
                setEmail(e);
                if (errors.email)
                  setErrors((p) => ({ ...p, email: undefined }));
              }}
            />
            <FieldError message={errors.email} />

            {/* Admin toggle */}
            <button
              onClick={() => setIsAdmin((v) => !v)}
              className="text-sm"
            >
              {isAdmin ? "✓ Admin" : "Make admin"}
            </button>
          </div>

          {/* Classes */}
          <div className="bg-[var(--color-bg-card)] border rounded-2xl p-6 flex flex-col gap-4">
            {errors.classes && (
              <p className="text-xs text-red-600">{errors.classes}</p>
            )}

            {classes.map((cls, i) => (
              <ClassAssignmentRow
                key={cls._id}
                row={cls}
                index={i}
                availableArms={availableArms}
                onChange={(updated) => updateClass(i, updated)}
                onRemove={() => removeClass(i)}
                canRemove={classes.length > 1}
              />
            ))}

            <button onClick={addClass} className="text-sm text-purple-600">
              + Add class
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[var(--color-purple)] text-white py-3 rounded-xl"
          >
            {submitting ? "Registering…" : "Register teacher"}
          </button>
        </div>
      )}
    </PageShell>
  );
}