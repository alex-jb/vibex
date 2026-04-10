"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, ArrowRight } from "lucide-react";
import { projects } from "@/lib/mock-data";
import { GameBoyFrame } from "@/components/showcase/game-boy-frame";
import { FlipCard } from "@/components/showcase/flip-card";
import { ProjectDemoCard } from "@/components/showcase/project-demo-card";
import { PetCard } from "@/components/showcase/pet-card";

const pixelEase = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE — 16-bit arcade marquee + Game Boy showcase + LAUNCH inside.
   Aesthetic: pixel chromatic shadows, terminal subtitle with cursor,
   floating pixel particles, decorative viewport corner brackets.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  // Pick AgentForge (id "2") — best stats, viral, featured
  const showcaseProject = projects.find((p) => p.id === "2") || projects[0];

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* ═══ ATMOSPHERIC LAYERS ═══ */}

      {/* Pixel grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(157,0,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(157,0,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/12 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-fuchsia-600/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-500/6 blur-[100px]" />

      {/* Floating pixel particles */}
      {[
        { left: "8%", top: "18%", delay: 0, color: "#9D00FF" },
        { left: "12%", top: "62%", delay: 1.5, color: "#39FF14" },
        { left: "85%", top: "22%", delay: 2.8, color: "#06B6D4" },
        { left: "92%", top: "70%", delay: 0.6, color: "#EC4899" },
        { left: "20%", top: "85%", delay: 3.2, color: "#FACC15" },
        { left: "78%", top: "12%", delay: 1.8, color: "#FF4500" },
      ].map((p, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute hidden md:block"
          style={{
            left: p.left,
            top: p.top,
            width: 4,
            height: 4,
            background: p.color,
            boxShadow: `0 0 12px ${p.color}, 0 0 4px ${p.color}`,
          }}
          animate={{
            y: [0, -16, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3.5,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Viewport corner brackets — decorative L-shapes */}
      {(["tl", "tr", "bl", "br"] as const).map((pos) => {
        const isTop = pos.startsWith("t");
        const isLeft = pos.endsWith("l");
        return (
          <div
            key={pos}
            aria-hidden="true"
            className="pointer-events-none absolute hidden sm:block"
            style={{
              [isTop ? "top" : "bottom"]: 16,
              [isLeft ? "left" : "right"]: 16,
              width: 28,
              height: 28,
            }}
          >
            <div
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                [isLeft ? "left" : "right"]: 0,
                width: 28,
                height: 3,
                background: "var(--neon-purple)",
                boxShadow: "0 0 8px rgba(157,0,255,0.6)",
              }}
            />
            <div
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                [isLeft ? "left" : "right"]: 0,
                width: 3,
                height: 28,
                background: "var(--neon-purple)",
                boxShadow: "0 0 8px rgba(157,0,255,0.6)",
              }}
            />
          </div>
        );
      })}

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center">
        {/* ─── HERO TEXT ─── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: pixelEase }}
          className="text-center mb-8 sm:mb-10 max-w-4xl"
        >
          {/* Eyebrow tag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-5 sm:mb-6 px-3 py-1.5"
            style={{
              border: "2px solid var(--neon-purple)",
              background: "rgba(157,0,255,0.08)",
              boxShadow: "3px 3px 0 #000, 0 0 16px rgba(157,0,255,0.25)",
            }}
          >
            <span
              className="inline-block"
              style={{
                width: 6,
                height: 6,
                background: "#39FF14",
                boxShadow: "0 0 6px #39FF14",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <span
              className="font-pixel"
              style={{
                fontSize: 8,
                letterSpacing: 3,
                color: "#E9BDFF",
              }}
            >
              VIBEX // NOW IN BETA
            </span>
          </motion.div>

          {/* Title — pixel chromatic shadow */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 sm:mb-6"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              color: "#FFF",
              lineHeight: 1.25,
              textShadow:
                "3px 3px 0 rgba(157,0,255,0.7), -2px -2px 0 rgba(6,182,212,0.5), 0 0 36px rgba(157,0,255,0.35)",
            }}
          >
            Turn your AI project
            <br className="hidden sm:inline" />{" "}
            into a{" "}
            <span
              className="relative inline-block"
              style={{
                color: "var(--neon-green)",
                textShadow:
                  "3px 3px 0 rgba(0,0,0,0.6), 0 0 32px rgba(57,255,20,0.6)",
              }}
            >
              viral collectible
              {/* Underline accent */}
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 -bottom-1"
                style={{
                  height: 4,
                  background:
                    "linear-gradient(90deg, transparent, var(--neon-green), transparent)",
                  boxShadow: "0 0 12px rgba(57,255,20,0.7)",
                }}
              />
            </span>
          </h1>

          {/* Subtitle — terminal prompt style */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2.5"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(157,0,255,0.3)",
              boxShadow: "inset 0 0 12px rgba(157,0,255,0.1)",
            }}
          >
            <span
              className="font-pixel"
              style={{
                fontSize: 9,
                color: "var(--neon-green)",
                textShadow: "0 0 6px rgba(57,255,20,0.6)",
              }}
            >
              {">"}
            </span>
            <span
              className="font-retro text-sm sm:text-base md:text-lg"
              style={{
                color: "#E8E8EC",
                letterSpacing: 0.5,
              }}
            >
              generate_a_card{" "}
              <span style={{ color: "var(--neon-purple)" }}>→</span>{" "}
              share_it{" "}
              <span style={{ color: "var(--neon-purple)" }}>→</span>{" "}
              grow_your_project
            </span>
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: 8,
                height: 14,
                background: "var(--neon-green)",
                marginLeft: 2,
                animation: "pulse 1s steps(2) infinite",
              }}
            />
          </div>
        </motion.div>

        {/* ─── GAME BOY SHOWCASE ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: pixelEase }}
          className="w-full"
        >
          <GameBoyFrame
            cta={
              <Link href="/home">
                <button
                  type="button"
                  aria-label="Launch VibeX — enter the full app"
                  className="group flex items-center gap-2 px-5 py-3 font-pixel text-xs tracking-wider transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/50"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--neon-purple), #C026D3)",
                    border: "2px solid #FFF",
                    boxShadow: "4px 4px 0 #000, 0 0 28px rgba(157,0,255,0.5)",
                    color: "#FFF",
                    minHeight: "44px",
                    cursor: "pointer",
                  }}
                >
                  <Rocket className="h-4 w-4" />
                  LAUNCH
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            }
          >
            <FlipCard
              autoFlipInterval={4000}
              front={
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px",
                  }}
                >
                  <div style={{ width: "100%", maxWidth: 380 }}>
                    <ProjectDemoCard project={showcaseProject} />
                  </div>
                </div>
              }
              back={
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "65%",
                      maxWidth: 240,
                      height: "94%",
                      maxHeight: 290,
                    }}
                  >
                    <PetCard project={showcaseProject} />
                  </div>
                </div>
              }
            />
          </GameBoyFrame>
        </motion.div>

        {/* ─── INSERT COIN HINT ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-6 sm:mt-8"
        >
          <span
            className="font-pixel text-center block"
            style={{
              fontSize: 8,
              letterSpacing: 4,
              color: "rgba(157,0,255,0.7)",
              textShadow: "0 0 8px rgba(157,0,255,0.4)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            ▸ PRESS LAUNCH TO ENTER ◂
          </span>
        </motion.div>
      </div>
    </div>
  );
}
