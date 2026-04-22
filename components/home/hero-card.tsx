"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLang, type TranslationKey } from "@/lib/i18n";
import type { EvolutionStage } from "@/lib/types";
import { EVOLUTION_CONFIG, RANK_BY_STAGE, type TopAttr } from "@/lib/rpg-utils";

/* ═══════════════════════════════════════════════════════════════════════════
   HeroCard — Direction A "character sheet" (2026-04-20).
   Replaces v7 "rarity stamp + fake video player". The card now shows
   the same vocabulary as the AIReviewPanel: evolution sprite as portrait,
   compound score in Press Start 2P yellow, rank letter, top-2 attribute
   bars (purple), one traction stat. Frame color = evolution stage only.
   ═══════════════════════════════════════════════════════════════════════════ */

export type HeroCardData = {
  id: string;
  name: string;
  creator: string;
  category: string;
  evolutionStage: EvolutionStage;
  compound: number;
  topAttrs: TopAttr[];
  traction: { kind: "plays" | "upvotes" | "shares"; value: number };
  newChip?: boolean;
};

export type HeroCardVariant = "grid" | "share";

const SPRITE_FILE: Record<EvolutionStage, string> = {
  Seed: "/generated/evo-1-seed.png",
  Active: "/generated/evo-2-active.png",
  Growing: "/generated/evo-3-growing.png",
  Breakout: "/generated/evo-4-breakout.png",
  Legend: "/generated/evo-5-legend.png",
  Myth: "/generated/evo-6-myth.png",
};
const spriteFor = (s: EvolutionStage) => SPRITE_FILE[s];

function LCorner({
  pos,
  size = 12,
  thick = 3,
}: {
  pos: "tl" | "tr" | "bl" | "br";
  size?: number;
  thick?: number;
}) {
  const col = "var(--neon-orange)";
  const base: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    zIndex: 3,
    pointerEvents: "none",
  };
  const map: Record<string, React.CSSProperties> = {
    tl: { top: -2, left: -2, borderTop: `${thick}px solid ${col}`, borderLeft: `${thick}px solid ${col}` },
    tr: { top: -2, right: -2, borderTop: `${thick}px solid ${col}`, borderRight: `${thick}px solid ${col}` },
    bl: { bottom: -2, left: -2, borderBottom: `${thick}px solid ${col}`, borderLeft: `${thick}px solid ${col}` },
    br: { bottom: -2, right: -2, borderBottom: `${thick}px solid ${col}`, borderRight: `${thick}px solid ${col}` },
  };
  return <div aria-hidden style={{ ...base, ...map[pos] }} />;
}

function Bar({ value, height = 8 }: { value: number; height?: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      style={{
        height,
        background: "var(--bg-deep)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset 0 0 0 1px #000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${v}%`,
          background: "var(--neon-purple)",
          boxShadow: "2px 0 0 #000",
          position: "relative",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, transparent 0 4px, rgba(0,0,0,0.28) 4px 6px)",
          }}
        />
      </div>
    </div>
  );
}

function AttrRow({ attr, scale = 1 }: { attr: TopAttr; scale?: number }) {
  const s = scale;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${28 * s}px 1fr ${28 * s}px`,
        alignItems: "center",
        columnGap: 10 * s,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span
          className="font-ui"
          style={{
            fontSize: 11 * s,
            color: "var(--neon-purple-text)",
            letterSpacing: 1,
            lineHeight: 1,
          }}
        >
          {attr.code}
        </span>
        <span
          className="font-ui"
          style={{
            fontSize: 7 * s,
            color: "var(--text-muted)",
            letterSpacing: 0.5,
            lineHeight: 1,
          }}
        >
          {attr.label}
        </span>
      </div>
      <Bar value={attr.value} height={8 * s} />
      <span
        className="font-retro"
        style={{
          fontSize: 18 * s,
          color: "var(--neon-purple-text)",
          textAlign: "right",
          lineHeight: 1,
          textShadow: "0 0 6px rgba(157,0,255,0.45)",
        }}
      >
        {attr.value}
      </span>
    </div>
  );
}

function ClaudeSigil({
  color = "var(--neon-green)",
  scale = 1,
}: {
  color?: string;
  scale?: number;
}) {
  const g = [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ];
  const px = 2.5 * scale;
  return (
    <div
      aria-hidden
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(5, ${px}px)`,
        gridTemplateRows: `repeat(5, ${px}px)`,
        flexShrink: 0,
      }}
    >
      {g.flat().map((on, i) => (
        <div
          key={i}
          style={{ width: px, height: px, background: on ? color : "transparent" }}
        />
      ))}
    </div>
  );
}

const fmtTraction = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

export function HeroCard({
  data,
  variant = "grid",
}: {
  data: HeroCardData;
  variant?: HeroCardVariant;
}) {
  const { t } = useLang();
  const {
    id, name, creator, category, evolutionStage,
    compound, topAttrs, traction, newChip,
  } = data;

  const evoColor = EVOLUTION_CONFIG[evolutionStage].color;
  const rank = RANK_BY_STAGE[evolutionStage];
  const idTail = id.replace(/[^a-zA-Z0-9]/g, "").slice(-3).toUpperCase().padStart(3, "0");

  const tracGlyph =
    traction.kind === "plays" ? "▲" : traction.kind === "upvotes" ? "★" : "◉";
  const tracLabelKey = `heroCard.traction.${traction.kind}` as TranslationKey;

  if (variant === "share") {
    return (
      <div
        style={{
          position: "relative",
          width: 1200,
          height: 630,
          background: "var(--bg-panel)",
          border: `4px solid ${evoColor}`,
          boxShadow: `8px 8px 0 #000, 0 0 0 2px var(--border-bolt) inset, 0 0 60px ${evoColor}44`,
          padding: 48,
          color: "var(--text)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: 48,
          overflow: "hidden",
        }}
      >
        <LCorner pos="tl" size={24} thick={4} />
        <LCorner pos="tr" size={24} thick={4} />
        <LCorner pos="bl" size={24} thick={4} />
        <LCorner pos="br" size={24} thick={4} />

        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.22) 3px 4px)",
            opacity: 0.55,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            className="font-ui"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              letterSpacing: 3,
              color: "var(--neon-green)",
            }}
          >
            <ClaudeSigil scale={1.4} />
            <span style={{ textShadow: "0 0 4px rgba(57,255,20,0.6)" }}>
              {t("heroCard.eyebrow")}
            </span>
          </div>

          <div
            style={{
              flex: 1,
              position: "relative",
              background: "var(--bg-deep)",
              border: `3px solid ${evoColor}`,
              boxShadow: `4px 4px 0 #000, inset 0 0 60px ${evoColor}22`,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              minHeight: 380,
            }}
          >
            {(["tl", "tr", "bl", "br"] as const).map((p) => (
              <div
                key={p}
                aria-hidden
                style={{
                  position: "absolute",
                  width: 8,
                  height: 8,
                  background: evoColor,
                  top: p.startsWith("t") ? 6 : "auto",
                  bottom: p.startsWith("b") ? 6 : "auto",
                  left: p.endsWith("l") ? 6 : "auto",
                  right: p.endsWith("r") ? 6 : "auto",
                }}
              />
            ))}
            <Image
              src={spriteFor(evolutionStage)}
              alt=""
              width={280}
              height={280}
              style={{
                imageRendering: "pixelated",
                filter: `drop-shadow(0 0 24px ${evoColor}aa)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 14,
                right: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                className="font-pixel"
                style={{
                  fontSize: 11,
                  color: evoColor,
                  letterSpacing: 2,
                  textShadow: `0 0 6px ${evoColor}`,
                }}
              >
                {evolutionStage.toUpperCase()} {t("heroCard.tier")}
              </span>
              <span
                className="font-ui"
                style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1.5 }}
              >
                #{idTail}
              </span>
            </div>
          </div>

          <div>
            <div
              className="font-pixel"
              style={{
                fontSize: 28,
                color: "var(--text)",
                letterSpacing: 1,
                lineHeight: 1.15,
                textShadow: "3px 3px 0 #000",
              }}
            >
              {name}
            </div>
            <div
              className="font-retro"
              style={{ marginTop: 10, fontSize: 22, color: "var(--text-muted)" }}
            >
              {t("heroCard.by")} <span style={{ color: "var(--text)" }}>@{creator}</span>
              <span
                className="font-ui"
                style={{
                  marginLeft: 14,
                  fontSize: 11,
                  letterSpacing: 1.5,
                  color: "var(--neon-purple-text)",
                  padding: "3px 8px",
                  background: "rgba(157,0,255,0.12)",
                  border: "1px solid rgba(157,0,255,0.4)",
                }}
              >
                {category}
              </span>
            </div>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              background: "var(--bg-card)",
              border: "3px solid var(--border-bolt)",
              padding: "24px 28px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="font-ui"
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: "var(--text-muted)",
                marginBottom: 14,
              }}
            >
              {t("heroCard.compound")}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span
                  className="font-pixel"
                  style={{
                    fontSize: 108,
                    color: "var(--neon-yellow)",
                    lineHeight: 0.9,
                    textShadow: "6px 6px 0 #000, 0 0 24px rgba(250,204,21,0.45)",
                  }}
                >
                  {compound}
                </span>
                <span
                  className="font-retro"
                  style={{ fontSize: 32, color: "var(--text-muted)", marginLeft: 8, lineHeight: 1 }}
                >
                  / 100
                </span>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 4,
                }}
              >
                <span
                  className="font-ui"
                  style={{ fontSize: 10, letterSpacing: 2.5, color: "var(--text-muted)" }}
                >
                  {t("heroCard.rank")}
                </span>
                <span
                  className="font-pixel"
                  style={{
                    fontSize: 64,
                    color: "var(--neon-yellow)",
                    lineHeight: 0.9,
                    textShadow: "4px 4px 0 #000, 0 0 18px rgba(250,204,21,0.5)",
                    letterSpacing: 2,
                  }}
                >
                  {rank}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div
              className="font-ui"
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: "var(--neon-green)",
                marginBottom: 16,
              }}
            >
              ▸ {t("heroCard.topAttrs")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {topAttrs.slice(0, 2).map((a) => (
                <AttrRow key={a.code} attr={a} scale={2} />
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: "auto",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 18,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: "Menlo, monospace", fontSize: 28, color: evoColor, lineHeight: 1 }}>
                {tracGlyph}
              </span>
              <span
                className="font-pixel"
                style={{ fontSize: 22, color: "var(--text)", lineHeight: 1, textShadow: "2px 2px 0 #000" }}
              >
                {fmtTraction(traction.value)}
              </span>
              <span
                className="font-ui"
                style={{ fontSize: 10, letterSpacing: 2, color: "var(--text-muted)", marginLeft: 2 }}
              >
                {t(tracLabelKey)}
              </span>
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ClaudeSigil color="var(--neon-green)" scale={1.2} />
              <span
                className="font-ui"
                style={{
                  color: "var(--neon-green)",
                  fontSize: 12,
                  letterSpacing: 2,
                }}
              >
                {t("heroCard.watermark")}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{
        width: 280,
        background: "var(--bg-panel)",
        border: `3px solid ${evoColor}`,
        boxShadow: `4px 4px 0 #000, 0 0 0 1px var(--border-bolt) inset`,
      }}
      whileHover={{
        x: -2,
        y: -2,
        boxShadow: `6px 6px 0 #000, 0 0 0 1px var(--border-bolt) inset`,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <LCorner pos="tl" />
      <LCorner pos="tr" />
      <LCorner pos="bl" />
      <LCorner pos="br" />

      <Link
        href={`/project/${encodeURIComponent(id)}`}
        // aria-label intentionally omitted — axe's label-content-name-mismatch
        // rule flags the (otherwise-helpful) "${name} — ${stage} tier,
        // compound ${compound}" summary because the card contains more
        // visible text (attributes, category, stats). Letting the accessible
        // name compute from children gives screen readers the full card
        // and passes the rule.
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neon-yellow)]"
        style={{ color: "var(--text)" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "var(--bg-deep)",
          }}
        >
          <ClaudeSigil color="var(--neon-green)" scale={0.9} />
          <span
            className="font-ui"
            style={{ fontSize: 7, letterSpacing: 2, color: "var(--neon-green)" }}
          >
            {t("heroCard.eyebrow")}
          </span>
          {newChip && (
            <span
              className="font-ui"
              style={{
                fontSize: 7,
                letterSpacing: 1.5,
                color: "var(--neon-green)",
                padding: "2px 5px",
                border: "1px solid var(--neon-green)",
                background: "rgba(57,255,20,0.10)",
                textShadow: "0 0 4px rgba(57,255,20,0.6)",
              }}
            >
              {t("heroCard.new")}
            </span>
          )}
          <span
            className="font-code"
            style={{
              marginLeft: "auto",
              fontSize: 7,
              color: "var(--text-muted)",
              letterSpacing: 0.5,
            }}
          >
            #{idTail}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "112px 1fr", gap: 12, padding: 12 }}>
          <div
            style={{
              position: "relative",
              width: 112,
              height: 112,
              background: "var(--bg-deep)",
              border: `2px solid ${evoColor}`,
              boxShadow: `inset 0 0 24px ${evoColor}22`,
              display: "grid",
              placeItems: "center",
            }}
          >
            {(["tl", "tr", "bl", "br"] as const).map((p) => (
              <div
                key={p}
                aria-hidden
                style={{
                  position: "absolute",
                  width: 5,
                  height: 5,
                  background: evoColor,
                  top: p.startsWith("t") ? 3 : "auto",
                  bottom: p.startsWith("b") ? 3 : "auto",
                  left: p.endsWith("l") ? 3 : "auto",
                  right: p.endsWith("r") ? 3 : "auto",
                }}
              />
            ))}
            <Image
              src={spriteFor(evolutionStage)}
              alt=""
              width={88}
              height={88}
              style={{
                imageRendering: "pixelated",
                filter: `drop-shadow(0 0 10px ${evoColor}aa)`,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div
                className="font-ui"
                style={{ fontSize: 7, letterSpacing: 2, color: "var(--text-muted)", marginBottom: 4 }}
              >
                {t("heroCard.compound")}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span
                  className="font-pixel"
                  style={{
                    fontSize: 38,
                    color: "var(--neon-yellow)",
                    lineHeight: 0.9,
                    textShadow: "2px 2px 0 #000, 0 0 10px rgba(250,204,21,0.4)",
                  }}
                >
                  {compound}
                </span>
                <span
                  className="font-retro"
                  style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1 }}
                >
                  /100
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                paddingTop: 6,
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                className="font-ui"
                style={{ fontSize: 7, letterSpacing: 2, color: "var(--text-muted)" }}
              >
                {t("heroCard.rank")}
              </span>
              <span
                className="font-pixel"
                style={{
                  fontSize: 24,
                  color: "var(--neon-yellow)",
                  lineHeight: 0.9,
                  letterSpacing: 1,
                  textShadow: "2px 2px 0 #000, 0 0 8px rgba(250,204,21,0.45)",
                }}
              >
                {rank}
              </span>
              <span
                className="font-pixel"
                style={{
                  marginLeft: "auto",
                  fontSize: 7,
                  color: evoColor,
                  letterSpacing: 1.5,
                  textShadow: `0 0 4px ${evoColor}`,
                }}
              >
                {evolutionStage.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 12px 10px 12px" }}>
          <div
            className="font-pixel"
            style={{
              fontSize: 12,
              color: "var(--text)",
              letterSpacing: 0.5,
              lineHeight: 1.3,
              textShadow: "1px 1px 0 #000",
              marginBottom: 5,
            }}
          >
            {name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              className="font-retro"
              style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1 }}
            >
              @{creator}
            </span>
            <span
              className="font-ui"
              style={{
                marginLeft: "auto",
                fontSize: 7,
                letterSpacing: 1.5,
                color: "var(--neon-purple-text)",
                padding: "2px 5px",
                background: "rgba(157,0,255,0.12)",
                border: "1px solid rgba(157,0,255,0.4)",
              }}
            >
              {category}
            </span>
          </div>
        </div>

        <div
          aria-hidden
          style={{
            height: 1,
            margin: "0 12px",
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--border-bolt) 0 3px, transparent 3px 6px)",
          }}
        />

        <div style={{ padding: "12px 12px 10px 12px", display: "flex", flexDirection: "column", gap: 9 }}>
          <div
            className="font-ui"
            style={{ fontSize: 7, letterSpacing: 2, color: "var(--neon-green)", marginBottom: 1 }}
          >
            ▸ {t("heroCard.topAttrs")}
          </div>
          {topAttrs.slice(0, 2).map((a) => (
            <AttrRow key={a.code} attr={a} scale={1} />
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--bg-deep)",
          }}
        >
          <span style={{ fontFamily: "Menlo, monospace", fontSize: 14, color: evoColor, lineHeight: 1 }}>
            {tracGlyph}
          </span>
          <span
            className="font-pixel"
            style={{ fontSize: 11, color: "var(--text)", lineHeight: 1, textShadow: "1px 1px 0 #000" }}
          >
            {fmtTraction(traction.value)}
          </span>
          <span
            className="font-ui"
            style={{ fontSize: 7, letterSpacing: 1.5, color: "var(--text-muted)" }}
          >
            {t(tracLabelKey)}
          </span>
          <span
            className="font-ui"
            style={{
              marginLeft: "auto",
              fontSize: 7,
              letterSpacing: 1.5,
              color: "var(--text-dim)",
            }}
          >
            {t("heroCard.view")} ›
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
