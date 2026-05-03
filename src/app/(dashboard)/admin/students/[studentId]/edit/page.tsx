"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { UserUpdateRequest, UserUpdateResponse } from "@/lib/api/api-types";
import { updateStudent } from "@/lib/api/admin";

export default function UpdateStudentPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const params = useParams();

  const studentId = params.studentId as string;

  const [email, setEmail] = useState("");
  const [class_level, setClassLevel] = useState("");
  const [class_arm, setClassArm] = useState("");
  const [parent_phone, setParentPhone] = useState("");
  const [parent_email, setParentEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!accessToken || studentId) return;

    setIsSubmitting(true);
    setError(null);

    try {
        await updateStudent(studentId, 
            {email, class_level, class_arm, parent_email, parent_phone} satisfies UserUpdateRequest,
            accessToken,
            refreshToken
        )

      router.push("/admin/students");
    } catch (err) {
      setError(`Failed to update student. ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell
      title="Update Student"
      description="Edit student details"
      actions={
        <button
          onClick={() => router.push("/admin/students")}
          className="px-4 py-2 text-sm border rounded-xl"
        >
          Back
        </button>
      }
    >
      <div className="max-w-xl flex flex-col gap-4">

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 rounded-xl border"
            placeholder="Enter email"
          />
        </div>

        {/* Class Level */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Class Level</label>
          <input
            value={class_level}
            onChange={(e) => setClassLevel(e.target.value)}
            className="px-4 py-2 rounded-xl border"
            placeholder="SS1, SS2..."
          />
        </div>

        {/* Class Arm */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Class Arm</label>
          <input
            value={class_arm}
            onChange={(e) => setClassArm(e.target.value)}
            className="px-4 py-2 rounded-xl border"
            placeholder="A, B..."
          />
        </div>

        {/* Parent Email */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Full Name</label>
          <input
            value={parent_email}
            onChange={(e) => setParentEmail(e.target.value)}
            className="px-4 py-2 rounded-xl border"
            placeholder="Enter full name"
          />
        </div>

        {/* Parent Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Full Name</label>
          <input
            value={parent_phone}
            onChange={(e) => setParentPhone(e.target.value)}
            className="px-4 py-2 rounded-xl border"
            placeholder="Enter full name"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-2 px-4 py-2 rounded-xl bg-[var(--color-purple)] text-white text-sm disabled:opacity-50"
        >
          {isSubmitting ? "Updating…" : "Update student"}
        </button>
      </div>
    </PageShell>
  );
}