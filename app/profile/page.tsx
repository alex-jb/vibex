"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  CalendarDays,
  Pencil,
  Folder,
  ThumbsUp,
  Swords,
  Users,
  Trophy,
  Shield,
  Star,
  ChevronUp,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { projects } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { computeUserLevel, EXP_REWARDS, BUDDY_TYPES, RARITY_CONFIG } from "@/lib/buddy-system";
import type { UserBuddy } from "@/lib/buddy-system";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

/* ─── Fade-in wrapper ─────────────────────────────────────────────────────── */

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stats Card ──────────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  delay,
  suffix,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  delay: number;
  suffix?: string;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="glass-card-strong rounded-xl border border-white/[0.08] p-5 text-center transition-all duration-300 hover:border-white/15 hover:shadow-[0_4px_24px_-6px_rgba(139,92,246,0.25)]">
        <Icon className="mx-auto mb-2 h-6 w-6 text-violet-400" />
        <p className="font-pixel text-2xl text-gradient">
          {suffix ? `Lv.${value}` : value.toLocaleString()}
        </p>
        {suffix && <p className="mt-0.5 font-pixel text-[10px] text-amber-400">{suffix}</p>}
        <p className="mt-1 text-xs text-white/50">{label}</p>
      </div>
    </FadeIn>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLang();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-pixel text-sm text-white/40 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Adventurer";
  const avatarUrl: string | undefined =
    user.user_metadata?.avatar_url ?? user.user_metadata?.picture;
  const email = user.email ?? "";
  const joinDate = user.created_at ? formatDate(user.created_at) : "---";

  /* Projects & computed stats */
  const myProjects = projects.slice(0, 3);
  const totalUpvotes = myProjects.reduce((sum, p) => sum + p.upvotes, 0);
  const battleCount = 12; // Keep mock for now
  const followerCount = 156; // Keep mock for now

  /* EXP & Buddy mock data */
  const mockTotalExp = 2850;
  const userLevel = computeUserLevel(mockTotalExp);

  const mockBuddies: UserBuddy[] = [
    { id: "b1", buddyTypeId: "pixel-fox", level: 5, exp: 230, happiness: 85, obtainedAt: "2026-03-20", isActive: true },
    { id: "b2", buddyTypeId: "neon-slime", level: 3, exp: 120, happiness: 70, obtainedAt: "2026-04-01", isActive: false },
  ];
  const activeBuddy = mockBuddies.find(b => b.isActive);
  const activeBuddyType = activeBuddy ? BUDDY_TYPES.find(t => t.id === activeBuddy.buddyTypeId) : null;
  const expPercent = Math.min(100, (userLevel.currentExp / userLevel.expToNextLevel) * 100);

  const stats: { icon: React.ElementType; label: string; value: number; suffix?: string }[] = [
    { icon: Folder, label: "我的项目", value: myProjects.length },
    { icon: ThumbsUp, label: "总点赞", value: totalUpvotes },
    { icon: Swords, label: "战斗次数", value: battleCount },
    { icon: Users, label: "粉丝数", value: followerCount },
    { icon: Sparkles, label: "等级", value: userLevel.level, suffix: userLevel.title },
  ];

  /* Mock battle history */
  const battles = [
    { opponent: "AgentForge", result: "胜利", won: true },
    { opponent: "PixelMind", result: "失败", won: false },
    { opponent: "NeuralCraft", result: "胜利", won: true },
  ];

  /* Mock achievements */
  const achievements = [
    { icon: Star, label: "先驱者", desc: "首批注册用户" },
    { icon: Swords, label: "第一次战斗", desc: "完成首场竞技" },
    { icon: Folder, label: "首个项目", desc: "发布第一个项目" },
    { icon: Trophy, label: "连胜三场", desc: "竞技场三连胜" },
    { icon: Shield, label: "百赞达人", desc: "单项目超100赞" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* ── Hero Section ── */}
      <FadeIn>
        <div className="glass-card-strong rounded-2xl border border-white/[0.08] p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-20 w-20 rounded-full border-2 border-violet-500/60 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-bold text-white">
                {getInitials(displayName)}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-pixel text-2xl text-gradient">{displayName}</h1>
                {activeBuddyType && (
                  <motion.span
                    className="text-xl"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    title={activeBuddyType.nameZh}
                  >
                    {activeBuddyType.emoji}
                  </motion.span>
                )}
                <span className="level-badge shrink-0 text-xs">
                  <span className="text-violet-400">Lv</span>
                  <span className="ml-0.5">{userLevel.level}</span>
                </span>
                <span className="font-pixel text-[10px] text-amber-400">{userLevel.title}</span>
              </div>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-white/50 sm:justify-start">
                <Mail className="h-3.5 w-3.5" />
                {email}
              </p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-white/40 sm:justify-start">
                <CalendarDays className="h-3.5 w-3.5" />
                加入于 {joinDate}
              </p>
            </div>

            {/* Edit button */}
            <button
              disabled
              title="即将推出"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs text-white/30 cursor-not-allowed"
            >
              <Pencil className="h-3.5 w-3.5" />
              编辑资料
            </button>
          </div>
        </div>
      </FadeIn>

      {/* ── Stats Grid ── */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((s, i) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} delay={0.1 + i * 0.08} suffix={s.suffix} />
        ))}
      </div>

      {/* ── EXP Progress ── */}
      <FadeIn delay={0.45} className="mt-8">
        <div className="rpgui-container framed rounded-xl p-5">
          <h2 className="font-pixel text-lg text-gradient mb-4">经验进度</h2>
          <div className="flex items-center gap-3">
            <div className="level-badge shrink-0">
              <span className="text-violet-400">Lv</span>
              <span className="ml-0.5">{userLevel.level}</span>
            </div>
            <div className="flex-1">
              <div className="rpg-bar h-4">
                <motion.div
                  className="rpg-bar__fill rpg-bar--exp"
                  initial={{ width: 0 }}
                  animate={{ width: `${expPercent}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className="rpg-bar__label">EXP</span>
                <span className="rpg-bar__value">
                  {userLevel.currentExp}/{userLevel.expToNextLevel}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-2 font-pixel text-[10px] text-white/40 text-right">
            累计 {userLevel.totalExp} EXP · 距下一级还需 {userLevel.expToNextLevel - userLevel.currentExp} EXP
          </p>
        </div>
      </FadeIn>

      {/* ── My Buddies ── */}
      <FadeIn delay={0.48} className="mt-8">
        <div className="rpgui-container framed rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-pixel text-lg text-gradient">我的伙伴</h2>
            <Link href="/buddy" className="font-pixel text-xs text-violet-400 hover:text-violet-300 transition-colors">
              查看全部 →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {mockBuddies.map((buddy) => {
              const buddyType = BUDDY_TYPES.find(t => t.id === buddy.buddyTypeId);
              if (!buddyType) return null;
              const rarity = RARITY_CONFIG[buddyType.rarity];
              return (
                <div
                  key={buddy.id}
                  className={`shrink-0 w-32 rounded-xl border-2 p-3 text-center transition-all duration-300 ${
                    buddy.isActive
                      ? "border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)] bg-amber-500/5"
                      : `${rarity.borderColor} ${rarity.bgColor}`
                  }`}
                >
                  <motion.span
                    className="block text-3xl mb-1"
                    animate={buddy.isActive ? { y: [0, -3, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {buddyType.emoji}
                  </motion.span>
                  <p className="font-pixel text-xs text-white/90">{buddyType.nameZh}</p>
                  <p className="font-pixel text-[10px] text-white/50 mt-0.5">Lv.{buddy.level}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: rarity.color }}>{rarity.labelZh}</p>
                  {buddy.isActive && (
                    <span className="inline-block mt-1 font-pixel text-[9px] text-amber-400">★ 出战中</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* ── My Projects ── */}
      <FadeIn delay={0.5} className="mt-10">
        <h2 className="font-pixel text-lg text-gradient mb-4">我的项目</h2>
        <div className="space-y-3">
          {myProjects.map((p) => (
            <Link key={p.id} href={`/project/${p.id}`} className="block group">
              <div className="glass-card-strong rounded-xl border border-white/[0.08] p-4 transition-all duration-300 group-hover:border-white/15 group-hover:shadow-[0_4px_24px_-6px_rgba(139,92,246,0.15)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white/90">{p.title}</span>
                    <Badge variant="outline" className="text-[10px] text-violet-400 border-violet-500/30">
                      {p.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                      {p.score}
                    </span>
                    <span className="flex items-center gap-1">
                      <ChevronUp className="h-3.5 w-3.5 text-emerald-400" />
                      {p.upvotes}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-white/30 transition-colors group-hover:text-violet-400" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </FadeIn>

      {/* ── Battle History ── */}
      <FadeIn delay={0.6} className="mt-10">
        <h2 className="font-pixel text-lg text-gradient mb-4">最近战斗</h2>
        <div className="glass-card-strong rounded-xl border border-white/[0.08] divide-y divide-white/[0.06]">
          {battles.map((b, i) => (
            <Link key={i} href="/arena" className="flex items-center justify-between px-5 py-3.5 group transition-colors hover:bg-white/[0.02]">
              <span className="text-sm text-white/70">
                vs <span className="font-medium text-white/90">{b.opponent}</span>
              </span>
              <span
                className={`font-pixel text-xs ${b.won ? "text-emerald-400" : "text-red-400"}`}
              >
                {b.result}
              </span>
            </Link>
          ))}
        </div>
      </FadeIn>

      {/* ── Achievement Badges ── */}
      <FadeIn delay={0.7} className="mt-10 pb-8">
        <h2 className="font-pixel text-lg text-gradient mb-4">成就徽章</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {achievements.map((a) => (
            <div
              key={a.label}
              className="glass-card-strong rounded-xl border border-white/[0.08] p-4 text-center transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_4px_20px_-6px_rgba(234,179,8,0.2)]"
            >
              <a.icon className="mx-auto mb-2 h-7 w-7 text-amber-400" />
              <p className="font-pixel text-xs text-white/90">{a.label}</p>
              <p className="mt-0.5 text-[10px] text-white/40">{a.desc}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
