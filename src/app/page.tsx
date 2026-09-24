"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Database,
  Eye,
  GraduationCap,
  Menu,
  Network,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion, Variants } from "motion/react";

import { sendCallback } from "@/lib/api/support";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/lib/use-theme";

type FormData = {
  schoolName: string;
  fullName: string;
  email: string;
  role: string;
  phone: string;
  city: string;
};

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function HomePage() {
  const [showCallback, setShowCallback] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FAF9FC] text-[#1E1B4B] transition-colors dark:bg-[#0F0B1A] dark:text-white">
      <Navbar onDemo={() => setShowCallback(true)} />

      <Hero onDemo={() => setShowCallback(true)} />

      <ParentSection />

      <SchoolGets />

      <Levels onDemo={() => setShowCallback(true)} />

      <TrustSection />

      <FinalCTA onDemo={() => setShowCallback(true)} />

      <Footer />

      <AnimatePresence>
        {showCallback && (
          <CallbackModal onClose={() => setShowCallback(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────── */

function Navbar({ onDemo }: { onDemo: () => void }) {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#E9E5F2]/80 bg-[#FAF9FC]/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0F0B1A]/85">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          href="#"
          className="flex items-center gap-2.5"
          aria-label="Hammet home"
        >
          <Image
            src="/icon-512x512.png"
            alt="Hammet"
            width={80}
            height={24}
            className="mb-4 h-8 w-auto"
          />

          <span className="text-[15px] font-extrabold tracking-tight">
            Hammet
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <Link
            href="#why"
            className="text-[13px] font-medium text-[#625F73] transition-colors hover:text-[#3B0764] dark:text-slate-400 dark:hover:text-purple-300"
          >
            Why Hammet
          </Link>

          <Link
            href="#school-gets"
            className="text-[13px] font-medium text-[#625F73] transition-colors hover:text-[#3B0764] dark:text-slate-400 dark:hover:text-purple-300"
          >
            What you get
          </Link>

          <Link
            href="#levels"
            className="text-[13px] font-medium text-[#625F73] transition-colors hover:text-[#3B0764] dark:text-slate-400 dark:hover:text-purple-300"
          >
            Levels
          </Link>

          <Link
            href="/login"
            className="text-[13px] font-semibolld text-[#3B0764] transition-colors hover:text-[#5B21B6] dark:text-purple-300 dark:hover:text-purple-200"
          >
            Log in
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle theme={theme} toggle={toggle} />

          <DemoButton onClick={onDemo} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#3B0764] hover:bg-[#EEEAF7] dark:text-purple-300 dark:hover:bg-white/10 lg:hidden"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[#E9E5F2] dark:border-white/10 lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 py-4">
              <Link
                href="#why"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-[#F0EDF7] dark:hover:bg-white/5"
              >
                Why Hammet
              </Link>

              <Link
                href="#school-gets"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-[#F0EDF7] dark:hover:bg-white/5"
              >
                What you get
              </Link>

              <Link
                href="#levels"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-[#F0EDF7] dark:hover:bg-white/5"
              >
                Levels
              </Link>

              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-[#3B0764] hover:bg-[#F0EDF7] dark:text-purple-300 dark:hover:bg-white/5"
              >
                Log in
              </Link>

              <div className="flex items-center gap-2 px-3 py-2">
                <ThemeToggle theme={theme} toggle={toggle} />
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onDemo();
                }}
                className="mt-2 rounded-xl bg-[#3B0764] px-4 py-3 text-sm font-bold text-white hover:bg-[#4C0A80]"
              >
                Book a school demo
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function ThemeToggle({
  theme,
  toggle,
}: {
  theme: string;
  toggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-black/[0.05] hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
    >
      <span className="text-lg leading-none">
        {theme === "dark" ? "☼" : "◐"}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────────── */

function Hero({ onDemo }: { onDemo: () => void }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#FAF9FC] pt-[72px] dark:bg-[#0F0B1A]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.14),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(6,182,212,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(6,182,212,0.10),transparent_28%)]" />

      <div className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-2xl"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DCD4EA] bg-white/70 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#5B21B6] dark:border-white/10 dark:bg-white/5 dark:text-purple-300">
              AI education for schools
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-7 text-5xl font-black leading-[0.98] tracking-[-0.045em] text-[#1E1B4B] dark:text-white sm:text-6xl lg:text-[68px]"
          >
            AI is already in your students&apos; lives.
            <span className="mt-2 block text-[#5B21B6] dark:text-purple-400">
              Bring it into your classroom properly.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-xl text-base leading-7 text-[#625F73] dark:text-slate-400 sm:text-lg"
          >
            Hammet gives your school a complete AI curriculum for JSS1 to
            JSS3, delivered through the platform, so you don&apos;t have to
            hire, retrain or hope.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9">
            <DemoButton onClick={onDemo} large />
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-[#777287] dark:text-slate-500"
          >
            <span>JSS1–JSS3</span>
            <span>3-year curriculum</span>
            <span>Platform delivered</span>
          </motion.div>
        </motion.div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-[560px]"
    >
      <div className="relative aspect-square">
        <div className="absolute inset-[8%] rounded-[40px] bg-[#3B0764] shadow-2xl shadow-[#3B0764]/25" />

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[12%] top-[15%] w-[58%] rounded-2xl border border-white/10 bg-white/[0.09] p-5 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-purple-200">
              Curriculum
            </span>

            <span className="rounded-full bg-cyan-400/15 px-2 py-1 text-[9px] font-bold text-cyan-300">
              3 YEARS
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {["Why AI", "How AI Works", "AI in Society", "AI in Practice"].map(
              (item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.07] px-3 py-2.5"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/15 text-[10px] font-bold text-cyan-300">
                    {index + 1}
                  </span>

                  <span className="text-xs font-medium text-white/90">
                    {item}
                  </span>
                </div>
              )
            )}
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 9, 0], rotate: [0, 1, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[13%] right-[5%] w-[52%] rounded-2xl border border-[#DDD5ED] bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#181329]"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEE8FA] dark:bg-purple-500/10">
              <Eye size={15} className="text-[#5B21B6] dark:text-purple-300" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B8798] dark:text-slate-500">
                Student progress
              </p>

              <p className="text-sm font-bold text-[#1E1B4B] dark:text-white">
                JSS2 · Term 2
              </p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#ECEAF0] dark:bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "72%" }}
              transition={{ duration: 1, delay: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
            />
          </div>

          <div className="mt-3 flex justify-between text-[10px] font-medium text-[#777287] dark:text-slate-500">
            <span>18 modules completed</span>
            <span>72%</span>
          </div>
        </motion.div>

        <div className="absolute right-[10%] top-[7%] h-16 w-16 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="absolute bottom-[8%] left-[10%] h-20 w-20 rounded-full bg-violet-500/25 blur-3xl" />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PARENT
───────────────────────────────────────────────────────────── */

function ParentSection() {
  return (
    <section
      id="why"
      className="border-y border-[#E9E5F2] bg-white px-5 py-24 dark:border-white/10 dark:bg-[#151020] lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <SectionEyebrow>For the parent who asks</SectionEyebrow>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] text-[#1E1B4B] dark:text-white sm:text-4xl">
            &ldquo;Does your school teach AI?&rdquo;
          </h2>
        </div>

        <div className="border-l-2 border-[#7C3AED] pl-7 dark:border-purple-500 lg:pl-10">
          <p className="max-w-2xl text-xl font-medium leading-9 text-[#4D4960] dark:text-slate-300 sm:text-2xl">
            Parents are starting to ask whether your school teaches AI.
            <span className="font-bold text-[#1E1B4B] dark:text-white">
              {" "}
              Now you have an answer, with a full curriculum behind it.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCHOOL GETS
───────────────────────────────────────────────────────────── */

function SchoolGets() {
  const items = [
    {
      icon: GraduationCap,
      number: "01",
      title: "A full three-year curriculum.",
      text: "Three terms a year, ten active weeks a term, across four strands: Why AI, How AI Works, AI in Society and AI in Practice.",
    },
    {
      icon: Sparkles,
      number: "02",
      title: "Lessons led by the platform.",
      text: "Your teachers don't need to be AI experts.",
    },
    {
      icon: Eye,
      number: "03",
      title: "Progress you can see.",
      text: "Know which modules each student has completed, approved or had flagged.",
    },
    {
      icon: Database,
      number: "04",
      title: "Student data stays with your school.",
      text: "Your student data remains under your school's control, in line with the NDPA 2023.",
    },
    {
      icon: Network,
      number: "05",
      title: "Built for patchy networks.",
      text: "A bad connection doesn't have to end the lesson.",
    },
  ];

  return (
    <section
      id="school-gets"
      className="relative overflow-hidden bg-[#F1EEFA] px-5 py-28 dark:bg-[#100C1B] lg:px-8"
    >
      <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-[#7C3AED]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <SectionEyebrow>What your school gets</SectionEyebrow>

          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#1E1B4B] dark:text-white sm:text-5xl">
            A curriculum your school can actually run.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-[#DDD6EA] bg-[#DDD6EA] dark:border-white/10 dark:bg-white/10 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.06 }}
                className="group bg-[#FAF9FC] p-7 transition-colors hover:bg-white dark:bg-[#171329] dark:hover:bg-[#1D1830] lg:p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B0764] text-white transition-transform duration-300 group-hover:scale-105">
                    <Icon size={17} />
                  </div>

                  <span className="text-xs font-bold text-[#A29DAF] dark:text-slate-600">
                    {item.number}
                  </span>
                </div>

                <h3 className="mt-7 text-lg font-extrabold tracking-tight text-[#1E1B4B] dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#706B7C] dark:text-slate-400">
                  {item.text}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   LEVELS
───────────────────────────────────────────────────────────── */

function Levels({ onDemo }: { onDemo: () => void }) {
  const levels = [
    {
      name: "Spark",
      subtitle: "AI Awareness",
      price: "₦25,000",
      suffix: "per term",
      description:
        "A straightforward starting point for bringing AI into school.",
      accent: "bg-[#EEE8FA] dark:bg-purple-500/10",
      text: "text-[#5B21B6] dark:text-purple-300",
    },
    {
      name: "Academy",
      subtitle: "AI Competence",
      price: "₦5,000",
      suffix: "per student, per term",
      description: "Build practical AI competence across your students.",
      accent: "bg-[#E6F8FB] dark:bg-cyan-500/10",
      text: "text-[#0891B2] dark:text-cyan-300",
    },
    {
      name: "Premier",
      subtitle: "AI Application",
      price: "₦25,000 + ₦12,000",
      suffix: "per student, per term",
      description: "Adds career pathways for Science, Arts and Commerce.",
      accent: "bg-[#EEE8FA] dark:bg-purple-500/10",
      text: "text-[#5B21B6] dark:text-purple-300",
      featured: true,
    },
    {
      name: "Global",
      subtitle: "AI Talent",
      price: "₦50,000 + ₦25,000",
      suffix: "per student, per term",
      description:
        "Adds the Fellowship, AI in Entrepreneurship and study abroad support.",
      accent: "bg-[#E6F8FB] dark:bg-cyan-500/10",
      text: "text-[#0891B2] dark:text-cyan-300",
    },
  ];

  return (
    <section
      id="levels"
      className="bg-white px-5 py-28 dark:bg-[#151020] lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <SectionEyebrow>Choose your level</SectionEyebrow>

            <h2 className="mt-4 max-w-xl text-4xl font-black tracking-[-0.04em] text-[#1E1B4B] dark:text-white sm:text-5xl">
              Start where your school is.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-6 text-[#706B7C] dark:text-slate-400 lg:text-right">
            Not sure which fits? Tell us your class size and we&apos;ll point
            you to one.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-4">
          {levels.map((level, index) => (
            <motion.article
              key={level.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              className={`relative flex min-h-[380px] flex-col overflow-hidden rounded-3xl border bg-white p-7 transition-transform duration-300 hover:-translate-y-1 dark:bg-[#171329] ${
                level.featured
                  ? "border-[#5B21B6] shadow-xl shadow-[#5B21B6]/10 dark:border-purple-500"
                  : "border-[#E5E1EC] dark:border-white/10"
              }`}
            >
              {level.featured && (
                <span className="absolute right-5 top-5 rounded-full bg-[#5B21B6] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                  Application
                </span>
              )}

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${level.accent}`}
              >
                <span className={`text-sm font-black ${level.text}`}>
                  {index + 1}
                </span>
              </div>

              <p
                className={`mt-7 text-xs font-bold uppercase tracking-[0.14em] ${level.text}`}
              >
                {level.subtitle}
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-[#1E1B4B] dark:text-white">
                {level.name}
              </h3>

              <div className="mt-7">
                <p className="text-xl font-black tracking-tight text-[#1E1B4B] dark:text-white">
                  {level.price}
                </p>

                <p className="mt-1 text-xs text-[#888394] dark:text-slate-500">
                  {level.suffix}
                </p>
              </div>

              <p className="mt-6 text-sm leading-6 text-[#706B7C] dark:text-slate-400">
                {level.description}
              </p>

              <button
                type="button"
                onClick={onDemo}
                className={`mt-auto flex items-center gap-1.5 pt-7 text-sm font-bold transition-all hover:gap-2.5 ${level.text}`}
              >
                Talk to us
                <ArrowRight size={15} />
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   TRUST
───────────────────────────────────────────────────────────── */

function TrustSection() {
  return (
    <section className="border-y border-[#E9E5F2] bg-[#F7F5FB] px-5 py-12 dark:border-white/10 dark:bg-[#100C1B] lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-[#5B21B6] dark:text-purple-300" />

          <p className="text-sm font-medium text-[#625F73] dark:text-slate-400">
            In partnership with{" "}
            <span className="font-bold text-[#1E1B4B] dark:text-white">
              NAPPS Oyo State
            </span>
          </p>
        </div>

        <p className="text-xs text-[#8A8596] dark:text-slate-500">
          Built for schools. Designed for the realities of the classroom.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   FINAL CTA
───────────────────────────────────────────────────────────── */

function FinalCTA({ onDemo }: { onDemo: () => void }) {
  return (
    <section className="relative overflow-hidden bg-[#3B0764] px-5 py-28 lg:px-8">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-400/15 blur-3xl" />
      <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
          See Hammet in action
        </p>

        <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
          See what one term
          <br />
          looks like.
        </h2>

        <p className="mt-6 max-w-xl text-base leading-7 text-purple-200">
          Book a demo and we&apos;ll walk you through the platform, one term
          at a time.
        </p>

        <div className="mt-9">
          <DemoButton onClick={onDemo} large light />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   CALLBACK MODAL
───────────────────────────────────────────────────────────── */

function CallbackModal({ onClose }: { onClose: () => void }) {
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
  const [error, setError] = useState("");

  function set(key: keyof FormData, value: string) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const success = await sendCallback(form);

      if (success) {
        setSubmitted(true);
      }
    } catch {
      setError("We couldn't send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171329]/70 p-4 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="callback-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-[#FAF9FC] shadow-2xl dark:bg-[#151020]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-[#625F73] transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
        >
          <X size={17} />
        </button>

        <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
          <div className="relative hidden overflow-hidden bg-[#3B0764] p-8 lg:block">
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex h-full flex-col">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                For schools
              </p>

              <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.035em] text-white">
                Let&apos;s talk about your school.
              </h2>

              <p className="mt-5 text-sm leading-6 text-purple-200">
                Tell us a little about your school and a member of the Hammet
                team will get in touch.
              </p>

              <div className="mt-auto pt-12">
                {[
                  "30-student pilot — no commitment required",
                  "Onboarding completed in under 2 hours",
                  "No AI expertise needed from your staff",
                  "Dedicated Hammet Ltd contact",
                  "Curriculum delivered term-by-term",
                ].map((point) => (
                  <div
                    key={point}
                    className="mb-4 flex items-start gap-2.5"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15">
                      <Check
                        size={11}
                        className="text-cyan-300"
                        strokeWidth={3}
                      />
                    </span>

                    <p className="text-xs leading-5 text-purple-100">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-9">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[500px] flex-col items-center justify-center text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#06B6D4]/12">
                    <Check
                      size={25}
                      className="text-[#0891B2] dark:text-cyan-300"
                      strokeWidth={2.5}
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-black text-[#1E1B4B] dark:text-white">
                    Request received
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#706B7C] dark:text-slate-400">
                    We&apos;ll be in touch within 24 hours.
                  </p>

                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-7 rounded-xl bg-[#3B0764] px-5 py-3 text-sm font-bold text-white hover:bg-[#4C0A80]"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3.5"
                >
                  <div className="mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5B21B6] dark:text-purple-300">
                      Book a school demo
                    </p>

                    <h2
                      id="callback-title"
                      className="mt-2 text-2xl font-black tracking-tight text-[#1E1B4B] dark:text-white"
                    >
                      Tell us about your school
                    </h2>

                    <p className="mt-2 text-sm leading-5 text-[#777287] dark:text-slate-400">
                      A member of our team will contact you within 24 hours.
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                      {error}
                    </div>
                  )}

                  <input
                    required
                    type="text"
                    placeholder="School name"
                    value={form.schoolName}
                    onChange={(e) => set("schoolName", e.target.value)}
                    className={modalInput}
                  />

                  <input
                    required
                    type="text"
                    placeholder="Your full name"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    className={modalInput}
                  />

                  <input
                    required
                    type="email"
                    placeholder="Your email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={modalInput}
                  />

                  <select
                    required
                    value={form.role}
                    onChange={(e) => set("role", e.target.value)}
                    className={modalInput}
                  >
                    <option value="" disabled>
                      Your role
                    </option>
                    <option>Proprietor</option>
                    <option>Principal</option>
                    <option>Administrator</option>
                    <option>Other</option>
                  </select>

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <input
                      required
                      type="tel"
                      placeholder="Phone number"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className={modalInput}
                    />

                    <select
                      required
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      className={modalInput}
                    >
                      <option value="" disabled>
                        City
                      </option>
                      <option>Lagos</option>
                      <option>Abuja</option>
                      <option>Ibadan</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3B0764] text-sm font-bold text-white transition-colors hover:bg-[#4C0A80] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    )}

                    {submitting
                      ? "Submitting..."
                      : "Request a school demo"}
                  </motion.button>

                  <p className="pt-1 text-center text-[10.5px] leading-4 text-[#9994A4] dark:text-slate-600">
                    By submitting, you agree to be contacted by the Hammet
                    Ltd team about your school&apos;s needs.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SHARED
───────────────────────────────────────────────────────────── */

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5B21B6] dark:text-purple-300">
      {children}
    </p>
  );
}

function DemoButton({
  onClick,
  large = false,
  light = false,
}: {
  onClick: () => void;
  large?: boolean;
  light?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      className={`group inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors ${
        large ? "px-6 py-3.5 text-sm" : "px-4 py-2.5 text-xs"
      } ${
        light
          ? "bg-cyan-400 text-[#102033] hover:bg-cyan-300"
          : "bg-[#3B0764] text-white hover:bg-[#4C0A80]"
      }`}
    >
      Book a school demo
      <ArrowRight
        size={large ? 16 : 14}
        className="transition-transform group-hover:translate-x-0.5"
      />
    </motion.button>
  );
}

const modalInput =
  "h-11 w-full rounded-xl border border-[#DDD9E5] bg-white px-3.5 text-[13px] text-[#1E1B4B] outline-none transition-all placeholder:text-[#A19CAA] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 dark:border-white/10 dark:bg-[#1D1830] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-500 dark:focus:ring-purple-500/10";

function Footer() {
  return (
    <footer className="bg-[#171329] px-5 py-8 text-purple-200 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs font-medium">
          © {new Date().getFullYear()} Hammet Ltd.
        </p>

        <p className="text-xs text-purple-300">
          AI education for the next generation.
        </p>
      </div>
    </footer>
  );
}