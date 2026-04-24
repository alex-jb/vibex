"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ForgeCounter } from "@/components/landing/forge-counter";

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE — v8 VibeXForge forge treatment.
   Replaces the v7 Pokémon-TCG gold/purple/cyan hero card with an arcade/anvil
   card that matches /profile + /arena V2 (forge-orange + cream + Game Boy
   rhythm). Three-zone composition preserved:
     • Left column : forge terminal boot log (VIBEXFORGE://BOOT_V1.5)
     • Center stack: anvil hero card + glitch headline + CTAs
     • Chrome      : status bar top, L-corner brackets, scanline overlay
   Approved 2026-04-23 (direct write path after V2 /profile+/arena shipped).
   ═══════════════════════════════════════════════════════════════════════════ */

const pixelEase = [0.22, 1, 0.36, 1] as const;

const C = {
  FORGE: "#FF4500",
  CREAM: "#FFE27D",
  GREEN: "#39FF14",
  YELLOW: "#FACC15",
  RED: "#EF4444",
} as const;

/* ─── Boot log content ─── */
const BOOT_LINES: { text: string; tone?: "forge" | "warn" | "ok" | "ready" }[] = [
  { text: "$ vibexforge launch", tone: "forge" },
  { text: "> forge.core ...... OK", tone: "ok" },
  { text: "> hero.sprites .... OK", tone: "ok" },
  { text: "> evo.engine ...... OK", tone: "ok" },
  { text: "> anvil ........... OK", tone: "ok" },
  { text: "> qr.stamps ....... OK", tone: "ok" },
  { text: "> shard.01 ........", tone: "forge" },
  { text: "! purging legacy", tone: "warn" },
  { text: "> 48t 43r 105cx", tone: "ok" },
  { text: ">> FORGED.", tone: "ready" },
];

/* Compact VIBEXFORGE title in block-shade characters — fits the 300px
   left column at 7px monospace. Kept as ASCII so it reads as a terminal
   banner, not a bitmap image. */
const FORGE_LOGO = `██╗   ██╗██╗██████╗ ███████╗██╗  ██╗
██║   ██║██║██╔══██╗██╔════╝╚██╗██╔╝
██║   ██║██║██████╔╝█████╗   ╚███╔╝
╚██╗ ██╔╝██║██╔══██╗██╔══╝   ██╔██╗
 ╚████╔╝ ██║██████╔╝███████╗██╔╝ ██╗
  ╚═══╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝
  ═══ F O R G E ═══════════════════`;

function toneColor(tone?: "forge" | "warn" | "ok" | "ready"): string {
  if (tone === "warn") return C.YELLOW;
  if (tone === "forge") return C.FORGE;
  if (tone === "ready") return C.CREAM;
  return C.GREEN;
}

/* ─── 16×16 pixel-art seed sprite, inline SVG, palette-locked.
   Replaces public/generated/evo-*.png on this surface because those PNGs
   have an opaque mauve background baked in (sampled 2026-04-23: all edges
   = rgba(69,46,74,255)) that would bleed purple on black/forge surfaces.
   Rendered at integer pixel grid so it reads as pixel art at any size. */
function PixelSprite({ size = 40 }: { size?: number }) {
  const F = C.FORGE;      // body
  const D = "#A32A00";    // body shadow (darker forge)
  const CR = C.CREAM;     // leaf / highlight
  const K = "#0A0A0C";    // outline
  const cmap: Record<string, string | null> = {
    ".": null, F: F, D: D, C: CR, K: K,
  };
  // prettier-ignore
  const rows = [
    "................",
    ".......C........",
    "......CC........",
    ".....CCC........",
    "................",
    "....KKFFFFKK....",
    "...KFFFFFFFFK...",
    "..KFFDFFFFDFFK..",
    "..KFCFFFFFFCFK..",
    "..KFFFFFFFFFFK..",
    "..KFFFFDDFFFFK..",
    "...KFFFFFFFFK...",
    "....KKFFFFKK....",
    ".....KK..KK.....",
    "................",
    "................",
  ];
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={{ imageRendering: "pixelated" }} aria-hidden="true">
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const c = cmap[ch];
          return c ? <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={c} /> : null;
        })
      )}
    </svg>
  );
}

export default function LandingPage() {
  const router = useRouter();

  /* SPACE key launches the full app (desktop power user shortcut) */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        router.push("/home");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* Visually-hidden page introduction so crawlers + screen readers
          get a proper heading + definitional prose without breaking the
          arcade splash. The press-start screen is intentionally one
          viewport tall and can't carry visible body copy without pushing
          the CTAs below the fold. Citability agent measured `/` at 22/100
          before this block — LLMs need at least one answer-friendly
          paragraph to cite the page when asked "what is VibeXForge?". */}
      <section className="sr-only" aria-label="About VibeXForge">
        <h1>VibeXForge — Launch your AI project. Watch it evolve.</h1>
        <p>
          VibeXForge (formerly VibeX) is an AI-native launch platform where
          creators publish projects and receive structured reviews from
          Claude across four dimensions: originality, craft, market fit,
          and growth. Every project becomes a collectible RPG hero that
          evolves through six stages — Seed, Active, Growing, Breakout,
          Legend, and Myth — based on real traction (plays, saves,
          shares) rather than upvote sprints. Built for the LLM era as
          an alternative to Product Hunt specifically for AI tools,
          agents, and vibe-coded projects.
        </p>
        <h2>How VibeXForge is different from Product Hunt</h2>
        <p>
          Product Hunt is a 24-hour upvote contest optimized for
          mainstream SaaS. VibeXForge is a long-running evolution system
          optimized for AI-native projects. Reviews are written by
          Claude against a published rubric, not collected as vanity
          upvotes. Projects keep progressing after launch day.
        </p>
        <h2>What you can do on VibeXForge</h2>
        <p>
          Submit an AI project (paste a URL), get a Claude-scored
          review, watch the project evolve based on real engagement,
          battle other projects in the Arena, and discover heroes across
          categories: AI agents, workflows, trading systems, code
          review, image generation, data tools, voice interfaces, and
          more.
        </p>
        {/* Same 5-question FAQ block as app/home/layout.tsx. Duplicated
            intentionally: `/` is the entry URL for AI crawlers + the
            linked-from-everywhere splash, and the 2026-04-18 GEO audit
            flagged that FAQ JSON-LD living only on /home left / with
            30 fewer citability points than the dashboard page. Same
            answers, different URL context, allowed by schema.org. */}
        <h2>Frequently asked questions</h2>
        <h3>What is VibeXForge?</h3>
        <p>
          VibeXForge (formerly VibeX) is an AI-native launch platform
          where every project is a 16-bit RPG hero. Creators submit AI
          projects (URL or GitHub repo) and receive a Claude-scored review
          across five dimensions (originality, clarity, UX potential,
          virality potential, investor curiosity). Projects evolve
          through six stages — Seed, Active, Growing, Breakout, Legend,
          Myth — based on real engagement (plays, upvotes, shares), not
          24-hour upvote sprints.
        </p>
        <h3>How does the Claude review work?</h3>
        <p>
          Every submitted project is reviewed by Claude Haiku 4.5 against
          a published rubric. Claude reads the title, tagline,
          description, and (if the demo URL is a GitHub repo) the README,
          then returns five 0-100 scores, two to three named strengths,
          two to three weaknesses, and two to three actionable
          suggestions. The review is stored in the ai_reviews table and
          the compound score becomes the project&rsquo;s headline score.
        </p>
        <h3>How is a project&rsquo;s VibeXForge score calculated?</h3>
        <p>
          The compound score is the arithmetic mean of the five Claude
          dimensions: originality, clarity, UX potential, virality
          potential, and investor curiosity. Each dimension is 0-100. The
          compound is displayed as the project&rsquo;s headline score on
          its detail page and used as an aggregateRating when search
          engines index the page.
        </p>
        <h3>What is VibeXForge&rsquo;s evolution system?</h3>
        <p>
          Every project progresses through six evolution stages tied to
          real engagement thresholds. Seed is the starting stage (score
          below 40 and low traction). Active requires 50+ plays or a
          compound score of 40+. Growing, Breakout, Legend, and Myth add
          progressively higher play, upvote, and score gates. The
          progression is driven by a Postgres trigger — no cron needed.
        </p>
        <h3>Is VibeXForge open source?</h3>
        <p>
          VibeXForge is source-available on GitHub at
          github.com/alex-jb/vibex under a custom VibeX Source Available
          License. Anyone can read, fork for personal use, and contribute
          back. Commercial hosting by third parties is restricted.
        </p>
      </section>
      {/* FAQPage JSON-LD for AI Overviews / Bing Copilot / Perplexity.
          Duplicates the same 5 Q&amp;A the /home layout emits, but scoped
          to `/` so the splash URL is directly answerable. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is VibeXForge?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "VibeXForge (formerly VibeX) is an AI-native launch platform where every project is a 16-bit RPG hero. Creators submit AI projects (URL or GitHub repo) and receive a Claude-scored review across five dimensions (originality, clarity, UX potential, virality potential, investor curiosity). Projects evolve through six stages — Seed, Active, Growing, Breakout, Legend, Myth — based on real engagement (plays, upvotes, shares), not 24-hour upvote sprints.",
                },
              },
              {
                "@type": "Question",
                name: "How does the Claude review work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Every submitted project is reviewed by Claude Haiku 4.5 against a published rubric. Claude reads the title, tagline, description, and (if the demo URL is a GitHub repo) the README, then returns five 0-100 scores, two to three named strengths, two to three weaknesses, and two to three actionable suggestions. The review is stored in the ai_reviews table and the compound score becomes the project's headline score.",
                },
              },
              {
                "@type": "Question",
                name: "How is a project's VibeXForge score calculated?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The compound score is the arithmetic mean of the five Claude dimensions: originality, clarity, UX potential, virality potential, and investor curiosity. Each dimension is 0-100. The compound is displayed as the project's headline score on its detail page and used as an aggregateRating when search engines index the page.",
                },
              },
              {
                "@type": "Question",
                name: "What is VibeXForge's evolution system?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Every project progresses through six evolution stages tied to real engagement thresholds. Seed is the starting stage (score below 40 and low traction). Active requires 50+ plays or a compound score of 40+. Growing, Breakout, Legend, and Myth add progressively higher play, upvote, and score gates. The progression is driven by a Postgres trigger — no cron needed.",
                },
              },
              {
                "@type": "Question",
                name: "Is VibeXForge open source?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "VibeXForge is source-available on GitHub at github.com/alex-jb/vibex under a custom VibeX Source Available License. Anyone can read, fork for personal use, and contribute back. Commercial hosting by third parties is restricted.",
                },
              },
            ],
          }),
        }}
      />
      {/* Gemini-generated epic pixel landscape behind everything. Tint
          swapped from violet-dominant to forge-orange so the art reads
          as a forge/portal scene rather than a cyberpunk purple haze. */}
      <Image
        src="/generated/landing-bg.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover z-0"
        style={{ imageRendering: "pixelated" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 44%, rgba(255,69,0,0.28), transparent 60%), radial-gradient(ellipse at 50% 44%, rgba(255,226,125,0.07), transparent 75%), rgba(13,13,13,0.6)",
        }}
      />
      {/* ═══ Scanline + vignette overlays ═══ */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[100]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.22) 2px, rgba(0,0,0,0.22) 4px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[99]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* ═══ L-corner brackets (forge-orange) ═══ */}
      {(["tl", "tr", "bl", "br"] as const).map((pos) => {
        const isTop = pos.startsWith("t");
        const isLeft = pos.endsWith("l");
        return (
          <div
            key={pos}
            aria-hidden="true"
            className="pointer-events-none fixed hidden sm:block z-50"
            style={{
              [isTop ? "top" : "bottom"]: 14,
              [isLeft ? "left" : "right"]: 14,
              width: 28,
              height: 28,
              filter: `drop-shadow(0 0 4px ${C.FORGE}80)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                [isLeft ? "left" : "right"]: 0,
                width: 28,
                height: 3,
                background: C.FORGE,
              }}
            />
            <div
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                [isLeft ? "left" : "right"]: 0,
                width: 3,
                height: 28,
                background: C.FORGE,
              }}
            />
          </div>
        );
      })}

      {/* ═══ Top status bar ═══ */}
      <div
        className="fixed z-[60] flex items-center justify-between"
        style={{
          top: 36,
          left: 56,
          right: 56,
          fontFamily: "var(--font-press-start), monospace",
          fontSize: 11,
          letterSpacing: 2,
          color: "var(--text-muted)",
        }}
      >
        <div
          style={{
            color: C.FORGE,
            fontSize: 17,
            textShadow: `0 0 4px ${C.FORGE}E6, 2px 2px 0 #000`,
            letterSpacing: 3,
          }}
        >
          ⚒ VIBEXFORGE
        </div>
        <div className="flex gap-[22px] hidden md:flex">
          <span>
            FORGE:<span style={{ color: C.GREEN }}>HOT</span>
          </span>
          <span>
            NET:<span style={{ color: C.GREEN }}>OK</span>
          </span>
          <span>
            SHARD:<span style={{ color: C.GREEN }}>01</span>
          </span>
          <motion.span
            style={{ color: C.FORGE }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 1] }}
          >
            ● REC
          </motion.span>
        </div>
      </div>

      {/* ═══ Left terminal column ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="fixed hidden xl:block z-[60] pointer-events-none"
        style={{
          top: 96,
          left: 40,
          width: 300,
          maxWidth: 300,
          overflow: "hidden",
          fontFamily: "var(--font-press-start), monospace",
        }}
      >
        <motion.pre
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            // Explicit monospace — Press Start 2P lacks box-drawing glyphs
            // and would fall back to a wider font, breaking width.
            fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace",
            fontSize: 7.5,
            color: C.FORGE,
            textShadow: `0 0 3px ${C.FORGE}D9`,
            lineHeight: 1.1,
            marginBottom: 16,
            whiteSpace: "pre",
          }}
        >
          {FORGE_LOGO}
        </motion.pre>

        <div
          style={{
            fontSize: 10,
            lineHeight: 2,
            color: C.GREEN,
            textShadow: `0 0 2px ${C.GREEN}E6`,
          }}
        >
          {BOOT_LINES.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.4, ease: "easeOut" }}
              style={{
                color: toneColor(line.tone),
                textShadow:
                  line.tone === "warn"
                    ? `0 0 2px ${C.YELLOW}E6`
                    : line.tone === "forge"
                    ? `0 0 2px ${C.FORGE}E6`
                    : line.tone === "ready"
                    ? `0 0 4px ${C.CREAM}`
                    : `0 0 2px ${C.GREEN}E6`,
                fontSize: line.tone === "ready" ? 12 : 10,
                marginTop: line.tone === "ready" ? 8 : 0,
                whiteSpace: "nowrap",
              }}
            >
              {line.text}
              {line.tone === "ready" && (
                <motion.span
                  aria-hidden="true"
                  className="inline-block align-middle"
                  style={{
                    width: 10,
                    height: 14,
                    background: C.CREAM,
                    marginLeft: 5,
                    boxShadow: `0 0 4px ${C.CREAM}`,
                  }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, times: [0, 0.5, 1] }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══ Center stack: anvil hero card + headline + CTAs ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 4.5, ease: pixelEase }}
        className="fixed z-40 flex flex-col items-center px-4"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(620px, calc(100vw - 64px))",
        }}
      >
        {/* === Anvil hero card === */}
        <div
          className="relative mb-7 w-full"
          style={{ maxWidth: 560 }}
        >
          {/* Forge ember glow behind */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              inset: -70,
              background: `radial-gradient(ellipse, ${C.FORGE}4D 0%, ${C.FORGE}1F 45%, transparent 72%)`,
              filter: "blur(34px)",
              zIndex: -1,
            }}
          />

          <motion.div
            className="relative overflow-hidden"
            style={{
              aspectRatio: "5 / 3",
              background: "#0A0A0C",
              border: `3px solid ${C.FORGE}`,
              boxShadow: `6px 6px 0 #000, 0 0 48px ${C.FORGE}55, inset 2px 2px 0 rgba(255,255,255,0.04)`,
              padding: "20px 18px 16px",
              display: "flex",
              flexDirection: "column",
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Cream inner rule */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute"
              style={{
                inset: 6,
                border: `1px solid ${C.CREAM}40`,
              }}
            />

            {/* Corner brackets (cream) */}
            {(["tl", "tr", "bl", "br"] as const).map((pos) => {
              const isTop = pos.startsWith("t");
              const isLeft = pos.endsWith("l");
              return (
                <div
                  key={pos}
                  aria-hidden="true"
                  className="pointer-events-none absolute"
                  style={{
                    [isTop ? "top" : "bottom"]: 12,
                    [isLeft ? "left" : "right"]: 12,
                    width: 16,
                    height: 16,
                    zIndex: 3,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      [isTop ? "top" : "bottom"]: 0,
                      [isLeft ? "left" : "right"]: 0,
                      width: 16,
                      height: 2,
                      background: C.CREAM,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      [isTop ? "top" : "bottom"]: 0,
                      [isLeft ? "left" : "right"]: 0,
                      width: 2,
                      height: 16,
                      background: C.CREAM,
                    }}
                  />
                </div>
              );
            })}

            {/* Header row: FORGE TEMP + LV ∞ */}
            <div
              className="flex items-center justify-between mb-2"
              style={{ zIndex: 2, position: "relative" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: 8,
                  color: C.CREAM,
                  letterSpacing: 2,
                  textShadow: `0 0 4px ${C.FORGE}66`,
                }}
              >
                ⚒ FORGE TEMP 1850°F · SHARD 01
              </span>
              <span
                style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: 9,
                  padding: "5px 8px",
                  background: C.FORGE,
                  color: "#0A0A0C",
                  letterSpacing: 1,
                  border: `1.5px solid ${C.CREAM}`,
                  boxShadow: `2px 2px 0 #000, 0 0 12px ${C.FORGE}AA`,
                }}
              >
                LV ∞
              </span>
            </div>

            {/* Anvil scene */}
            <div
              className="relative flex-1 overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at 50% 72%, rgba(255,69,0,0.34), transparent 50%), radial-gradient(circle at 50% 50%, rgba(255,226,125,0.08), transparent 60%), #0A0A0C",
                border: `2px solid ${C.FORGE}80`,
                boxShadow: "inset 0 0 24px rgba(0,0,0,0.75)",
                marginBottom: 10,
                zIndex: 2,
              }}
            >
              {/* Ember rays anchored at anvil strike point */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `repeating-conic-gradient(from 0deg at 50% 75%, ${C.FORGE}17 0deg 10deg, transparent 10deg 20deg)`,
                }}
              />
              {/* Heat shimmer (vertical drift) */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)",
                  zIndex: 5,
                }}
                animate={{ y: [0, -1.5, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* LIVE badge top-right */}
              <div
                className="absolute flex items-center gap-1.5"
                style={{
                  top: 14,
                  right: 14,
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: 8,
                  color: C.FORGE,
                  letterSpacing: 1.5,
                  zIndex: 6,
                }}
              >
                <motion.span
                  aria-hidden="true"
                  className="inline-block"
                  style={{
                    width: 6,
                    height: 6,
                    background: C.FORGE,
                    boxShadow: `0 0 6px ${C.FORGE}`,
                  }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 1] }}
                />
                LIVE
              </div>

              {/* Anvil silhouette (pixel-art SVG) anchored center-bottom */}
              <div
                aria-hidden="true"
                className="absolute pointer-events-none"
                style={{
                  left: "50%",
                  bottom: 18,
                  transform: "translateX(-50%)",
                  width: 150,
                  zIndex: 3,
                }}
              >
                <svg
                  viewBox="0 0 32 20"
                  width="100%"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ imageRendering: "pixelated" }}
                >
                  {/* Top slab */}
                  <rect x="3" y="1" width="26" height="5" fill="#4a4a50" />
                  <rect x="3" y="1" width="26" height="1" fill="#6a6a70" />
                  <rect x="3" y="5" width="26" height="1" fill="#2a2a30" />
                  {/* Heat glow on anvil face */}
                  <rect x="11" y="2" width="10" height="2" fill={C.FORGE} opacity="0.65" />
                  {/* Waist */}
                  <rect x="12" y="6" width="8" height="7" fill="#3a3a40" />
                  <rect x="12" y="6" width="1" height="7" fill="#5a5a60" />
                  <rect x="19" y="6" width="1" height="7" fill="#2a2a30" />
                  {/* Base */}
                  <rect x="1" y="13" width="30" height="4" fill="#4a4a50" />
                  <rect x="1" y="13" width="30" height="1" fill="#6a6a70" />
                  <rect x="0" y="17" width="32" height="3" fill="#2a2a30" />
                </svg>
              </div>

              {/* Evo sprite silhouette sitting on the anvil face */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: "50%",
                  bottom: 70,
                  transform: "translateX(-50%)",
                  zIndex: 4,
                  filter: `drop-shadow(0 0 6px ${C.FORGE}AA)`,
                }}
              >
                <PixelSprite size={48} />
              </div>

              {/* Hammer — pixel-art, swings in from upper-right on 3.5s beat */}
              <motion.div
                aria-hidden="true"
                className="absolute pointer-events-none"
                style={{
                  left: "50%",
                  bottom: 100,
                  marginLeft: -16,
                  width: 32,
                  height: 56,
                  transformOrigin: "50% 90%",
                  zIndex: 5,
                }}
                animate={{
                  rotate: [-38, -38, 12, -38],
                  y: [0, 0, 14, 0],
                }}
                transition={{
                  duration: 3.5,
                  times: [0, 0.68, 0.78, 1],
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              >
                <svg
                  viewBox="0 0 20 32"
                  width="100%"
                  height="100%"
                  style={{ imageRendering: "pixelated" }}
                >
                  {/* Handle */}
                  <rect x="9" y="10" width="2" height="22" fill="#B89A50" />
                  <rect x="8" y="10" width="1" height="22" fill={C.CREAM} />
                  <rect x="11" y="10" width="1" height="22" fill="#8A6A30" />
                  {/* Hammer head */}
                  <rect x="2" y="2" width="16" height="9" fill="#4a4a50" />
                  <rect x="2" y="2" width="16" height="1" fill="#6a6a70" />
                  <rect x="2" y="10" width="16" height="1" fill="#2a2a30" />
                  {/* Hot striking tip */}
                  <rect x="14" y="3" width="4" height="7" fill={C.FORGE} />
                  <rect x="15" y="4" width="2" height="5" fill="#FF7A30" />
                </svg>
              </motion.div>

              {/* Ember sparks — cluster at anvil strike point, fire on the
                  strike beat (delay ≈ 2.55s into the 3.5s cycle). */}
              {[
                { left: "44%", dx: -4, dy: -14 },
                { left: "48%", dx: 2, dy: -22 },
                { left: "52%", dx: -2, dy: -18 },
                { left: "56%", dx: 6, dy: -12 },
                { left: "50%", dx: 0, dy: -28 },
                { left: "46%", dx: -6, dy: -20 },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  aria-hidden="true"
                  className="absolute pointer-events-none"
                  style={{
                    left: s.left,
                    bottom: 70,
                    width: 4,
                    height: 4,
                    background: C.FORGE,
                    boxShadow: `0 0 6px ${C.FORGE}`,
                    zIndex: 7,
                  }}
                  animate={{
                    opacity: [0, 0, 1, 0],
                    x: [0, 0, s.dx, s.dx],
                    y: [0, 0, s.dy, s.dy - 6],
                    scale: [0.2, 0.2, 1.3, 0.3],
                  }}
                  transition={{
                    duration: 3.5,
                    times: [0, 0.7, 0.82, 1],
                    delay: i * 0.04,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Floor glow line below anvil */}
              <div
                aria-hidden="true"
                className="absolute pointer-events-none"
                style={{
                  left: 0,
                  right: 0,
                  bottom: 14,
                  height: 2,
                  background: `linear-gradient(90deg, transparent 10%, ${C.FORGE}66 50%, transparent 90%)`,
                  zIndex: 2,
                }}
              />
            </div>

            {/* FORGING progress bar (replaces HP/MP/ATK stats — stat bars
                belong on the /home HeroCard list, not the landing hero
                unit; brief anti-pattern #4). */}
            <div
              className="flex items-center gap-3"
              style={{ zIndex: 2, position: "relative" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: 9,
                  color: C.CREAM,
                  letterSpacing: 2,
                  textShadow: `0 0 6px ${C.FORGE}AA`,
                  whiteSpace: "nowrap",
                }}
              >
                FORGING...
              </span>
              <div
                className="relative flex-1 overflow-hidden"
                style={{
                  height: 12,
                  background: "#0A0A0C",
                  border: `1.5px solid ${C.FORGE}80`,
                }}
              >
                <motion.div
                  className="absolute top-0 left-0 h-full"
                  style={{
                    width: "100%",
                    background: `linear-gradient(90deg, ${C.FORGE}, ${C.CREAM})`,
                    boxShadow: `0 0 10px ${C.FORGE}CC`,
                    transformOrigin: "left center",
                  }}
                  animate={{ scaleX: [0, 1, 0] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: 8,
                  color: C.CREAM,
                  letterSpacing: 1,
                  whiteSpace: "nowrap",
                }}
              >
                ⚒ FORGED
              </span>
            </div>
          </motion.div>
        </div>

        {/* === Live social-proof counter === */}
        <ForgeCounter delay={5.0} />

        {/* === Headline === */}
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: [0, 0.6, 0.8, 1], x: [-6, 4, -2, 0] }}
          transition={{ duration: 0.5, delay: 5.2, times: [0, 0.33, 0.66, 1] }}
          className="text-center mb-5"
          style={{
            fontFamily: "var(--font-press-start), monospace",
            fontSize: 26,
            lineHeight: 1.5,
            color: "var(--text)",
            letterSpacing: 2,
            textShadow: `0 0 6px rgba(232,232,236,0.5), 0 0 20px ${C.FORGE}55`,
          }}
        >
          LAUNCH YOUR AI PROJECT.
          <br />
          <span
            style={{
              color: C.FORGE,
              textShadow: `0 0 8px ${C.FORGE}E6, 3px 3px 0 #000`,
            }}
          >
            WATCH IT EVOLVE.
          </span>
        </motion.div>

        {/* === CTAs === */}
        <div className="flex justify-center gap-4">
          <Link href="/home">
            <motion.button
              type="button"
              className="font-pixel uppercase cursor-pointer"
              style={{
                fontSize: 13,
                padding: "16px 28px",
                letterSpacing: 2,
                border: `3px solid ${C.CREAM}`,
                boxShadow: `5px 5px 0 #000, 0 0 24px ${C.FORGE}A6`,
                color: "#0A0A0C",
                background: C.FORGE,
              }}
              whileHover={{
                x: -2,
                y: -2,
                boxShadow: `7px 7px 0 #000, 0 0 32px ${C.FORGE}DD`,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
            >
              ▶ PRESS START
            </motion.button>
          </Link>
          <Link href="/about" prefetch={false}>
            <motion.button
              type="button"
              className="font-pixel uppercase cursor-pointer"
              style={{
                fontSize: 13,
                padding: "16px 28px",
                letterSpacing: 2,
                background: "transparent",
                border: `3px solid ${C.CREAM}`,
                color: C.CREAM,
                boxShadow: "5px 5px 0 #000",
              }}
              whileHover={{
                x: -2,
                y: -2,
                boxShadow: `7px 7px 0 #000, 0 0 20px ${C.CREAM}66`,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
            >
              [ ABOUT ]
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* ═══ Keyboard hint bottom (desktop only) ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 6 }}
        className="fixed hidden md:block z-[60] text-center"
        style={{
          bottom: 34,
          left: 0,
          right: 0,
          fontFamily: "var(--font-press-start), monospace",
          fontSize: 8,
          letterSpacing: 3,
          color: `${C.FORGE}B3`,
          textShadow: `0 0 6px ${C.FORGE}66`,
        }}
      >
        ▸ PRESS{" "}
        <kbd
          className="inline-block px-1.5 py-0.5 mx-0.5"
          style={{
            background: `${C.FORGE}26`,
            border: `1px solid ${C.FORGE}AA`,
            color: C.CREAM,
            fontSize: 8,
          }}
        >
          SPACE
        </kbd>{" "}
        OR CLICK ▶ PRESS START ◂
      </motion.div>
    </div>
  );
}
