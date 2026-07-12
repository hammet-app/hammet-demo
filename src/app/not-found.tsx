"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Compass } from "lucide-react";

const QUIPS = [
  "Nothing here but good intentions.",
  "This page took the day off.",
  "Well, that's unfortunate.",
  "You're early. Or very, very late.",
  "This page is off the grid.",
  "The trail ends here.",
  "No page. No problem. (Okay, maybe a little problem.)",
  "Looks like a dead end.",
  "You found the void.",
  "Mission failed successfully.",
  "The page has clocked out.",
  "No luck this time.",
  "You've reached nowhere in particular.",
  "Wrong place. Right curiosity.",
  "This page blinked out of existence.",
  "Even we can't find it.",
  "The page ghosted us too.",
  "404. That's all we've got.",
  "This wasn't part of the plan.",
  "The internet misplaced something.",
  "Nothing to render here.",
  "The page has gone incognito.",
  "You zigged. The page zagged.",
  "Lost? Us too.",
  "No page beyond this point.",
  "Here be nothing.",
  "The map ends here.",
  "This URL tells tall tales.",
  "The page is somewhere else.",
  "An excellent place for absolutely nothing.",
  "Your destination has left the building.",
  "The page couldn't make it today.",
  "Looks like you outran the content.",
  "Error 404. Character development unlocked.",
  "Achievement unlocked: Missing Page.",
  "This page is experiencing an identity crisis.",
  "Not all who wander are pages.",
  "You found our secret empty page.",
  "This page failed its attendance check.",
  "The page is on an extended coffee break."
];

export default function NotFound() {
  const [driving, setDriving] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [quipIndex, setQuipIndex] = useState(
    () => Math.floor(Math.random() * QUIPS.length)
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouse({ x, y });
  };

  const cycleQuip = () => {
    setQuipIndex((prev) => (prev + 1) % QUIPS.length);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden bg-[var(--color-bg-page)] dark:bg-neutral-950 flex items-center justify-center px-6"
    >
      {/* Adire-inspired geometric layers, parallax on cursor */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07] dark:opacity-[0.1] pointer-events-none"
        style={{
          transform: `translate(${mouse.x * 20}px, ${mouse.y * 20}px)`,
          transition: "transform 0.2s ease-out",
        }}
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="adire" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="3" fill="var(--color-purple)" />
            <path
              d="M0 20 Q10 0 20 20 Q30 40 40 20"
              stroke="var(--color-purple)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M20 0 Q0 10 20 20 Q40 30 20 40"
              stroke="var(--color-cyan)"
              strokeWidth="1"
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#adire)" />
      </svg>

      {/* Second, slower-moving layer for depth */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
        style={{
          transform: `translate(${mouse.x * -12}px, ${mouse.y * -12}px)`,
          transition: "transform 0.3s ease-out",
        }}
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="adire2" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect x="25" y="25" width="10" height="10" fill="var(--color-cyan)" transform="rotate(45 30 30)" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#adire2)" />
      </svg>

      {/* Content */}
      <div className="relative z-10 max-w-lg w-full text-center">
        <p className="font-heading text-[6rem] leading-none font-bold text-[var(--color-purple)] dark:text-[var(--color-cyan)] select-none">
          404
        </p>

        <h1 className="font-heading text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mt-2 mb-3">
          Page Not Found
        </h1>

        <button
          onClick={cycleQuip}
          className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          title="Tap for another one"
        >
          <span className="italic">“{QUIPS[quipIndex]}”</span>
        </button>

        {/* Danfo bus that drives off on click */}
        <div className="relative h-16 mb-8 overflow-hidden">
          <div
            className={`absolute top-1/2 -translate-y-1/2 text-4xl transition-transform duration-[1400ms] ease-in ${
              driving ? "translate-x-[120vw]" : "translate-x-0"
            }`}
            style={{ left: "calc(50% - 20px)" }}
          >
            🚌
          </div>
        </div>

        <Link
          href="/"
          onClick={() => setDriving(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-purple)] hover:bg-[var(--color-purple-dark)] text-white text-sm font-medium px-5 py-2.5 transition-colors"
        >
          <Compass className="h-4 w-4" />
          Take me home
        </Link>
      </div>
    </div>
  );
}