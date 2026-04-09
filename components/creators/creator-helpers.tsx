import { computeClass, computeAttributes } from "@/lib/rpg-utils";
import type { HeroAttributes, HeroClass, Project } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n";

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase();
}

const avatarColors = [
  "from-violet-500 to-fuchsia-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-violet-500",
  "from-fuchsia-500 to-rose-500",
  "from-teal-500 to-cyan-500",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function getBadgeConfig(t: (key: TranslationKey) => string): Record<string, { label: string; className: string }> {
  return {
    "top-creator": { label: t("creators.badgeTopCreator"), className: "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-500/30" },
    trending: { label: t("creators.badgeTrending"), className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    "remix-king": { label: t("creators.badgeRemixKing"), className: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30" },
    "weekly-winner": { label: t("creators.badgeWeeklyWinner"), className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    pioneer: { label: t("creators.badgePioneer"), className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    viral: { label: t("creators.badgeViral"), className: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  };
}

/** Compute dominant class for a creator from their projects */
export function getCreatorClass(creatorId: string, projects: Project[]): HeroClass | null {
  const cp = projects.filter((p) => p.creatorId === creatorId);
  if (cp.length === 0) return null;
  const classCounts: Record<HeroClass, number> = { Architect: 0, Artisan: 0, Enchanter: 0, Alchemist: 0, Sentinel: 0 };
  for (const p of cp) {
    classCounts[computeClass(p.category)]++;
  }
  return (Object.entries(classCounts) as [HeroClass, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

/** Get average attributes for a creator */
export function getCreatorAttributes(creatorId: string, projects: Project[]): HeroAttributes | null {
  const cp = projects.filter((p) => p.creatorId === creatorId);
  if (cp.length === 0) return null;
  const sum: HeroAttributes = { power: 0, resilience: 0, charisma: 0, wisdom: 0, agility: 0, stability: 0 };
  for (const p of cp) {
    const attrs = computeAttributes(p);
    for (const k of Object.keys(sum) as (keyof HeroAttributes)[]) {
      sum[k] += attrs[k];
    }
  }
  for (const k of Object.keys(sum) as (keyof HeroAttributes)[]) {
    sum[k] = Math.round(sum[k] / cp.length);
  }
  return sum;
}
