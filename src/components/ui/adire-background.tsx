"use client";

/**
 * AdireBackground
 *
 * Full-viewport canvas that draws animated Adire-inspired geometric patterns
 * (hexagons, diamonds, cross-points) that breathe on their own and drift
 * subtly toward the user's cursor.
 *
 * File location: src/components/ui/adire-background.tsx
 *
 * Usage: Mount once in (auth)/layout.tsx. Position absolute, z-0.
 * Children sit above it at z-10.
 */

import { useEffect, useRef } from "react";

interface Pattern {
  type: "hex" | "diamond" | "cross";
  /** 0–1 normalised canvas position */
  x: number;
  y: number;
  /** base radius in px */
  r: number;
  /** rgba prefix, e.g. "rgba(91,33,182," */
  color: string;
  /** phase offset so shapes don't all breathe in sync */
  phase: number;
}

const PATTERNS: Pattern[] = [
  { type: "hex",     x: 0.08, y: 0.12, r: 58,  color: "rgba(91,33,182,",  phase: 0    },
  { type: "diamond", x: 0.88, y: 0.10, r: 42,  color: "rgba(6,182,212,",  phase: 1.1  },
  { type: "hex",     x: 0.92, y: 0.72, r: 66,  color: "rgba(91,33,182,",  phase: 2.3  },
  { type: "cross",   x: 0.06, y: 0.75, r: 34,  color: "rgba(245,158,11,", phase: 0.7  },
  { type: "diamond", x: 0.50, y: 0.93, r: 28,  color: "rgba(91,33,182,",  phase: 1.8  },
  { type: "cross",   x: 0.74, y: 0.42, r: 26,  color: "rgba(6,182,212,",  phase: 3.0  },
  { type: "hex",     x: 0.22, y: 0.58, r: 20,  color: "rgba(245,158,11,", phase: 2.0  },
  { type: "diamond", x: 0.60, y: 0.22, r: 32,  color: "rgba(6,182,212,",  phase: 0.4  },
  { type: "cross",   x: 0.38, y: 0.80, r: 22,  color: "rgba(91,33,182,",  phase: 1.5  },
];

export function AdireBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const target = useRef({ x: 0.5, y: 0.5 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;

    function resize() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(e: MouseEvent) {
      target.current.x = e.clientX / W;
      target.current.y = e.clientY / H;
    }
    window.addEventListener("mousemove", onMouseMove);

    // ── drawing helpers ──────────────────────────────────────────────────────

    function hexPath(cx: number, cy: number, r: number, rot: number) {
      ctx!.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + rot;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        i === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      }
      ctx!.closePath();
    }

    function diamondPath(cx: number, cy: number, r: number) {
      ctx!.beginPath();
      ctx!.moveTo(cx, cy - r);
      ctx!.lineTo(cx + r * 0.65, cy);
      ctx!.lineTo(cx, cy + r);
      ctx!.lineTo(cx - r * 0.65, cy);
      ctx!.closePath();
    }

    function drawPattern(p: Pattern, mx: number, my: number, t: number) {
      // parallax nudge toward cursor
      const nudgeX = (mx - 0.5) * 0.032 * W;
      const nudgeY = (my - 0.5) * 0.032 * H;
      const cx = p.x * W + nudgeX;
      const cy = p.y * H + nudgeY;

      // proximity glow
      const dist = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
      const hover = Math.max(0, 1 - dist * 2.8);

      // breath
      const breathe = 1 + Math.sin(t * 0.7 + p.phase) * 0.055;
      const r = p.r * breathe;
      const rot = t * 0.12 + p.phase;
      const base = 0.12 + hover * 0.22;

      ctx!.save();

      if (p.type === "hex") {
        for (let ring = 3; ring >= 1; ring--) {
          const rr = (r * ring) / 3 + hover * 6 * (ring / 3);
          hexPath(cx, cy, rr, rot);
          ctx!.strokeStyle = `${p.color}${(base * 0.65 * (4 - ring)) / 3})`;
          ctx!.lineWidth = 1 + hover * 0.6;
          ctx!.stroke();
          if (ring === 1) {
            ctx!.fillStyle = `${p.color}${base * 0.1})`;
            ctx!.fill();
          }
        }
        // corner dots
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i + rot;
          ctx!.beginPath();
          ctx!.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 2 + hover * 2, 0, Math.PI * 2);
          ctx!.fillStyle = `${p.color}${base * 1.6})`;
          ctx!.fill();
        }
      } else if (p.type === "diamond") {
        for (let ring = 3; ring >= 1; ring--) {
          diamondPath(cx, cy, (r * ring) / 3 + hover * 5 * (ring / 3));
          ctx!.strokeStyle = `${p.color}${base * 0.7})`;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
        ctx!.beginPath();
        ctx!.arc(cx, cy, 3 + hover * 3, 0, Math.PI * 2);
        ctx!.fillStyle = `${p.color}${base * 2})`;
        ctx!.fill();
      } else {
        // cross
        const lines: [number, number, number, number][] = [
          [cx - r, cy, cx + r, cy],
          [cx, cy - r, cx, cy + r],
        ];
        lines.forEach(([x1, y1, x2, y2]) => {
          ctx!.beginPath();
          ctx!.moveTo(x1, y1);
          ctx!.lineTo(x2, y2);
          ctx!.strokeStyle = `${p.color}${base * 0.9})`;
          ctx!.lineWidth = 1 + hover;
          ctx!.stroke();
        });
        const d = r * 0.65;
        const diagonals: [number, number, number, number][] = [
          [cx - d, cy - d, cx + d, cy + d],
          [cx + d, cy - d, cx - d, cy + d],
        ];
        diagonals.forEach(([x1, y1, x2, y2]) => {
          ctx!.beginPath();
          ctx!.moveTo(x1, y1);
          ctx!.lineTo(x2, y2);
          ctx!.strokeStyle = `${p.color}${base * 0.45})`;
          ctx!.lineWidth = 0.7;
          ctx!.stroke();
        });
        for (let i = 0; i < 4; i++) {
          const a = (Math.PI / 2) * i;
          ctx!.beginPath();
          ctx!.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 2 + hover * 2, 0, Math.PI * 2);
          ctx!.fillStyle = `${p.color}${base * 1.8})`;
          ctx!.fill();
        }
      }

      ctx!.restore();
    }

    function drawConnectors(t: number) {
      for (let i = 0; i < PATTERNS.length; i++) {
        for (let j = i + 1; j < PATTERNS.length; j++) {
          const a = PATTERNS[i], b = PATTERNS[j];
          const d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
          if (d > 0.45) continue;
          const alpha = (0.45 - d) * 0.10;
          ctx!.beginPath();
          ctx!.moveTo(a.x * W, a.y * H);
          ctx!.lineTo(b.x * W, b.y * H);
          ctx!.strokeStyle = `rgba(91,33,182,${alpha})`;
          ctx!.lineWidth = 0.6;
          ctx!.stroke();
        }
      }
    }

    // ── loop ──────────────────────────────────────────────────────────────────

    let t = 0;

    function loop() {
      t += 0.016;

      // smooth mouse lerp
      mouse.current.x += (target.current.x - mouse.current.x) * 0.055;
      mouse.current.y += (target.current.y - mouse.current.y) * 0.055;

      const mx = mouse.current.x;
      const my = mouse.current.y;

      ctx!.clearRect(0, 0, W, H);

      // soft radial wash that follows cursor
      const grd = ctx!.createRadialGradient(
        mx * W, my * H, 0,
        mx * W, my * H, Math.max(W, H) * 0.65
      );
      grd.addColorStop(0, "rgba(91,33,182,0.04)");
      grd.addColorStop(1, "rgba(245,243,255,0)");
      ctx!.fillStyle = grd;
      ctx!.fillRect(0, 0, W, H);

      drawConnectors(t);
      PATTERNS.forEach((p) => drawPattern(p, mx, my, t));

      raf.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}