"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Link2, Sparkles, Share2, Play } from "lucide-react";
import { projects } from "@/lib/mock-data";
import { GameBoyFrame } from "@/components/showcase/game-boy-frame";
import { FlipCard } from "@/components/showcase/flip-card";
import { ProjectDemoCard } from "@/components/showcase/project-demo-card";
import { HeroCard } from "@/components/rpg/hero-card";

const pixelEase = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-30px" },
  transition: { duration: 0.5, delay, ease: pixelEase },
});

export default function CreateCardPage() {
  // Pick AgentForge (id "2") — best stats, viral, featured, has computed hero stats
  const showcaseProject =
    projects.find((p) => p.id === "2") || projects[0];

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg-deep)" }}>
      {/* Scanline CRT overlay */}
      <div className="scanline-overlay" />

      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-fuchsia-600/8 blur-[120px]" />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-20 pb-10 lg:pt-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          {/* Eyebrow */}
          <motion.div {...fadeUp(0)}>
            <span
              className="inline-block font-pixel text-[9px] tracking-widest px-3 py-1.5 mb-6"
              style={{
                border: "2px solid var(--neon-purple)",
                color: "#E9BDFF",
                background: "var(--neon-purple-dim)",
              }}
            >
              HOW VIBEX WORKS
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            {...fadeUp(0.1)}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              color: "#FFF",
              lineHeight: 1.15,
              textShadow: "0 0 24px rgba(157,0,255,0.4)",
            }}
          >
            Create Your
            <br />
            <span style={{ color: "var(--neon-green)" }}>VibeX Card</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...fadeUp(0.2)}
            className="text-base md:text-lg font-retro"
            style={{ color: "#A0A0A8", maxWidth: "36rem", margin: "0 auto" }}
          >
            Paste your URL. We&apos;ll turn any AI project into a viral, evolving hero
            card with stats, rarity, and shareable QR.
          </motion.p>
        </div>
      </section>

      {/* ═══ GAME BOY SHOWCASE ═══ */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: pixelEase }}
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
                    }}
                  >
                    <div style={{ width: "92%", maxWidth: 260 }}>
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
                    }}
                  >
                    <div style={{ width: "92%", maxWidth: 260 }}>
                      <HeroCard project={showcaseProject} />
                    </div>
                  </div>
                }
              />
            </GameBoyFrame>
          </motion.div>

          {/* Flip hint */}
          <motion.div
            {...fadeUp(0.4)}
            className="text-center mt-6"
          >
            <p
              className="font-pixel text-[9px] tracking-widest"
              style={{ color: "#888" }}
            >
              {"\u25C4 AUTO-FLIPPING \u25BA HOVER TO PAUSE \u00B7 CLICK TO FLIP"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS (3 steps) ═══ */}
      <section className="relative py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <span
              className="inline-block font-pixel text-[9px] tracking-widest px-3 py-1.5"
              style={{
                border: "2px solid var(--neon-green)",
                color: "var(--neon-green)",
                background: "var(--neon-green-dim)",
              }}
            >
              3 STEPS
            </span>
            <h2
              className="font-pixel text-xl md:text-2xl tracking-wider mt-4"
              style={{ color: "#FFF" }}
            >
              HOW IT WORKS
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Link2,
                step: "01",
                title: "PASTE URL",
                desc: "GitHub repo, landing page, live demo — any public URL. We extract your project in seconds.",
                color: "var(--neon-cyan)",
              },
              {
                icon: Sparkles,
                step: "02",
                title: "AI GENERATES",
                desc: "Our AI crafts a hero card with HP/MP/EXP stats, rarity tier, skill tags, and a catchphrase.",
                color: "var(--neon-purple)",
              },
              {
                icon: Share2,
                step: "03",
                title: "SHARE & EVOLVE",
                desc: "Download and share on X, Xiaohongshu, LinkedIn. Real traction evolves your card to legendary.",
                color: "var(--neon-green)",
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.step}
                  {...fadeUp(0.1 * i)}
                  className="retro-card relative"
                  style={{
                    background: "var(--bg-panel)",
                    border: "2px solid var(--border-metal)",
                    boxShadow: "4px 4px 0 #000",
                    padding: 24,
                  }}
                >
                  <div
                    className="absolute top-3 right-3 font-pixel text-xs opacity-40"
                    style={{ color: s.color }}
                  >
                    {s.step}
                  </div>
                  <div
                    className="w-12 h-12 flex items-center justify-center mb-4"
                    style={{
                      background: s.color + "22",
                      border: `2px solid ${s.color}`,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: s.color }} />
                  </div>
                  <h3
                    className="font-pixel text-xs tracking-wider mb-3"
                    style={{ color: "#FFF" }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="font-retro text-sm leading-relaxed"
                    style={{ color: "#A0A0A8" }}
                  >
                    {s.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA (two buttons) ═══ */}
      <section className="relative py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <motion.h2
            {...fadeUp(0)}
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              color: "#FFF",
              lineHeight: 1.2,
            }}
          >
            Ready to ship your
            <br />
            <span style={{ color: "var(--neon-purple)" }}>first hero card?</span>
          </motion.h2>

          <motion.p
            {...fadeUp(0.1)}
            className="text-base mb-8 font-retro"
            style={{ color: "#A0A0A8" }}
          >
            30 seconds. No credit card. No sign-up required to preview.
          </motion.p>

          <motion.div
            {...fadeUp(0.2)}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/launch">
              <button
                className="group flex items-center gap-3 px-8 py-4 font-pixel text-sm tracking-wider transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, var(--neon-purple), #C026D3)",
                  border: "3px solid #FFF",
                  boxShadow: "6px 6px 0 #000, 0 0 40px rgba(157,0,255,0.4)",
                  color: "#FFF",
                }}
              >
                <Rocket className="h-5 w-5" />
                LAUNCH YOUR PROJECT
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <Link href="/discover">
              <button
                className="flex items-center gap-2 px-6 py-4 font-pixel text-xs tracking-wider transition-all hover:scale-105"
                style={{
                  background: "transparent",
                  border: "2px solid var(--border-metal)",
                  color: "#E8E8EC",
                }}
              >
                <Play className="h-4 w-4" />
                BROWSE EXAMPLES
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
