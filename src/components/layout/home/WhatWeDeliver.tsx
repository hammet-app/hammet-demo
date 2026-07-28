"use client"

import { motion } from "motion/react";

import { CTAPair } from "./ProblemStatement";
import { fadeUp } from "@/components/animations/home";

export function WhatWeDeliver() {
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
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.12 }}
          className="max-w-2xl mb-16"
        >
          <motion.h2
            variants={fadeUp}
            className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-5xl font-bold text-[#1E1B4B] mb-4 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            A complete AI Studies programme. Plug-in ready for your school.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 text-lg leading-relaxed">
            A full academic programme that your school can own. All accessible remotely through a simple link.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {columns.map((col, index) => (
            <motion.div 
              key={col.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              whileHover={{ y: -8, backgroundColor: "#FAF8FF", borderColor: "#DDD6FE" }}
              className="group relative overflow-hidden rounded-2xl p-6 border border-transparent"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-8 -left-8 h-40 w-40 pointer-events-none bg-gradient-to-br bg-[#EDE9FE]/60 blur-3xl"
              />
              <motion.div
                whileHover={{ rotate: -8, scale: 1.08, }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                className="relative z-10 w-12 h-12 rounded-xl bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center mb-5 group-hover:bg-[#3B0764] group-hover:text-white transition-colors duration-300"
              >
                <motion.div 
                  whileHover={{ rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {col.icon}
                </motion.div>
              </motion.div>
              <motion.h3
                whileHover={{ color: "#5B21B6"}}
                transition={{ duration: 0.2 }}
                className="relative z-10 font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#1E1B4B] mb-3">
                {col.title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, }}
                whileInView={{ opacity: 1}}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="relative z-10 text-gray-500 text-sm leading-relaxed">
                  {col.body}
                </motion.p>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CTAPair />
        </motion.div>
          
      </div>
    </section>
  );
}