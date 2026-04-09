"use client";

import { useMemo } from "react";
import { BootSequence } from "@/components/home/boot-sequence";

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE — terminal boot sequence only
   Click LAUNCH inside the terminal to enter the app at /home
   ═══════════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const communityStats = useMemo(
    () => [] as { label: string; value: string; color: string }[],
    [],
  );

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* Scanline CRT overlay */}
      <div className="scanline-overlay" />

      {/* SECTION 1 — TERMINAL BOOT HERO (the only thing on the landing) */}
      <BootSequence communityStats={communityStats} />
    </div>
  );
}
