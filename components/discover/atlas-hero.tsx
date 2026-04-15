"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   THE ATLAS — pixel world map hero for /discover.
   Six themed regions, one per AI category. Each region has:
     - a handcrafted SVG pixel scene (city / forest / forge / docks / caves / volcano)
     - a neon accent color (locked by category, not by rarity — see DESIGN.md
       "1 primary per screen" rule: the whole page is yellow-primary, but each
       region carries its category identity as a SECONDARY accent on the tile)
     - a hero count + 2 featured heroes
     - hover lift + border glow

   Approved via /design-shotgun 2026-04-14, variant A ("Pokedex Overworld").
   Inspired by codedex.io's world map metaphor — each coding language is a
   region you "unlock". VibeX does the same for AI project categories.
   ═══════════════════════════════════════════════════════════════════════════ */

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "myth";

type Region = {
  id: string;
  name: string;
  category: string;
  accent: string;
  accentRgb: string;
  wash: string;
  count: number;
  scene: ReactNode;
  dots: { top?: string; left?: string; right?: string; bottom?: string; rarity: Rarity }[];
  featured: { name: string; rarity: Rarity; label: string }[];
};

const NEON_PURPLE = "#9D00FF";
const NEON_GREEN = "#39FF14";
const NEON_ORANGE = "#FF4500";
const NEON_CYAN = "#06B6D4";
const NEON_YELLOW = "#FACC15";
const NEON_PINK = "#EC4899";

/* ─── 6 regions ─── */
const REGIONS: Region[] = [
  {
    id: "agent",
    name: "CYBER CITY",
    category: "AI AGENT",
    accent: NEON_PURPLE,
    accentRgb: "157,0,255",
    wash:
      "radial-gradient(ellipse at 50% 75%, rgba(157,0,255,0.12), transparent 65%)",
    count: 52,
    scene: <CyberCityScene />,
    dots: [
      { top: "25%", left: "35%", rarity: "myth" },
      { top: "35%", left: "62%", rarity: "legendary" },
      { top: "55%", left: "78%", rarity: "common" },
    ],
    featured: [
      { name: "AgentCraft", rarity: "myth", label: "✦✦✦ MYTH" },
      { name: "CodeSage", rarity: "legendary", label: "✦✦ LEGEND" },
    ],
  },
  {
    id: "game",
    name: "PIXEL FOREST",
    category: "AI GAME",
    accent: NEON_GREEN,
    accentRgb: "57,255,20",
    wash:
      "radial-gradient(ellipse at 50% 75%, rgba(57,255,20,0.1), transparent 65%)",
    count: 38,
    scene: <PixelForestScene />,
    dots: [
      { top: "45%", left: "28%", rarity: "legendary" },
      { top: "65%", left: "55%", rarity: "common" },
      { top: "38%", left: "72%", rarity: "rare" },
    ],
    featured: [
      { name: "PixelForge", rarity: "legendary", label: "✦✦ LEGEND" },
      { name: "Starlight.io", rarity: "rare", label: "✦ RARE" },
    ],
  },
  {
    id: "tool",
    name: "THE FORGE",
    category: "AI TOOL",
    accent: NEON_ORANGE,
    accentRgb: "255,69,0",
    wash:
      "radial-gradient(ellipse at 50% 75%, rgba(255,69,0,0.1), transparent 65%)",
    count: 74,
    scene: <TheForgeScene />,
    dots: [
      { top: "42%", left: "20%", rarity: "legendary" },
      { top: "62%", left: "52%", rarity: "common" },
      { top: "35%", left: "75%", rarity: "rare" },
    ],
    featured: [
      { name: "MoodAlchemy", rarity: "epic", label: "✦ EPIC" },
      { name: "VibeTranslate", rarity: "rare", label: "✦ RARE" },
    ],
  },
  {
    id: "workflow",
    name: "THE DOCKS",
    category: "AI WORKFLOW",
    accent: NEON_CYAN,
    accentRgb: "6,182,212",
    wash:
      "radial-gradient(ellipse at 50% 75%, rgba(6,182,212,0.1), transparent 65%)",
    count: 31,
    scene: <TheDocksScene />,
    dots: [
      { top: "40%", left: "18%", rarity: "common" },
      { top: "50%", left: "42%", rarity: "rare" },
      { top: "45%", left: "68%", rarity: "legendary" },
    ],
    featured: [
      { name: "LoopMaster", rarity: "legendary", label: "✦✦ LEGEND" },
      { name: "Hyperdrive", rarity: "epic", label: "✦ EPIC" },
    ],
  },
  {
    id: "utility",
    name: "UNDERGROUND",
    category: "AI UTILITY",
    accent: NEON_YELLOW,
    accentRgb: "250,204,21",
    wash:
      "radial-gradient(ellipse at 50% 75%, rgba(250,204,21,0.08), transparent 65%)",
    count: 23,
    scene: <UndergroundScene />,
    dots: [
      { top: "52%", left: "24%", rarity: "rare" },
      { top: "70%", left: "50%", rarity: "common" },
      { top: "58%", left: "78%", rarity: "legendary" },
    ],
    featured: [
      { name: "QuantumInk", rarity: "rare", label: "✦ RARE" },
      { name: "TinyGPT", rarity: "uncommon", label: "UNCOMMON" },
    ],
  },
  {
    id: "experiment",
    name: "THE VOLCANO",
    category: "AI EXPERIMENT",
    accent: NEON_PINK,
    accentRgb: "236,72,153",
    wash:
      "radial-gradient(ellipse at 50% 75%, rgba(236,72,153,0.1), transparent 65%)",
    count: 12,
    scene: <TheVolcanoScene />,
    dots: [
      { top: "38%", left: "46%", rarity: "myth" },
      { top: "60%", left: "26%", rarity: "legendary" },
      { top: "72%", left: "70%", rarity: "common" },
    ],
    featured: [
      { name: "DreamCast", rarity: "myth", label: "✦✦✦ MYTH" },
      { name: "RhymeBot", rarity: "common", label: "COMMON" },
    ],
  },
];

function rarityColor(r: Rarity): string {
  if (r === "myth") return "var(--neon-pink)";
  if (r === "legendary") return "var(--neon-yellow)";
  if (r === "epic") return "var(--neon-orange)";
  if (r === "rare") return "var(--neon-cyan)";
  if (r === "uncommon") return "var(--neon-green)";
  return "var(--muted)";
}

export function AtlasHero() {
  return (
    <div className="relative">
      {/* ═══ Top chrome: Explorer + Expedition quest + Search ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid items-center mb-6 px-5 py-4 relative"
        style={{
          gridTemplateColumns: "auto 1fr auto",
          gap: 18,
          background: "var(--bg-panel)",
          border: "2px solid var(--border-metal)",
        }}
      >
        {/* top accent bar */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0"
          style={{ height: 3, background: "var(--neon-yellow)" }}
        />

        {/* Explorer LV */}
        <div className="flex items-center gap-3.5">
          <div
            className="font-pixel"
            style={{
              fontSize: 22,
              color: "var(--neon-yellow)",
              textShadow: "0 0 8px rgba(250,204,21,0.7)",
              letterSpacing: 1,
            }}
          >
            LV.12
          </div>
          <div>
            <div
              className="font-ui"
              style={{
                fontSize: 11,
                color: "var(--muted)",
                letterSpacing: 2,
                marginBottom: 3,
              }}
            >
              ◆ EXPLORER
            </div>
            <div
              className="font-ui"
              style={{
                fontSize: 12,
                color: "var(--text)",
                letterSpacing: 1,
              }}
            >
              42 / 250 DISCOVERED &nbsp;·&nbsp;{" "}
              <b style={{ color: "var(--neon-yellow)", fontWeight: "normal" }}>
                16.8%
              </b>{" "}
              COMPLETE
            </div>
          </div>
        </div>

        {/* Active Expedition quest */}
        <div
          className="hidden lg:block"
          style={{
            borderLeft: "1.5px solid var(--border-metal)",
            borderRight: "1.5px solid var(--border-metal)",
            padding: "0 20px",
          }}
        >
          <div
            className="font-ui"
            style={{
              fontSize: 10,
              color: "var(--neon-yellow)",
              letterSpacing: 2,
              marginBottom: 5,
            }}
          >
            ▸ ACTIVE EXPEDITION
          </div>
          <div
            className="font-ui"
            style={{
              fontSize: 13,
              color: "var(--text)",
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            SCOUT 3 EPIC+ HEROES THIS WEEK
          </div>
          <div
            className="font-retro"
            style={{ fontSize: 17, color: "var(--muted)" }}
          >
            Progress:{" "}
            <b style={{ color: "var(--neon-pink)", fontWeight: "normal" }}>
              1/3
            </b>{" "}
            · Reward: +50 XP, Rare Badge Drop
          </div>
        </div>

        {/* Search (hidden on lg; shown on lg for space) */}
        <div
          className="hidden lg:flex items-center gap-2"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1.5px solid rgba(157,0,255,0.4)",
            padding: "9px 14px",
            minWidth: 240,
          }}
        >
          <span
            className="font-ui"
            style={{ fontSize: 12, color: "var(--neon-green)" }}
          >
            ▸
          </span>
          <input
            className="font-retro bg-transparent border-0 outline-none w-full"
            style={{ fontSize: 17, color: "var(--text)" }}
            placeholder="Scout the atlas..."
          />
        </div>
      </motion.div>

      {/* ═══ Eyebrow + Title ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div
          className="font-ui mb-1.5 mt-1.5"
          style={{
            fontSize: 12,
            color: "var(--neon-green)",
            letterSpacing: 3,
            textShadow: "0 0 4px rgba(57,255,20,0.7)",
          }}
        >
          ▸ VIBEX://THE_ATLAS ·{" "}
          <b style={{ color: "var(--neon-yellow)", fontWeight: "normal" }}>
            6 REGIONS
          </b>{" "}
          · LIVE SIGHTINGS
        </div>
        <h1
          className="font-pixel mb-1.5"
          style={{
            fontSize: 26,
            letterSpacing: 3,
            color: "var(--text)",
            textShadow: "0 0 10px rgba(232,232,236,0.3)",
          }}
        >
          CHOOSE YOUR{" "}
          <span
            style={{
              color: "var(--neon-yellow)",
              textShadow: "0 0 12px rgba(250,204,21,0.7)",
            }}
          >
            EXPEDITION
          </span>
        </h1>
        <p
          className="font-retro mb-5"
          style={{ fontSize: 19, color: "var(--muted)" }}
        >
          Every AI project lives in one of six regions. Hunt heroes. Collect
          badges. Grow your codex.
        </p>
      </motion.div>

      {/* ═══ 3x2 REGION GRID (the atlas itself) ═══ */}
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: 18,
          minHeight: 720,
        }}
      >
        {/* Floating "YOU ARE HERE" marker at center */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none z-20 flex flex-col items-center"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <motion.div
            className="font-ui"
            style={{
              fontSize: 9,
              color: "var(--neon-yellow)",
              letterSpacing: 2,
              background: "rgba(0,0,0,0.85)",
              padding: "4px 8px",
              border: "1.5px solid var(--neon-yellow)",
              marginBottom: 6,
              whiteSpace: "nowrap",
            }}
            animate={{
              boxShadow: [
                "0 0 12px rgba(250,204,21,0.5)",
                "0 0 22px rgba(250,204,21,0.9)",
                "0 0 12px rgba(250,204,21,0.5)",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ◆ YOU ARE HERE
          </motion.div>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "8px solid var(--neon-yellow)",
              marginTop: -2,
            }}
          />
        </div>

        {REGIONS.map((region, i) => (
          <motion.div
            key={region.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
            whileHover={{ x: -2, y: -2 }}
            className="relative overflow-hidden cursor-pointer"
            style={{
              background: "var(--bg-card)",
              border: "2px solid var(--border-metal)",
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              minHeight: 330,
            }}
          >
            {/* top accent bar */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0"
              style={{ height: 3, background: region.accent }}
            />
            {/* tonal wash */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{ background: region.wash, zIndex: 0 }}
            />

            {/* header row */}
            <div className="relative z-[2] flex items-start justify-between mb-2.5">
              <div>
                <div
                  className="font-pixel"
                  style={{
                    fontSize: 14,
                    color: "var(--text)",
                    letterSpacing: 2,
                    lineHeight: 1.3,
                    textShadow: `0 0 8px rgba(${region.accentRgb}, 0.4)`,
                  }}
                >
                  {region.name}
                </div>
                <div
                  className="font-ui"
                  style={{
                    fontSize: 9,
                    color: region.accent,
                    letterSpacing: 1,
                    marginTop: 4,
                  }}
                >
                  {region.category}
                </div>
              </div>
              <div
                className="font-ui text-right"
                style={{
                  fontSize: 8,
                  color: "var(--muted)",
                  letterSpacing: 1,
                }}
              >
                HEROES
                <div
                  className="font-pixel"
                  style={{
                    fontSize: 20,
                    color: "var(--text)",
                    lineHeight: 1.1,
                    marginTop: 2,
                  }}
                >
                  {region.count}
                </div>
              </div>
            </div>

            {/* scene */}
            <div
              className="relative z-[2] flex-1 overflow-hidden"
              style={{
                minHeight: 130,
                background: "rgba(0,0,0,0.4)",
                border: `1.5px solid ${region.accent}`,
                margin: "8px -8px 10px",
              }}
            >
              {region.scene}
              {/* CRT scanlines on top */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 3px)",
                }}
              />
              {/* project dots */}
              {region.dots.map((d, di) => (
                <motion.div
                  key={di}
                  className="absolute z-[3]"
                  style={{
                    top: d.top,
                    left: d.left,
                    right: d.right,
                    bottom: d.bottom,
                    width: d.rarity === "myth" ? 12 : 10,
                    height: d.rarity === "myth" ? 12 : 10,
                    background: rarityColor(d.rarity),
                    boxShadow: `0 0 10px ${rarityColor(d.rarity)}`,
                    border: "1.5px solid #000",
                  }}
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.85, 1, 0.85],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: di * 0.3,
                  }}
                />
              ))}
              {/* region sign */}
              <div
                className="font-ui absolute z-[4]"
                style={{
                  bottom: 8,
                  left: 8,
                  fontSize: 9,
                  color: region.accent,
                  letterSpacing: 1.5,
                  background: "rgba(0,0,0,0.8)",
                  padding: "3px 7px",
                  border: `1px solid ${region.accent}`,
                }}
              >
                ◆ {region.name}
              </div>
            </div>

            {/* featured drops */}
            <div
              className="relative z-[2] border-t pt-2.5 font-ui"
              style={{
                borderColor: "var(--border-metal)",
                fontSize: 9,
                lineHeight: 1.7,
                color: "var(--muted)",
                letterSpacing: 0.5,
              }}
            >
              <div
                className="block"
                style={{
                  color: region.accent,
                  fontSize: 8,
                  letterSpacing: 2,
                  marginBottom: 4,
                }}
              >
                ▸ FEATURED DROPS
              </div>
              {region.featured.map((f, fi) => (
                <div
                  key={fi}
                  className="block"
                  style={{ color: "var(--text)" }}
                >
                  {f.name}{" "}
                  <span
                    style={{
                      fontSize: 7,
                      color: rarityColor(f.rarity),
                    }}
                  >
                    {f.label}
                  </span>
                </div>
              ))}
              <div className="block" style={{ color: "var(--muted)" }}>
                + {region.count - 2} more heroes
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══ Legend ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="flex items-center justify-between mt-5 px-5 py-3 font-ui"
        style={{
          background: "var(--bg-panel)",
          border: "2px solid var(--border-metal)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: 1.5,
        }}
      >
        <div className="flex gap-[22px]">
          {[
            { label: "COMMON", color: "var(--muted)", glow: "none" },
            { label: "RARE", color: "var(--neon-cyan)", glow: "0 0 6px var(--neon-cyan)" },
            {
              label: "LEGENDARY",
              color: "var(--neon-yellow)",
              glow: "0 0 6px var(--neon-yellow)",
            },
            {
              label: "MYTHIC",
              color: "var(--neon-pink)",
              glow: "0 0 8px rgba(236,72,153,0.8)",
            },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span
                style={{
                  width: 8,
                  height: 8,
                  background: item.color,
                  boxShadow: item.glow,
                }}
              />
              {item.label}
            </span>
          ))}
        </div>
        <div
          style={{
            color: "var(--neon-green)",
            textShadow: "0 0 4px rgba(57,255,20,0.6)",
          }}
        >
          ▸ CLICK A REGION TO ENTER · HOVER FOR DETAILS
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCENES — inline SVG pixel art for each region
   viewBox is 200x120, shape-rendering crispEdges keeps the pixels sharp
   ═══════════════════════════════════════════════════════════════════════════ */

function SceneSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      className="absolute inset-0 w-full h-full"
    >
      {children}
    </svg>
  );
}

function CyberCityScene() {
  return (
    <SceneSvg>
      <rect x="0" y="75" width="200" height="45" fill="rgba(157,0,255,0.18)" />
      {/* building 1 */}
      <rect x="10" y="50" width="20" height="70" fill="rgba(20,12,30,0.9)" />
      <rect x="13" y="55" width="3" height="3" fill="#9D00FF" />
      <rect x="22" y="60" width="3" height="3" fill="#9D00FF" />
      <rect x="13" y="67" width="3" height="3" fill="#FACC15" />
      <rect x="22" y="72" width="3" height="3" fill="#9D00FF" />
      {/* building 2 */}
      <rect x="34" y="30" width="16" height="90" fill="rgba(30,15,40,0.95)" />
      <rect x="38" y="36" width="3" height="3" fill="#9D00FF" />
      <rect x="44" y="40" width="3" height="3" fill="#EC4899" />
      <rect x="38" y="50" width="3" height="3" fill="#9D00FF" />
      <rect x="44" y="58" width="3" height="3" fill="#9D00FF" />
      <rect x="38" y="68" width="3" height="3" fill="#FACC15" />
      <rect x="44" y="78" width="3" height="3" fill="#9D00FF" />
      {/* building 3 */}
      <rect x="54" y="60" width="12" height="60" fill="rgba(20,12,30,0.9)" />
      <rect x="57" y="65" width="3" height="3" fill="#9D00FF" />
      <rect x="62" y="73" width="3" height="3" fill="#9D00FF" />
      {/* building 4 */}
      <rect x="70" y="40" width="22" height="80" fill="rgba(30,15,40,0.95)" />
      <rect x="73" y="46" width="3" height="3" fill="#9D00FF" />
      <rect x="80" y="52" width="3" height="3" fill="#EC4899" />
      <rect x="87" y="48" width="3" height="3" fill="#9D00FF" />
      <rect x="73" y="62" width="3" height="3" fill="#9D00FF" />
      <rect x="80" y="70" width="3" height="3" fill="#FACC15" />
      <rect x="87" y="64" width="3" height="3" fill="#9D00FF" />
      {/* building 5 */}
      <rect x="98" y="55" width="14" height="65" fill="rgba(20,12,30,0.9)" />
      <rect x="102" y="60" width="3" height="3" fill="#9D00FF" />
      <rect x="107" y="68" width="3" height="3" fill="#9D00FF" />
      {/* building 6 (tallest) */}
      <rect x="116" y="35" width="20" height="85" fill="rgba(30,15,40,0.95)" />
      <rect x="119" y="42" width="3" height="3" fill="#9D00FF" />
      <rect x="126" y="48" width="3" height="3" fill="#EC4899" />
      <rect x="132" y="44" width="3" height="3" fill="#9D00FF" />
      <rect x="119" y="58" width="3" height="3" fill="#9D00FF" />
      <rect x="126" y="66" width="3" height="3" fill="#FACC15" />
      <rect x="132" y="60" width="3" height="3" fill="#9D00FF" />
      <rect x="119" y="76" width="3" height="3" fill="#9D00FF" />
      {/* buildings 7-9 */}
      <rect x="142" y="48" width="18" height="72" fill="rgba(20,12,30,0.9)" />
      <rect x="146" y="54" width="3" height="3" fill="#9D00FF" />
      <rect x="152" y="60" width="3" height="3" fill="#EC4899" />
      <rect x="146" y="68" width="3" height="3" fill="#9D00FF" />
      <rect x="152" y="78" width="3" height="3" fill="#FACC15" />
      <rect x="164" y="55" width="14" height="65" fill="rgba(30,15,40,0.95)" />
      <rect x="168" y="62" width="3" height="3" fill="#9D00FF" />
      <rect x="174" y="70" width="3" height="3" fill="#9D00FF" />
      <rect x="182" y="42" width="14" height="78" fill="rgba(20,12,30,0.9)" />
      <rect x="185" y="48" width="3" height="3" fill="#9D00FF" />
      <rect x="190" y="58" width="3" height="3" fill="#EC4899" />
      <rect x="185" y="70" width="3" height="3" fill="#FACC15" />
      {/* moon */}
      <circle cx="170" cy="22" r="8" fill="#9D00FF" opacity="0.8" />
      <circle cx="172" cy="20" r="6" fill="#0D0D0D" />
    </SceneSvg>
  );
}

function PixelForestScene() {
  return (
    <SceneSvg>
      <rect x="0" y="95" width="200" height="25" fill="rgba(57,255,20,0.12)" />
      <rect x="156" y="12" width="12" height="12" fill="#FACC15" opacity="0.9" />
      <rect x="160" y="16" width="8" height="4" fill="#0D0D0D" />
      {/* trees: triangle pairs + trunks */}
      {[
        { x: 14, base: 95, mid: 70, top: 58 },
        { x: 36, base: 95, mid: 62, top: 48 },
        { x: 86, base: 95, mid: 54, top: 42 },
        { x: 116, base: 95, mid: 68, top: 54 },
        { x: 146, base: 95, mid: 60, top: 46 },
        { x: 176, base: 95, mid: 62, top: 50 },
      ].map((t, i) => (
        <g key={i}>
          <polygon
            points={`${t.x},${t.base} ${t.x - 10},${t.mid} ${t.x + 10},${t.mid}`}
            fill="rgba(57,255,20,0.45)"
            stroke="#39FF14"
            strokeWidth="1"
          />
          <polygon
            points={`${t.x},${t.mid - 17} ${t.x - 8},${t.top} ${t.x + 8},${t.top}`}
            fill="rgba(57,255,20,0.65)"
            stroke="#39FF14"
            strokeWidth="1"
          />
          <rect x={t.x - 2} y="95" width="4" height="6" fill="#1E9C00" />
        </g>
      ))}
      {/* shorter stand-alone tree */}
      <polygon
        points="62,95 52,68 72,68"
        fill="rgba(57,255,20,0.35)"
        stroke="#39FF14"
        strokeWidth="1"
      />
      <rect x="60" y="95" width="4" height="6" fill="#1E9C00" />
      {/* grass dots */}
      <rect x="50" y="100" width="2" height="2" fill="#39FF14" />
      <rect x="78" y="102" width="2" height="2" fill="#39FF14" />
      <rect x="128" y="100" width="2" height="2" fill="#39FF14" />
      <rect x="160" y="102" width="2" height="2" fill="#39FF14" />
    </SceneSvg>
  );
}

function TheForgeScene() {
  return (
    <SceneSvg>
      <rect x="0" y="100" width="200" height="20" fill="rgba(255,69,0,0.1)" />
      {/* furnace */}
      <rect x="20" y="50" width="46" height="50" fill="rgba(30,12,0,0.9)" />
      <rect x="25" y="55" width="36" height="8" fill="rgba(255,69,0,0.3)" />
      <rect x="26" y="70" width="34" height="22" fill="rgba(255,69,0,0.8)" />
      <rect x="28" y="74" width="4" height="8" fill="#FACC15" />
      <rect x="34" y="78" width="3" height="6" fill="#FFD700" />
      <rect x="40" y="72" width="4" height="10" fill="#FACC15" />
      <rect x="46" y="78" width="3" height="7" fill="#FFD700" />
      <rect x="52" y="74" width="4" height="9" fill="#FACC15" />
      {/* chimney smoke */}
      <rect x="34" y="35" width="8" height="18" fill="rgba(30,12,0,0.9)" />
      <rect x="30" y="25" width="4" height="3" fill="rgba(255,69,0,0.6)" />
      <rect x="38" y="18" width="5" height="4" fill="rgba(255,69,0,0.5)" />
      <rect x="46" y="10" width="4" height="3" fill="rgba(255,69,0,0.4)" />
      {/* anvil */}
      <rect x="80" y="78" width="34" height="4" fill="rgba(100,100,110,0.9)" />
      <rect x="82" y="82" width="30" height="6" fill="rgba(70,70,80,0.9)" />
      <rect x="88" y="88" width="18" height="14" fill="rgba(50,50,60,0.9)" />
      {/* sparks */}
      <rect x="96" y="70" width="2" height="2" fill="#FACC15" />
      <rect x="100" y="64" width="2" height="2" fill="#FFD700" />
      <rect x="104" y="72" width="2" height="2" fill="#FACC15" />
      <rect x="92" y="68" width="2" height="2" fill="#FF4500" />
      {/* hammer */}
      <rect x="120" y="60" width="3" height="24" fill="rgba(140,80,40,0.9)" />
      <rect x="114" y="55" width="16" height="8" fill="rgba(80,80,90,0.95)" />
      {/* gear */}
      <rect x="148" y="62" width="24" height="24" fill="rgba(60,60,70,0.9)" />
      <rect x="144" y="70" width="32" height="8" fill="rgba(60,60,70,0.9)" />
      <rect x="156" y="58" width="8" height="32" fill="rgba(60,60,70,0.9)" />
      <rect x="156" y="70" width="8" height="8" fill="rgba(255,69,0,0.6)" />
      <rect x="180" y="85" width="14" height="15" fill="rgba(40,20,0,0.9)" />
    </SceneSvg>
  );
}

function TheDocksScene() {
  return (
    <SceneSvg>
      <rect x="0" y="70" width="200" height="50" fill="rgba(6,182,212,0.15)" />
      {[
        { x: 8, y: 75 },
        { x: 28, y: 82, op: 0.7 },
        { x: 52, y: 78 },
        { x: 80, y: 90, op: 0.6 },
        { x: 104, y: 84 },
        { x: 130, y: 78, op: 0.7 },
        { x: 156, y: 92, op: 0.6 },
        { x: 176, y: 86 },
      ].map((w, i) => (
        <rect
          key={i}
          x={w.x}
          y={w.y}
          width={14}
          height={1}
          fill="#06B6D4"
          opacity={w.op ?? 1}
        />
      ))}
      {/* dock platform */}
      <rect x="0" y="66" width="200" height="4" fill="rgba(100,80,40,0.9)" />
      {/* crane */}
      <rect x="18" y="30" width="6" height="36" fill="rgba(6,182,212,0.6)" />
      <rect x="12" y="26" width="44" height="3" fill="rgba(6,182,212,0.9)" />
      <rect x="50" y="28" width="3" height="14" fill="rgba(6,182,212,0.8)" />
      <rect x="48" y="42" width="7" height="5" fill="rgba(80,80,90,0.95)" />
      {/* ship 1 */}
      <rect x="72" y="52" width="40" height="6" fill="rgba(80,60,30,0.95)" />
      <rect x="68" y="58" width="48" height="8" fill="rgba(60,40,20,0.95)" />
      <rect x="90" y="32" width="4" height="20" fill="rgba(140,140,150,0.8)" />
      <rect x="94" y="34" width="14" height="8" fill="rgba(232,232,236,0.6)" />
      <rect x="94" y="34" width="14" height="2" fill="#06B6D4" />
      {/* ship 2 */}
      <rect x="128" y="55" width="32" height="5" fill="rgba(80,60,30,0.95)" />
      <rect x="124" y="60" width="40" height="6" fill="rgba(60,40,20,0.95)" />
      <rect x="140" y="38" width="4" height="17" fill="rgba(140,140,150,0.8)" />
      <rect x="144" y="40" width="10" height="6" fill="rgba(232,232,236,0.6)" />
      {/* container */}
      <rect x="170" y="56" width="22" height="10" fill="rgba(6,182,212,0.7)" />
      <rect x="170" y="56" width="22" height="1" fill="#06B6D4" />
      <rect x="173" y="60" width="2" height="2" fill="#FACC15" />
      <rect x="179" y="60" width="2" height="2" fill="#FACC15" />
      <rect x="185" y="60" width="2" height="2" fill="#FACC15" />
    </SceneSvg>
  );
}

function UndergroundScene() {
  return (
    <SceneSvg>
      <rect x="0" y="0" width="200" height="120" fill="rgba(30,25,0,0.5)" />
      {/* stalactites */}
      {[
        { x: 10, h: 28 },
        { x: 28, h: 40, w: 12 },
        { x: 48, h: 22 },
        { x: 68, h: 46, w: 16 },
        { x: 92, h: 30, w: 12 },
        { x: 112, h: 42, w: 16 },
        { x: 134, h: 26 },
        { x: 154, h: 38, w: 16 },
        { x: 176, h: 30, w: 12 },
        { x: 192, h: 22, w: 12 },
      ].map((s, i) => {
        const half = (s.w ?? 8) / 2;
        return (
          <polygon
            key={i}
            points={`${s.x},0 ${s.x - half},${s.h} ${s.x + half},${s.h}`}
            fill={i % 2 === 0 ? "rgba(80,70,20,0.9)" : "rgba(100,90,30,0.95)"}
          />
        );
      })}
      {/* stalagmites */}
      {[
        { x: 18, t: 90 },
        { x: 42, t: 76, w: 16 },
        { x: 78, t: 80, w: 16 },
        { x: 108, t: 74, w: 16 },
        { x: 138, t: 92 },
        { x: 164, t: 78, w: 16 },
        { x: 184, t: 88 },
      ].map((s, i) => {
        const half = (s.w ?? 8) / 2;
        return (
          <polygon
            key={i}
            points={`${s.x},120 ${s.x - half},${s.t} ${s.x + half},${s.t}`}
            fill={i % 2 === 0 ? "rgba(80,70,20,0.9)" : "rgba(100,90,30,0.95)"}
          />
        );
      })}
      {/* torch */}
      <rect x="82" y="52" width="3" height="10" fill="rgba(140,80,30,0.95)" />
      <rect x="78" y="45" width="11" height="7" fill="rgba(255,69,0,0.8)" />
      <rect x="80" y="42" width="7" height="4" fill="#FACC15" />
      <rect x="82" y="39" width="3" height="3" fill="#FFD700" />
      {/* crystals */}
      <polygon points="128,72 124,64 132,64" fill="rgba(250,204,21,0.8)" stroke="#FACC15" strokeWidth="1" />
      <polygon points="146,70 142,60 150,60" fill="rgba(250,204,21,0.7)" stroke="#FACC15" strokeWidth="1" />
      <polygon points="160,72 156,66 164,66" fill="rgba(250,204,21,0.8)" stroke="#FACC15" strokeWidth="1" />
    </SceneSvg>
  );
}

function TheVolcanoScene() {
  return (
    <SceneSvg>
      <rect x="0" y="0" width="200" height="60" fill="rgba(60,20,40,0.6)" />
      <circle cx="140" cy="18" r="7" fill="rgba(100,40,60,0.6)" />
      <circle cx="155" cy="14" r="9" fill="rgba(120,50,80,0.5)" />
      <circle cx="170" cy="20" r="6" fill="rgba(80,30,60,0.6)" />
      {/* mountain */}
      <polygon
        points="0,120 0,90 50,50 90,28 135,50 165,70 200,90 200,120"
        fill="rgba(30,10,20,0.95)"
      />
      {/* crater rim */}
      <polygon
        points="75,36 90,28 106,34 112,38 104,40 92,36 82,40"
        fill="rgba(236,72,153,0.8)"
      />
      <rect x="88" y="32" width="3" height="3" fill="#FACC15" />
      <rect x="94" y="30" width="3" height="3" fill="#FFD700" />
      <rect x="98" y="34" width="3" height="3" fill="#FACC15" />
      {/* lava flows */}
      <polygon
        points="90,40 86,56 94,68 100,82 104,96 98,110 92,120 88,120 86,110 90,96 84,82 86,68 82,56"
        fill="rgba(236,72,153,0.6)"
        stroke="#EC4899"
        strokeWidth="0.8"
      />
      <polygon
        points="102,38 108,52 102,68 110,84 108,100 114,118 110,120 104,114 98,98 104,82 96,66 102,52"
        fill="rgba(255,69,0,0.5)"
        stroke="#FF4500"
        strokeWidth="0.8"
      />
      {/* cracks */}
      <rect x="40" y="100" width="20" height="1.5" fill="rgba(236,72,153,0.7)" />
      <rect x="65" y="108" width="30" height="1.5" fill="rgba(255,69,0,0.6)" />
      <rect x="120" y="96" width="40" height="1.5" fill="rgba(236,72,153,0.7)" />
      <rect x="160" y="106" width="30" height="1.5" fill="rgba(255,69,0,0.6)" />
      {/* sparks */}
      <rect x="86" y="20" width="2" height="2" fill="#FACC15" />
      <rect x="92" y="14" width="2" height="2" fill="#FFD700" />
      <rect x="100" y="22" width="2" height="2" fill="#FACC15" />
    </SceneSvg>
  );
}
