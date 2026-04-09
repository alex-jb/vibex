"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Swords, Heart, Target, MessageSquare, Lock, Zap, Star, Shield, Users, Share2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { projects } from "@/lib/mock-data";
import { ShareModal } from "@/components/share-modal";

interface DojoRoom {
  href: string;
  icon: typeof Swords;
  color: string;
  shadow: string;
  accent: string;
  glowColor: string;
  i18nKey: string;
  descKey: string;
  requiresAuth?: boolean;
}

const dojoRooms: DojoRoom[] = [
  {
    href: "/arena",
    icon: Swords,
    color: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
    accent: "text-amber-400",
    glowColor: "rgba(245,158,11,0.5)",
    i18nKey: "nav.arena",
    descKey: "dojo.arenaDesc",
  },
  {
    href: "/buddy",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    shadow: "shadow-pink-500/20",
    accent: "text-pink-400",
    glowColor: "rgba(236,72,153,0.5)",
    i18nKey: "nav.buddy",
    descKey: "dojo.buddyDesc",
  },
  {
    href: "/hunt",
    icon: Target,
    color: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
    accent: "text-emerald-400",
    glowColor: "rgba(16,185,129,0.5)",
    i18nKey: "nav.hunt",
    descKey: "dojo.huntDesc",
  },
  {
    href: "/messages",
    icon: MessageSquare,
    color: "from-cyan-500 to-blue-500",
    shadow: "shadow-cyan-500/20",
    accent: "text-cyan-400",
    glowColor: "rgba(6,182,212,0.5)",
    i18nKey: "nav.messages",
    descKey: "dojo.messagesDesc",
    requiresAuth: true,
  },
];

const trainerStats = [
  { label: "LVL", value: "42", icon: Star, color: "#FFD700" },
  { label: "EXP", value: "8,450", icon: Zap, color: "#39FF14" },
  { label: "BUDDIES", value: "12", icon: Users, color: "#FF69B4" },
  { label: "WINS", value: "87", icon: Shield, color: "#00BFFF" },
];

const containerVariants = {
  hidden: {} as const,
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
} as const;

const roomVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 } as const,
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    },
  },
} as const;

export default function DojoPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [shareProject, setShareProject] = useState<typeof projects[0] | null>(null);

  const visibleRooms = dojoRooms.filter(
    (room) => !room.requiresAuth || user
  );

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />

      {/* Background gradient orb */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-violet-600/8 blur-[120px]" />

      {/* Terminal header bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mb-6"
      >
        <div
          className="rounded-t-lg px-4 py-2 flex items-center gap-2"
          style={{ background: "rgba(30,30,40,0.85)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#FF5F56" }} />
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#FFBD2E" }} />
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#27C93F" }} />
          <span
            className="ml-3 text-xs tracking-widest"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              color: "#39FF14",
              textShadow: "0 0 8px rgba(57,255,20,0.4)",
            }}
          >
            VIBEX://DOJO v1.0
          </span>
        </div>
      </motion.div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center mb-8"
      >
        <h1
          className="font-pixel text-[14px] tracking-widest mb-3"
          style={{ color: "#39FF14", textShadow: "0 0 12px rgba(57,255,20,0.3)" }}
        >
          {"> VIBEX://DOJO"}
        </h1>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
          {t("dojo.title")}{" "}
          <span className="text-gradient">{t("dojo.titleHighlight")}</span>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
          {t("dojo.description")}
        </p>
      </motion.div>

      {/* Trainer Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-8"
      >
        <div
          className="rpgui-container framed"
          style={{ padding: "0.5rem 1rem" }}
        >
          <div className="flex items-center justify-around flex-wrap gap-3">
            {trainerStats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <stat.icon className="size-4" style={{ color: stat.color }} />
                <span
                  className="text-xs tracking-wider"
                  style={{
                    fontFamily: "var(--font-pixel), monospace",
                    color: stat.color,
                    textShadow: `0 0 6px ${stat.color}40`,
                  }}
                >
                  {stat.label}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: "var(--font-pixel), monospace",
                    color: "#fff",
                    textShadow: "0 0 4px rgba(255,255,255,0.3)",
                  }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Room Grid wrapped in RPG frame */}
      <div className="rpgui-container framed" style={{ padding: "1.5rem" }}>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {visibleRooms.map((room) => (
            <motion.div
              key={room.href}
              variants={roomVariants}
            >
              <Link href={room.href} className="group block">
                <div
                  className="glass-card-strong rounded-xl retro-border p-6 transition-all hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5"
                  style={{
                    transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 16px ${room.glowColor}, 0 0 32px ${room.glowColor}, inset 0 0 8px ${room.glowColor}30`;
                    e.currentTarget.style.borderColor = room.glowColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  <div className={`inline-flex items-center justify-center size-14 rounded-xl bg-gradient-to-br ${room.color} ${room.shadow} shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                    <room.icon className="size-7 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${room.accent} mb-2`}>
                    {t(room.i18nKey as Parameters<typeof t>[0])}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(room.descKey as Parameters<typeof t>[0])}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Login prompt for Messages when not authenticated */}
          {!user && (
            <motion.div variants={roomVariants}>
              <Link href="/login" className="group block">
                <div
                  className="glass-card-strong rounded-xl retro-border p-6 transition-all hover:border-violet-500/30 border-dashed border-white/10 opacity-60 hover:opacity-80"
                  style={{ transition: "box-shadow 0.3s ease, opacity 0.3s ease" }}
                >
                  <div className="inline-flex items-center justify-center size-14 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 shadow-lg mb-4">
                    <Lock className="size-7 text-cyan-400/60" />
                  </div>
                  <h3 className="text-xl font-bold text-cyan-400/60 mb-2">
                    {t("nav.messages")}
                  </h3>
                  <p className="text-sm text-muted-foreground/60 leading-relaxed">
                    {t("dojo.loginToChat")}
                  </p>
                </div>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ═══ Share Hero Card Section ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8"
      >
        <div className="rpgui-container framed" style={{ padding: "1.5rem" }}>
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="size-4 text-fuchsia-400" />
            <span
              className="font-pixel text-[8px] uppercase tracking-widest"
              style={{ color: "#FACC15", textShadow: "0 0 8px rgba(250,204,21,0.3)" }}
            >
              {lang === "zh" ? "分享你的英雄卡片" : "SHARE YOUR HERO CARD"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {lang === "zh"
              ? "选择一个项目，生成你的 16-bit 英雄成就卡，分享到社交媒体！"
              : "Pick a project and generate your 16-bit Hero Achievement Card to share on social media!"}
          </p>

          {/* Project picker grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {projects.slice(0, 6).map((p) => {
              const emojiMap: Record<string, string> = { Architect: "🏗️", Artisan: "⚒️", Enchanter: "✨", Alchemist: "🧪", Sentinel: "🛡️" };
              const classEmoji = (p.hero?.heroClass ? emojiMap[p.hero.heroClass] : undefined) ?? "⚔️";
              return (
                <button
                  key={p.id}
                  onClick={() => setShareProject(p)}
                  className="group glass-card-strong rounded-lg p-3 text-left transition-all hover:border-violet-500/30 hover:bg-violet-500/5 retro-border"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{classEmoji}</span>
                    <span className="font-pixel text-[7px] text-muted-foreground">
                      LV.{p.hero?.level || 1}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-foreground group-hover:text-violet-400 transition-colors line-clamp-1">
                    {p.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground/60">{p.creatorName}</span>
                    <span className="text-[10px] text-amber-400">★{p.score}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Share Modal */}
      {shareProject && (
        <ShareModal
          open={!!shareProject}
          onOpenChange={(open) => { if (!open) setShareProject(null); }}
          project={{
            id: shareProject.id,
            title: shareProject.title,
            tagline: shareProject.tagline,
            category: shareProject.category,
            creatorName: shareProject.creatorName,
          }}
        />
      )}
    </div>
  );
}
