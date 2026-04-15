"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════════
   HeroCard — unified landing v7 format with uniform chrome.
   Per DESIGN.md 2026-04-14 "rarity = data, not chrome": all cards get the
   same neutral border (--border-bolt) + same flat offset shadow. Rarity is
   signaled ONLY through the top-right stamp and footer ✦ symbols.
   ═══════════════════════════════════════════════════════════════════════════ */

export type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "myth";

export type HeroCardData = {
  id: string;
  name: string;
  hp: number;
  category: string;
  stage?: string;
  creator: string;
  rarity: Rarity;
  cardNumber: string;
  timelineStart: string;
  timelineEnd: string;
};

const RARITY_LABEL: Record<Rarity, string> = {
  common: "COMMON",
  uncommon: "UNCOMMON",
  rare: "RARE",
  epic: "EPIC",
  legendary: "LEGEND",
  myth: "MYTH",
};

const RARITY_SYMBOL: Record<Rarity, string> = {
  common: "✦",
  uncommon: "✦",
  rare: "✦",
  epic: "✦",
  legendary: "✦✦",
  myth: "✦✦✦",
};

function stampStyle(r: Rarity): React.CSSProperties {
  if (r === "myth")
    return {
      background:
        "linear-gradient(135deg, var(--neon-pink), var(--neon-purple))",
      color: "#FFF",
      boxShadow: "0 0 12px rgba(236,72,153,0.8)",
    };
  if (r === "legendary")
    return {
      background: "linear-gradient(135deg, var(--neon-yellow), #F59E0B)",
      color: "#000",
      boxShadow: "0 0 12px rgba(250,204,21,0.8)",
    };
  if (r === "epic")
    return { background: "var(--neon-orange)", color: "#FFF" };
  if (r === "rare") return { background: "var(--neon-cyan)", color: "#000" };
  if (r === "uncommon")
    return { background: "var(--neon-green)", color: "#000" };
  return { background: "#9CA3AF", color: "#000" };
}

function symColor(r: Rarity): string {
  if (r === "myth") return "transparent"; // rainbow handled via bg-clip
  if (r === "legendary") return "var(--neon-yellow)";
  if (r === "epic") return "var(--neon-orange)";
  if (r === "rare") return "var(--neon-cyan)";
  if (r === "uncommon") return "var(--neon-green)";
  return "#9CA3AF";
}

export function HeroCard({ data }: { data: HeroCardData }) {
  const mythStyle: React.CSSProperties =
    data.rarity === "myth"
      ? {
          background:
            "linear-gradient(90deg, var(--neon-pink), var(--neon-purple), var(--neon-cyan), var(--neon-yellow))",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }
      : {};

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{
        aspectRatio: "5 / 3",
        background:
          "linear-gradient(180deg, var(--bg-card) 0%, var(--bg-panel) 100%)",
        border: "2px solid var(--border-bolt)",
        boxShadow: "4px 4px 0 #000",
      }}
      whileHover={{
        x: -2,
        y: -2,
        boxShadow: "6px 6px 0 #000",
        borderColor: "rgba(255,255,255,0.18)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
    <Link
      href={`/project/${encodeURIComponent(data.id)}`}
      aria-label={`${data.name} — ${RARITY_LABEL[data.rarity]} hero card`}
      className="absolute inset-0 flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neon-yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)]"
      style={{ padding: "14px 16px" }}
    >
      {/* Rarity stamp */}
      <div
        className="absolute font-ui uppercase z-[8]"
        style={{
          top: 10,
          right: 12,
          fontSize: 8,
          padding: "4px 7px",
          letterSpacing: 1,
          border: "1px solid #FFD700",
          ...stampStyle(data.rarity),
        }}
      >
        {RARITY_LABEL[data.rarity]}
      </div>

      {/* header row: name + HP */}
      <div className="relative z-[2] flex items-start justify-between mb-[3px]">
        <div
          className="font-pixel"
          style={{
            fontSize: 11,
            color: "var(--text)",
            letterSpacing: 0.5,
            lineHeight: 1.3,
            maxWidth: "72%",
            textShadow: "0 0 6px rgba(232,232,236,0.25)",
          }}
        >
          {data.name}
        </div>
        <div
          className="font-ui text-right"
          style={{ fontSize: 8, color: "var(--text-muted)", lineHeight: 1 }}
        >
          <span>HP</span>
          <div
            className="font-pixel"
            style={{
              fontSize: 14,
              color: "#EF4444",
              lineHeight: 1.1,
              textShadow: "0 0 8px rgba(239,68,68,0.8)",
              marginTop: 3,
            }}
          >
            {data.hp}
          </div>
        </div>
      </div>

      {/* stage */}
      <div
        className="relative z-[2] font-ui"
        style={{
          fontSize: 7,
          color: "var(--text-dim)",
          letterSpacing: 1,
          marginBottom: 6,
        }}
      >
        {data.stage ?? "BASIC"}
      </div>

      {/* demo area with video chrome */}
      <div
        className="relative z-[2] flex-1 overflow-hidden"
        style={{
          background: "#0A0A0C",
          border: "1px solid var(--border-wire)",
          marginBottom: 8,
          minHeight: 110,
        }}
      >
        {/* Fallback pixel art arcade screen — sits behind everything so
            the scanlines / play button / timeline overlay on top. Cards
            that have a real demo thumbnail will replace this in a later
            pass. */}
        <Image
          src="/generated/card-fallback-v2.png"
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          aria-hidden="true"
          className="object-cover opacity-80"
          style={{ imageRendering: "pixelated" }}
        />
        {/* scanlines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
          }}
        />
        {/* play button */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            top: 8,
            left: 8,
            width: 20,
            height: 20,
            border: "1.5px solid var(--neon-yellow)",
            background: "rgba(0,0,0,0.6)",
            fontFamily: "var(--font-ui)",
            fontSize: 9,
            color: "var(--neon-yellow)",
            zIndex: 6,
          }}
        >
          ▶
        </div>
        {/* LIVE badge */}
        <div
          className="absolute flex items-center gap-1.5"
          style={{
            top: 10,
            right: 10,
            fontFamily: "var(--font-ui)",
            fontSize: 8,
            color: "var(--neon-pink)",
            letterSpacing: 1.5,
            zIndex: 6,
          }}
        >
          <motion.span
            className="inline-block"
            style={{
              width: 5,
              height: 5,
              background: "var(--neon-pink)",
              boxShadow: "0 0 5px var(--neon-pink)",
            }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 1] }}
          />
          LIVE
        </div>
        {/* ambient sparkles */}
        {[
          { top: "28%", left: "20%", color: "var(--neon-yellow)", delay: 0 },
          { top: "38%", right: "22%", color: "var(--neon-cyan)", delay: 0.6 },
          {
            bottom: "30%",
            left: "38%",
            color: "var(--neon-pink)",
            delay: 1.3,
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            aria-hidden="true"
            className="absolute z-[7]"
            style={{
              ...(s as Record<string, unknown>),
              width: 4,
              height: 4,
              background: s.color,
              boxShadow: `0 0 8px ${s.color}`,
            }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.5, 1.3, 0.5] }}
            transition={{
              duration: 2,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        {/* timeline */}
        <div
          className="absolute flex items-center gap-1.5"
          style={{ bottom: 7, left: 8, right: 8, zIndex: 6 }}
        >
          <span
            className="font-ui"
            style={{ fontSize: 7, color: "var(--neon-yellow)" }}
          >
            {data.timelineStart}
          </span>
          <div
            className="relative flex-1"
            style={{
              height: 3,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,215,0,0.4)",
            }}
          >
            <div
              className="absolute top-0 left-0 h-full"
              style={{
                width: "32%",
                background:
                  "linear-gradient(90deg, var(--neon-yellow), #FFD700)",
                boxShadow: "0 0 4px rgba(250,204,21,0.8)",
              }}
            />
          </div>
          <span
            className="font-ui"
            style={{ fontSize: 7, color: "var(--neon-yellow)" }}
          >
            {data.timelineEnd}
          </span>
        </div>
      </div>

      {/* footer info */}
      <div className="relative z-[2] flex items-center justify-between gap-2.5">
        <span
          className="font-ui"
          style={{ fontSize: 8, color: "var(--text-muted)", letterSpacing: 1 }}
        >
          by <b style={{ color: "var(--text)", fontWeight: "normal" }}>@{data.creator}</b>
        </span>
        <span
          className="font-ui"
          style={{
            fontSize: 7,
            color: "var(--neon-purple)",
            letterSpacing: 1,
            padding: "2px 5px",
            background: "rgba(157,0,255,0.12)",
            border: "1px solid rgba(157,0,255,0.4)",
          }}
        >
          {data.category}
        </span>
        <span
          className="font-pixel"
          style={{
            fontSize: 10,
            letterSpacing: 1,
            color: symColor(data.rarity),
            ...mythStyle,
          }}
        >
          {RARITY_SYMBOL[data.rarity]} #{data.cardNumber}
        </span>
      </div>
    </Link>
    </motion.div>
  );
}
