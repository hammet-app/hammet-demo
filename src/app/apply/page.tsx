"use client";

import { useState, FormEvent } from "react";
import { ApiError, apiClient } from "@/lib/api/api-client";
import { fromApplyForm, Role } from "@/lib/api/types/apply";


interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: Role;
  location: string;
  portfolio: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  location?: string;
  portfolio?: string;
  form?: string;
}


function LogoMark() {
  return (
    <img
      src="/favicon.ico"
      alt="logo"
      className="w-8 h-8"
    />
  );
}


export default function CareersPage() {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
    location: "",
    portfolio: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim()) {
      e.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email address.";
    }
    if (!form.phoneNumber.trim()) {
      e.phoneNumber= "WhatsApp number is required.";
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(form.phoneNumber)) {
      e.phoneNumber = "Please enter a valid phone number.";
    }
    if (!form.role) e.role = "Please select a role.";
    if (!form.location.trim()) e.location = "Location is required.";
    if (!form.portfolio.trim()) {
      e.portfolio = "Portfolio link is required.";
    } else {
      try { new URL(form.portfolio); } catch {
        e.portfolio = "Please enter a valid URL (include https://).";
      }
    }
    return e;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try{
      const response = await apiClient.post(
              "/callback/apply",
              {...fromApplyForm(form)}
            );

      setSubmittedData(form)
      setForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        role: "",
        location: "",
        portfolio: "",
      })
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrors({ form: `You have applied before.` });
        } else {
          setErrors({ form: `${err.message}` });
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    
    <main
      className="min-h-screen"
      style={{
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
        background: "linear-gradient(135deg, #1a0533 0%, #3B0764 40%, #1e1050 70%, #0c2a4a 100%)",
      }}
    >
      {/* Floating orb decorations — matches homepage style */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* Large cyan orb top-right */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "340px", height: "340px", borderRadius: "50%",
          background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)",
          opacity: 0.18,
        }} />
        {/* Purple orb mid-left */}
        <div style={{
          position: "absolute", top: "35%", left: "-100px",
          width: "420px", height: "420px", borderRadius: "50%",
          background: "radial-gradient(circle, #5B21B6 0%, transparent 70%)",
          opacity: 0.25,
        }} />
        {/* Cyan orb bottom-right */}
        <div style={{
          position: "absolute", bottom: "5%", right: "5%",
          width: "280px", height: "280px", borderRadius: "50%",
          background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)",
          opacity: 0.12,
        }} />
        {/* Floating 3D-style geometric shapes — matches homepage */}
        <FloatingShape
          style={{ top: "12%", right: "8%", width: 64, height: 64, borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
            transform: "rotate(20deg)", opacity: 0.7 }}
        />
        <FloatingShape
          style={{ top: "28%", right: "18%", width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #06B6D4, #0e7490)",
            opacity: 0.6 }}
        />
        <FloatingShape
          style={{ bottom: "22%", right: "12%", width: 52, height: 52, borderRadius: 10,
            background: "linear-gradient(135deg, #6D28D9, #4C1D95)",
            transform: "rotate(-15deg)", opacity: 0.55 }}
        />
        <FloatingShape
          style={{ top: "60%", left: "3%", width: 40, height: 40,
            borderRadius: 8, background: "linear-gradient(135deg, #06B6D4, #5B21B6)",
            transform: "rotate(30deg)", opacity: 0.4 }}
        />
      </div>

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 40px",
        background: "rgba(59, 7, 100, 0.5)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="w-7 h-7 rounded-[7px] bg-cyan flex items-center justify-center">
            <LogoMark />
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>
            HammetLtd
          </span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 14, fontWeight: 500 }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Home</a>
          <a href="#apply" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Apply</a>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "56px 24px 80px", position: "relative" }}>

        {/* Hero section */}
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(6, 182, 212, 0.15)", border: "1px solid rgba(6, 182, 212, 0.3)",
            borderRadius: 99, padding: "6px 16px", marginBottom: 24,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#06B6D4",
              boxShadow: "0 0 8px #06B6D4",
              display: "inline-block",
            }} />
            <span style={{ color: "#06B6D4", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em" }}>
              SIWES Internships · NOW OPEN
            </span>
          </div>

          <h1 style={{
            fontSize: 52, fontWeight: 800, color: "white", lineHeight: 1.1,
            letterSpacing: "-0.03em", margin: "0 0 16px",
          }}>
            Join the{" "}
            <span style={{
              background: "linear-gradient(90deg, #A78BFA, #06B6D4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              HammetLtd
            </span>{" "}
            Team
          </h1>

          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
            In-person roles for SIWES Interns open to working in Ibadan.
            Creative, hardworking, and excited about what we&apos;re building? Apply below.
          </p>
        </div>

        {/* Open roles cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          <RoleCard emoji="🎬" title="Video Editor" spots={1} />
          <RoleCard emoji="📱" title="Social Media Manager" spots={1} />
          <RoleCard emoji="🎬" title="Research Writer" spots={1} />
          <RoleCard emoji="🎬" title="Graphic Designer" spots={1} />
          <RoleCard emoji="🎬" title="Front end Developer" spots={1} />
          <RoleCard emoji="🎬" title="Backend Developer" spots={1} />
        </div>

        {/* Requirements strip */}
        <div style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16, padding: "20px 24px", marginBottom: 40,
        }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            To apply you&apos;ll need
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Your name, email, and WhatsApp number",
              "Your location — you must be open to working in Ibadan",
              "A portfolio link — this is the most important thing",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                <span style={{ marginTop: 5, width: 6, height: 6, borderRadius: "50%", background: "#06B6D4", flexShrink: 0, display: "inline-block" }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        {submitted ? (
          <SuccessCard name={submittedData?.fullName || ""} role={submittedData?.role || ""} />
        ) : (
          <div id="apply" style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 24, padding: "40px 40px",
          }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>
                Ready? Fill in the form below.
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, margin: 0 }}>
                Make sure your portfolio link works before you submit. That is the first thing we look at.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Field label="Full Name" name="fullName" type="text" placeholder="John Doe"
                value={form.fullName} error={errors.fullName} onChange={handleChange} autoComplete="name" />
              <Field label="Email Address" name="email" type="email" placeholder="abc@example.com"
                value={form.email} error={errors.email} onChange={handleChange} autoComplete="email" />
              <Field label="WhatsApp Number" name="phoneNumber" type="tel" placeholder="+234 801 234 5678"
                value={form.phoneNumber} error={errors.phoneNumber} onChange={handleChange} autoComplete="tel" />

              {/* Role dropdown */}
              <div>
                <label style={{ display: "block", color: "rgba(255,255,255,0.85)", fontSize: 13,
                  fontWeight: 600, marginBottom: 6 }}>
                  Role Applying For
                </label>
                <select
                  name="role" value={form.role} onChange={handleChange}
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 12,
                    background: "rgba(255,255,255,0.08)",
                    border: errors.role ? "1.5px solid #F87171" : "1px solid rgba(255,255,255,0.15)",
                    color: form.role ? "white" : "rgba(255,255,255,0.4)",
                    fontSize: 14, outline: "none", cursor: "pointer",
                    appearance: "none" as const,
                  }}
                >
                  <option value="" disabled style={{ background: "#2d0a55" }}>Select a role…</option>
                  <option value="Video Editor" style={{ background: "#2d0a55", color: "white" }}>Video Editor</option>
                  <option value="Social Media Manager" style={{ background: "#2d0a55", color: "white" }}>Social Media Manager</option>
                  <option value="Research Writer" style={{ background: "#2d0a55", color: "white" }}>Research Writer</option>
                  <option value="Graphic Designer" style={{ background: "#2d0a55", color: "white" }}>Graphic Designer</option>
                  <option value="Frontend Developer" style={{ background: "#2d0a55", color: "white" }}>Frontend Developer</option>
                  <option value="Backend Developer" style={{ background: "#2d0a55", color: "white" }}>Backend Developer</option>
                </select>
                {errors.role && <p style={{ color: "#F87171", fontSize: 12, marginTop: 4 }}>{errors.role}</p>}
              </div>

              <Field label="Location" name="location" type="text" placeholder="Ibadan, Oyo State"
                value={form.location} error={errors.location} onChange={handleChange}
                note="This role is in-person in Ibadan." />
              <Field label="Portfolio Link" name="portfolio" type="url" placeholder="https://drive.google.com/…"
                value={form.portfolio} error={errors.portfolio} onChange={handleChange}
                note="Paste a link to your portfolio, Google Drive folder, or any work samples. This is the most important part of your application."
                isImportant />

              {errors.form && (
                <div
                  style={{
                    color: "#F87171",
                    fontSize: 14,
                    marginBottom: 12,
                  }}
                >
                  {errors.form}
                </div>
              )}

              <button
                type="submit" disabled={submitting}
                style={{
                  marginTop: 8, padding: "14px 24px", borderRadius: 14,
                  background: submitting ? "rgba(91,33,182,0.5)" : "linear-gradient(135deg, #3B0764, #5B21B6)",
                  border: "none", color: "white", fontSize: 15, fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 24px rgba(91,33,182,0.4)",
                  transition: "all 0.2s",
                  letterSpacing: "-0.01em",
                }}
              >
                {submitting ? (
                  <>
                    <svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Submitting…
                  </>
                ) : "Submit Application →"}
              </button>
            </form>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}
      </div>
    </main>
  );
}

function FloatingShape({ style }: { style: React.CSSProperties }) {
  return <div style={{ position: "absolute", ...style }} />;
}

function RoleCard({ emoji, title, spots }: { emoji: string; title: string; spots: number }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 16, padding: "20px 20px",
      backdropFilter: "blur(10px)",
    }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{emoji}</div>
      <p style={{ color: "white", fontWeight: 700, fontSize: 15, margin: "0 0 6px" }}>{title}</p>
      <span style={{
        display: "inline-block",
        background: "rgba(6, 182, 212, 0.15)",
        border: "1px solid rgba(6, 182, 212, 0.3)",
        color: "#67E8F9", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 600,
      }}>
        {spots} {spots === 1 ? "position" : "positions"}
      </span>
    </div>
  );
}

function SuccessCard({ name, role }: { name: string; role: Role }) {
  return (
    <div style={{
      background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.3)",
      borderRadius: 24, padding: "48px 40px", textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "rgba(6, 182, 212, 0.2)", margin: "0 auto 16px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#06B6D4" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 style={{ color: "white", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Application received!</h2>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.6 }}>
        Thanks, {name.split(" ")[0]}. We&apos;ve got your application for{" "}
        <span style={{ color: "white", fontWeight: 600 }}>
          {role}
        </span>
        . We&apos;ll review your portfolio and reach out via WhatsApp if you&apos;re shortlisted.
      </p>
    </div>
  );
}

function Field({
  label, name, type, placeholder, value, error, onChange, note, isImportant, autoComplete,
}: {
  label: string; name: string; type: string; placeholder?: string; value: string;
  error?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  note?: string; isImportant?: boolean; autoComplete?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", color: "rgba(255,255,255,0.85)", fontSize: 13,
        fontWeight: 600, marginBottom: 6 }}>
        {label}
      </label>
      <input
        id={name} name={name} type={type} placeholder={placeholder}
        value={value} onChange={onChange} autoComplete={autoComplete}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 12, boxSizing: "border-box",
          background: "rgba(255,255,255,0.08)",
          border: error ? "1.5px solid #F87171" : "1px solid rgba(255,255,255,0.15)",
          color: "white", fontSize: 14, outline: "none",
        }}
      />
      {note && !error && (
        <p style={{ fontSize: 12, marginTop: 5,
          color: isImportant ? "#67E8F9" : "rgba(255,255,255,0.35)",
          fontWeight: isImportant ? 500 : 400 }}>
          {isImportant && "★ "}{note}
        </p>
      )}
      {error && <p style={{ color: "#F87171", fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}