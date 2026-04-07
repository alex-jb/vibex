"use client";

import { motion } from "framer-motion";
import type { BuddyType } from "@/lib/buddy-system";
import { RARITY_CONFIG } from "@/lib/buddy-system";

interface BuddyCardProps {
  buddy: BuddyType;
  owned: boolean;
  active?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { card: 120, emoji: 28, name: 7, badge: 6 },
  md: { card: 160, emoji: 40, name: 8, badge: 7 },
  lg: { card: 200, emoji: 56, name: 10, badge: 8 },
};

export function BuddyCard({ buddy, owned, active = false, size = "md" }: BuddyCardProps) {
  const rarity = RARITY_CONFIG[buddy.rarity];
  const s = sizeMap[size];

  return (
    <motion.div
      whileHover={owned ? { scale: 1.04, y: -2 } : undefined}
      style={{
        width: s.card,
        minHeight: s.card + 40,
        border: active
          ? "3px solid #FFD700"
          : `2px solid ${owned ? rarity.color : "#2A2A30"}`,
        background: owned ? `${rarity.color}08` : "#111114",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        position: "relative",
        cursor: owned ? "pointer" : "default",
        filter: owned ? "none" : "grayscale(1) brightness(0.4)",
        boxShadow: active
          ? "0 0 20px rgba(255,215,0,0.3), inset 0 0 12px rgba(255,215,0,0.08)"
          : owned && rarity.glow
            ? `0 0 12px ${rarity.color}20`
            : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Active badge */}
      {active && (
        <div
          className="font-pixel"
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 6,
            color: "#0D0D0D",
            background: "#FFD700",
            padding: "2px 8px",
            whiteSpace: "nowrap",
            zIndex: 2,
          }}
        >
          当前伙伴
        </div>
      )}

      {/* Emoji sprite */}
      <motion.div
        animate={owned ? { y: [0, -3, 0] } : undefined}
        transition={owned ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
        style={{
          fontSize: s.emoji,
          lineHeight: 1,
          marginTop: active ? 6 : 0,
        }}
      >
        {owned ? buddy.emoji : "❓"}
      </motion.div>

      {/* Name */}
      <span
        className="font-pixel"
        style={{
          fontSize: s.name,
          color: owned ? "#E8E8EC" : "#555",
          textAlign: "center",
        }}
      >
        {owned ? buddy.name : "???"}
      </span>

      {/* Rarity badge */}
      <span
        className="font-pixel"
        style={{
          fontSize: s.badge,
          color: owned ? rarity.color : "#444",
          background: owned ? `${rarity.color}15` : "#1A1A1E",
          padding: "1px 6px",
          border: `1px solid ${owned ? rarity.color + "40" : "#2A2A30"}`,
        }}
      >
        {owned ? rarity.labelZh : "??"}
      </span>

      {/* Element */}
      {owned && (
        <span
          className="font-pixel"
          style={{ fontSize: s.badge, color: buddy.color }}
        >
          {buddy.element}
        </span>
      )}

      {/* Passive */}
      {owned && size !== "sm" && (
        <span
          className="font-pixel"
          style={{
            fontSize: 6,
            color: "#8888A0",
            textAlign: "center",
            marginTop: 2,
          }}
        >
          {buddy.passiveZh}
        </span>
      )}
    </motion.div>
  );
}
