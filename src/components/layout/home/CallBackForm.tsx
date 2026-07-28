"use client"

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SectionLabel } from "./ProblemStatement";
import { sendCallback } from "@/lib/api/support";
import { fadeUp } from "@/components/animations/home";

type FormData = {
  schoolName: string;
  fullName: string;
  email: string,
  role: string;
  phone: string;
  city: string;
};

export function CallbackForm() {
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
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.12 }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>For Schools</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-5xl font-bold text-[#1E1B4B] mb-4 leading-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              Request to Test the Software
            </motion.h2>
            <motion.p 
              variants={fadeUp}
              className="text-gray-500 text-lg mb-10 leading-relaxed">
              A member of our team will contact you within 24 hours.
            </motion.p>

            <div className="flex flex-col gap-4">
              {trustPoints.map((point, index) => (
                <motion.div 
                  key={point}
                  initial={{ opacity: 0, x: -20, }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 350 }}
                    className="w-5 h-5 rounded-full bg-[#3B0764] flex items-center justify-center shrink-0 mt-0.5"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </motion.div>
                  <p className="text-[#1E1B4B] text-sm font-medium leading-relaxed">{point}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, }}
            className="relative overflow-hidden bg-[#3B0764] rounded-3xl p-8 lg:p-10 shadow-2xl shadow-[#3B0764]/20"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
            </div>
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-10 text-center py-8"
                >
                  <motion.div 
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 250, damping: 18 }}
                    className="w-14 h-14 rounded-full bg-[#06B6D4]/20 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-7 h-7 text-[#06B6D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </motion.div>
                  <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-white mb-2">
                    Request received
                  </h3>
                  <p className="text-purple-200 text-sm">
                    We&apos;ll be in touch within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: 0.06
                      }
                    }
                  }}
                  onSubmit={handleSubmit} 
                  className="relative z-10 flex flex-col gap-4">
                  <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-white mb-2">
                    Get in touch
                  </h3>

                  <motion.div variants={fadeUp}>              
                    <motion.input
                      type="text"
                      required
                      placeholder="School Name"
                      value={form.schoolName}
                      onChange={(e) => set("schoolName", e.target.value)}
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 24 }}
                      className={inputClass}
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <motion.input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 24 }}
                      className={inputClass}
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <motion.input
                      type="text"
                      required
                      placeholder="Your Email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 24 }}
                      className={inputClass}
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <motion.select
                      required
                      value={form.role}
                      onChange={(e) => set("role", e.target.value)}
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 24 }}
                      className={selectClass}
                    >
                      <option value="" disabled>Your Role</option>
                      <option>Proprietor</option>
                      <option>Principal</option>
                      <option>Administrator</option>
                      <option>Other</option>
                    </motion.select>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <motion.input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 24 }}
                      className={inputClass}
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <motion.select
                      required
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 24 }}
                      className={selectClass}
                    >
                      <option value="" disabled>City</option>
                      <option>Lagos</option>
                      <option>Abuja</option>
                      <option>Ibadan</option>
                      <option>Other</option>
                    </motion.select>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="w-full mt-2 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-bold py-4 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {submitting && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                    </div>
                    <motion.span
                      key={submitting ? "loading" : "idle"}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      {submitting ? "Submitting…" : "Request to Test the Software"}
                    </motion.span>
                  </motion.button>

                  <motion.p variants={fadeUp} className="text-purple-300 text-xs text-center leading-relaxed">
                    By submitting, you agree to be contacted by the Hammet Ltd team about your school&apos;s needs.
                  </motion.p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}