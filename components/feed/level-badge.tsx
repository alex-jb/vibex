"use client";

// ═══════════════════════════════════════════════════════════════
// 50-LEVEL CREATOR PROGRESSION SYSTEM
//
//   Lv.1-5    Apprentice    #888
//   Lv.6-10   Novice        #39FF14
//   Lv.11-15  Junior        #06B6D4
//   Lv.16-20  Intermediate  #06B6D4
//   Lv.21-25  Advanced      #9D00FF
//   Lv.26-30  Senior        #9D00FF
//   Lv.31-35  Expert        #F97316
//   Lv.36-40  Master        #F97316
//   Lv.41-45  Grandmaster   #FACC15
//   Lv.46-50  Legend         #FACC15
// ═══════════════════════════════════════════════════════════════

export type CreatorLevel = "Noob" | "Coder" | "Builder" | "Master" | "Legend";

interface LevelInfo {
  numericLevel: number;
  title: string;
  titleZh: string;
  tier: CreatorLevel;
  color: string;
  bg: string;
  xpForCurrent: number;
  xpForNext: number;
  progress: number; // 0-1
}

// XP curve: each level requires progressively more XP
function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(20 * level * level + 30 * level);
}

const TIER_TITLES: { maxLevel: number; tier: CreatorLevel; title: string; titleZh: string; color: string }[] = [
  { maxLevel: 5, tier: "Noob", title: "Apprentice", titleZh: "Apprentice", color: "#888" },
  { maxLevel: 10, tier: "Noob", title: "Novice", titleZh: "Novice", color: "#39FF14" },
  { maxLevel: 15, tier: "Coder", title: "Junior", titleZh: "Junior", color: "#06B6D4" },
  { maxLevel: 20, tier: "Coder", title: "Intermediate", titleZh: "Intermediate", color: "#06B6D4" },
  { maxLevel: 25, tier: "Builder", title: "Advanced", titleZh: "Advanced", color: "#9D00FF" },
  { maxLevel: 30, tier: "Builder", title: "Senior", titleZh: "Senior", color: "#9D00FF" },
  { maxLevel: 35, tier: "Master", title: "Expert", titleZh: "Expert", color: "#F97316" },
  { maxLevel: 40, tier: "Master", title: "Master", titleZh: "Master", color: "#F97316" },
  { maxLevel: 45, tier: "Legend", title: "Grandmaster", titleZh: "Grandmaster", color: "#FACC15" },
  { maxLevel: 50, tier: "Legend", title: "Legend", titleZh: "Legend", color: "#FACC15" },
];

export function computeLevelInfo(xp: number): LevelInfo {
  let level = 1;
  while (level < 50 && xpForLevel(level + 1) <= xp) {
    level++;
  }

  const currentXp = xpForLevel(level);
  const nextXp = xpForLevel(Math.min(level + 1, 50));
  const progress = nextXp > currentXp ? (xp - currentXp) / (nextXp - currentXp) : 1;

  const tierInfo = TIER_TITLES.find((t) => level <= t.maxLevel) ?? TIER_TITLES[TIER_TITLES.length - 1];

  return {
    numericLevel: level,
    title: tierInfo.title,
    titleZh: tierInfo.titleZh,
    tier: tierInfo.tier,
    color: tierInfo.color,
    bg: tierInfo.color + "2A",
    xpForCurrent: currentXp,
    xpForNext: nextXp,
    progress: Math.min(1, Math.max(0, progress)),
  };
}

// Backward compat
export function xpToLevel(xp: number): CreatorLevel {
  return computeLevelInfo(xp).tier;
}

// ─── Components ───

interface LevelBadgeProps {
  level?: CreatorLevel;
  xp?: number;
  showProgress?: boolean;
}

export function LevelBadge({ xp, showProgress = false }: LevelBadgeProps) {
  const info = computeLevelInfo(xp ?? 0);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, marginLeft: 4, verticalAlign: "middle" }}>
      <span
        className="font-pixel"
        title={`${info.title} — ${xp ?? 0} XP`}
        style={{
          fontSize: 6,
          color: info.color,
          background: info.bg,
          padding: "1px 5px",
          letterSpacing: 0.5,
        }}
      >
        Lv.{info.numericLevel} {info.title}
      </span>
      {showProgress && (
        <span style={{ display: "inline-block", width: 24, height: 4, background: "#1A1A1E", verticalAlign: "middle" }}>
          <span style={{ display: "block", width: `${info.progress * 100}%`, height: "100%", background: info.color }} />
        </span>
      )}
    </span>
  );
}
