"use client";

import { Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Compass,
  Swords,
  MessageSquare,
} from "lucide-react";
import { useProjects } from "@/lib/use-data";
import { useLang } from "@/lib/i18n";
import { ValueHero } from "@/components/home/value-hero";
import { QuestBoard } from "@/components/home/quest-board";
import { CtaSection } from "@/components/home/cta-section";
import { DailyQuestBar } from "@/components/home/daily-quest-bar";

/* ─── skeleton fallback for lazy sections ─── */
function SectionSkeleton() {
  return (
    <div className="py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 animate-pulse">
        <div className="h-4 w-40 mb-4" style={{ background: "var(--border-metal)" }} />
        <div className="h-3 w-64 mb-8" style={{ background: "var(--border-metal)", opacity: 0.5 }} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-48" style={{ background: "var(--bg-panel)", border: "2px solid var(--border-metal)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── animation presets ─── */
const pixelEase = [0.22, 1, 0.36, 1] as const;

const staggerChild = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-30px" },
  transition: { duration: 0.4, delay: i * 0.08, ease: pixelEase },
});

/* ═══════════════════════════════════════════════════════════════════════════
   APP HOME — full dashboard after clicking LAUNCH from landing
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AppHome() {
  const { t } = useLang();
  const { data: projects } = useProjects();
  const gridProjects = projects.slice(0, 6);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg-deep)" }}>
      {/* Scanline CRT overlay */}
      <div className="scanline-overlay" />

      {/* Boot scanline sweep — plays once on mount, carries the arcade energy
          from landing into /home so the tonal shift isn't jarring */}
      <AnimatePresence>
        <motion.div
          key="boot-sweep"
          aria-hidden="true"
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "120%", opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], times: [0, 0.15, 0.85, 1] }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
          style={{
            height: 4,
            background:
              "linear-gradient(90deg, transparent 0%, var(--neon-purple) 20%, var(--neon-green) 50%, var(--neon-purple) 80%, transparent 100%)",
            boxShadow: "0 0 24px rgba(157,0,255,0.8), 0 0 48px rgba(57,255,20,0.4)",
            filter: "blur(1px)",
          }}
        />
      </AnimatePresence>

      {/* Content entrance — subtle scale/fade, fast, not distracting */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >

      {/* VALUE HERO — 3-second value proposition */}
      <ValueHero />

      {/* QUICK ACTIONS BAR — primary "do something now" entry points, above the fold */}
      <section className="py-6">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t("quick.launch"), href: "/launch", icon: Rocket, gradient: "linear-gradient(135deg, #7C3AED, #9D4EDD)" },
              { label: t("quick.discover"), href: "/discover", icon: Compass, gradient: "linear-gradient(135deg, #06B6D4, #22D3EE)" },
              { label: t("quick.dojo"), href: "/dojo", icon: Swords, gradient: "linear-gradient(135deg, #D97706, #F59E0B)" },
              { label: t("quick.feed"), href: "/feed", icon: MessageSquare, gradient: "linear-gradient(135deg, #DB2777, #F472B6)" },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.div key={action.label} {...staggerChild(i)}>
                  <Link href={action.href}>
                    <div
                      className="retro-card p-3 flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                      style={{ boxShadow: "3px 3px 0 #000" }}
                    >
                      <div
                        className="w-10 h-10 flex items-center justify-center"
                        style={{ background: action.gradient, border: "2px solid var(--border-metal)" }}
                      >
                        <Icon size={18} color="#fff" />
                      </div>
                      <span className="font-pixel text-[10px] uppercase tracking-wider" style={{ color: "#E8E8EC" }}>
                        {action.label}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DAILY QUEST BAR — retention hook, below primary actions, localStorage UTC reset */}
      <DailyQuestBar />

      {/* BACK TO SHOWCASE — link to landing Game Boy */}
      <section className="py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-3 px-6 py-3 cursor-pointer transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(157,0,255,0.15), rgba(57,255,20,0.08))",
                border: "2px solid var(--neon-purple)",
                boxShadow: "4px 4px 0 #000, 0 0 24px rgba(157,0,255,0.2)",
              }}
            >
              <span
                className="font-pixel text-[9px] tracking-widest"
                style={{ color: "#E9BDFF" }}
              >
                ◂ BACK TO SHOWCASE — REPLAY THE DEMO
              </span>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* BETA BANNER */}
      <section className="py-3 overflow-hidden" style={{ background: "rgba(0,0,0,0.6)", borderTop: "1px solid var(--border-metal)", borderBottom: "1px solid var(--border-metal)" }}>
        <div className="text-center">
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: "var(--neon-green)" }}>
            Join the beta &mdash; be among the first creators
          </span>
        </div>
      </section>

      {/* Below-fold sections wrapped in Suspense for progressive loading */}
      <Suspense fallback={<SectionSkeleton />}>
        <QuestBoard gridProjects={gridProjects} />
        <CtaSection />
      </Suspense>
      </motion.div>
    </div>
  );
}
