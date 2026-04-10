"use client";

import { motion } from "framer-motion";
import type { Project, HeroClass } from "@/lib/types";
import { SPRITE_STAGES } from "@/lib/sprite-config";

interface PetCardProps {
  project: Project;
  className?: string;
}

/**
 * Class → totem palette + emoji.
 * Each class gets a distinct tribal color scheme inspired by
 * Leaf Studio's Pokémon × Monster Hunter design.
 */
const CLASS_TOTEM: Record<HeroClass, {
  emoji: string;
  primary: string;
  secondary: string;
  accent: string;
  parchment: string;
  pattern: string;
}> = {
  Architect: {
    emoji: "\u{1F432}", // dragon
    primary: "#5B8DEF",
    secondary: "#1E3A8A",
    accent: "#FCD34D",
    parchment: "#F5E6C8",
    pattern: "#1E3A8A",
  },
  Artisan: {
    emoji: "\u{1F98A}", // fox
    primary: "#F97316",
    secondary: "#7C2D12",
    accent: "#FDE047",
    parchment: "#FEF3C7",
    pattern: "#7C2D12",
  },
  Enchanter: {
    emoji: "\u{1F985}", // eagle
    primary: "#A855F7",
    secondary: "#3B0764",
    accent: "#E879F9",
    parchment: "#F3E8FF",
    pattern: "#3B0764",
  },
  Alchemist: {
    emoji: "\u{1F40D}", // snake
    primary: "#22C55E",
    secondary: "#14532D",
    accent: "#FACC15",
    parchment: "#ECFDF5",
    pattern: "#14532D",
  },
  Sentinel: {
    emoji: "\u{1F422}", // turtle
    primary: "#06B6D4",
    secondary: "#164E63",
    accent: "#FDE047",
    parchment: "#ECFEFF",
    pattern: "#164E63",
  },
};

/**
 * Tribal pattern SVG decorations — borrowed from Aztec/Mesoamerican
 * geometric motifs. Stylized triangles, zigzags, and dots.
 */
function TribalPattern({ color }: { color: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="zigzag" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0,4 L2,2 L4,4 L6,2 L8,4" stroke={color} strokeWidth="0.5" fill="none" />
        </pattern>
        <pattern id="triangles" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <polygon points="3,0 6,6 0,6" fill={color} opacity="0.4" />
        </pattern>
      </defs>
      {/* Top border */}
      <rect x="0" y="0" width="100" height="6" fill="url(#triangles)" />
      {/* Bottom border */}
      <rect x="0" y="94" width="100" height="6" fill="url(#triangles)" transform="rotate(180 50 97)" />
      {/* Side zigzags */}
      <rect x="0" y="6" width="3" height="88" fill="url(#zigzag)" />
      <rect x="97" y="6" width="3" height="88" fill="url(#zigzag)" />
    </svg>
  );
}

/**
 * Stylized creature container with tribal patterns radiating outward.
 * Shows the class emoji at huge size with geometric decorations.
 */
function CreatureSilhouette({
  emoji,
  primary,
  secondary,
  accent,
}: {
  emoji: string;
  primary: string;
  secondary: string;
  accent: string;
}) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: "180px", height: "180px" }}>
      {/* Outer aura ring */}
      <svg className="absolute inset-0" viewBox="0 0 200 200">
        {/* Radial sun rays */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 100 + Math.cos(angle) * 60;
          const y1 = 100 + Math.sin(angle) * 60;
          const x2 = 100 + Math.cos(angle) * 90;
          const y2 = 100 + Math.sin(angle) * 90;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={primary}
              strokeWidth="3"
              strokeLinecap="square"
              opacity="0.6"
            />
          );
        })}

        {/* Inner geometric ring */}
        <circle cx="100" cy="100" r="55" fill="none" stroke={secondary} strokeWidth="3" strokeDasharray="6 4" />

        {/* Triangular accents at cardinal points */}
        {[0, 90, 180, 270].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 100 + Math.cos(rad) * 75;
          const cy = 100 + Math.sin(rad) * 75;
          return (
            <polygon
              key={deg}
              points={`${cx},${cy - 6} ${cx + 6},${cy + 4} ${cx - 6},${cy + 4}`}
              fill={accent}
              transform={`rotate(${deg + 90} ${cx} ${cy})`}
            />
          );
        })}

        {/* Background blob behind creature */}
        <circle cx="100" cy="100" r="48" fill={primary} opacity="0.15" />
        <circle cx="100" cy="100" r="48" fill="none" stroke={primary} strokeWidth="2" />
      </svg>

      {/* Creature emoji at center */}
      <motion.div
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          fontSize: "82px",
          filter: `drop-shadow(0 0 12px ${primary}) drop-shadow(0 4px 4px rgba(0,0,0,0.4))`,
          position: "relative",
          zIndex: 1,
          imageRendering: "pixelated",
        }}
      >
        {emoji}
      </motion.div>
    </div>
  );
}

/**
 * Stat bar with tribal styling
 */
function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-pixel text-[6px] w-6" style={{ color }}>{label}</span>
      <div className="flex-1 h-1.5 border" style={{ borderColor: color, background: `${color}15` }}>
        <div className="h-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="font-pixel text-[6px] w-8 text-right" style={{ color }}>{value}/{max}</span>
    </div>
  );
}

export function PetCard({ project, className = "" }: PetCardProps) {
  const hero = project.hero;
  if (!hero) return null;

  const totem = CLASS_TOTEM[hero.heroClass];
  const stage = SPRITE_STAGES[hero.evolutionStage];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, ${totem.parchment} 0%, ${totem.parchment}EE 100%)`,
        border: `4px solid ${totem.secondary}`,
        boxShadow: `0 0 0 2px ${totem.parchment}, 0 0 0 6px ${totem.secondary}, 0 8px 24px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Tribal corner decorations */}
      <TribalPattern color={totem.pattern} />

      {/* Top tag — Class name + Rarity */}
      <div
        className="absolute top-2 left-2 right-2 flex items-center justify-between px-2 py-1 z-10"
        style={{
          background: totem.secondary,
          border: `1px solid ${totem.primary}`,
        }}
      >
        <span
          className="font-pixel text-[7px] uppercase tracking-wider"
          style={{ color: totem.parchment, letterSpacing: "1px" }}
        >
          {hero.heroClass}
        </span>
        <span
          className="font-pixel text-[7px] tracking-wider"
          style={{ color: totem.accent }}
        >
          {stage.rarity}
        </span>
      </div>

      {/* Center: Creature silhouette */}
      <div className="relative flex flex-col items-center justify-center h-full pt-8 pb-20">
        <CreatureSilhouette
          emoji={totem.emoji}
          primary={totem.primary}
          secondary={totem.secondary}
          accent={totem.accent}
        />

        {/* Project name with parchment scroll feel */}
        <div className="mt-3 px-3 py-1" style={{ background: `${totem.secondary}22`, border: `1px dashed ${totem.secondary}` }}>
          <span
            className="font-pixel text-[9px] tracking-wide"
            style={{ color: totem.secondary, fontWeight: "bold" }}
          >
            {project.title.toUpperCase()}
          </span>
        </div>

        {/* Level + Stage */}
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className="font-pixel text-[8px] px-1.5 py-0.5"
            style={{
              background: totem.accent,
              color: totem.secondary,
              border: `1px solid ${totem.secondary}`,
            }}
          >
            LV.{hero.level}
          </span>
          <span className="text-base">{stage.emoji}</span>
          <span
            className="font-pixel text-[7px] uppercase tracking-wider"
            style={{ color: totem.secondary }}
          >
            {stage.label}
          </span>
        </div>
      </div>

      {/* Bottom: Stats panel */}
      <div
        className="absolute bottom-2 left-2 right-2 px-2 py-2 z-10 space-y-1"
        style={{
          background: `${totem.secondary}EE`,
          border: `1px solid ${totem.primary}`,
        }}
      >
        <StatBar label="HP" value={hero.hp} max={hero.maxHp} color={totem.accent} />
        <StatBar label="MP" value={hero.mp} max={hero.maxMp} color={totem.primary} />
        <StatBar label="EXP" value={hero.exp} max={hero.expToNextLevel} color="#A7F3D0" />
      </div>
    </div>
  );
}
