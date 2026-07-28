"use client"

import { motion } from "motion/react";
import { SectionLabel } from "./ProblemStatement";
import { fadeUp } from "@/components/animations/home";

export function Features() {
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
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>Features</SectionLabel>
          </motion.div>

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
              <motion.div 
                key={f.title} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ x: 6, }}
                className="group relative py-8 flex flex-col md:flex-row md:items-start gap-6 group"
              >
                <motion.div 
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{ originX: 0 }}
                  className="absolute left-0 top-0 h-full w-1 bg-[#5B21B6]"
                />
                <motion.span 
                  whileHover={{ scale: 1.08, y: -2 }}
                  transition={{ type: "spring", stiffness: 350 }}
                  className="font-[family-name:var(--font-jakarta)] text-5xl font-bold text-[#F5F3FF] group-hover:text-[#5B21B6] transition-colors shrink-0 w-16 leading-none"
                >
                  {String(i + 1).padStart(2, "0")}
                </motion.span>
                <div className="flex-1">
                  <motion.h3 
                    whileHover={{ color: "#5B21B6"}}
                    transition={{ duration: 0.2 }}
                    className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#1E1B4B] mb-2">
                    {f.title}
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 }}
                    className="text-gray-500 text-sm leading-relaxed max-w-2xl"
                  >
                    {f.body}
                  </motion.p>
                </div>
                {i !== features.length - 1 && (
                  <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{
                          delay: i * 0.08,
                      }}
                      style={{ originX: 0 }}
                      className="h-px bg-[#E5E7EB]"
                  />
              )}
              </motion.div>
            ))}

          </div>
        </motion.div>
      </div>
    </section>
  );
}