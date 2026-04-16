"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { getSchoolProfile, registerStudent } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/page-shell";
import { AuthInput } from "@/components/ui/auth-input";
import { RegisterStudentResponse } from "@/lib/api/api-types";

const LEVELS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];

export default function NewStudentPage() {
  const { accessToken, refreshToken } = useAuth();

  const [availableArms, setAvailableArms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    class_level: "",
    class_arm: "",
    parent_email: "",
    parent_phone: "",
  });

  const [created, setCreated] = useState<RegisterStudentResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getSchoolProfile(accessToken, refreshToken)
      .then((p) => setAvailableArms(p.available_arms ?? []))
      .catch(() => setAvailableArms([]))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!accessToken) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await registerStudent(
        {
          ...form,
          parent_phone: form.parent_phone,
        },
        accessToken,
        refreshToken
      );

      // EXPECTED BACKEND RESPONSE: { full_name, email, claim_code }
      setCreated(res);

      setForm({
        full_name: "",
        email: "",
        class_level: "",
        class_arm: "",
        parent_email: "",
        parent_phone: "",
      });
    } catch {
      setError("Failed to register student");
    } finally {
      setSubmitting(false);
    }
  }

  function downloadTXT() {
    if (!created) return;

    const content = `Name: ${created.full_name}\nEmail: ${created.email}\nCode: ${created.code}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${created.full_name}.txt`;
    a.click();
  }

  function downloadCSV() {
    if (!created) return;

    const content = `full_name,email,claim_code\n${created.full_name},${created.email},${created.code}`;

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `student.csv`;
    a.click();
  }

  return (
    <PageShell title="Register Student">
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : (
        <div className="max-w-md flex flex-col gap-6">

          {/* FORM */}
          <div className="border rounded-2xl p-6 flex flex-col gap-4">
            <AuthInput
              id="full-name"
              label="Full name"
              value={form.full_name}
              onChange={(e) => set("full_name", e)}
            />

            <AuthInput
              id="email"
              label="Email"
              value={form.email}
              onChange={(e) => set("email", e)}
            />

            <select
              value={form.class_level}
              onChange={(e) => set("class_level", e.target.value)}
            >
              <option value="">Select level</option>
              {LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>

            {availableArms.length > 0 && (
              <select
                value={form.class_arm}
                onChange={(e) => set("class_arm", e.target.value)}
              >
                <option value="">Select arm</option>
                {availableArms.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            )}

            <AuthInput
              id="parent-email"
              label="Parent email"
              value={form.parent_email}
              onChange={(e) => set("parent_email", e)}
            />

            <AuthInput
              id="parent-phone"
              label="Parent phone"
              value={form.parent_phone}
              onChange={(e) => set("parent_phone", e)}
            />

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-purple-600 text-white py-3 rounded-xl"
            >
              {submitting ? "Registering..." : "Register student"}
            </button>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          {/* RESULT */}
          {created && (
            <div className="border rounded-2xl p-6 flex flex-col gap-3">
              <p className="font-semibold">Student Created</p>
              <p>Name: {created.full_name}</p>
              <p>Email: {created.email}</p>
              <p className="font-mono">Code: {created.code}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={downloadTXT}
                  className="flex-1 border rounded p-2"
                >
                  Download TXT
                </button>

                <button
                  onClick={downloadCSV}
                  className="flex-1 border rounded p-2"
                >
                  Download CSV
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
