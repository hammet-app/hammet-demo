"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { sendCallback } from "@/lib/api/support";
import Link from "next/link";
import Image from "next/image";

import { 
  Hero, 
  CTAPair, 
  ProblemStatement, 
  SectionLabel, 
  WhatWeDeliver, 
  HowItWorks,
  Features,
  CallbackForm
} from "@/components/layout/home";


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
            src="/icon-512x512.png"
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


// ─── Section 6 — Callback Form ────────────────────────────────────────────────


// ─── Footer ───────────────────────────────────────────────────────────────────

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
              src="/icon-512x512.png"
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
