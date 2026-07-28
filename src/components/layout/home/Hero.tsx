"use client"

import Link from "next/link";
import CountUp from "react-countup";
import { motion } from "motion/react";
import { container, fadeLeft, fadeUp } from "@/components/animations/home";

export function Hero() {
  const stats = [
    { value: 118, label: "Countries with AI in Education" },
    { value: 14, label: "Countries with National AI-Ed Policy" },
    { value: 950000, label: "Schools Already Using AI Tools" },
    { value: 175000, label: "Schools With Structured AI Curriculum" },
  ];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background accent */}
      <motion.div 
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#EDE9FE] rounded-full opacity-30 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" 
        animate={{ x:[0, 25, 0], y: [0, -20, 0], scale: [1, 1.05, 1], }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeOut" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-0 lg:pt-24">

        {/* Two-column: copy left, video right */}
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center pb-16 lg:pb-20"
          variants={container}
          initial="hidden"
          animate="show"
        >

          {/* Left — headline + CTAs */}
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 bg-[#EDE9FE] text-[#5B21B6] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
              AI Literacy for Nigerian Secondary Schools
            </div>

            <motion.h1
              variants={fadeUp}
              className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-6xl font-bold leading-[1.08] text-[#1E1B4B] mb-6"
              style={{ letterSpacing: "-0.02em" }}
            >
              Nigerian Classrooms Need{" "}
              <span className="relative inline-block">
                <span className="relative z-10">AI Literacy.</span>
                <motion.span
                  className="absolute bottom-1 left-0 w-full h-3 bg-[#06B6D4] opacity-20 rounded"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.5, }}
                  style={{ originX: 0 }}
                  aria-hidden
                />
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              className="text-lg text-gray-500 mb-10 leading-relaxed max-w-lg"
            >
              We built an easy-to-use software that brings AI knowledge to your doorstep.
            </motion.p>

            <motion.div 
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3"
            >
              <motion.div
                whileHover={{ y: -2, scale: 1.02, }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="#"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold bg-[#3B0764] text-white hover:bg-[#5B21B6] transition-all duration-200"
                >
                  Watch how it works in 3 Mins
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ y: -2, scale: 1.02, }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="#callback"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold border border-[#3B0764] text-[#3B0764] hover:bg-[#EDE9FE] transition-all duration-200"
                >
                  Test the software yourself
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right — video placeholder */}
          <motion.div
            variants={fadeLeft}
            whileHover={{ scale: 1.01, y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }} 
            className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#1E1B4B] flex items-center justify-center shadow-2xl shadow-[#3B0764]/20"
          >
            {/* Placeholder content */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B0764] to-[#0F0A1A]" />
            <div className="relative flex flex-col items-center gap-4 text-center px-8">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
              >
                <motion.svg 
                  whileHover={{ y: 2, }}
                  className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"

                >
                  <path d="M8 5v14l11-7z" />
                </motion.svg>
              </motion.div>
              <p className="text-white/50 text-sm font-medium">Product demo video</p>
            </div>
            {/* Decorative corner dots */}
            <motion.div 
              animate={{ opacity: [0.3, 0.8, 0.3], }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[#06B6D4]/40" 
            />
            <motion.div 
              animate={{ opacity: [0.3, 0.8, 0.3], }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
              className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#06B6D4]/40" 
            />
            <motion.div 
              animate={{ opacity: [0.3, 0.8, 0.3], }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
              className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-[#06B6D4]/40" 
            />
            <motion.div 
              animate={{ opacity: [0.3, 0.8, 0.3], }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
              className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-[#06B6D4]/40" 
            />
          </motion.div>
        </motion.div>

        {/* Stats bar — full width, flush to section bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E5E7EB] border-t border-[#E5E7EB]"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260 }}
              className="bg-white px-6 py-8 flex flex-col gap-1.5 group hover:bg-[#F5F3FF] transition-colors"
            >
              <p
                className="font-[family-name:var(--font-jakarta)] text-3xl lg:text-4xl font-bold text-[#3B0764] leading-none"
                style={{ letterSpacing: "-0.02em" }}
              >
                <CountUp end={s.value} duration={1} separator="," enableScrollSpy scrollSpyOnce />+
              </p>
              <p className="text-gray-500 text-sm leading-snug">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20, }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-[#3B0764] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-white/70 text-sm">
            Your school could be part of this global shift.
          </p>
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98, }}
          >
            <Link
              href="#callback"
              className="inline-flex items-center gap-2 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-bold px-6 py-3 rounded-full text-sm transition-colors shrink-0"
            >
              Test the AI Curriculum Software
              <motion.svg 
                whileHover={{ x: 4 }}
                className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </motion.svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}