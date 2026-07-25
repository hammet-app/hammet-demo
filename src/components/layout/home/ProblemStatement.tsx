"use client"

import Link from "next/link";
import { motion } from "motion/react";

import { fadeUp } from "@/components/animations/home";
import CountUp from "react-countup";


export function SectionLabel({ children, liveIndicator = false }: { children: React.ReactNode; liveIndicator?: boolean }) {
  return (
    <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#06B6D4] mb-4 flex items-center gap-2">
      {liveIndicator && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <motion.span 
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1], }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative inline-flex rounded-full h-2 w-2 bg-red-500" 
          />
        </span>
      )}
      {children}
    </p>
  );
}

export function CTAPair({ light = false }: { light?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <motion.div
        whileHover={{ y: -2, scale: 1.02, }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 350, damping: 20, }}
      >
        <Link
          href="#"
          className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            light
              ? "bg-white text-[#3B0764] hover:bg-[#EDE9FE]"
              : "bg-[#3B0764] text-white hover:bg-[#5B21B6]"
          }`}
        >
          Watch how the Product Works in 3 Mins
        </Link>
      </motion.div>
      <motion.div
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
      >
        <Link
          href="#callback"
          className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
            light
              ? "border-white/40 text-white hover:bg-white/10"
              : "border-[#3B0764] text-[#3B0764] hover:bg-[#EDE9FE]"
          }`}
        >
          Test the Software Yourself
        </Link>
      </motion.div>
    </div>
  );
}

export function ProblemStatement() {
  const topStats = [
    { value: 120, suffix: "+", label: "countries with AI in education" },
    { value: 6 , suffix: "of 7", label: "continents covered" },
    { value: 15, prefix: "~", suffix:"", label: "countries with national AI-in-ed policy" },
    { value: 10, prefix: "<", suffix: "%", label: "schools with formal AI guidelines" },
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
      <motion.div  variants={fadeUp} className="max-w-7xl mx-auto">
        <SectionLabel liveIndicator>Live global data</SectionLabel>
        <motion.h2
          variants={fadeUp}
          className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-5xl font-bold text-white mb-4 max-w-2xl leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          The State of AI in Education — Globally
        </motion.h2>
        <motion.p className="text-gray-400 text-lg mb-12 max-w-xl">
          HammetLtd intends to get your school on the global AI education map.
        </motion.p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden mb-8">
          {topStats.map((s, index) => (
            <motion.div
              key={s.label} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .5, delay: index * .08}}
              whileHover={{ y: -4, backgroundColor: "#181127" }}
              className="bg-[#0F0A1A] p-6 lg:p-8"
            >
              <p
                className="font-[family-name:var(--font-jakarta)] text-4xl lg:text-5xl font-bold text-white mb-2"
                style={{ letterSpacing: "-0.02em" }}
              >
                {s.prefix}<CountUp end={s.value} duration={1} separator="," enableScrollSpy scrollSpyOnce />{s.suffix && s.suffix === "of 7" ? ` ${s.suffix}` : `${s.suffix}`}
              </p>
              <p className="text-gray-400 text-sm leading-snug">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {regions.map((region, index) => (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * .08 }}
              whileHover={{ y: -6, borderColor: "#06B6D4"}}
              className={`rounded-xl border border-white/10 p-5 ${region.muted ? "opacity-50" : ""}`}
            >
              <motion.p 
                whileHover={{ color: "#22D3EE"}}
                transition={{ duration: 0.2 }}
                className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3"
              >
                {region.name}
              </motion.p>
              <div className="flex flex-col gap-2">
                {region.items.map((item, rowIndex) => (
                  <motion.div 
                    key={item.country} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: rowIndex * .03 }}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-sm text-gray-300 leading-tight">{item.country}</span>
                    <motion.span
                    whileHover={{ scale: 1.08 }} 
                    transition={{ type: "spring", stiffness: 400 }}
                      className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${item.color}`}
                    >
                      {item.badge}
                    </motion.span>
                  </motion.div>
                ))}
                {region.extra?.map((sub) => (
                  <motion.div 
                    key={sub.subheading} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="mt-3 pt-3 border-t border-white/10"
                  >
                    <motion.p 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.25 }}
                      className="text-xs font-bold tracking-widest uppercase text-gray-600 mb-2"
                    >
                      {sub.subheading}
                    </motion.p>
                    {sub.items.map((item, rowIndex) => (
                      <motion.div 
                        key={item.country} 
                        initial={{ opacity: 1, x: 0 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: rowIndex * 0.03 }}
                        className="flex items-center justify-between gap-2 mb-1.5"
                      >
                        <span className="text-sm text-gray-300 leading-tight">{item.country}</span>
                        <motion.span 
                          whileHover={{ scale: 1.08 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${item.color}`}>
                          {item.badge}
                        </motion.span>
                      </motion.div>
                    ))}
                  </motion.div>
                ))}
                {region.note && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35 }}
                    className="text-xs text-gray-500 mt-2 leading-relaxed italic">
                    {region.note}
                  </motion.p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 p-5 mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">
            Deployment tier legend
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {legend.map((l) => (
              <motion.div 
                key={l.badge} 
                whileHover={{ y: -2, scale: 1.05 }}
                className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.color}`}>
                  {l.badge}
                </span>
                <span className="text-xs text-gray-400">{l.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-xs text-gray-600 mb-12"
        >
          Sources: UNESCO (2023–2025), Stanford HAI 2025 AI Index, DevelopmentAid, CRPE
        </motion.p>

        <CTAPair light />
      </motion.div>
    </section>
  );
}