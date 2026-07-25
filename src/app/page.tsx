"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { sendCallback } from "@/lib/api/support";
import Link from "next/link";
import Image from "next/image";

import { Hero, CTAPair, ProblemStatement, SectionLabel, WhatWeDeliver } from "@/components/layout/home";


// ─── Shared primitives ────────────────────────────────────────────────────────



// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "For Schools", href: "#callback" },
    { label: "Contact", href: "#footer" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/favicon.ico"
            alt="HammetLtd"
            width={140}
            height={36}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-600 hover:text-[#3B0764] transition-colors font-medium"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#3B0764] hover:text-[#5B21B6] transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="#callback"
            className="text-sm font-semibold bg-[#3B0764] text-white px-5 py-2.5 rounded-full hover:bg-[#5B21B6] transition-colors"
          >
            Request a Callback
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-gray-600"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-gray-700 font-medium"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link href="/login" className="text-sm font-semibold text-[#3B0764] py-2">
              Log in
            </Link>
            <Link
              href="#callback"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold bg-[#3B0764] text-white px-5 py-2.5 rounded-full text-center"
            >
              Request a Callback
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Pilot Phase",
      body: "30 students from your school test the product for one term. You check progress and knowledge gained — and once satisfied, you can integrate to all classes (JSS1–SS3).",
    },
    {
      num: "02",
      title: "School Onboarding (JSS1–SS3)",
      body: "We will brief your designated staff on how to use the software and assign all admin access. The entire process takes less than 2 hours.",
    },
    {
      num: "03",
      title: "Admin Registers Your School",
      body: "School Admin assigns registers individual students into the software database.",
    },
    {
      num: "04",
      title: "Term-by-Term Delivery",
      body: "Structured lessons are delivered each term. In JSS1–2, students build foundational AI literacy. By SS2–3, they are applying AI tools to real academic and creative work.",
    },
    {
      num: "05",
      title: "You See Everything",
      body: "The school admin dashboard gives you and your leadership real-time visibility — class progress, student completion, Digital Passport advancement, per term.",
    },
    {
      num: "06",
      title: "Students Receive Their Digital Passports",
      body: "Each student is assigned a grade-appropriate Digital Passport at the end of every school year. Progress is tracked, visible, and cumulative across their years in your school. This Passport auto-updates as personalised to each individual student.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-[#F5F3FF] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionLabel>How It Works</SectionLabel>
        <h2
          className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-5xl font-bold text-[#1E1B4B] mb-16 max-w-xl leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          From signup to classroom in under a week.
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="bg-white rounded-2xl p-7 border border-[#E5E7EB] hover:border-[#5B21B6] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="font-[family-name:var(--font-jakarta)] text-4xl font-bold text-[#EDE9FE] group-hover:text-[#5B21B6] transition-colors duration-300 leading-none">
                  {step.num}
                </span>
                {i === steps.length - 1 && (
                  <span className="text-xs font-bold tracking-widest uppercase text-[#06B6D4] bg-cyan-50 px-2 py-1 rounded-md">
                    Ongoing
                  </span>
                )}
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-base font-bold text-[#1E1B4B] mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 5 — Features ─────────────────────────────────────────────────────

function Features() {
  const features = [
    {
      title: "Spiral Curriculum Architecture",
      body: "Content is layered deliberately from JSS1 through SS3. Each year builds on the last. By graduation, students have a documented six-year AI education history.",
    },
    {
      title: "Digital Passport",
      body: "A gamified, verifiable competency record. Students unlock higher-tier AI tools as they advance — creating a school-wide culture of progression.",
    },
    {
      title: "Admin Dashboard",
      body: "School leadership gets full visibility into programme performance — by class, by student, by term.",
    },
    {
      title: "Dedicated School Support",
      body: "A Hammet Ltd contact is assigned to your school. Setup, troubleshooting, and content updates are handled on our end.",
    },
  ];

  return (
    <section id="features" className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionLabel>Features</SectionLabel>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <h2
            className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-5xl font-bold text-[#1E1B4B] max-w-xl leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Everything a school needs to run AI education properly.
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-[#E5E7EB]">
          {features.map((f, i) => (
            <div key={f.title} className="py-8 flex flex-col md:flex-row md:items-start gap-6 group">
              <span className="font-[family-name:var(--font-jakarta)] text-5xl font-bold text-[#F5F3FF] group-hover:text-[#EDE9FE] transition-colors shrink-0 w-16 leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#1E1B4B] mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 6 — Callback Form ────────────────────────────────────────────────

type FormData = {
  schoolName: string;
  fullName: string;
  email: string,
  role: string;
  phone: string;
  city: string;
};

function CallbackForm() {
  const [form, setForm] = useState<FormData>({
    schoolName: "",
    fullName: "",
    email: "",
    role: "",
    phone: "",
    city: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set(key: keyof FormData, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const success = await sendCallback(form);

      if (success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const trustPoints = [
    "30-student pilot — no commitment required",
    "Onboarding completed in under 2 hours",
    "No AI expertise needed from your staff",
    "Dedicated Hammet Ltd contact for your school",
    "Curriculum delivered term-by-term",
  ];

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent transition";
  const selectClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent transition appearance-none";

  return (
    <section id="callback" className="bg-[#F5F3FF] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <SectionLabel>For Schools</SectionLabel>
            <h2
              className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-5xl font-bold text-[#1E1B4B] mb-4 leading-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              Request to Test the Software
            </h2>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed">
              A member of our team will contact you within 24 hours.
            </p>

            <div className="flex flex-col gap-4">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#3B0764] flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-[#1E1B4B] text-sm font-medium leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#3B0764] rounded-3xl p-8 lg:p-10 shadow-2xl shadow-[#3B0764]/20">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-[#06B6D4]/20 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-[#06B6D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-white mb-2">
                  Request received
                </h3>
                <p className="text-purple-200 text-sm">
                  We&apos;ll be in touch within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-white mb-2">
                  Get in touch
                </h3>

                <input
                  type="text"
                  required
                  placeholder="School Name"
                  value={form.schoolName}
                  onChange={(e) => set("schoolName", e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  required
                  placeholder="Your Email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputClass}
                />
                <select
                  required
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  className={selectClass}
                >
                  <option value="" disabled>Your Role</option>
                  <option>Proprietor</option>
                  <option>Principal</option>
                  <option>Administrator</option>
                  <option>Other</option>
                </select>
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputClass}
                />
                <select
                  required
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className={selectClass}
                >
                  <option value="" disabled>City</option>
                  <option>Lagos</option>
                  <option>Abuja</option>
                  <option>Ibadan</option>
                  <option>Other</option>
                </select>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-bold py-4 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {submitting ? "Submitting…" : "Request to Test the Software"}
                </button>

                <p className="text-purple-300 text-xs text-center leading-relaxed">
                  By submitting, you agree to be contacted by the Hammet Ltd team about your school&apos;s needs.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function FooterOld() {
  const footerLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "For Schools", href: "#callback" },
    { label: "Request to Test the Software", href: "#callback" },
  ];
  return (
    
    <footer id="footer" className="bg-[#0F0A1A] text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-5">Product</h4>
            <div className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

          

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2026 Hammet Ltd. All rights reserved.</p>
          <Link href="/login" className="text-sm text-gray-500 hover:text-white transition-colors font-medium">
            Login →
          </Link>
        </div>
      </div>
    </footer>
  );
}


function Footer() {
  const footerLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "For Schools", href: "#callback" },
    { label: "Request to Test the Software", href: "#callback" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookie-policy" },
  ];

  return (
    <footer id="footer" className="bg-[#0F0A1A] text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Image
              src="/favicon.ico"
              alt="Hammet"
              width={130}
              height={34}
              className="h-8 w-auto mb-4"
            />
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4">
              AI Curriculum Infrastructure for Nigerian Secondary Schools.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Hammet designs and delivers structured AI literacy programmes for private secondary schools in Nigeria. We handle curriculum, delivery frameworks, and school support — so institutions can lead on AI education without building it from scratch.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-5">Product</h4>
            <div className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-5">Legal</h4>
            <div className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-5">Contact</h4>
            <div className="flex flex-col gap-3">
              <Link href="mailto:admin@hammetlabs.com" className="text-sm text-gray-500 hover:text-white transition-colors"> admin@hammetlabs.com</Link>
              <Link href="https://www.instagram.com/hammetlabs/" className="text-sm text-gray-500 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Instagram</Link>
              <Link href="https://www.linkedin.com/company/hammet-labs/" className="text-sm text-gray-500 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">LinkedIn</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2026 Hammet Ltd. All rights reserved.</p>
          <Link href="/login" className="text-sm text-gray-500 hover:text-white transition-colors font-medium">
            Login →
          </Link>
        </div>
      </div>
    </footer>
  );
}
// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <ProblemStatement />
        <WhatWeDeliver />
        <HowItWorks />
        <Features />
        <CallbackForm />
      </main>
      <Footer />
    </div>
  );
}
