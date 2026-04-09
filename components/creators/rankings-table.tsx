"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Play,
  GitFork,
  ChevronUp,
  ArrowUpRight,
} from "lucide-react";
import { ClassIcon } from "@/components/rpg/class-icon";
import { useLang } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import type { HeroClass } from "@/lib/types";
import type { creators } from "@/lib/mock-data";
import { formatNumber, getBadgeConfig } from "./creator-helpers";
import { AvatarCircle } from "./creator-card";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

function CreatorBadge({ badge, t }: { badge: string; t: (key: TranslationKey) => string }) {
  const config = getBadgeConfig(t)[badge];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${config.className}`}>
      {config.label}
    </span>
  );
}

export function RankingsTable({
  pagedCreators,
  selectedCreator,
  onSelectCreator,
  currentPage,
  totalPages,
  onPageChange,
  getHeroClass,
}: {
  pagedCreators: (typeof creators)[number][];
  selectedCreator: string | null;
  onSelectCreator: (id: string | null) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getHeroClass: (creatorId: string) => HeroClass | null;
}) {
  const { t } = useLang();

  return (
    <>
      <motion.div variants={stagger} initial="initial" animate="animate" className="mt-8 glass-card rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
        {pagedCreators.map((creator) => {
          const heroClass = getHeroClass(creator.id);
          return (
            <motion.div
              key={creator.id}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors group cursor-pointer ${
                selectedCreator === creator.id ? "bg-violet-500/5 ring-1 ring-violet-500/20" : ""
              }`}
              onClick={() => onSelectCreator(selectedCreator === creator.id ? null : creator.id)}
            >
              <span className="text-lg font-bold text-muted-foreground/60 w-8 text-center shrink-0">
                #{creator.rank}
              </span>
              <AvatarCircle name={creator.name} size="sm" />
              {heroClass && (
                <ClassIcon heroClass={heroClass} size={16} />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{creator.name}</p>
                <p className="text-xs text-muted-foreground truncate">{creator.bio}</p>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="size-3 text-violet-400" />
                  {formatNumber(creator.totalUpvotes)}
                </span>
                <span className="flex items-center gap-1">
                  <Play className="size-3 text-fuchsia-400" />
                  {formatNumber(creator.totalPlays)}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="size-3 text-cyan-400" />
                  {creator.totalRemixes}
                </span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium shrink-0">
                <ChevronUp className="size-3" />
                {creator.weeklyGrowth}%
              </div>
              <div className="hidden lg:flex items-center gap-1.5">
                {creator.badges.map((b) => (
                  <CreatorBadge key={b} badge={b} t={t} />
                ))}
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground/40 group-hover:text-violet-400 transition-colors shrink-0" />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 16 }}>
          <button
            className="nes-btn is-primary"
            style={{ fontSize: 10, padding: "8px 14px" }}
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            {t("creators.prev")}
          </button>
          <span className="font-pixel" style={{ fontSize: 8, color: "#8888A0" }}>
            {currentPage} / {totalPages}
          </span>
          <button
            className="nes-btn is-primary"
            style={{ fontSize: 10, padding: "8px 14px" }}
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          >
            {t("creators.next")}
          </button>
        </div>
      )}
    </>
  );
}
