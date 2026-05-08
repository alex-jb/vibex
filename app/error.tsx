"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw, Home, Bug } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

/* ═══════════════════════════════════════════════════════════════════════════
   Global error boundary — arcade "SYSTEM ERROR" screen.
   Captures exception to Sentry, then shows retro CRT failure state with
   retry + home + report actions.
   ═══════════════════════════════════════════════════════════════════════════ */

const pixelEase = [0.22, 1, 0.36, 1] as const;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4"
      style={{ background: "var(--bg-deep)" }}
      role="alert"
      aria-live="assertive"
    >
      {/* Scanline overlay — more intense than usual to sell the "CRT fault" */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,165,0,0.07) 2px, rgba(255,165,0,0.07) 3px)",
        }}
      />

      {/* Flicker glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(249,115,22,0.12) 0%, transparent 60%)",
        }}
        animate={{ opacity: [0.4, 0.8, 0.4, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: pixelEase }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Retro error card */}
        <div
          className="relative p-6 sm:p-8"
          style={{
            background:
              "linear-gradient(180deg, #1a0000 0%, #2a0505 50%, #1a0000 100%)",
            border: "3px solid #F97316",
            boxShadow:
              "0 0 0 1px #000, 0 0 0 5px #2a0505, 0 0 40px rgba(249,115,22,0.35), 0 12px 40px rgba(0,0,0,0.8)",
          }}
        >
          {/* Top warning strip */}
          <div
            className="flex items-center justify-between mb-6 px-3 py-1.5"
            style={{
              background:
                "repeating-linear-gradient(-45deg, #F97316, #F97316 8px, #1a0000 8px, #1a0000 16px)",
              border: "1px solid #FFB000",
            }}
          >
            <span
              className="font-pixel"
              style={{
                fontSize: 8,
                letterSpacing: 2,
                color: "#FFF",
                textShadow: "1px 1px 0 #000",
              }}
            >
              ⚠ SYSTEM FAULT
            </span>
            <span
              className="font-pixel"
              style={{
                fontSize: 8,
                letterSpacing: 2,
                color: "#FFF",
                textShadow: "1px 1px 0 #000",
              }}
            >
              CODE 0x01
            </span>
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1] }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center mb-4"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              fontSize: "clamp(24px, 7vw, 48px)",
              color: "#FFF",
              textShadow:
                "3px 3px 0 #F97316, -2px -2px 0 rgba(255,255,0,0.4), 0 0 24px rgba(249,115,22,0.6)",
              lineHeight: 1.2,
            }}
          >
            SYSTEM ERROR
          </motion.h1>

          {/* Terminal message */}
          <div
            className="mb-6 p-3 sm:p-4"
            style={{
              background: "rgba(0,0,0,0.7)",
              border: "1px solid rgba(249,115,22,0.4)",
              boxShadow: "inset 0 0 20px rgba(249,115,22,0.08)",
            }}
          >
            <div className="flex items-start gap-2">
              <span
                className="font-pixel shrink-0"
                style={{
                  fontSize: 9,
                  color: "#F97316",
                  marginTop: 2,
                  textShadow: "0 0 6px rgba(249,115,22,0.6)",
                }}
              >
                {">"}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="font-retro text-sm sm:text-base break-words"
                  style={{ color: "#FFB8A3", letterSpacing: 0.5, lineHeight: 1.5 }}
                >
                  {error.message || "unknown_exception_thrown"}
                </p>
                {error.digest && (
                  <p
                    className="font-pixel mt-2"
                    style={{ fontSize: 6, color: "#8B5A3C", letterSpacing: 1 }}
                  >
                    DIGEST: {error.digest}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={reset}
              className="group flex items-center justify-center gap-2 px-4 py-3 font-pixel transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/50"
              style={{
                background:
                  "linear-gradient(135deg, var(--neon-green), #22C55E)",
                border: "2px solid #FFF",
                boxShadow: "3px 3px 0 #000, 0 0 16px rgba(57,255,20,0.4)",
                color: "#0A2500",
                minHeight: "48px",
                fontSize: 9,
                letterSpacing: 1.5,
                cursor: "pointer",
              }}
            >
              <RotateCcw className="h-4 w-4" />
              RETRY
            </button>
            <Link href="/home">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 font-pixel transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/50"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "2px solid var(--neon-purple)",
                  boxShadow: "3px 3px 0 #000, 0 0 16px rgba(157,0,255,0.3)",
                  color: "#E9BDFF",
                  minHeight: "48px",
                  fontSize: 9,
                  letterSpacing: 1.5,
                  cursor: "pointer",
                }}
              >
                <Home className="h-4 w-4" />
                HOME
              </button>
            </Link>
            <a
              href={`mailto:support@vibexforge.com?subject=Bug%20Report&body=${encodeURIComponent(
                `Error: ${error.message}\nDigest: ${error.digest || "n/a"}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 font-pixel transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/50"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "2px solid #F97316",
                  boxShadow: "3px 3px 0 #000, 0 0 16px rgba(249,115,22,0.3)",
                  color: "#FFB8A3",
                  minHeight: "48px",
                  fontSize: 9,
                  letterSpacing: 1.5,
                  cursor: "pointer",
                }}
              >
                <Bug className="h-4 w-4" />
                REPORT
              </button>
            </a>
          </div>

          {/* Footer hint */}
          <div className="mt-6 text-center">
            <span
              className="font-pixel"
              style={{
                fontSize: 7,
                letterSpacing: 3,
                color: "rgba(249,115,22,0.5)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              ▸ PRESS RETRY TO CONTINUE ◂
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
