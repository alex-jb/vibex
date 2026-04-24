"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   SeasonBanner — thin "active season" strip at the top of the landing
   viewport. Codedex equivalent: their #30NitesOfCode ticker. Gives visitors
   a time-bound reason to act ("6 DAYS LEFT") rather than "whenever."

   Season 1 runs 2026-04-23 → 2026-04-30 (Product Hunt launch week). When
   the season ends the banner hides itself, no deploy needed.
   ═══════════════════════════════════════════════════════════════════════════ */

const FORGE = "#FF4500";
const CREAM = "#FFE27D";

// Season 1 end: 2026-04-30 23:59:59 UTC.
const SEASON_END_MS = Date.UTC(2026, 3, 30, 23, 59, 59);

export function SeasonBanner() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const recompute = () => {
      const ms = SEASON_END_MS - Date.now();
      if (ms <= 0) {
        setDaysLeft(0);
        return;
      }
      setDaysLeft(Math.ceil(ms / 86_400_000));
    };
    recompute();
    const t = setInterval(recompute, 60_000);
    return () => clearInterval(t);
  }, []);

  if (daysLeft === null || daysLeft === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="fixed z-[70] flex items-center justify-center gap-3"
      style={{
        top: 0,
        left: 0,
        right: 0,
        height: 18,
        fontFamily: "var(--font-press-start), monospace",
        fontSize: 8,
        letterSpacing: 2.2,
        color: "var(--text-muted)",
        borderBottom: `1px solid ${FORGE}66`,
        background: "rgba(255,69,0,0.05)",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
      aria-label={`Season 1: Launch Week. ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left.`}
    >
      <motion.span
        aria-hidden
        style={{ color: FORGE, textShadow: `0 0 4px ${FORGE}` }}
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        ⚒
      </motion.span>
      <span style={{ color: CREAM }}>SEASON 1</span>
      <span aria-hidden style={{ color: `${FORGE}88` }}>·</span>
      <span className="hidden sm:inline">LAUNCH WEEK</span>
      <span aria-hidden style={{ color: `${FORGE}88` }} className="hidden sm:inline">·</span>
      <span style={{ color: CREAM }}>
        {daysLeft} {daysLeft === 1 ? "DAY" : "DAYS"} LEFT
      </span>
      <motion.span
        aria-hidden
        style={{ color: FORGE, textShadow: `0 0 4px ${FORGE}` }}
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: 0.9 }}
      >
        ⚒
      </motion.span>
    </motion.div>
  );
}
