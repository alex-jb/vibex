"use client";

import { motion } from "framer-motion";
import type { PixelBadge as PixelBadgeType } from "@/lib/types";

interface PixelBadgeProps {
  badge: PixelBadgeType;
  size?: "sm" | "md";
  className?: string;
}

const RARITY_COLORS = {
  common: { border: "oklch(0.5 0 0)", bg: "oklch(0.15 0 0)", glow: "none" },
  uncommon: { border: "#22c55e", bg: "#22c55e10", glow: "0 0 8px #22c55e30" },
  rare: { border: "#3b82f6", bg: "#3b82f610", glow: "0 0 12px #3b82f640" },
  legendary: { border: "#facc15", bg: "#facc1510", glow: "0 0 16px #facc1550" },
};

export function PixelBadge({
  badge,
  size = "md",
  className = "",
}: PixelBadgeProps) {
  const rarity = RARITY_COLORS[badge.rarity];
  const dim = size === "sm" ? 32 : 44;

  return (
    <motion.div
      className={`relative inline-flex flex-col items-center gap-1 ${className}`}
      whileHover={{ scale: 1.1 }}
      title={`${badge.name} — ${badge.description}`}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: dim,
          height: dim,
          border: `2px solid ${rarity.border}`,
          background: rarity.bg,
          boxShadow: rarity.glow,
          imageRendering: "pixelated",
        }}
      >
        <span style={{ fontSize: dim * 0.5 }}>{badge.icon}</span>
      </div>
      {size === "md" && (
        <span className="font-pixel text-[6px] text-muted-foreground text-center leading-tight max-w-[52px]">
          {badge.name}
        </span>
      )}
    </motion.div>
  );
}
