"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, Link2, Sparkles, Share2, ArrowRight } from "lucide-react";
import { useProjects } from "@/lib/use-data";
import { ProjectCard } from "@/components/project-card";

/* ─── animation presets ─── */
const pixelEase = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-30px" },
  transition: { duration: 0.5, delay, ease: pixelEase },
});

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE — Focused acquisition landing
   Core loop: Paste URL → AI generates hero card → Share for traffic
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Home() {
  const { data: projects } = useProjects();
  const showcaseProjects = projects.slice(0, 6);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg-deep)" }}>
      {/* Scanline CRT overlay */}
      <div className="scanline-overlay" />

      {/* ═══ HERO — single headline, single CTA ═══ */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24">
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
              AI-NATIVE LAUNCH PLATFORM
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            {...fadeUp(0.1)}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              color: "#FFF",
              lineHeight: 1.1,
              textShadow: "0 0 20px var(--neon-purple-dim)",
            }}
          >
            Turn your AI project
            <br />
            <span style={{ color: "var(--neon-green)" }}>into a viral hero card.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fadeUp(0.2)}
            className="text-lg md:text-xl mb-10 font-retro"
            style={{ color: "var(--muted-foreground, #A0A0A8)", maxWidth: "42rem", margin: "0 auto 2.5rem auto" }}
          >
            Paste your URL. Get an AI-generated hero card with stats, rarity, and QR code. Share it
            everywhere, watch it evolve from real traction.
          </motion.p>

          {/* Primary CTA */}
          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/launch">
              <button
                className="group flex items-center gap-3 px-8 py-4 font-pixel text-sm tracking-wider transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, var(--neon-purple), #C026D3)",
                  border: "3px solid #FFF",
                  boxShadow: "6px 6px 0 #000, 0 0 40px var(--neon-purple-dim)",
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
                BROWSE EXAMPLES
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — 3 steps ═══ */}
      <section className="py-16 lg:py-20 relative">
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
              HOW IT WORKS
            </span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Link2,
                step: "01",
                title: "PASTE YOUR URL",
                desc: "Drop your AI project URL. GitHub repo, live demo, landing page — anything works.",
                color: "var(--neon-cyan)",
              },
              {
                icon: Sparkles,
                step: "02",
                title: "AI GENERATES CARD",
                desc: "Instant hero card with HP/MP/EXP stats, rarity tier, skill tags, AI catchphrase, and QR code.",
                color: "var(--neon-purple)",
              },
              {
                icon: Share2,
                step: "03",
                title: "SHARE & EVOLVE",
                desc: "Download and share on X, Xiaohongshu, LinkedIn. Real traffic evolves your card to legendary.",
                color: "var(--neon-green)",
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.step}
                  {...fadeUp(0.1 * i)}
                  className="retro-card p-6 relative"
                  style={{
                    background: "var(--bg-panel)",
                    border: "2px solid var(--border-metal)",
                    boxShadow: "4px 4px 0 #000",
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
                    style={{ color: "var(--muted-foreground, #A0A0A8)" }}
                  >
                    {s.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ LIVE EXAMPLES — real hero cards ═══ */}
      {showcaseProjects.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div {...fadeUp(0)} className="text-center mb-10">
              <span
                className="inline-block font-pixel text-[9px] tracking-widest px-3 py-1.5 mb-4"
                style={{
                  border: "2px solid var(--neon-yellow)",
                  color: "var(--neon-yellow)",
                  background: "rgba(250, 204, 21, 0.1)",
                }}
              >
                LIVE HERO CARDS
              </span>
              <h2
                className="font-pixel text-xl md:text-2xl tracking-wider mt-2"
                style={{ color: "#FFF" }}
              >
                PROJECTS ALREADY EVOLVING
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {showcaseProjects.map((project, i) => (
                <motion.div key={project.id} {...fadeUp(0.05 * i)}>
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>

            <motion.div {...fadeUp(0.2)} className="text-center mt-10">
              <Link href="/discover">
                <button
                  className="flex items-center gap-2 mx-auto px-6 py-3 font-pixel text-[10px] tracking-wider hover:scale-105 transition-transform"
                  style={{
                    background: "transparent",
                    border: "2px solid var(--border-metal)",
                    color: "#E8E8EC",
                  }}
                >
                  BROWSE ALL PROJECTS
                  <ArrowRight className="h-3 w-3" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 lg:py-28 relative">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <motion.h2
            {...fadeUp(0)}
            className="text-3xl md:text-4xl font-bold mb-6"
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
            className="text-lg mb-8 font-retro"
            style={{ color: "var(--muted-foreground, #A0A0A8)" }}
          >
            30 seconds. No credit card. No sign-up required to preview.
          </motion.p>
          <motion.div {...fadeUp(0.2)}>
            <Link href="/launch">
              <button
                className="group flex items-center gap-3 mx-auto px-10 py-5 font-pixel text-sm tracking-wider transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, var(--neon-purple), #C026D3)",
                  border: "3px solid #FFF",
                  boxShadow: "6px 6px 0 #000, 0 0 60px var(--neon-purple-dim)",
                  color: "#FFF",
                }}
              >
                <Rocket className="h-5 w-5" />
                LAUNCH YOUR PROJECT
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
