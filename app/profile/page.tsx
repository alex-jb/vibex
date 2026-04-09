"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Save,
  X,
  Check,
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
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { projects } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { computeUserLevel, BUDDY_TYPES, RARITY_CONFIG } from "@/lib/buddy-system";
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

/* ─── Profile Overrides ──────────────────────────────────────────────────── */

const PROFILE_STORAGE_KEY = "vibex-profile-overrides";

type ProfileOverrides = {
  displayName?: string;
  bio?: string;
  avatarDataUrl?: string;
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLang();

  /* ── Profile overrides from localStorage ── */
  const [overrides, setOverrides] = useState<ProfileOverrides>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Load overrides from localStorage on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const parsed: ProfileOverrides = JSON.parse(raw);
        setOverrides(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const baseDisplayName = String(
    meta?.full_name ??
    meta?.name ??
    user?.email?.split("@")[0] ??
    "Adventurer"
  );
  const baseAvatarUrl: string | undefined =
    (meta?.avatar_url as string) ?? (meta?.picture as string) ?? undefined;
  const email = user?.email ?? "";
  const joinDate = user?.created_at ? formatDate(user.created_at) : "---";

  const displayName = overrides.displayName || baseDisplayName;
  const bio = overrides.bio || "";
  const avatarUrl = overrides.avatarDataUrl || baseAvatarUrl;

  const handleEditOpen = useCallback(() => {
    setEditName(displayName);
    setEditBio(bio);
    setEditAvatarPreview(overrides.avatarDataUrl || null);
    setIsEditing(true);
  }, [displayName, bio, overrides.avatarDataUrl]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditAvatarPreview(null);
  }, []);

  const handleAvatarSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = useCallback(() => {
    const next: ProfileOverrides = {
      displayName: editName.trim() || undefined,
      bio: editBio.trim() || undefined,
      avatarDataUrl: editAvatarPreview || undefined,
    };
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage full — ignore
    }
    setOverrides(next);
    setIsEditing(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }, [editName, editBio, editAvatarPreview]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-pixel text-sm text-white/40 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

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
    { icon: Folder, label: t("profile.myProjects"), value: myProjects.length },
    { icon: ThumbsUp, label: t("profile.totalUpvotes"), value: totalUpvotes },
    { icon: Swords, label: t("profile.battleCount"), value: battleCount },
    { icon: Users, label: t("profile.followers"), value: followerCount },
    { icon: Sparkles, label: t("profile.level"), value: userLevel.level, suffix: userLevel.title },
  ];

  /* Mock battle history */
  const battles = [
    { opponent: "AgentForge", result: t("profile.win"), won: true },
    { opponent: "PixelMind", result: t("profile.lose"), won: false },
    { opponent: "NeuralCraft", result: t("profile.win"), won: true },
  ];

  /* Mock achievements */
  const achievements = [
    { icon: Star, label: t("profile.pioneer"), desc: t("profile.earlyAdopter") },
    { icon: Swords, label: t("profile.firstBattle"), desc: t("profile.firstBattleDesc") },
    { icon: Folder, label: t("profile.firstProject"), desc: t("profile.firstProjectDesc") },
    { icon: Trophy, label: t("profile.winStreak"), desc: t("profile.winStreakDesc") },
    { icon: Shield, label: t("profile.hundredUpvotes"), desc: t("profile.hundredUpvotesDesc") },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* ── Hero Section ── */}
      <FadeIn>
        <div className="glass-card-strong rounded-2xl border border-white/[0.08] p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {isEditing ? (
              /* ── Edit Mode ── */
              <motion.div
                key="edit-mode"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-pixel text-lg text-gradient mb-5">{t("profile.editMode")}</h2>
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  {/* Avatar upload */}
                  <div className="relative group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarSelect}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-violet-500/40 bg-white/5 overflow-hidden transition-all hover:border-violet-400 hover:bg-white/10"
                    >
                      {editAvatarPreview ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={editAvatarPreview}
                          alt="Preview"
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="h-full w-full rounded-full object-cover opacity-50"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 text-xl font-bold text-white/40">
                          {getInitials(displayName)}
                        </div>
                      )}
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-5 w-5 text-white/80" />
                        <span className="mt-1 font-pixel text-[8px] text-white/70">{t("profile.avatarUpload")}</span>
                      </div>
                    </button>
                  </div>

                  {/* Edit fields */}
                  <div className="flex-1 w-full space-y-4">
                    {/* Display Name */}
                    <div>
                      <label className="block font-pixel text-xs text-white/60 mb-1.5" style={{ fontFamily: "var(--font-pixel), monospace" }}>
                        {t("profile.editProfile")}
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={40}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/90 font-pixel placeholder:text-white/25 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
                        style={{ fontFamily: "var(--font-pixel), monospace" }}
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block font-pixel text-xs text-white/60 mb-1.5" style={{ fontFamily: "var(--font-pixel), monospace" }}>
                        {t("profile.bio")}
                      </label>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        maxLength={200}
                        rows={3}
                        placeholder={t("profile.bioPlaceholder")}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/90 font-pixel placeholder:text-white/25 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all resize-none"
                        style={{ fontFamily: "var(--font-pixel), monospace" }}
                      />
                      <p className="mt-1 text-right font-pixel text-[10px] text-white/30">{editBio.length}/200</p>
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="nes-btn is-primary font-pixel text-xs"
                      >
                        <Save className="inline-block h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                        {t("profile.save")}
                      </button>
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        className="nes-btn font-pixel text-xs"
                      >
                        <X className="inline-block h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                        {t("profile.cancel")}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ── View Mode ── */
              <motion.div
                key="view-mode"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                  {/* Avatar */}
                  {avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
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
                    {bio && (
                      <p className="mt-1.5 font-pixel text-xs text-white/60 italic max-w-md">{bio}</p>
                    )}
                    <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-white/50 sm:justify-start">
                      <Mail className="h-3.5 w-3.5" />
                      {email}
                    </p>
                    <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-white/40 sm:justify-start">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {t("profile.joinedAt")} {joinDate}
                    </p>
                  </div>

                  {/* Edit button + saved flash */}
                  <div className="flex items-center gap-2">
                    <AnimatePresence>
                      {savedFlash && (
                        <motion.span
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          className="flex items-center gap-1 font-pixel text-xs text-emerald-400"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {t("profile.saveDone")}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={handleEditOpen}
                      className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 px-4 py-2 text-xs text-violet-300 transition-all hover:border-violet-400 hover:bg-violet-500/10 hover:text-violet-200"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t("profile.editProfile")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
          <h2 className="font-pixel text-lg text-gradient mb-4">{t("profile.expProgress")}</h2>
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
            {t("profile.expTotal")} {userLevel.totalExp} EXP · {t("profile.expNeeded")} {userLevel.expToNextLevel - userLevel.currentExp} EXP {t("profile.expMore")}
          </p>
        </div>
      </FadeIn>

      {/* ── My Buddies ── */}
      <FadeIn delay={0.48} className="mt-8">
        <div className="rpgui-container framed rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-pixel text-lg text-gradient">{t("profile.myBuddies")}</h2>
            <Link href="/buddy" className="font-pixel text-xs text-violet-400 hover:text-violet-300 transition-colors">
              {t("profile.viewAll")}
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
                    <span className="inline-block mt-1 font-pixel text-[9px] text-amber-400">{t("buddy.inBattle")}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* ── Creator Dashboard Link ── */}
      <FadeIn delay={0.45} className="mt-8">
        <Link href="/profile/dashboard" className="group block">
          <div className="rpgui-container framed flex items-center justify-between" style={{ padding: "12px 16px" }}>
            <div className="flex items-center gap-3">
              <BarChart3 className="size-5 text-violet-400" />
              <div>
                <span className="font-pixel text-[9px] text-violet-400">{t("profile.creatorDashboard")}</span>
                <p className="text-xs text-muted-foreground">{t("profile.dashboardDesc")}</p>
              </div>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-violet-400 transition-colors" />
          </div>
        </Link>
      </FadeIn>

      {/* ── My Projects ── */}
      <FadeIn delay={0.5} className="mt-6">
        <h2 className="font-pixel text-lg text-gradient mb-4">{t("profile.myProjects")}</h2>
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
        <h2 className="font-pixel text-lg text-gradient mb-4">{t("profile.recentBattles")}</h2>
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
        <h2 className="font-pixel text-lg text-gradient mb-4">{t("profile.achievements")}</h2>
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
