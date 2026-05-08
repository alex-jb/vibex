"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

/* ═══════════════════════════════════════════════════════════════════════════
   Explorer Chrome — global adventure progress strip.
   Rendered below the navbar on authed pages. Shows the player's current
   level, discovery progress, and active expedition quest at a glance.

   Inspired by codedex.io's "unlock regions / collect badges" progress
   visibility and Linear's "every pixel earns its place" discipline.
   Uses the new hairline border system (--border-hair) and Silkscreen UI
   font (font-ui) so we dogfood the 2026-04-14 Linear-inspired additions.

   Mock data for now — wiring to real supabase (user stats + quest state)
   is a follow-up. The component is positioned so future data props slot
   in without layout change.
   ═══════════════════════════════════════════════════════════════════════════ */

type ExplorerChromeProps = {
  lv?: number;
  discovered?: number;
  total?: number;
  xpCurrent?: number;
  xpToNext?: number;
  questTitle?: string;
  questProgress?: string;
  questReward?: string;
};

export function ExplorerChrome({
  lv = 12,
  discovered = 42,
  total = 250,
  xpCurrent = 2840,
  xpToNext = 6700,
  questTitle,
  questProgress = "1/3",
  questReward = "+50 XP",
}: ExplorerChromeProps) {
  const { lang } = useLang();
  const discoveryPct = Math.round((discovered / total) * 100);
  const xpPct = Math.round((xpCurrent / xpToNext) * 100);
  const labels = {
    discovered: lang === "zh" ? "已探索" : "DISCOVERED",
    xpNext: lang === "zh" ? "下级 XP" : "XP NEXT",
    quest: lang === "zh" ? "▸ 任务" : "▸ QUEST",
  };
  const defaultQuest =
    lang === "zh" ? "探索 3 个 EPIC+ 英雄" : "SCOUT 3 EPIC+ HEROES";
  const resolvedQuestTitle = questTitle ?? defaultQuest;

  return (
    <div
      className="hidden md:block"
      style={{
        borderBottom: "1px solid var(--border-hair)",
        background: "rgba(10,10,14,0.6)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        className="mx-auto flex items-center gap-5 px-4 py-1.5"
        style={{ maxWidth: 1440 }}
      >
        {/* LV badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="font-ui"
            style={{
              fontSize: 9,
              color: "var(--text-muted)",
              letterSpacing: 1.5,
            }}
          >
            ◆ LV
          </span>
          <span
            className="font-pixel"
            style={{
              fontSize: 13,
              color: "var(--neon-yellow)",
              textShadow: "0 0 6px rgba(250,204,21,0.6)",
              letterSpacing: 1,
            }}
          >
            {String(lv).padStart(2, "0")}
          </span>
        </div>

        {/* Discovery progress */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="font-ui"
            style={{
              fontSize: 9,
              color: "var(--text-muted)",
              letterSpacing: 1.5,
            }}
          >
            {labels.discovered}
          </span>
          <span
            className="font-ui"
            style={{
              fontSize: 10,
              color: "var(--text)",
              letterSpacing: 1,
            }}
          >
            {discovered}/{total}
          </span>
          <div
            className="relative"
            style={{
              width: 72,
              height: 6,
              background: "#0A0A0C",
              border: "1px solid var(--border-wire)",
            }}
          >
            <motion.div
              className="absolute top-0 left-0 h-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--neon-yellow), #F59E0B)",
                boxShadow: "0 0 6px rgba(250,204,21,0.5)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${discoveryPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span
            className="font-ui"
            style={{
              fontSize: 9,
              color: "var(--neon-yellow)",
              letterSpacing: 0.5,
            }}
          >
            {discoveryPct}%
          </span>
        </div>

        {/* XP to next level */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span
            className="font-ui"
            style={{
              fontSize: 9,
              color: "var(--text-muted)",
              letterSpacing: 1.5,
            }}
          >
            {labels.xpNext}
          </span>
          <div
            className="relative"
            style={{
              width: 72,
              height: 6,
              background: "#0A0A0C",
              border: "1px solid var(--border-wire)",
            }}
          >
            <motion.div
              className="absolute top-0 left-0 h-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--neon-purple), #C026D3)",
                boxShadow: "0 0 6px rgba(157,0,255,0.5)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            />
          </div>
          <span
            className="font-ui"
            style={{
              fontSize: 9,
              color: "var(--text-muted)",
              letterSpacing: 0.5,
            }}
          >
            {xpCurrent.toLocaleString()}/{xpToNext.toLocaleString()}
          </span>
        </div>

        {/* Quest hint — takes remaining space, right-aligned */}
        <div className="hidden lg:flex items-center gap-3 ml-auto min-w-0">
          <span
            className="font-ui"
            style={{
              fontSize: 9,
              color: "var(--neon-green)",
              letterSpacing: 1.5,
              textShadow: "0 0 4px rgba(57,255,20,0.5)",
            }}
          >
            {labels.quest}
          </span>
          <span
            className="font-ui truncate"
            style={{
              fontSize: 10,
              color: "var(--text)",
              letterSpacing: 1,
            }}
          >
            {resolvedQuestTitle}
          </span>
          <span
            className="font-ui shrink-0"
            style={{
              fontSize: 10,
              color: "var(--neon-pink)",
              letterSpacing: 0.5,
            }}
          >
            {questProgress}
          </span>
          <span
            className="font-ui shrink-0"
            style={{
              fontSize: 9,
              color: "var(--neon-green)",
              letterSpacing: 0.5,
            }}
          >
            {questReward}
          </span>
        </div>
      </div>
    </div>
  );
}
