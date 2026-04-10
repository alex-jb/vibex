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
   LANDING PAGE — Game Boy + flip hero card + LAUNCH button. Nothing else.
   Click LAUNCH → /home (the full feature dashboard)
   ═══════════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  // Pick AgentForge (id "2") — best stats, viral, featured
  const showcaseProject = projects.find((p) => p.id === "2") || projects[0];

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* Scanline CRT overlay */}
      <div className="scanline-overlay" />

      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-fuchsia-600/8 blur-[120px]" />

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center gap-10">
        {/* ═══ GAME BOY SHOWCASE ═══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: pixelEase }}
          className="w-full"
        >
          <GameBoyFrame>
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
                  <div style={{ width: "100%", maxWidth: 340 }}>
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
                  <div style={{ width: "60%", maxWidth: 220, height: "94%", maxHeight: 270 }}>
                    <PetCard project={showcaseProject} />
                  </div>
                </div>
              }
            />
          </GameBoyFrame>
        </motion.div>

        {/* ═══ LAUNCH BUTTON ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: pixelEase }}
        >
          <Link href="/home">
            <button
              type="button"
              className="group flex items-center gap-3 px-10 py-5 font-pixel text-base tracking-wider transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/50"
              style={{
                background: "linear-gradient(135deg, var(--neon-purple), #C026D3)",
                border: "3px solid #FFF",
                boxShadow: "6px 6px 0 #000, 0 0 50px rgba(157,0,255,0.5)",
                color: "#FFF",
                minHeight: "48px",
                cursor: "pointer",
              }}
            >
              <Rocket className="h-5 w-5" />
              LAUNCH
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
