"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { getSchoolProfile, registerTeacher } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { AuthInput } from "@/components/ui/auth-input";
import { FieldError } from "@/components/ui/auth-shell";

const LEVELS = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];

type ClassRow = { level: string; arm: string };
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
    "flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-page)] px-3 py-2.5 text-sm";

  return (
    <div className="flex items-center gap-2">
      <span className="w-5 text-xs text-center shrink-0">
        {index + 1}
      </span>

      {/* Level */}
      <select
        value={row.level}
        onChange={(e) => onChange({ ...row, level: e.target.value })}
        className={selectClass}
      >
        <option value="">Level</option>
        {LEVELS.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      {/* Arm */}
      {availableArms.length > 0 && (
        <select
          value={row.arm}
          onChange={(e) => onChange({ ...row, arm: e.target.value })}
          className={selectClass}
        >
          <option value="">Arm</option>
          {availableArms.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      )}

      {/* Remove */}
      <button
        onClick={onRemove}
        disabled={!canRemove}
        className="p-1.5 disabled:opacity-25"
      >
        ✕
      </button>
    </div>
  );
}

export default function NewTeacherPage() {
  const { accessToken, refreshToken } = useAuth();

  const [availableArms, setAvailableArms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<string[]>(["teacher"]);
  const [classes, setClasses] = useState<(ClassRow & { _id: string })[]>([
    { _id: uid(), level: "", arm: "" },
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
        setClasses([{ _id: uid(), level: "", arm: "" }]);
      })
      .catch(() => setAvailableArms([]))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  function updateClass(index: number, updated: ClassRow) {
    setClasses((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...updated } : c))
    );
    if (errors.classes) {
      setErrors((p) => ({ ...p, classes: undefined }));
    }
  }

  function addClass() {
    setClasses((prev) => [...prev, { _id: uid(), level: "", arm: "" }]);
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
      errs.email = "Enter a valid email.";
    }

    const hasIncomplete = classes.some(
      (c) => !c.level || (availableArms.length > 0 && !c.arm)
    );

    if (hasIncomplete) {
      errs.classes = "Complete all class fields or remove incomplete rows.";
    }

    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (!accessToken) return;

    const classLevels = classes.map((c) => c.level);
    const classArms =
      availableArms.length > 0
        ? classes.map((c) => c.arm)
        : null;

    setSubmitting(true);
    setServerError(null);

    try {
      await registerTeacher({
        full_name: fullName.trim(),
        email: email.trim(),
        roles,
        class_level: classLevels,
        class_arm: classArms,
      },
      accessToken,
      refreshToken
    );
      

      setSuccess(fullName.trim());
      setFullName("");
      setEmail("");
      setClasses([{ _id: uid(), level: "", arm: "" }]);
      setErrors({});
    } catch {
      setServerError("Failed to register teacher.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      title="Register Teacher"
      description="An invite link will be emailed."
      backHref="/admin/teachers"
    >
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : (
        <div className="max-w-md flex flex-col gap-6">
          {success && <div>{success} registered.</div>}
          {serverError && <div>{serverError}</div>}

          <div className="p-6 border rounded-2xl flex flex-col gap-5">
            <AuthInput
              id="full-name"
              label="Full name"
              value={fullName}
              onChange={setFullName}
            />
            <FieldError message={errors.full_name} />

            <AuthInput
              id="email"
              label="Email"
              value={email}
              onChange={setEmail}
            />
            <FieldError message={errors.email} />
          </div>

          <button
            onClick={() => {
              setRoles((prev) =>
                prev.includes("school_admin")
                  ? prev.filter((r) => r !== "school_admin")
                  : [...prev, "school_admin"]
              );
            }}
            className="text-sm"
          >
            {roles.includes("school_admin") ? "✓ Admin" : "Make admin"}
          </button>

          <div className="p-6 border rounded-2xl flex flex-col gap-4">
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
            className="w-full bg-purple-600 text-white py-3 rounded-xl"
          >
            {submitting ? "Registering…" : "Register teacher"}
          </button>
        </div>
      )}
    </PageShell>
  );
}