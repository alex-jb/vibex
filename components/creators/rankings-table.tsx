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
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="mt-8 overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "2px solid var(--border-metal)",
          boxShadow: "4px 4px 0 #000",
        }}
      >
        {pagedCreators.map((creator, i) => {
          const heroClass = getHeroClass(creator.id);
          const isSelected = selectedCreator === creator.id;
          return (
            <motion.div
              key={creator.id}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-4 px-5 py-4 group cursor-pointer transition-colors"
              style={{
                borderTop: i > 0 ? "1px solid var(--border-hair)" : "none",
                background: isSelected ? "rgba(157,0,255,0.12)" : "transparent",
                boxShadow: isSelected
                  ? "inset 0 0 0 1px var(--neon-purple)"
                  : "none",
              }}
              onClick={() => onSelectCreator(isSelected ? null : creator.id)}
            >
              <span
                className="font-pixel w-10 text-center shrink-0"
                style={{
                  fontSize: 14,
                  color: isSelected ? "var(--neon-yellow)" : "var(--text-muted)",
                  textShadow: isSelected
                    ? "0 0 6px rgba(250,204,21,0.6)"
                    : "none",
                  letterSpacing: 1,
                }}
              >
                #{creator.rank}
              </span>
              <AvatarCircle name={creator.name} size="sm" />
              {heroClass && <ClassIcon heroClass={heroClass} size={16} />}
              <div className="flex-1 min-w-0">
                <p
                  className="font-pixel truncate"
                  style={{
                    fontSize: 11,
                    color: "var(--text)",
                    letterSpacing: 0.5,
                  }}
                >
                  {creator.name}
                </p>
                <p
                  className="font-retro truncate mt-0.5"
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    lineHeight: 1.3,
                  }}
                >
                  {creator.bio}
                </p>
              </div>
              <div
                className="hidden sm:flex items-center gap-5 font-ui"
                style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 1 }}
              >
                <span className="flex items-center gap-1">
                  <Zap className="size-3" style={{ color: "var(--neon-purple)" }} />
                  <b style={{ color: "var(--text)", fontWeight: "normal" }}>
                    {formatNumber(creator.totalUpvotes)}
                  </b>
                </span>
                <span className="flex items-center gap-1">
                  <Play className="size-3" style={{ color: "var(--neon-pink)" }} />
                  <b style={{ color: "var(--text)", fontWeight: "normal" }}>
                    {formatNumber(creator.totalPlays)}
                  </b>
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="size-3" style={{ color: "var(--neon-cyan)" }} />
                  <b style={{ color: "var(--text)", fontWeight: "normal" }}>
                    {creator.totalRemixes}
                  </b>
                </span>
              </div>
              <div
                className="font-ui flex items-center gap-1 shrink-0"
                style={{
                  fontSize: 9,
                  color: "var(--neon-green)",
                  letterSpacing: 1,
                  textShadow: "0 0 4px rgba(57,255,20,0.6)",
                }}
              >
                <ChevronUp className="size-3" />▲{creator.weeklyGrowth}%
              </div>
              <div className="hidden lg:flex items-center gap-1.5">
                {creator.badges.map((b) => (
                  <CreatorBadge key={b} badge={b} t={t} />
                ))}
              </div>
              <ArrowUpRight
                className="size-4 shrink-0 transition-colors"
                style={{
                  color: isSelected ? "var(--neon-purple)" : "var(--text-dim)",
                }}
              />
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
