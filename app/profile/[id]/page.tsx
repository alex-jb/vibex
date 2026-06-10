"use client";

import { use } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCreators, useProjects } from "@/lib/use-data";
import { useLang } from "@/lib/i18n";
import { AttributeRadar } from "@/components/rpg/attribute-radar";
import { HeroCard } from "@/components/home/hero-card";
import { projectsToCards } from "@/components/home/hero-card-grid";
import {
  getCreatorClass,
  getCreatorAttributes,
  formatNumber,
} from "@/components/creators/creator-helpers";
import { hashString } from "@/lib/hash";
import { CrackedProfilePanel } from "@/components/cracked/profile-panel";

const C = {
  BG: "#0D0D0D",
  SCREEN_BG: "#9BBC0F", // Game Boy LCD green
  SCREEN_DEEP: "#0F380F", // Game Boy deep-screen-green
  BEZEL: "#2A2A30", // Game Boy console plastic dark
  BEZEL_OUTLINE: "#3A3A42",
  PANEL: "#111114",
  CARD: "#161619",
  BORDER: "#3A3A42",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  DIM: "#8A7B9A",
  FORGE: "#F97316",
  CREAM: "#FFE27D",
  GREEN: "#39FF14",
  YELLOW: "#FACC15",
  CYAN: "#06B6D4",
  PURPLE: "#9D00FF",
  PURPLE_TEXT: "#C077FF",
  HP_GREEN: "#39FF14",
  MP_BLUE: "#06B6D4",
  ATK_ORANGE: "#F97316",
  DEF_PURPLE: "#C077FF",
};

/* ─── HP-bar stat row (Game Boy RPG style) ─── */
function StatBar({
  label,
  value,
  max,
  color,
  glyph,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  glyph: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "64px 1fr 56px",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
      }}
    >
      <div className="font-pixel" style={{ fontSize: 9, color, letterSpacing: 2 }}>
        {glyph} {label}
      </div>
      <div
        style={{
          position: "relative",
          height: 14,
          background: C.BG,
          border: `2px solid ${C.BORDER}`,
          boxShadow: "inset 0 0 0 1px #000",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${pct}%`,
            background: color,
            boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.2), 2px 0 0 #000`,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,0.25) 3px 4px)",
            pointerEvents: "none",
          }}
        />
      </div>
      <div
        className="font-pixel"
        style={{
          fontSize: 11,
          color,
          textAlign: "right",
          textShadow: `0 0 6px ${color}55, 2px 2px 0 #000`,
        }}
      >
        {formatNumber(value)}
      </div>
    </div>
  );
}

/* ─── Pick an evo sprite to use as "portrait" ─── */
const EVO_SPRITES = [
  "/generated/evo-1-seed.png",
  "/generated/evo-2-active.png",
  "/generated/evo-3-growing.png",
  "/generated/evo-4-breakout.png",
  "/generated/evo-5-legend.png",
  "/generated/evo-6-myth.png",
] as const;

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { lang } = useLang();
  const { data: creators } = useCreators();
  const { data: projects } = useProjects();

  const creator = creators.find((c) => c.id === id);

  if (!creator) {
    return (
      <div
        className="relative min-h-[60vh] flex items-center justify-center"
        style={{ background: C.BG, color: C.TEXT }}
      >
        <div
          className="font-pixel"
          style={{ fontSize: 12, color: C.FORGE, letterSpacing: 2 }}
        >
          ▸ {lang === "zh" ? "CREATOR 未找到" : "CREATOR NOT FOUND"}
        </div>
      </div>
    );
  }

  const myProjects = projects.filter((p) => p.creatorId === id);
  const heroClass = getCreatorClass(id, projects);
  const attributes = getCreatorAttributes(id, projects);

  // Pick sprite deterministically based on creator rank / project count
  // Higher-tier creator → later-stage sprite.
  const spriteIdx = Math.min(
    5,
    Math.max(0, Math.floor((creator.projectCount ?? 1) / 2)),
  );
  const portrait = EVO_SPRITES[spriteIdx];

  // HP bars — scale each stat to a "max" so percentages make sense.
  // These maxes are rough targets for "what feels full" — tweakable later.
  const STAT_MAXES = { projects: 20, upvotes: 5000, plays: 50000, remixes: 100 };

  return (
    <div
      className="relative min-h-full overflow-hidden"
      style={{ background: C.BG, color: C.TEXT, padding: "24px 16px" }}
    >
      {/* Ambient forge glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[360px] w-[520px] rounded-full"
        style={{
          background: `radial-gradient(closest-side, ${C.FORGE}22, transparent 70%)`,
        }}
      />

      {/* ═══ GAME BOY CONSOLE BEZEL ═══
          Boot animation borrowed from xhs 灵灵妮 "Annie Creative OS" — power
          on the console as the page mounts. 600ms scale + opacity, then the
          inner identity block does its own stagger.  */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto"
        style={{
          maxWidth: 960,
          borderRadius: "24px 24px 96px 24px",
          background: `linear-gradient(180deg, ${C.BEZEL} 0%, #1A1A1F 100%)`,
          border: `3px solid ${C.BEZEL_OUTLINE}`,
          boxShadow: `
            6px 6px 0 #000,
            inset 2px 2px 0 rgba(255,255,255,0.04),
            0 0 32px ${C.FORGE}22
          `,
          padding: 20,
        }}
      >
        {/* Bezel top strip: brand + power LED */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 10px 12px",
            borderBottom: `2px solid ${C.BEZEL_OUTLINE}`,
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: C.FORGE,
                boxShadow: `0 0 8px ${C.FORGE}, inset 0 0 2px rgba(255,255,255,0.3)`,
                animation: "pulse 2s ease-in-out infinite",
              }}
              aria-hidden
            />
            <span
              className="font-pixel"
              style={{ fontSize: 8, color: C.MUTED, letterSpacing: 3 }}
            >
              POWER
            </span>
          </div>
          <div
            className="font-pixel"
            style={{
              fontSize: 14,
              color: C.CREAM,
              letterSpacing: 4,
              textShadow: `2px 2px 0 #000`,
            }}
          >
            VIBE<span style={{ color: C.FORGE }}>X</span>FORGE
            <span
              className="font-pixel"
              style={{ fontSize: 8, color: C.DIM, letterSpacing: 2, marginLeft: 8 }}
            >
              DMG-001
            </span>
          </div>
          <span className="font-pixel" style={{ fontSize: 8, color: C.BORDER, letterSpacing: 2 }}>
            TRAINER CARD
          </span>
        </div>

        {/* ═══ "SCREEN" — main character card ═══ */}
        <div
          className="relative"
          style={{
            background: C.PANEL,
            border: `3px solid ${C.BEZEL_OUTLINE}`,
            boxShadow: `inset 0 0 0 1px #000, inset 0 0 24px ${C.FORGE}11`,
            padding: "24px 22px",
            overflow: "hidden",
          }}
        >
          <h1 className="sr-only">{creator.name} — Creator Profile</h1>

          {/* Scanlines on screen */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.12) 2px 3px)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            {/* Card header: portrait + identity */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 20,
                alignItems: "center",
                marginBottom: 20,
                paddingBottom: 18,
                borderBottom: `2px solid ${C.FORGE}44`,
              }}
            >
              {/* Portrait — evo sprite in a frame */}
              <div
                style={{
                  position: "relative",
                  width: 120,
                  height: 120,
                  background: `radial-gradient(closest-side, ${C.PURPLE}33, ${C.BG} 70%)`,
                  border: `3px solid ${C.FORGE}`,
                  boxShadow: `3px 3px 0 #000, 0 0 20px ${C.FORGE}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Small "card number" in corner */}
                <span
                  className="font-pixel"
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    fontSize: 7,
                    color: C.CREAM,
                    background: C.BG,
                    padding: "1px 4px",
                    letterSpacing: 1,
                  }}
                >
                  #{String(hashString(creator.id) % 999).padStart(3, "0")}
                </span>
                <Image
                  src={portrait}
                  alt={`${creator.name} portrait`}
                  width={96}
                  height={96}
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              {/* Identity block */}
              <div>
                <div
                  className="font-pixel"
                  style={{
                    fontSize: 9,
                    color: C.FORGE,
                    letterSpacing: 3,
                    marginBottom: 4,
                  }}
                >
                  ▸ {lang === "zh" ? "创作者" : "TRAINER"} · {lang === "zh" ? "排名" : "RANK"} #{creator.rank}
                </div>
                <div
                  className="font-pixel"
                  style={{
                    fontSize: 22,
                    color: C.CREAM,
                    letterSpacing: 2,
                    marginBottom: 6,
                    textShadow: `3px 3px 0 #000, 0 0 16px ${C.FORGE}44`,
                  }}
                >
                  {creator.name}
                </div>
                {heroClass && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      background: `${C.GREEN}11`,
                      border: `1px solid ${C.GREEN}66`,
                      boxShadow: `0 0 10px ${C.GREEN}33`,
                    }}
                  >
                    <span style={{ color: C.GREEN, fontSize: 14 }}>★</span>
                    <span
                      className="font-pixel"
                      style={{ fontSize: 9, color: C.GREEN, letterSpacing: 3 }}
                    >
                      {heroClass.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Vertical rank badge */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "8px 10px",
                  background: C.CARD,
                  border: `2px solid ${C.YELLOW}`,
                  boxShadow: `2px 2px 0 #000, 0 0 12px ${C.YELLOW}33`,
                }}
              >
                <span
                  className="font-pixel"
                  style={{ fontSize: 7, color: C.YELLOW, letterSpacing: 2 }}
                >
                  LV
                </span>
                <span
                  className="font-pixel"
                  style={{
                    fontSize: 22,
                    color: C.YELLOW,
                    textShadow: `2px 2px 0 #000, 0 0 10px ${C.YELLOW}`,
                    lineHeight: 1,
                  }}
                >
                  {Math.max(1, Math.floor((creator.totalPlays ?? 0) / 100) + 1)}
                </span>
              </div>
            </motion.div>

            {/* HP-bar stats (RPG style) */}
            <div style={{ marginBottom: 22 }}>
              <div
                className="font-pixel"
                style={{
                  fontSize: 9,
                  color: C.MUTED,
                  letterSpacing: 3,
                  marginBottom: 6,
                }}
              >
                ▸ {lang === "zh" ? "创作者数据" : "TRAINER STATS"}
              </div>
              <StatBar
                label="HP"
                value={creator.projectCount ?? myProjects.length}
                max={STAT_MAXES.projects}
                color={C.HP_GREEN}
                glyph="♥"
              />
              <StatBar
                label="MP"
                value={creator.totalUpvotes ?? 0}
                max={STAT_MAXES.upvotes}
                color={C.DEF_PURPLE}
                glyph="◆"
              />
              <StatBar
                label="ATK"
                value={creator.totalPlays ?? 0}
                max={STAT_MAXES.plays}
                color={C.ATK_ORANGE}
                glyph="⚔"
              />
              <StatBar
                label="EXP"
                value={creator.totalRemixes ?? 0}
                max={STAT_MAXES.remixes}
                color={C.MP_BLUE}
                glyph="★"
              />
            </div>

            <CrackedProfilePanel candidate={creator.name} creatorHandle={creator.name} />

            {/* Radar + Spotter Codex */}
            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
            >
              {attributes && (
                <div
                  style={{
                    background: C.CARD,
                    border: `2px solid ${C.BORDER}`,
                    boxShadow: `2px 2px 0 #000`,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    className="font-pixel"
                    style={{
                      fontSize: 10,
                      color: C.PURPLE_TEXT,
                      letterSpacing: 3,
                      marginBottom: 10,
                    }}
                  >
                    ✦ ATTRIBUTES
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <AttributeRadar attributes={attributes} size={200} />
                  </div>
                </div>
              )}

              <div
                data-slot="spotter-badges"
                style={{
                  background: C.CARD,
                  border: `2px solid ${C.BORDER}`,
                  boxShadow: `2px 2px 0 #000`,
                  padding: "14px 16px",
                }}
              >
                <div
                  className="font-pixel"
                  style={{
                    fontSize: 10,
                    color: C.FORGE,
                    letterSpacing: 3,
                    marginBottom: 12,
                  }}
                >
                  ◆ SPOTTER CODEX
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {[
                    { tier: "FOUNDING", count: 0, color: C.CREAM, glyph: "◉" },
                    { tier: "EARLY SPOTTER", count: 0, color: C.CYAN, glyph: "✦" },
                    { tier: "LEGENDARY", count: 0, color: C.YELLOW, glyph: "★" },
                    { tier: "MYTHIC EYE", count: 0, color: "#FF69B4", glyph: "⬢" },
                  ].map((b) => (
                    <div
                      key={b.tier}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 10px",
                        border: `1px solid ${b.color}33`,
                        background: `${b.color}08`,
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: b.color, fontSize: 12 }}>{b.glyph}</span>
                        <span
                          className="font-pixel"
                          style={{ fontSize: 8, color: b.color, letterSpacing: 2 }}
                        >
                          {b.tier}
                        </span>
                      </span>
                      <span
                        className="font-pixel"
                        style={{ fontSize: 8, color: C.DIM, letterSpacing: 2 }}
                      >
                        {b.count}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className="font-retro"
                  style={{
                    fontSize: 12,
                    color: C.DIM,
                    marginTop: 10,
                    fontStyle: "italic",
                  }}
                >
                  — Unlocked with Backer Mode —
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ D-pad / buttons decoration row (pure chrome) ═══ */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 10px 4px",
            marginTop: 16,
          }}
        >
          {/* D-pad */}
          <div
            aria-hidden
            style={{
              position: "relative",
              width: 48,
              height: 48,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 0,
                width: 48,
                height: 16,
                background: "#1A1A1F",
                border: `1px solid ${C.BORDER}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 16,
                width: 16,
                height: 48,
                background: "#1A1A1F",
                border: `1px solid ${C.BORDER}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                width: 8,
                height: 8,
                background: C.FORGE,
                borderRadius: "50%",
              }}
            />
          </div>
          <span
            className="font-pixel"
            style={{ fontSize: 7, color: C.DIM, letterSpacing: 3 }}
          >
            ◀ SELECT · START ▶
          </span>
          {/* A/B buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <div
              aria-hidden
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: `radial-gradient(closest-side, ${C.PURPLE_TEXT} 0 30%, #4B2E60 35% 70%, #1A1A1F 75%)`,
                border: `1px solid ${C.BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="font-pixel"
                style={{ fontSize: 10, color: "#000", textShadow: "1px 1px 0 rgba(255,255,255,0.2)" }}
              >
                B
              </span>
            </div>
            <div
              aria-hidden
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: `radial-gradient(closest-side, ${C.FORGE} 0 30%, #6B2500 35% 70%, #1A1A1F 75%)`,
                border: `1px solid ${C.BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="font-pixel"
                style={{ fontSize: 10, color: "#000", textShadow: "1px 1px 0 rgba(255,255,255,0.2)" }}
              >
                A
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ EVOLVED HEROES (outside the Game Boy) ═══ */}
      <div className="mx-auto mt-8" style={{ maxWidth: 960 }}>
        <div
          className="font-pixel"
          style={{
            fontSize: 12,
            color: C.GREEN,
            letterSpacing: 3,
            marginBottom: 14,
            textShadow: `0 0 8px ${C.GREEN}44`,
          }}
        >
          ⬢ {lang === "zh" ? "项目作品" : "EVOLVED HEROES"} · {myProjects.length}
        </div>
        {myProjects.length === 0 ? (
          <div
            className="font-retro"
            style={{
              fontSize: 16,
              color: C.DIM,
              padding: "32px 0",
              textAlign: "center",
              border: `1px dashed ${C.BORDER}`,
            }}
          >
            {lang === "zh" ? "还没有上线的项目。" : "No heroes forged yet."}
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
          >
            {projectsToCards(myProjects.slice(0, 6)).map((card) => (
              <HeroCard key={card.id} data={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
