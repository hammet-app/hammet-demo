"use client"

import { motion } from "motion/react";
import { SectionLabel } from "./ProblemStatement";
import { fadeUp } from "@/components/animations/home";

export function HowItWorks() {
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
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.div variants={fadeUp}>How It Works</motion.div>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-5xl font-bold text-[#1E1B4B] mb-16 max-w-xl leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          From signup to classroom in under a week.
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden bg-white rounded-2xl p-7 border border-[#E5E7EB]"
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: .25 }}
                className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#EDE9FE]/50 via-[#F5F3FF]/20 to-transparent"
              />

              <div className="flex items-start justify-between mb-5">
                <motion.span
                  whileHover={{ y: -2, scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 350 }}
                  className="relative z-10 font-[family-name:var(--font-jakarta)] text-4xl font-bold text-[#EDE9FE] group-hover:text-[#5B21B6] transition-colors duration-300 leading-none"
                >
                  {step.num}
                </motion.span>
                {i === steps.length - 1 && (
                  <motion.span
                    animate={{ scale: [1, 1.05, 1], }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative z-10 text-xs font-bold tracking-widest uppercase text-[#06B6D4] bg-cyan-50 px-2 py-1 rounded-md"
                  >
                    Ongoing
                  </motion.span>
                )}
                {i !== steps.length - 1 && (
                  <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{
                          delay: i * 0.15,
                      }}
                      style={{ originX: 0 }}
                      className="hidden lg:block absolute top-12 -right-3 w-6 h-px bg-[#DDD6FE]"
                  />
              )}
              </div>
              <motion.h3 
                whileHover={{ color: "#5B21B6"}}
                transition={{ duration: .2 }}
                className="relative z-10 font-[family-name:var(--font-jakarta)] text-base font-bold text-[#1E1B4B] mb-3">
                {step.title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 2 }}
                className="relative z-10 text-sm text-gray-500 leading-relaxed">
                  {step.body}
                </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}