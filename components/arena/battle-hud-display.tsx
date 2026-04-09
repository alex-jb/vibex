"use client";

import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { CLASS_CONFIG, EVOLUTION_CONFIG } from "@/lib/rpg-utils";

/* ─── Pixel HP Bar ─── */
function PixelBar({
  label,
  value,
  max,
  type,
}: {
  label: string;
  value: number;
  max: number;
  type: "hp" | "mp" | "exp";
}) {
  const pct = Math.min(100, (value / max) * 100);
  const colors = {
    hp: pct > 50 ? "#39FF14" : pct > 25 ? "#FACC15" : "#FF4500",
    mp: "#06B6D4",
    exp: "#9D00FF",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="font-pixel" style={{ fontSize: 7, color: colors[type], width: 24 }}>
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 12,
          background: "#0A0A0C",
          border: "2px solid #2A2A30",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%",
            background: colors[type],
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(90deg, transparent 0, transparent 5px, rgba(0,0,0,0.3) 5px, rgba(0,0,0,0.3) 7px)",
            }}
          />
        </motion.div>
      </div>
      <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0", width: 55, textAlign: "right" }}>
        {value}/{max}
      </span>
    </div>
  );
}

/* ─── Fighter Panel (Pokemon Battle Style) ─── */
export function FighterPanel({
  project,
  side,
  isAttacking,
}: {
  project: Project;
  side: "left" | "right";
  isAttacking?: boolean;
}) {
  const hero = project.hero!;
  const cls = CLASS_CONFIG[hero.heroClass];
  const evo = EVOLUTION_CONFIG[hero.evolutionStage];

  return (
    <div style={{ textAlign: side === "right" ? "right" : "left" }}>
      {/* Name + Level */}
      <div
        style={{
          display: "flex",
          alignItems: side === "right" ? "flex-end" : "flex-start",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {side === "left" && (
            <span className="font-pixel" style={{ fontSize: 10, color: "#E8E8EC" }}>
              {project.title}
            </span>
          )}
          <span
            className="font-pixel"
            style={{
              fontSize: 8,
              color: "#000",
              background: cls.color,
              padding: "2px 6px",
              fontWeight: "bold",
            }}
          >
            Lv{hero.level}
          </span>
          {side === "right" && (
            <span className="font-pixel" style={{ fontSize: 10, color: "#E8E8EC" }}>
              {project.title}
            </span>
          )}
        </div>

        <span className="font-pixel" style={{ fontSize: 7, color: cls.color, textShadow: "0 0 4px rgba(0,0,0,0.9)" }}>
          {hero.heroClass} · {evo.label}
        </span>
      </div>

      {/* HP/MP bars */}
      <div style={{ marginTop: 8, maxWidth: 280 }}>
        <PixelBar label="HP" value={hero.hp} max={hero.maxHp} type="hp" />
        <div style={{ height: 3 }} />
        <PixelBar label="MP" value={hero.mp} max={hero.maxMp} type="mp" />
      </div>

      {/* Sprite area */}
      <motion.div
        animate={
          isAttacking
            ? { x: side === "left" ? [0, 20, 0] : [0, -20, 0] }
            : { y: [0, -4, 0] }
        }
        transition={
          isAttacking
            ? { duration: 0.3, ease: "easeInOut" }
            : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          width: 64,
          height: 64,
          margin: side === "right" ? "12px 0 0 auto" : "12px 0 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${cls.color}40`,
          background: `${cls.color}08`,
          fontSize: 32,
        }}
      >
        {hero.heroClass === "Architect" && "🏗️"}
        {hero.heroClass === "Artisan" && "🎨"}
        {hero.heroClass === "Enchanter" && "✨"}
        {hero.heroClass === "Alchemist" && "🧪"}
        {hero.heroClass === "Sentinel" && "🛡️"}
      </motion.div>
    </div>
  );
}
