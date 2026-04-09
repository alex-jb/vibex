"use client";

import { motion } from "framer-motion";
import {
  Crown,
  Medal,
  TrendingUp,
  Star,
  ChevronUp,
  Play,
  GitFork,
} from "lucide-react";
import { ClassIcon } from "@/components/rpg/class-icon";
import { useLang } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import type { HeroClass } from "@/lib/types";
import type { creators } from "@/lib/mock-data";
import { formatNumber, getInitials, getAvatarColor, getBadgeConfig } from "./creator-helpers";

function CreatorBadge({ badge, t }: { badge: string; t: (key: TranslationKey) => string }) {
  const config = getBadgeConfig(t)[badge];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${config.className}`}>
      {config.label}
    </span>
  );
}

export function AvatarCircle({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = { sm: "size-10 text-sm", md: "size-14 text-lg", lg: "size-20 text-2xl" };
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getAvatarColor(name)} flex items-center justify-center font-bold text-white shrink-0 shadow-lg`}>
      {getInitials(name)}
    </div>
  );
}

export function PodiumCard({
  creator,
  accent,
  delay,
  elevated = false,
  heroClass,
  isSelected,
  onSelect,
}: {
  creator: (typeof creators)[number];
  accent: "gold" | "silver" | "bronze";
  delay: number;
  elevated?: boolean;
  heroClass: HeroClass | null;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { t } = useLang();
  const accentStyles = {
    gold: {
      border: "border-amber-500/30",
      glow: "shadow-amber-500/15",
      iconBg: "from-amber-400 to-yellow-300",
      icon: <Crown className="size-5 text-white" />,
      rankColor: "text-amber-400",
      wrapperExtra: "fire-border",
    },
    silver: {
      border: "border-zinc-400/25",
      glow: "shadow-zinc-400/10",
      iconBg: "from-zinc-300 to-zinc-400",
      icon: <Medal className="size-5 text-white" />,
      rankColor: "text-zinc-400",
      wrapperExtra: "",
    },
    bronze: {
      border: "border-orange-600/25",
      glow: "shadow-orange-600/10",
      iconBg: "from-orange-500 to-amber-600",
      icon: <Medal className="size-5 text-white" />,
      rankColor: "text-orange-400",
      wrapperExtra: "",
    },
  };

  const s = accentStyles[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-card-strong rounded-2xl p-6 border ${s.border} shadow-lg ${s.glow} noise-bg relative cursor-pointer transition-all ${
        elevated ? "md:-mt-4 md:scale-[1.03] z-10" : ""
      } ${s.wrapperExtra} ${
        isSelected ? "ring-2 ring-violet-500 evolution-glow" : "hover:ring-1 hover:ring-white/20"
      }`}
      onClick={onSelect}
    >
      {/* Rank icon */}
      <div className="flex items-center justify-between mb-5">
        <div className={`flex items-center justify-center size-10 rounded-xl bg-gradient-to-br ${s.iconBg} shadow-md`}>
          {s.icon}
        </div>
        <div className="flex items-center gap-2">
          {heroClass && <ClassIcon heroClass={heroClass} size={16} />}
          <span className={`text-3xl font-black ${s.rankColor}`}>#{creator.rank}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <AvatarCircle name={creator.name} size={elevated ? "lg" : "md"} />
        <div className="min-w-0">
          <p className="font-bold text-foreground text-lg truncate">{creator.name}</p>
          <p className="text-xs text-muted-foreground truncate">{creator.bio}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: t("creators.projects"), value: creator.projectCount, icon: Star, color: "text-violet-400" },
          { label: t("creators.upvotes"), value: creator.totalUpvotes, icon: ChevronUp, color: "text-fuchsia-400" },
          { label: t("creators.plays"), value: creator.totalPlays, icon: Play, color: "text-cyan-400" },
          { label: t("creators.remixes"), value: creator.totalRemixes, icon: GitFork, color: "text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.04] rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <stat.icon className={`size-3 ${stat.color}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-sm font-bold text-foreground">{formatNumber(stat.value)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
          <TrendingUp className="size-3" />
          +{creator.weeklyGrowth}% {t("creators.thisWeek")}
        </div>
        <div className="flex items-center gap-1.5">
          {creator.badges.map((b) => (
            <CreatorBadge key={b} badge={b} t={t} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
