"use client";

import { motion } from "framer-motion";
import type { BuddyType } from "@/lib/buddy-system";
import { RARITY_CONFIG } from "@/lib/buddy-system";
import { BuddySprite } from "@/components/buddy-sprite";
import { useLang } from "@/lib/i18n";

interface BuddyCardProps {
  buddy: BuddyType;
  owned: boolean;
  active?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { card: 150, name: 10, badge: 8, sprite: "sm" as const },
  md: { card: 200, name: 12, badge: 9, sprite: "md" as const },
  lg: { card: 260, name: 14, badge: 10, sprite: "lg" as const },
};

export function BuddyCard({ buddy, owned, active = false, size = "md" }: BuddyCardProps) {
  const { t } = useLang();
  const rarity = RARITY_CONFIG[buddy.rarity];
  const s = sizeMap[size];

  return (
    <motion.div
      whileHover={owned ? { scale: 1.03, y: -3 } : undefined}
      className="glass-card rounded-xl overflow-hidden"
      style={{
        width: s.card,
        border: active
          ? "2px solid #FFD700"
          : `1px solid ${owned ? rarity.color + "30" : "rgba(255,255,255,0.06)"}`,
        cursor: owned ? "pointer" : "default",
        filter: owned ? "none" : "grayscale(1) brightness(0.4)",
        boxShadow: active
          ? "0 0 24px rgba(255,215,0,0.25)"
          : owned && rarity.glow
            ? `0 0 16px ${rarity.color}15`
            : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Rarity accent bar */}
      <div
        style={{
          height: 4,
          background: owned
            ? `linear-gradient(90deg, ${rarity.color}, ${rarity.color}80)`
            : "#2A2A30",
        }}
      />

      {/* Card content */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
        {/* Active badge */}
        {active && (
          <div
            className="font-pixel"
            style={{
              position: "absolute",
              top: 4,
              right: 8,
              fontSize: 7,
              color: "#FFD700",
              background: "rgba(255,215,0,0.1)",
              padding: "2px 6px",
              borderRadius: 4,
              border: "1px solid rgba(255,215,0,0.3)",
            }}
          >
            {t("buddy.currentBuddy")}
          </div>
        )}

        {/* Pixel sprite */}
        <div style={{ marginTop: active ? 12 : 0, padding: 8 }}>
          {owned ? (
            <BuddySprite buddyTypeId={buddy.id} size={s.sprite} animated={owned} />
          ) : (
            <div style={{ fontSize: 40, lineHeight: 1, opacity: 0.3 }}>?</div>
          )}
        </div>

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

        {/* Rarity + Element row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            className="font-pixel"
            style={{
              fontSize: s.badge,
              color: owned ? rarity.color : "#444",
              background: owned ? `${rarity.color}12` : "#1A1A1E",
              padding: "2px 8px",
              borderRadius: 4,
              border: `1px solid ${owned ? rarity.color + "30" : "#2A2A30"}`,
            }}
          >
            {owned ? rarity.labelZh : "??"}
          </span>

          {owned && (
            <span style={{ fontSize: s.badge + 2, color: buddy.color }}>
              {buddy.element}
            </span>
          )}
        </div>

        {/* Passive */}
        {owned && size !== "sm" && (
          <span
            className="font-retro"
            style={{
              fontSize: 12,
              color: "#8888A0",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {buddy.passiveZh}
          </span>
        )}
      </div>
    </motion.div>
  );
}
