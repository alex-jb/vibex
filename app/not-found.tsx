"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, Compass } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   404 — GAME OVER screen (forge edition 2026-04-23).
   Swaps the v1 violet/fuchsia CTAs + violet scanlines to forge-orange and
   introduces the smith-idle mascot above the headline so the "lost" moment
   lands on a familiar face, not an abstract error. Viewport corner brackets
   stay red (error signal) + "404" stays red; everything else aligns to the
   forge palette used on /landing + /profile + /arena.
   ═══════════════════════════════════════════════════════════════════════════ */

const pixelEase = [0.22, 1, 0.36, 1] as const;

export default function NotFound() {
  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* Scanline overlay (forge-orange) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,69,0,0.06) 2px, rgba(255,69,0,0.06) 3px)",
        }}
      />

      {/* Pixel grid texture (forge-orange) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,69,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,69,0,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      {/* Background glow orbs — red error + forge ember */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-red-600/15 blur-[120px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,69,0,0.18), transparent 70%)" }}
      />

      {/* Viewport corner brackets (stay red — error signal) */}
      {(["tl", "tr", "bl", "br"] as const).map((pos) => {
        const isTop = pos.startsWith("t");
        const isLeft = pos.endsWith("l");
        return (
          <div
            key={pos}
            aria-hidden="true"
            className="pointer-events-none absolute hidden sm:block"
            style={{
              [isTop ? "top" : "bottom"]: 16,
              [isLeft ? "left" : "right"]: 16,
              width: 28,
              height: 28,
            }}
          >
            <div
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                [isLeft ? "left" : "right"]: 0,
                width: 28,
                height: 3,
                background: "#FF004D",
                boxShadow: "0 0 8px rgba(255,0,77,0.6)",
              }}
            />
            <div
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                [isLeft ? "left" : "right"]: 0,
                width: 3,
                height: 28,
                background: "#FF004D",
                boxShadow: "0 0 8px rgba(255,0,77,0.6)",
              }}
            />
          </div>
        );
      })}

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: pixelEase }}
        className="relative z-10 max-w-2xl w-full text-center"
      >
        {/* Smith-idle mascot — looks lost, introduces the empty-path moment
            with a familiar face rather than an abstract error. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: pixelEase }}
          className="mx-auto mb-4 relative"
          style={{ width: 160, height: 160 }}
        >
          <Image
            src="/generated/smith-idle.png"
            alt=""
            width={160}
            height={160}
            priority
            style={{ imageRendering: "pixelated" }}
            unoptimized
          />
          {/* Question-mark cloud above the mascot's head */}
          <div
            aria-hidden="true"
            className="absolute font-pixel"
            style={{
              top: -6,
              right: 16,
              fontSize: 20,
              color: "#FFE27D",
              textShadow: "0 0 10px rgba(255,226,125,0.85), 2px 2px 0 #000",
              animation: "pulse 1.6s ease-in-out infinite",
            }}
          >
            ?
          </div>
        </motion.div>

        {/* Error code eyebrow (forge-orange) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-6 px-3 py-1.5"
          style={{
            border: "2px solid var(--neon-orange)",
            background: "rgba(255,69,0,0.08)",
            boxShadow: "3px 3px 0 #000, 0 0 16px rgba(255,69,0,0.25)",
          }}
        >
          <span
            className="inline-block"
            style={{
              width: 6,
              height: 6,
              background: "var(--neon-orange)",
              boxShadow: "0 0 6px var(--neon-orange)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <span
            className="font-pixel"
            style={{
              fontSize: 8,
              letterSpacing: 3,
              color: "#FFE27D",
            }}
          >
            VIBEXFORGE://ERROR_404
          </span>
        </motion.div>

        {/* GAME OVER title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: pixelEase }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4"
          style={{
            fontFamily: "var(--font-pixel), monospace",
            color: "#FFF",
            lineHeight: 1.2,
            textShadow:
              "3px 3px 0 #FF004D, -2px -2px 0 rgba(255,69,0,0.6), 0 0 36px rgba(255,0,77,0.35)",
          }}
        >
          GAME OVER
        </motion.h1>

        {/* 404 big number (stays red — error signal) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
          style={{
            fontFamily: "var(--font-pixel), monospace",
            fontSize: "min(20vw, 140px)",
            lineHeight: 1,
            color: "#FF004D",
            textShadow:
              "4px 4px 0 #000, 0 0 40px rgba(255,0,77,0.6), 0 0 80px rgba(255,0,77,0.3)",
            letterSpacing: -4,
          }}
        >
          404
        </motion.div>

        {/* Terminal subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2.5 mb-8"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,69,0,0.4)",
            boxShadow: "inset 0 0 12px rgba(255,69,0,0.12)",
          }}
        >
          <span
            className="font-pixel"
            style={{
              fontSize: 9,
              color: "var(--neon-green)",
              textShadow: "0 0 6px rgba(57,255,20,0.6)",
            }}
          >
            {">"}
          </span>
          <span
            className="font-retro text-sm sm:text-base"
            style={{ color: "#E8E8EC", letterSpacing: 0.5 }}
          >
            this_level_does_not_exist{" "}
            <span style={{ color: "#FF004D" }}>×</span>
          </span>
          <span
            aria-hidden="true"
            className="inline-block"
            style={{
              width: 8,
              height: 14,
              background: "var(--neon-green)",
              marginLeft: 2,
              animation: "pulse 1s steps(2) infinite",
            }}
          />
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/">
            <button
              type="button"
              className="group flex items-center justify-center gap-2 px-5 py-3 font-pixel text-xs tracking-wider transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--neon-orange)]/50 w-full sm:w-auto"
              style={{
                background: "var(--neon-orange)",
                border: "2px solid #FFE27D",
                boxShadow: "4px 4px 0 #000, 0 0 20px rgba(255,69,0,0.55)",
                color: "#0A0A0C",
                minHeight: "48px",
                cursor: "pointer",
              }}
            >
              <Home className="h-4 w-4" />
              BACK TO SHOWCASE
            </button>
          </Link>
          <Link href="/home">
            <button
              type="button"
              className="group flex items-center justify-center gap-2 px-5 py-3 font-pixel text-xs tracking-wider transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/50 w-full sm:w-auto"
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "2px solid var(--neon-green)",
                boxShadow: "4px 4px 0 #000, 0 0 20px rgba(57,255,20,0.4)",
                color: "var(--neon-green)",
                minHeight: "48px",
                cursor: "pointer",
              }}
            >
              <Compass className="h-4 w-4" />
              ENTER THE APP
            </button>
          </Link>
        </motion.div>

        {/* Insert coin hint (forge-orange) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-10"
        >
          <span
            className="font-pixel"
            style={{
              fontSize: 8,
              letterSpacing: 4,
              color: "rgba(255,69,0,0.75)",
              textShadow: "0 0 8px rgba(255,69,0,0.5)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            ▸ INSERT COIN TO CONTINUE ◂
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
