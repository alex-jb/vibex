"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE — v7 cinematic "boot sequence" hero.
   Replaces the earlier GameBoyFrame + InteractiveDemo showcase with a
   cleaner three-zone composition:
     • Left column : dark terminal boot log (VIBEXFORGE://BOOT_V1.4.2)
     • Center stack: landscape hero card + glitch headline + CTAs
     • Chrome      : status bar top, L-corner brackets, scanline overlay
   Approved via /design-shotgun on 2026-04-13, iterations v1→v7.
   ═══════════════════════════════════════════════════════════════════════════ */

const pixelEase = [0.22, 1, 0.36, 1] as const;

/* ─── Boot log content ─── */
const BOOT_LINES: { text: string; tone?: "accent" | "warn" | "ok" | "ready" }[] = [
  { text: "$ vibex launch", tone: "accent" },
  { text: "> growth.layer .... OK", tone: "accent" },
  { text: "> hero.cards ...... OK", tone: "accent" },
  { text: "> evo.engine ...... OK", tone: "accent" },
  { text: "> rarity .......... OK", tone: "accent" },
  { text: "> qr.codes ........ OK", tone: "accent" },
  { text: "> shard.01 ........", tone: "accent" },
  { text: "! purging legacy", tone: "warn" },
  { text: "> 48t 43r 105cx", tone: "ok" },
  { text: ">> READY.", tone: "ready" },
];

const ASCII_LOGO = `  ██╗   ██╗██╗██████╗ ███████╗██╗  ██╗
  ██║   ██║██║██╔══██╗██╔════╝╚██╗██╔╝
  ██║   ██║██║██████╔╝█████╗   ╚███╔╝
  ╚██╗ ██╔╝██║██╔══██╗██╔══╝   ██╔██╗
   ╚████╔╝ ██║██████╔╝███████╗██╔╝ ██╗
    ╚═══╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝`;

function toneColor(tone?: "accent" | "warn" | "ok" | "ready"): string {
  if (tone === "warn") return "var(--neon-yellow)";
  if (tone === "accent") return "var(--neon-cyan)";
  if (tone === "ready") return "var(--neon-yellow)";
  return "var(--neon-green)";
}

/* ─── Bar data for mini hero card ─── */
const STATS = [
  { label: "HP", pct: 88, grad: "linear-gradient(180deg, #4AFF2A, #1E9C00)" },
  { label: "MP", pct: 67, grad: "linear-gradient(180deg, #22D3EE, #0891B2)" },
  { label: "XP", pct: 51, grad: "linear-gradient(180deg, #C77DFF, #7B2FBE)" },
];

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
      {/* Gemini-generated epic pixel landscape: swirling purple portal
          over mountains, floating islands with lanterns, crystal spires,
          cobblestone path leading toward the portal. Sits beneath all
          the terminal boot log + AI HERO card + PRESS START overlays,
          dimmed via the tint layer below so the foreground text stays
          readable. */}
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
      {/* Darkening tint + neon glow layer on top of the image so the
          foreground UI doesn't fight the art. Keeps the same gradient
          colors as the old pure-gradient bg for brand continuity. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 44%, rgba(157,0,255,0.25), transparent 60%), radial-gradient(ellipse at 50% 44%, rgba(57,255,20,0.05), transparent 75%), rgba(13,13,13,0.55)",
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

      {/* ═══ L-corner brackets (orange) ═══ */}
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
              filter: "drop-shadow(0 0 4px rgba(255,69,0,0.5))",
            }}
          >
            <div
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                [isLeft ? "left" : "right"]: 0,
                width: 28,
                height: 3,
                background: "var(--neon-orange)",
              }}
            />
            <div
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                [isLeft ? "left" : "right"]: 0,
                width: 3,
                height: 28,
                background: "var(--neon-orange)",
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
            color: "var(--neon-purple)",
            fontSize: 17,
            textShadow: "0 0 4px rgba(157,0,255,0.9)",
            letterSpacing: 3,
          }}
        >
          ◆ VIBEX
        </div>
        <div className="flex gap-[22px] hidden md:flex">
          <span>
            SYS:<span style={{ color: "var(--neon-green)" }}>ONLINE</span>
          </span>
          <span>
            NET:<span style={{ color: "var(--neon-green)" }}>OK</span>
          </span>
          <span>
            SHARD:<span style={{ color: "var(--neon-green)" }}>01</span>
          </span>
          <motion.span
            style={{ color: "var(--neon-green)" }}
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
            fontSize: 8,
            color: "var(--neon-purple)",
            textShadow: "0 0 3px rgba(157,0,255,1)",
            lineHeight: 1.1,
            marginBottom: 16,
            whiteSpace: "pre",
          }}
        >
          {ASCII_LOGO}
        </motion.pre>

        <div
          style={{
            fontSize: 10,
            lineHeight: 2,
            color: "var(--neon-green)",
            textShadow: "0 0 2px rgba(57,255,20,0.9)",
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
                    ? "0 0 2px rgba(250,204,21,0.9)"
                    : line.tone === "accent"
                    ? "0 0 2px rgba(6,182,212,0.9)"
                    : line.tone === "ready"
                    ? "0 0 3px rgba(250,204,21,1)"
                    : "0 0 2px rgba(57,255,20,0.9)",
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
                    background: "var(--neon-green)",
                    marginLeft: 5,
                    boxShadow: "0 0 4px var(--neon-green)",
                  }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, times: [0, 0.5, 1] }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══ Center stack: hero card + headline + CTAs ═══ */}
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
        {/* === Landscape hero card === */}
        <div
          className="relative mb-7 w-full"
          style={{ maxWidth: 560 }}
        >
          {/* Static radial glow behind */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              inset: -70,
              background:
                "radial-gradient(ellipse, rgba(157,0,255,0.4) 0%, rgba(6,182,212,0.2) 40%, transparent 72%)",
              filter: "blur(34px)",
              zIndex: -1,
            }}
          />

          <motion.div
            className="relative overflow-hidden"
            style={{
              aspectRatio: "5 / 3",
              background:
                "linear-gradient(135deg, rgba(157,0,255,0.16), rgba(6,182,212,0.16)), linear-gradient(180deg, var(--bg-card) 0%, var(--bg-panel) 100%)",
              border: "4px solid #FFD700",
              boxShadow:
                "0 0 50px rgba(255,215,0,0.3), 0 0 100px rgba(157,0,255,0.25), inset 0 0 24px rgba(255,215,0,0.1), 8px 8px 0 #000",
              padding: "20px 18px 16px",
              display: "flex",
              flexDirection: "column",
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Double pinstripe frame */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute"
              style={{
                inset: 6,
                border: "1.5px solid rgba(255,215,0,0.55)",
              }}
            />

            {/* Foil sweep */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, transparent 20%, rgba(157,0,255,0.28) 35%, rgba(6,182,212,0.28) 50%, rgba(236,72,153,0.28) 65%, transparent 80%)",
                mixBlendMode: "screen",
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            />

            {/* Header row */}
            <div
              className="flex items-center justify-between mb-2"
              style={{ zIndex: 2, position: "relative" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: 8,
                  color: "#FFD700",
                  letterSpacing: 2,
                }}
              >
                ◆ BOSS ENCOUNTER ◆
              </span>
              <span
                style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: 9,
                  padding: "5px 8px",
                  background:
                    "linear-gradient(135deg, var(--neon-pink), var(--neon-purple))",
                  color: "#FFF",
                  letterSpacing: 1,
                  border: "1.5px solid #FFD700",
                  boxShadow:
                    "2px 2px 0 #000, 0 0 14px rgba(236,72,153,0.85)",
                }}
              >
                LEGENDARY
              </span>
            </div>

            {/* Big landscape demo area */}
            <div
              className="relative flex-1 overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(6,182,212,0.25), transparent 55%), radial-gradient(circle at 70% 70%, rgba(157,0,255,0.2), transparent 50%), #0A0A0C",
                border: "2px solid rgba(255,215,0,0.5)",
                boxShadow: "inset 0 0 24px rgba(0,0,0,0.6)",
                marginBottom: 10,
                zIndex: 2,
              }}
            >
              {/* Sun-ray bg (static) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "repeating-conic-gradient(from 0deg at center, rgba(255,215,0,0.06) 0deg 10deg, transparent 10deg 20deg)",
                }}
              />
              {/* CRT scanlines */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)",
                  zIndex: 5,
                }}
              />
              {/* Play button top-left */}
              <div
                className="absolute flex items-center justify-center"
                style={{
                  top: 12,
                  left: 12,
                  width: 22,
                  height: 22,
                  border: "2px solid var(--neon-yellow)",
                  background: "rgba(0,0,0,0.5)",
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: 10,
                  color: "var(--neon-yellow)",
                  zIndex: 6,
                }}
              >
                ▶
              </div>
              {/* LIVE badge top-right */}
              <div
                className="absolute flex items-center gap-1.5"
                style={{
                  top: 14,
                  right: 14,
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: 8,
                  color: "var(--neon-pink)",
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
                    background: "var(--neon-pink)",
                    boxShadow: "0 0 6px var(--neon-pink)",
                  }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 1] }}
                />
                LIVE
              </div>

              {/* 3 ambient sparkles */}
              {[
                { top: "28%", left: "18%", color: "var(--neon-yellow)", delay: 0 },
                { top: "38%", right: "22%", color: "var(--neon-cyan)", delay: 0.7 },
                { bottom: "30%", left: "38%", color: "var(--neon-pink)", delay: 1.3 },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  aria-hidden="true"
                  className="absolute pointer-events-none"
                  style={{
                    ...(s as Record<string, unknown>),
                    width: 5,
                    height: 5,
                    background: s.color,
                    boxShadow: `0 0 8px ${s.color}`,
                    zIndex: 7,
                  }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
                  transition={{
                    duration: 2,
                    delay: s.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}

              {/* Timeline bottom */}
              <div
                className="absolute flex items-center gap-2"
                style={{
                  bottom: 10,
                  left: 12,
                  right: 12,
                  zIndex: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-press-start), monospace",
                    fontSize: 7,
                    color: "var(--neon-yellow)",
                    letterSpacing: 1,
                  }}
                >
                  00:12
                </span>
                <div
                  className="relative flex-1"
                  style={{
                    height: 4,
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,215,0,0.4)",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 h-full"
                    style={{
                      width: "28%",
                      background: "linear-gradient(90deg, var(--neon-yellow), #FFD700)",
                      boxShadow: "0 0 6px rgba(250,204,21,0.8)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-press-start), monospace",
                    fontSize: 7,
                    color: "var(--neon-yellow)",
                    letterSpacing: 1,
                  }}
                >
                  00:42
                </span>
              </div>
            </div>

            {/* Info strip: name + HP/MP/XP bars */}
            <div
              className="flex items-center gap-4"
              style={{ zIndex: 2, position: "relative" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: 13,
                  color: "var(--text)",
                  letterSpacing: 1.5,
                  textShadow: "0 0 4px rgba(255,215,0,0.9)",
                  whiteSpace: "nowrap",
                  paddingRight: 14,
                  borderRight: "1.5px solid var(--border-metal)",
                }}
              >
                AI HERO
              </div>
              <div className="flex-1 grid grid-cols-3 gap-2.5">
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-1.5"
                    style={{
                      fontFamily: "var(--font-press-start), monospace",
                      fontSize: 7,
                    }}
                  >
                    <span style={{ width: 16, color: "var(--text)" }}>
                      {stat.label}
                    </span>
                    <div
                      className="relative flex-1 overflow-hidden"
                      style={{
                        height: 10,
                        background: "#0A0A0C",
                        border: "1.5px solid var(--border-metal)",
                      }}
                    >
                      <motion.div
                        className="absolute top-0 left-0 h-full"
                        style={{
                          background: stat.grad,
                          transformOrigin: "left center",
                        }}
                        initial={{ scaleX: 0, width: `${stat.pct}%` }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: 1.2,
                          delay: 5.2,
                          ease: pixelEase,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        width: 18,
                        textAlign: "right",
                        color: "var(--text-muted)",
                      }}
                    >
                      {stat.pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

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
            textShadow:
              "0 0 6px rgba(232,232,236,0.5), 0 0 20px rgba(157,0,255,0.3)",
          }}
        >
          LAUNCH YOUR AI PROJECT.
          <br />
          <span
            style={{
              color: "var(--neon-yellow)",
              textShadow: "0 0 8px rgba(250,204,21,0.9)",
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
                border: "3px solid #FFF",
                boxShadow: "5px 5px 0 #000, 0 0 24px rgba(157,0,255,0.6)",
                color: "#FFF",
                background:
                  "linear-gradient(135deg, var(--neon-purple), #C026D3)",
              }}
              whileHover={{
                x: -2,
                y: -2,
                boxShadow: "7px 7px 0 #000, 0 0 32px rgba(157,0,255,0.85)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
            >
              ▶ PRESS START
            </motion.button>
          </Link>
          <Link href="/about">
            <motion.button
              type="button"
              className="font-pixel uppercase cursor-pointer"
              style={{
                fontSize: 13,
                padding: "16px 28px",
                letterSpacing: 2,
                background: "transparent",
                border: "3px solid var(--neon-green)",
                color: "var(--neon-green)",
                boxShadow: "5px 5px 0 #000",
              }}
              whileHover={{
                x: -2,
                y: -2,
                boxShadow: "7px 7px 0 #000, 0 0 20px rgba(57,255,20,0.45)",
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
          color: "rgba(157,0,255,0.7)",
          textShadow: "0 0 6px rgba(157,0,255,0.4)",
        }}
      >
        ▸ PRESS{" "}
        <kbd
          className="inline-block px-1.5 py-0.5 mx-0.5"
          style={{
            background: "rgba(157,0,255,0.15)",
            border: "1px solid rgba(157,0,255,0.6)",
            color: "#E9BDFF",
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
