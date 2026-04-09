"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AttributeRadar } from "@/components/rpg/attribute-radar";
import { ClassIcon } from "@/components/rpg/class-icon";
import { useLang } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import type { HeroAttributes, HeroClass } from "@/lib/types";
import type { creators, projects } from "@/lib/mock-data";
import { formatNumber, getBadgeConfig } from "./creator-helpers";
import { AvatarCircle } from "./creator-card";

function CreatorBadge({ badge, t }: { badge: string; t: (key: TranslationKey) => string }) {
  const config = getBadgeConfig(t)[badge];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${config.className}`}>
      {config.label}
    </span>
  );
}

export interface CreatorDetailData {
  creator: (typeof creators)[number];
  heroClass: HeroClass | null;
  attributes: HeroAttributes | null;
  projectList: (typeof projects)[number][];
}

export function CreatorDetailPanel({
  data,
}: {
  data: CreatorDetailData | null;
}) {
  const { t } = useLang();

  if (!data) {
    return (
      <div className="retro-card l-corner relative p-8 text-center">
        <div className="l-corner-inner absolute inset-0 pointer-events-none" />
        <BookOpen className="mx-auto size-8 text-muted-foreground/30 mb-3" />
        <p className="font-pixel text-[8px] text-muted-foreground">
          {t("creators.selectCreator")}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={data.creator.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="retro-card l-corner p-5 space-y-4 relative"
    >
      <div className="l-corner-inner absolute inset-0 pointer-events-none" />

      {/* header */}
      <div className="flex items-center justify-between">
        <span className="font-pixel text-[8px] text-violet-400 uppercase tracking-wider">
          {t("creators.badge")} #{String(data.creator.rank).padStart(3, "0")}
        </span>
        {data.heroClass && (
          <ClassIcon heroClass={data.heroClass} size={16} showLabel />
        )}
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <AvatarCircle name={data.creator.name} size="lg" />
        <div className="min-w-0">
          <h3 className="font-bold text-foreground text-lg truncate">
            {data.creator.name}
          </h3>
          <p className="text-xs text-muted-foreground">{data.creator.bio}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {data.creator.badges.map((b) => (
              <CreatorBadge key={b} badge={b} t={t} />
            ))}
          </div>
        </div>
      </div>

      {/* Attribute Radar */}
      {data.attributes && (
        <div className="flex justify-center">
          <AttributeRadar attributes={data.attributes} size={200} />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: t("creators.projects"), value: data.creator.projectCount, color: "text-violet-400" },
          { label: t("creators.upvotes"), value: data.creator.totalUpvotes, color: "text-fuchsia-400" },
          { label: t("creators.plays"), value: data.creator.totalPlays, color: "text-cyan-400" },
          { label: t("creators.remixes"), value: data.creator.totalRemixes, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] rounded px-3 py-2">
            <span className="font-pixel text-[6px] text-muted-foreground uppercase">{s.label}</span>
            <p className={`font-pixel text-[10px] ${s.color}`}>{formatNumber(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Growth */}
      <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
        <TrendingUp className="size-3" />
        +{data.creator.weeklyGrowth}% {t("creators.weeklyGrowth")}
      </div>

      {/* Projects by this creator */}
      {data.projectList.length > 0 && (
        <div>
          <span className="font-pixel text-[7px] text-muted-foreground uppercase tracking-widest">
            {t("creators.projects")}
          </span>
          <div className="mt-2 space-y-1.5">
            {data.projectList.map((p) => (
              <a
                key={p.id}
                href={`/project/${p.id}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.04] transition-colors"
              >
                {p.hero && (
                  <span className="level-badge shrink-0">
                    <span className="text-violet-400">Lv</span>
                    <span className="ml-0.5">{p.hero.level}</span>
                  </span>
                )}
                <span className="font-retro text-sm text-foreground truncate">
                  {p.title}
                </span>
                <Badge variant="outline" className="ml-auto text-[8px] shrink-0">
                  {p.category}
                </Badge>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Joined */}
      <p className="font-pixel text-[6px] text-muted-foreground/40">
        {t("creators.joined")} {data.creator.joinedAt}
      </p>
    </motion.div>
  );
}
