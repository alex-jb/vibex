"use client";

import { useEffect, useRef } from "react";

/**
 * Confetti — single-shot canvas burst, ~1.2s total, no deps.
 *
 * Fires once when mounted (key={trigger} forces remount to re-fire).
 * Particles use brand accents only: indigo / amber / emerald. No pink.
 * Respects prefers-reduced-motion (returns null instantly).
 */
interface Props {
  /** Number of particles. ~40 default. */
  count?: number;
}

const COLORS = ["#6366F1", "#F59E0B", "#10B981", "#E8E8EC"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRotation: number;
  life: number; // 0 → 1, dies at 1
}

export function Confetti({ count = 40 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const ox = canvas.offsetWidth / 2;
    const oy = canvas.offsetHeight / 2;

    const particles: Particle[] = Array.from({ length: count }, () => {
      const angle = (Math.random() - 0.5) * Math.PI * 1.4 - Math.PI / 2;
      const speed = 4 + Math.random() * 5;
      return {
        x: ox,
        y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * 0.3,
        life: 0,
      };
    });

    let raf = 0;
    const start = performance.now();
    const DURATION = 1200; // ms

    function frame(now: number) {
      const elapsed = now - start;
      if (elapsed > DURATION) {
        if (ctx) ctx.clearRect(0, 0, W, H);
        return;
      }
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const t = elapsed / DURATION;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // gravity
        p.vx *= 0.985; // air drag
        p.rotation += p.vRotation;
        p.life = t;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, 1 - t * 1.15);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(raf);
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}
