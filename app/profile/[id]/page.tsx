"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { useCreators, useProjects } from "@/lib/use-data";
import { AttributeRadar } from "@/components/rpg/attribute-radar";
import { HeroCard } from "@/components/home/hero-card";
import { projectsToCards } from "@/components/home/hero-card-grid";
import { getCreatorClass, getCreatorAttributes, formatNumber } from "@/components/creators/creator-helpers";

/* ─── Direction A palette (inline — matches retro-game.css CSS vars) ─── */
const C = {
  BG: "#0D0D0D",
  PANEL: "#111114",
  CARD: "#161619",
  BORDER: "#3A3A42",
  WIRE: "#2A2A30",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  DIM: "#8A7B9A",
  FORGE: "#FF4500",
  CREAM: "#FFE27D",
  GREEN: "#39FF14",
  YELLOW: "#FACC15",
  CYAN: "#06B6D4",
  PURPLE: "#9D00FF",
  PURPLE_TEXT: "#C077FF",
};

/* ─── L-corner brackets (orange, 4 per panel) ─── */
function LCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const isTop = pos.startsWith("t");
  const isLeft = pos.endsWith("l");
  const SIZE = 14;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: SIZE,
        height: SIZE,
        [isTop ? "top" : "bottom"]: -2,
        [isLeft ? "left" : "right"]: -2,
        [isTop ? "borderTop" : "borderBottom"]: `3px solid ${C.FORGE}`,
        [isLeft ? "borderLeft" : "borderRight"]: `3px solid ${C.FORGE}`,
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─── Pixel avatar — 4×4 grid derived from name initials ─── */
function PixelAvatar({ name, color }: { name: string; color: string }) {
  // 16-bit "portrait" — symmetrical pixel grid from initials hash
  const seed = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const grid = Array.from({ length: 16 }, (_, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const mirror = col < 2 ? col : 3 - col;
    const idx = row * 2 + mirror;
    return (seed + idx * 7) % 3 !== 0;
  });
  return (
    <div
      style={{
        width: 80,
        height: 80,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        border: `2px solid ${color}`,
        boxShadow: `3px 3px 0 #000, 0 0 16px ${color}44`,
        background: `${C.BG}`,
        padding: 6,
        gap: 2,
      }}
      aria-hidden="true"
    >
      {grid.map((on, i) => (
        <div
          key={i}
          style={{
            background: on ? color : "transparent",
            opacity: on ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Stat card ─── */
function StatCard({
  label,
  value,
  color,
  glyph,
}: {
  label: string;
  value: string | number;
  color: string;
  glyph: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: C.CARD,
        border: `2px solid ${C.BORDER}`,
        padding: "12px 14px",
      }}
    >
      <div
        className="font-pixel"
        style={{ fontSize: 7, color: C.MUTED, letterSpacing: 2, marginBottom: 6 }}
      >
        <span style={{ color }}>{glyph}</span> {label}
      </div>
      <div
        className="font-pixel"
        style={{
          fontSize: 20,
          color,
          letterSpacing: 1,
          textShadow: `2px 2px 0 #000, 0 0 12px ${color}44`,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: creators } = useCreators();
  const { data: projects } = useProjects();

  const creator = creators.find((c) => c.id === id);

  // Graceful fallback for unknown creator
  if (!creator) {
    return (
      <div
        className="relative min-h-[60vh] flex items-center justify-center"
        style={{ background: C.BG, color: C.TEXT }}
      >
        <div className="font-pixel" style={{ fontSize: 12, color: C.FORGE, letterSpacing: 2 }}>
          ▸ CREATOR NOT FOUND
        </div>
      </div>
    );
  }

  const myProjects = projects.filter((p) => p.creatorId === id);
  const heroClass = getCreatorClass(id, projects);
  const attributes = getCreatorAttributes(id, projects);

  const totalPlays = creator.totalPlays ?? 0;
  const totalUpvotes = creator.totalUpvotes ?? 0;
  const totalRemixes = creator.totalRemixes ?? 0;
  const projectCount = creator.projectCount ?? myProjects.length;

  return (
    <div
      className="relative min-h-full overflow-hidden"
      style={{ background: C.BG, color: C.TEXT }}
    >
      {/* Forge ember glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[360px] w-[520px] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${C.FORGE}22, transparent 70%)` }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Terminal header */}
        <div
          style={{
            background: C.PANEL,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${C.BORDER}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, background: "#FF5F57", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, background: "#FEBC2E", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, background: "#28C840", display: "inline-block" }} />
          </div>
          <span className="font-pixel" style={{ fontSize: 9, color: C.MUTED, letterSpacing: 3 }}>
            <span style={{ color: C.FORGE }}>▸</span> VIBEXFORGE://PROFILE/{creator.name.toUpperCase()}
          </span>
          <span className="font-pixel" style={{ fontSize: 7, color: C.BORDER }}>━━━</span>
        </div>

        <h1 className="sr-only">{creator.name} — Creator Profile</h1>

        {/* ═══ TRAINER BLOCK + 4-STAT GRID ═══ */}
        <div
          style={{
            position: "relative",
            background: C.PANEL,
            border: `1px solid ${C.BORDER}`,
            borderTop: "none",
            padding: "28px 24px",
            marginBottom: 20,
          }}
        >
          <LCorner pos="tl" />
          <LCorner pos="tr" />
          <LCorner pos="bl" />
          <LCorner pos="br" />

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 24,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <PixelAvatar name={creator.name} color={C.PURPLE_TEXT} />

            <div>
              <div className="font-pixel" style={{ fontSize: 8, color: C.FORGE, letterSpacing: 3, marginBottom: 6 }}>
                ▸ TRAINER
              </div>
              <div
                className="font-pixel"
                style={{
                  fontSize: 26,
                  color: C.CREAM,
                  letterSpacing: 2,
                  marginBottom: 8,
                  textShadow: `2px 2px 0 #000, 0 0 12px ${C.FORGE}44`,
                }}
              >
                {creator.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span
                  className="font-pixel"
                  style={{
                    fontSize: 10,
                    color: C.YELLOW,
                    padding: "4px 10px",
                    border: `1px solid ${C.YELLOW}`,
                    background: `${C.YELLOW}11`,
                    letterSpacing: 2,
                  }}
                >
                  RANK #{creator.rank}
                </span>
                {heroClass && (
                  <span
                    className="font-pixel"
                    style={{
                      fontSize: 10,
                      color: C.GREEN,
                      padding: "4px 10px",
                      border: `1px solid ${C.GREEN}`,
                      background: `${C.GREEN}11`,
                      letterSpacing: 2,
                    }}
                  >
                    ★ {heroClass.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* 4-stat grid */}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
          >
            <StatCard label="PROJECTS" value={projectCount} color={C.FORGE} glyph="◉" />
            <StatCard label="UPVOTES" value={formatNumber(totalUpvotes)} color={C.PURPLE_TEXT} glyph="▲" />
            <StatCard label="PLAYS" value={formatNumber(totalPlays)} color={C.CYAN} glyph="▶" />
            <StatCard label="REMIXES" value={formatNumber(totalRemixes)} color={C.GREEN} glyph="⎇" />
          </div>

          {/* Weekly rank trend strip */}
          <div
            style={{
              marginTop: 20,
              padding: "10px 14px",
              borderTop: `1px dashed ${C.BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span
              className="font-pixel"
              style={{ fontSize: 8, color: C.MUTED, letterSpacing: 2 }}
            >
              ▸ WEEKLY TRAJECTORY
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {[4, 3, 5, 4, 2].map((bar, i) => (
                <div
                  key={i}
                  style={{
                    width: 12,
                    height: bar * 4 + 8,
                    background: i === 4 ? C.GREEN : C.PURPLE,
                    opacity: i === 4 ? 1 : 0.5,
                  }}
                />
              ))}
            </div>
            <span
              className="font-pixel"
              style={{ fontSize: 8, color: C.GREEN, letterSpacing: 2 }}
            >
              ▲ CURRENT: #{creator.rank}
            </span>
          </div>
        </div>

        {/* ═══ RADAR + SPOTTER CODEX ROW ═══ */}
        <div
          className="grid gap-5 mb-5"
          style={{ gridTemplateColumns: "minmax(260px, 1fr) minmax(260px, 1fr)" }}
        >
          {/* Attribute radar */}
          {attributes && (
            <div
              style={{
                position: "relative",
                background: C.PANEL,
                border: `1px solid ${C.BORDER}`,
                padding: "18px 20px",
              }}
            >
              <LCorner pos="tl" />
              <LCorner pos="tr" />
              <LCorner pos="bl" />
              <LCorner pos="br" />
              <div
                className="font-pixel"
                style={{ fontSize: 10, color: C.PURPLE_TEXT, letterSpacing: 3, marginBottom: 10 }}
              >
                ✦ ATTRIBUTES
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <AttributeRadar attributes={attributes} size={220} />
              </div>
            </div>
          )}

          {/* Spotter codex placeholder (future Backer Mode) */}
          <div
            style={{
              position: "relative",
              background: C.PANEL,
              border: `1px solid ${C.BORDER}`,
              padding: "18px 20px",
            }}
            data-slot="spotter-badges"
          >
            <LCorner pos="tl" />
            <LCorner pos="tr" />
            <LCorner pos="bl" />
            <LCorner pos="br" />
            <div
              className="font-pixel"
              style={{ fontSize: 10, color: C.FORGE, letterSpacing: 3, marginBottom: 14 }}
            >
              ◆ SPOTTER CODEX
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { tier: "FOUNDING BACKER", count: 0, color: C.CREAM, glyph: "◉" },
                { tier: "EARLY SPOTTER", count: 0, color: C.CYAN, glyph: "✦" },
                { tier: "LEGENDARY SPOTTER", count: 0, color: C.YELLOW, glyph: "★" },
                { tier: "MYTHIC EYE", count: 0, color: "#FF69B4", glyph: "⬢" },
              ].map((b) => (
                <div
                  key={b.tier}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "8px 10px",
                    border: `1px solid ${b.color}33`,
                    background: `${b.color}08`,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: b.color, fontSize: 14 }}>{b.glyph}</span>
                    <span className="font-pixel" style={{ fontSize: 8, color: b.color, letterSpacing: 2 }}>
                      {b.tier}
                    </span>
                  </span>
                  <span className="font-pixel" style={{ fontSize: 8, color: C.DIM, letterSpacing: 2 }}>
                    {b.count}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="font-retro"
              style={{
                fontSize: 13,
                color: C.DIM,
                marginTop: 12,
                fontStyle: "italic",
              }}
            >
              — Unlocked when Backer Mode ships —
            </div>
          </div>
        </div>

        {/* ═══ EVOLVED HEROES (projects grid) ═══ */}
        <div
          style={{
            position: "relative",
            background: C.PANEL,
            border: `1px solid ${C.BORDER}`,
            padding: "18px 20px",
          }}
        >
          <LCorner pos="tl" />
          <LCorner pos="tr" />
          <LCorner pos="bl" />
          <LCorner pos="br" />
          <div
            className="font-pixel"
            style={{
              fontSize: 11,
              color: C.GREEN,
              letterSpacing: 3,
              marginBottom: 14,
              textShadow: `0 0 6px ${C.GREEN}44`,
            }}
          >
            ⬢ EVOLVED HEROES · {myProjects.length}
          </div>
          {myProjects.length === 0 ? (
            <div
              className="font-retro"
              style={{
                fontSize: 16,
                color: C.DIM,
                padding: "32px 0",
                textAlign: "center",
              }}
            >
              No projects shipped yet.
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

        {/* Footer stamp */}
        <div
          style={{
            marginTop: 24,
            padding: "12px 16px",
            borderTop: `1px dashed ${C.BORDER}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            aria-hidden="true"
            className="inline-block"
            style={{
              width: 6,
              height: 6,
              background: C.GREEN,
              boxShadow: `0 0 6px ${C.GREEN}`,
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span className="font-pixel" style={{ fontSize: 8, color: C.DIM, letterSpacing: 3 }}>
            TRAINER ID · {creator.id}
          </span>
        </div>
      </div>
    </div>
  );
}
