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
      iconBg: "linear-gradient(135deg, #FFE27D, #FFD700)",
      icon: <Crown className="size-5" style={{ color: "#1a0a3a" }} />,
      rankColor: "var(--neon-yellow)",
      rankShadow: "0 0 12px rgba(250,204,21,0.7), 2px 2px 0 #000",
      borderColor: "var(--neon-yellow)",
    },
    silver: {
      iconBg: "linear-gradient(135deg, #E0E0E6, #A8A8B0)",
      icon: <Medal className="size-5" style={{ color: "#1a0a3a" }} />,
      rankColor: "#E0E0E6",
      rankShadow: "0 0 10px rgba(224,224,230,0.5), 2px 2px 0 #000",
      borderColor: "rgba(224,224,230,0.5)",
    },
    bronze: {
      iconBg: "linear-gradient(135deg, #FF7A36, #C94A1E)",
      icon: <Medal className="size-5" style={{ color: "#FFF" }} />,
      rankColor: "var(--neon-orange)",
      rankShadow: "0 0 10px rgba(255,69,0,0.6), 2px 2px 0 #000",
      borderColor: "var(--neon-orange)",
    },
  };
  const s = accentStyles[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative cursor-pointer ${elevated ? "md:-mt-4 md:scale-[1.03] z-10" : ""}`}
      style={{
        background: "var(--bg-panel)",
        border: `2px solid ${isSelected ? "var(--neon-purple)" : s.borderColor}`,
        padding: 20,
        boxShadow: isSelected
          ? "4px 4px 0 #000, 0 0 20px rgba(157,0,255,0.5)"
          : "4px 4px 0 #000",
      }}
      onClick={onSelect}
    >
      {/* Rank + accent icon row */}
      <div className="flex items-center justify-between mb-5">
        <div
          className="flex items-center justify-center"
          style={{ width: 40, height: 40, background: s.iconBg, border: "2px solid #000" }}
        >
          {s.icon}
        </div>
        <div className="flex items-center gap-2">
          {heroClass && <ClassIcon heroClass={heroClass} size={16} />}
          <span
            className="font-pixel font-pixel-hero"
            style={{
              fontSize: 26,
              color: s.rankColor,
              textShadow: s.rankShadow,
              letterSpacing: 1,
            }}
          >
            #{creator.rank}
          </span>
        </div>
      </div>

      {/* Avatar + name + bio */}
      <div className="flex items-center gap-3 mb-4">
        <AvatarCircle name={creator.name} size={elevated ? "lg" : "md"} />
        <div className="min-w-0">
          <p
            className="font-pixel truncate"
            style={{
              fontSize: 12,
              color: "var(--text)",
              letterSpacing: 0.5,
              textShadow: "0 0 6px rgba(232,232,236,0.25)",
            }}
          >
            {creator.name}
          </p>
          <p
            className="font-retro truncate mt-1"
            style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.3 }}
          >
            {creator.bio}
          </p>
        </div>
      </div>

      {/* Stats grid — retro inset panels */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: t("creators.projects"), value: creator.projectCount, icon: Star, accent: "var(--neon-purple)" },
          { label: t("creators.upvotes"), value: creator.totalUpvotes, icon: ChevronUp, accent: "var(--neon-pink)" },
          { label: t("creators.plays"), value: creator.totalPlays, icon: Play, accent: "var(--neon-cyan)" },
          { label: t("creators.remixes"), value: creator.totalRemixes, icon: GitFork, accent: "var(--neon-green)" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid var(--border-wire)",
              padding: "8px 10px",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon className="size-3" style={{ color: stat.accent }} />
              <span
                className="font-ui"
                style={{ fontSize: 8, color: "var(--text-muted)", letterSpacing: 1.5 }}
              >
                {stat.label.toUpperCase()}
              </span>
            </div>
            <p
              className="font-pixel"
              style={{
                fontSize: 13,
                color: "var(--neon-yellow)",
                textShadow: "0 0 6px rgba(250,204,21,0.5)",
              }}
            >
              {formatNumber(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Footer: growth + badges */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid var(--border-hair)" }}
      >
        <div
          className="font-ui flex items-center gap-1"
          style={{
            fontSize: 9,
            color: "var(--neon-green)",
            letterSpacing: 1,
            textShadow: "0 0 4px rgba(57,255,20,0.6)",
          }}
        >
          <TrendingUp className="size-3" />
          ▲ {creator.weeklyGrowth}% THIS WEEK
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
