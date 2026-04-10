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
   LANDING PAGE — Game Boy + flip hero card. LAUNCH lives inside the console
   right grip, below the A/B buttons. Click LAUNCH → /home (full feature page).
   ═══════════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  // Pick AgentForge (id "2") — best stats, viral, featured
  const showcaseProject = projects.find((p) => p.id === "2") || projects[0];

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-fuchsia-600/8 blur-[120px]" />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center">
        {/* ═══ HERO TEXT ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: pixelEase }}
          className="text-center mb-8 sm:mb-10 max-w-3xl"
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-5"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              color: "#FFF",
              lineHeight: 1.2,
              textShadow: "0 0 24px rgba(157,0,255,0.4)",
            }}
          >
            Turn your AI project into a{" "}
            <span style={{ color: "var(--neon-green)" }}>viral collectible</span>
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl font-retro"
            style={{ color: "#A0A0A8", maxWidth: "32rem", margin: "0 auto" }}
          >
            Generate a card. Share it. Grow your project.
          </p>
        </motion.div>

        {/* ═══ GAME BOY SHOWCASE ═══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: pixelEase }}
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
                    background: "linear-gradient(135deg, var(--neon-purple), #C026D3)",
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
                  <div style={{ width: "65%", maxWidth: 240, height: "94%", maxHeight: 290 }}>
                    <PetCard project={showcaseProject} />
                  </div>
                </div>
              }
            />
          </GameBoyFrame>
        </motion.div>
      </div>
    </div>
  );
}
