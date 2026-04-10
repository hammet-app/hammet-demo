"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Shared primitives ────────────────────────────────────────────────────────

function CTAPair({ light = false }: { light?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href="#callback"
        className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 ${
          light
            ? "bg-white text-[#3B0764] hover:bg-[#EDE9FE]"
            : "bg-[#3B0764] text-white hover:bg-[#5B21B6]"
        }`}
      >
        Watch how the Product Works in 3 Mins
      </a>
      <a
        href="#callback"
        className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
          light
            ? "border-white/40 text-white hover:bg-white/10"
            : "border-[#3B0764] text-[#3B0764] hover:bg-[#EDE9FE]"
        }`}
      >
        Test the Software Yourself
      </a>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#06B6D4] mb-4">
      {children}
    </p>
  );
}

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
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="HammetLabs"
            width={140}
            height={36}
            className="h-8 w-auto"
            priority
          />
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-gray-600 hover:text-[#3B0764] transition-colors font-medium"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#3B0764] hover:text-[#5B21B6] transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <a
            href="#callback"
            className="text-sm font-semibold bg-[#3B0764] text-white px-5 py-2.5 rounded-full hover:bg-[#5B21B6] transition-colors"
          >
            Request a Callback
          </a>
        </div>

        {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-gray-700 font-medium"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link href="/login" className="text-sm font-semibold text-[#3B0764] py-2">
              Log in
            </Link>
            <a
              href="#callback"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold bg-[#3B0764] text-white px-5 py-2.5 rounded-full text-center"
            >
              Request a Callback
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Section 1 — Hero ─────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle top-right accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#EDE9FE] rounded-full opacity-30 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-[#EDE9FE] text-[#5B21B6] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
            AI Literacy for Nigerian Secondary Schools
          </div>

          {/* Headline */}
          <h1
            className="font-[family-name:var(--font-jakarta)] text-5xl lg:text-7xl font-bold leading-[1.05] text-[#1E1B4B] mb-6"
            style={{ letterSpacing: "-0.02em" }}
          >
            Newsflash: Nearly{" "}
            <span className="relative inline-block">
              <span className="relative z-10">120 Countries</span>
              <span
                className="absolute bottom-1 left-0 w-full h-3 bg-[#06B6D4] opacity-20 rounded"
                aria-hidden
              />
            </span>{" "}
            have now integrated AI into their educational infrastructure.
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-gray-500 mb-3 leading-relaxed">
            This is across <strong className="text-[#3B0764]">6 out of 7 continents</strong> — all except Antarctica.
          </p>
          <p className="text-lg text-gray-600 mb-3 leading-relaxed max-w-2xl">
            HammetLabs built a safe AI curriculum software for your secondary school.
          </p>
          <p className="text-base text-gray-500 mb-10 max-w-2xl leading-relaxed">
            An easy-to-use, well-structured curriculum that attaches to weekly computer classes — getting your students prepared for the brave new world of AI.
          </p>

          <CTAPair />
        </div>

        {/* Decorative grid accent — bottom right */}
        <div
          className="absolute bottom-0 right-0 w-64 h-64 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #3B0764 0, #3B0764 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, #3B0764 0, #3B0764 1px, transparent 1px, transparent 32px)",
          }}
        />
      </div>
    </section>
  );
}

// ─── Section 2 — Problem Statement / Stats ────────────────────────────────────

function ProblemStatement() {
  const topStats = [
    { value: "120+", label: "countries with AI in education" },
    { value: "6 of 7", label: "continents covered" },
    { value: "~15", label: "countries with national AI-in-ed policy" },
    { value: "<10%", label: "schools with formal AI guidelines" },
  ];

  const regions = [
    {
      name: "ASIA-PACIFIC",
      items: [
        { country: "China", badge: "mandatory", color: "bg-green-900 text-green-300" },
        { country: "South Korea", badge: "mandatory", color: "bg-green-900 text-green-300" },
        { country: "Singapore", badge: "national plan", color: "bg-blue-900 text-blue-300" },
        { country: "Australia", badge: "national plan", color: "bg-blue-900 text-blue-300" },
        { country: "Japan", badge: "guidelines", color: "bg-amber-900 text-amber-300" },
        { country: "India", badge: "guidelines", color: "bg-amber-900 text-amber-300" },
        { country: "Indonesia, Malaysia, Pakistan", badge: "piloting", color: "bg-gray-700 text-gray-300" },
      ],
    },
    {
      name: "NORTH AMERICA",
      items: [
        { country: "USA", badge: "national plan", color: "bg-blue-900 text-blue-300" },
        { country: "Canada", badge: "fragmented", color: "bg-orange-900 text-orange-300" },
      ],
      extra: [
        {
          subheading: "LATIN AMERICA & CARIBBEAN",
          items: [
            { country: "Brazil, Chile, Mexico", badge: "guidelines", color: "bg-amber-900 text-amber-300" },
            { country: "Other LA/C nations", badge: "piloting", color: "bg-gray-700 text-gray-300" },
          ],
        },
      ],
    },
    {
      name: "EUROPE",
      items: [
        { country: "UK", badge: "national plan", color: "bg-blue-900 text-blue-300" },
        { country: "Finland", badge: "national plan", color: "bg-blue-900 text-blue-300" },
        { country: "Estonia", badge: "national plan", color: "bg-blue-900 text-blue-300" },
        { country: "France, Germany, Netherlands", badge: "guidelines", color: "bg-amber-900 text-amber-300" },
        { country: "Most EU states", badge: "piloting", color: "bg-gray-700 text-gray-300" },
      ],
    },
    {
      name: "MIDDLE EAST & ARAB STATES",
      items: [
        { country: "UAE", badge: "mandatory", color: "bg-green-900 text-green-300" },
        { country: "Saudi Arabia", badge: "national plan", color: "bg-blue-900 text-blue-300" },
        { country: "Egypt, Jordan", badge: "guidelines", color: "bg-amber-900 text-amber-300" },
      ],
    },
    {
      name: "AFRICA",
      items: [
        { country: "South Africa, Kenya, Rwanda", badge: "guidelines", color: "bg-amber-900 text-amber-300" },
        { country: "Nigeria, Ethiopia, Senegal, Zambia, Zimbabwe + more", badge: "piloting", color: "bg-gray-700 text-gray-300" },
      ],
      note: "UNESCO engaging 29+ African countries on AI policy frameworks",
    },
    {
      name: "ANTARCTICA",
      items: [],
      note: "No permanent civilian population — the only continent without AI in education",
      muted: true,
    },
  ];

  const legend = [
    { badge: "mandatory", color: "bg-green-900 text-green-300", desc: "AI in schools required by law" },
    { badge: "national plan", color: "bg-blue-900 text-blue-300", desc: "Formal strategy with funding" },
    { badge: "guidelines", color: "bg-amber-900 text-amber-300", desc: "Policies issued, adoption optional" },
    { badge: "piloting", color: "bg-gray-700 text-gray-300", desc: "Tools in use, no national framework yet" },
  ];

  return (
    <section className="bg-[#0F0A1A] text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionLabel>Live global data</SectionLabel>
        <h2
          className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-5xl font-bold text-white mb-4 max-w-2xl leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          The State of AI in Education — Globally
        </h2>
        <p className="text-gray-400 text-lg mb-12 max-w-xl">
          HammetLabs intends to get your school on the global AI education map.
        </p>

        {/* Top stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden mb-8">
          {topStats.map((s) => (
            <div key={s.label} className="bg-[#0F0A1A] p-6 lg:p-8">
              <p
                className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-5xl font-bold text-white mb-2"
                style={{ letterSpacing: "-0.02em" }}
              >
                {s.value}
              </p>
              <p className="text-gray-400 text-sm leading-snug">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Region grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {regions.map((region) => (
            <div
              key={region.name}
              className={`rounded-xl border border-white/10 p-5 ${region.muted ? "opacity-50" : ""}`}
            >
              <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">
                {region.name}
              </p>
              <div className="flex flex-col gap-2">
                {region.items.map((item) => (
                  <div key={item.country} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-300 leading-tight">{item.country}</span>
                    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${item.color}`}>
                      {item.badge}
                    </span>
                  </div>
                ))}
                {region.extra?.map((sub) => (
                  <div key={sub.subheading} className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-600 mb-2">
                      {sub.subheading}
                    </p>
                    {sub.items.map((item) => (
                      <div key={item.country} className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm text-gray-300 leading-tight">{item.country}</span>
                        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${item.color}`}>
                          {item.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
                {region.note && (
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed italic">{region.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="rounded-xl border border-white/10 p-5 mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">
            Deployment tier legend
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {legend.map((l) => (
              <div key={l.badge} className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.color}`}>
                  {l.badge}
                </span>
                <span className="text-xs text-gray-400">{l.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600 mb-12">
          Sources: UNESCO (2023–2025), Stanford HAI 2025 AI Index, DevelopmentAid, CRPE
        </p>

        <CTAPair light />
      </div>
    </section>
  );
}

// ─── Section 3 — What We Deliver ──────────────────────────────────────────────

function WhatWeDeliver() {
  const columns = [
    {
      title: "Structured Curriculum — JSS1 to SS3",
      body: "Six years of AI education, sequenced and scaffolded. Content builds term on term, year on year. Students don't repeat topics — they deepen their understanding as they progress.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
    {
      title: "The Digital Passport System",
      body: "Every student earns a Digital Passport — a verifiable, grade-specific record of their AI competency. As they progress through school, they unlock access to more advanced tools and capabilities.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
        </svg>
      ),
    },
    {
      title: "Full School Support",
      body: "Implementation guides for teachers. Admin dashboard for school leaders. Lesson delivery frameworks are delivered every term. Your staff does not need prior AI expertise to run this programme.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <h2
            className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-5xl font-bold text-[#1E1B4B] mb-4 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            A complete AI Studies programme. Plug-in ready for your school.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            A full academic programme that your school can own. All accessible remotely through a simple link.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {columns.map((col) => (
            <div key={col.title} className="group">
              <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center mb-5 group-hover:bg-[#3B0764] group-hover:text-white transition-colors duration-300">
                {col.icon}
              </div>
              <h3
                className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#1E1B4B] mb-3"
              >
                {col.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{col.body}</p>
            </div>
          ))}
        </div>

        <CTAPair />
      </div>
    </section>
  );
}

// ─── Section 4 — How It Works ─────────────────────────────────────────────────

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
      body: "School Admin assigns teachers and afterwards registers individual students into the software database.",
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
                <span
                  className="font-[family-name:var(--font-jakarta)] text-4xl font-bold text-[#EDE9FE] group-hover:text-[#5B21B6] transition-colors duration-300 leading-none"
                >
                  {step.num}
                </span>
                {i === steps.length - 1 && (
                  <span className="text-xs font-bold tracking-widest uppercase text-[#06B6D4] bg-cyan-50 px-2 py-1 rounded-md">
                    Ongoing
                  </span>
                )}
              </div>
              <h3
                className="font-[family-name:var(--font-jakarta)] text-base font-bold text-[#1E1B4B] mb-3"
              >
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
      title: "Teacher Delivery Framework",
      body: "No AI background required from your staff. Each term comes with structured lesson guides, modules, and facilitation notes.",
    },
    {
      title: "Admin Dashboard",
      body: "School leadership gets full visibility into programme performance — by class, by student, by term.",
    },
    {
      title: "Dedicated School Support",
      body: "A HammetLabs contact is assigned to your school. Setup, troubleshooting, and content updates are handled on our end.",
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
            <div
              key={f.title}
              className="py-8 flex flex-col md:flex-row md:items-start gap-6 group"
            >
              <span
                className="font-[family-name:var(--font-jakarta)] text-5xl font-bold text-[#F5F3FF] group-hover:text-[#EDE9FE] transition-colors shrink-0 w-16 leading-none"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <h3
                  className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#1E1B4B] mb-2"
                >
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
  school_name: string;
  full_name: string;
  role: string;
  phone: string;
  city: string;
};

function CallbackForm() {
  const [form, setForm] = useState<FormData>({
    school_name: "",
    full_name: "",
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
    // TODO: wire to your backend endpoint
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setSubmitting(false);
  }

  const trustPoints = [
    "30-student pilot — no commitment required",
    "Onboarding completed in under 2 hours",
    "No AI expertise needed from your staff",
    "Dedicated HammetLabs contact for your school",
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
          {/* Left — copy + trust signals (mirrors Image 1 layout) */}
          <div>
            <SectionLabel>For Schools</SectionLabel>
            <h2
              className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-5xl font-bold text-[#1E1B4B] mb-4 leading-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              Request a School Callback
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

          {/* Right — form card (mirrors Image 1 form panel) */}
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
                  We'll be in touch within 24 hours.
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
                  value={form.school_name}
                  onChange={(e) => set("school_name", e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
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
                  {submitting ? "Submitting…" : "Request Callback"}
                </button>

                <p className="text-purple-300 text-xs text-center leading-relaxed">
                  By submitting, you agree to be contacted by the HammetLabs team about your school's needs.
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

function Footer() {
  return (
    <footer id="footer" className="bg-[#0F0A1A] text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand col */}
          <div className="md:col-span-2">
            <Image
              src="/logo.png"
              alt="HammetLabs"
              width={130}
              height={34}
              className="h-8 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4">
              AI Curriculum Infrastructure for Nigerian Secondary Schools.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              HammetLabs designs and delivers structured AI literacy programmes for private secondary schools in Nigeria. We handle curriculum, delivery frameworks, and school support — so institutions can lead on AI education without building it from scratch.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-5">
              Product
            </h4>
            <div className="flex flex-col gap-3">
              {["How It Works", "Features", "For Schools", "Request a Callback"].map((l) => (
                <a key={l} href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                  {l}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-5">
              Contact
            </h4>
            <div className="flex flex-col gap-3">
              <a href="mailto:" className="text-sm text-gray-500 hover:text-white transition-colors">
                Email
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                Instagram
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 HammetLabs. All rights reserved.
          </p>
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-white transition-colors font-medium"
          >
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
