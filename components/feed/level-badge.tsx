"use client";

export type CreatorLevel = "Noob" | "Coder" | "Builder" | "Master" | "Legend";

const LEVEL_CONFIG: Record<CreatorLevel, { color: string; bg: string; minXp: number }> = {
  Noob: { color: "#888", bg: "#88882A", minXp: 0 },
  Coder: { color: "#39FF14", bg: "#39FF142A", minXp: 100 },
  Builder: { color: "#06B6D4", bg: "#06B6D42A", minXp: 500 },
  Master: { color: "#9D00FF", bg: "#9D00FF2A", minXp: 2000 },
  Legend: { color: "#FACC15", bg: "#FACC152A", minXp: 10000 },
};

export function xpToLevel(xp: number): CreatorLevel {
  if (xp >= 10000) return "Legend";
  if (xp >= 2000) return "Master";
  if (xp >= 500) return "Builder";
  if (xp >= 100) return "Coder";
  return "Noob";
}

interface LevelBadgeProps {
  level: CreatorLevel;
  xp?: number;
}

export function LevelBadge({ level, xp }: LevelBadgeProps) {
  const config = LEVEL_CONFIG[level];

  return (
    <span
      className="font-pixel"
      title={xp != null ? `${xp} XP` : undefined}
      style={{
        fontSize: 6,
        color: config.color,
        background: config.bg,
        padding: "1px 5px",
        marginLeft: 4,
        verticalAlign: "middle",
        letterSpacing: 0.5,
      }}
    >
      Lv.{level}
    </span>
  );
}
