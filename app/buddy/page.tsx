"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { triggerQuestComplete } from "@/lib/onboarding";
import {
  computeUserLevel,
  summonBuddy,
  EXP_REWARDS,
  BUDDY_TYPES,
  RARITY_CONFIG,
  getEvolutionStage,
  canEvolve,
  type SummonResult,
} from "@/lib/buddy-system";
import { BuddyCard } from "@/components/buddy-card";
import { BuddySprite } from "@/components/buddy-sprite";

/* ─── Summon levels reference ─── */
const SUMMON_LEVELS = [3, 5, 8, 10, 13, 15, 18, 20, 25, 30];

/* ─── Pure helper — defined outside component to avoid impure-render lint ─── */
function daysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/* ─── EXP Rewards Table ─── */
const EXP_TABLE_ROWS: { actionKey: string; key: keyof typeof EXP_REWARDS; icon: string }[] = [
  { actionKey: "buddy.publishProject", key: "publishProject", icon: "🚀" },
  { actionKey: "buddy.publishDemo", key: "publishDemo", icon: "🎮" },
  { actionKey: "buddy.submitIdea", key: "publishIdea", icon: "💡" },
  { actionKey: "buddy.publishArticle", key: "postArticle", icon: "📝" },
  { actionKey: "buddy.shareContent", key: "shareContent", icon: "📤" },
  { actionKey: "buddy.receiveUpvote", key: "receiveUpvote", icon: "👍" },
  { actionKey: "buddy.postComment", key: "giveComment", icon: "💬" },
  { actionKey: "buddy.receiveComment", key: "receiveComment", icon: "📩" },
  { actionKey: "buddy.winBattle", key: "winBattle", icon: "⚔️" },
  { actionKey: "buddy.loseBattle", key: "loseBattle", icon: "🛡️" },
  { actionKey: "buddy.draw", key: "drawBattle", icon: "🤝" },
  { actionKey: "buddy.dailyLogin", key: "dailyLogin", icon: "📅" },
  { actionKey: "buddy.getFollowed", key: "getFollowed", icon: "👥" },
  { actionKey: "buddy.forkProject", key: "forkProject", icon: "🔀" },
  { actionKey: "buddy.runAgent", key: "runAgent", icon: "🤖" },
  { actionKey: "buddy.createWorkflow", key: "createWorkflow", icon: "🔧" },
  { actionKey: "buddy.completeProfile", key: "completeProfile", icon: "📋" },
  { actionKey: "buddy.firstProject", key: "firstProject", icon: "⭐" },
  { actionKey: "buddy.firstBattle", key: "firstBattle", icon: "🏆" },
  { actionKey: "buddy.firstBuddy", key: "firstBuddy", icon: "🎁" },
];

/* ─── Stat Bar ─── */
function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span className="font-pixel" style={{ fontSize: 10, color, width: 60, textAlign: "right" }}>
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 20,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 3,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(90deg, transparent 0, transparent 6px, rgba(0,0,0,0.2) 6px, rgba(0,0,0,0.2) 8px)",
            }}
          />
        </motion.div>
      </div>
      <span className="font-retro" style={{ fontSize: 14, color: "#8888A0", width: 80, textAlign: "right" }}>
        {value}/{max}
      </span>
    </div>
  );
}

/* ─── Mock buddy data (module-level so it's stable across renders) ─── */
const BUDDY_LEVELS: Record<string, number> = {
  "pixel-fox": 10, "neon-slime": 8, "byte-owl": 5, "code-dragon": 3, "crystal-phoenix": 1,
};
const BUDDY_META: Record<string, { obtainedAt: string; energy: number }> = {
  "pixel-fox": { obtainedAt: "2026-03-01", energy: 85 },
  "neon-slime": { obtainedAt: "2026-03-15", energy: 62 },
  "byte-owl": { obtainedAt: "2026-03-20", energy: 90 },
  "code-dragon": { obtainedAt: "2026-04-01", energy: 45 },
  "crystal-phoenix": { obtainedAt: "2026-04-05", energy: 100 },
};

/* ═══ Main Buddy Page ═══ */
export default function BuddyPage() {
  const { t } = useLang();

  // Mock user state
  const [totalExp] = useState(2500);
  const [ownedBuddyIds, setOwnedBuddyIds] = useState<string[]>(["pixel-fox", "neon-slime"]);
  const [activeBuddyId, setActiveBuddyId] = useState<string>("pixel-fox");
  const [totalUpvotes] = useState(85);

  // Summon state
  const [summonPhase, setSummonPhase] = useState<"idle" | "flash" | "reveal">("idle");
  const [summonResult, setSummonResult] = useState<SummonResult | null>(null);

  // Evolution state
  const [buddyStages, setBuddyStages] = useState<Record<string, number>>({});
  const [evolvingId, setEvolvingId] = useState<string | null>(null);

  // Interaction state
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [feedFlash, setFeedFlash] = useState(false);
  const [buddyMood, setBuddyMood] = useState<"happy" | "neutral" | "hungry" | "sleepy">("happy");
  const [buddyState, setBuddyState] = useState<"idle" | "sleeping" | "excited">("idle");
  const [petCount, setPetCount] = useState(0);

  const userLevel = computeUserLevel(totalExp);
  const nextSummonLevel = SUMMON_LEVELS.find((lv) => lv > userLevel.level) ?? null;

  const handleSummon = useCallback(() => {
    if (!userLevel.canSummon) return;
    setSummonPhase("flash");
    setTimeout(() => {
      const result = summonBuddy(userLevel.level, totalUpvotes, ownedBuddyIds);
      setSummonResult(result);
      if (result.isNew && !ownedBuddyIds.includes(result.buddy.id)) {
        setOwnedBuddyIds((prev) => [...prev, result.buddy.id]);
      }
      setSummonPhase("reveal");
      // Quest auto-complete: summon_buddy fires after first successful
      // summon. Idempotent via localStorage in triggerQuestComplete.
      triggerQuestComplete("summon_buddy").catch(() => {});
    }, 1000);
  }, [userLevel, totalUpvotes, ownedBuddyIds]);

  const handleEvolve = useCallback((buddyId: string) => {
    setEvolvingId(buddyId);
    setTimeout(() => {
      setBuddyStages((prev) => ({
        ...prev,
        [buddyId]: (prev[buddyId] ?? getEvolutionStage(buddyId, BUDDY_LEVELS[buddyId] ?? 1).stage) + 1,
      }));
      setEvolvingId(null);
    }, 1200);
  }, [BUDDY_LEVELS]);

  // Pet the buddy — spawn floating hearts
  const handlePet = useCallback(() => {
    if (buddyState === "sleeping") {
      setBuddyState("idle");
      setBuddyMood("neutral");
      return;
    }
    const newHearts = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      x: 40 + Math.random() * 20,
    }));
    setHearts((prev) => [...prev, ...newHearts]);
    setPetCount((prev) => prev + 1);
    setBuddyState("excited");
    setBuddyMood("happy");
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.some((n) => n.id === h.id)));
      setBuddyState("idle");
    }, 1500);
  }, [buddyState]);

  // Feed the buddy — boost energy with flash
  const handleFeed = useCallback(() => {
    if (buddyState === "sleeping") return;
    setFeedFlash(true);
    setBuddyMood("happy");
    setBuddyState("excited");
    // Update energy in mock data
    if (activeBuddyId && BUDDY_META[activeBuddyId]) {
      BUDDY_META[activeBuddyId].energy = Math.min(100, BUDDY_META[activeBuddyId].energy + 15);
    }
    setTimeout(() => {
      setFeedFlash(false);
      setBuddyState("idle");
    }, 800);
  }, [activeBuddyId, buddyState]);

  // Toggle sleep
  const handleSleep = useCallback(() => {
    if (buddyState === "sleeping") {
      setBuddyState("idle");
      setBuddyMood("neutral");
    } else {
      setBuddyState("sleeping");
      setBuddyMood("sleepy");
    }
  }, [buddyState]);

  // Compute mood from energy
  const computedMood = activeBuddyId && BUDDY_META[activeBuddyId]
    ? BUDDY_META[activeBuddyId].energy > 70 ? "happy"
      : BUDDY_META[activeBuddyId].energy > 40 ? "neutral"
      : BUDDY_META[activeBuddyId].energy > 15 ? "hungry"
      : "sleepy"
    : "neutral";

  const displayMood = buddyState === "sleeping" ? "sleepy" : buddyState === "excited" ? "happy" : buddyMood !== "happy" ? buddyMood : computedMood;

  const moodEmoji: Record<string, string> = {
    happy: "😊",
    neutral: "😐",
    hungry: "😩",
    sleepy: "😴",
  };

  const moodLabel: Record<string, string> = {
    happy: "Happy!",
    neutral: "Okay",
    hungry: "Hungry...",
    sleepy: "Zzz...",
  };

  const ownedBuddies = BUDDY_TYPES.filter((b) => ownedBuddyIds.includes(b.id));
  const activeBuddy = BUDDY_TYPES.find((b) => b.id === activeBuddyId);
  const activeEvo = activeBuddy ? getEvolutionStage(activeBuddyId, BUDDY_LEVELS[activeBuddyId] ?? 1) : null;
  const activeMeta = activeBuddyId ? BUDDY_META[activeBuddyId] : null;
  const activeRarity = activeBuddy ? RARITY_CONFIG[activeBuddy.rarity] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Flash Overlay */}
      <AnimatePresence>
        {summonPhase === "flash" && (
          <motion.div
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: "white", pointerEvents: "none" }}
            animate={{ opacity: [0, 1, 0, 1, 0, 0.8, 0] }}
            transition={{ duration: 1, times: [0, 0.12, 0.2, 0.32, 0.4, 0.52, 0.6] }}
          />
        )}
      </AnimatePresence>

      {/* ═══ Page Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-pixel" style={{ fontSize: 24, color: "#E8E8EC", letterSpacing: 4 }}>
          BUDDY LAB
        </h1>
        <p className="font-retro" style={{ fontSize: 18, color: "#8888A0", marginTop: 4 }}>
          Summon & Collect
        </p>
      </motion.div>

      {/* ═══ A) Active Buddy — Dojo ═══ */}
      {activeBuddy && activeRarity && activeEvo && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mb-10 overflow-hidden rounded-2xl"
          style={{ maxWidth: 560, border: `2px solid ${activeRarity.color}25` }}
        >
          {/* ── Dojo Arena ── */}
          <div
            style={{
              position: "relative",
              minHeight: 340,
              background: "linear-gradient(180deg, #0C0C14 0%, #141420 40%, #1a1a2e 70%, #252540 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Pixel grid floor */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "45%",
                background: `
                  linear-gradient(180deg, transparent 0%, ${activeRarity.color}08 100%),
                  repeating-linear-gradient(90deg, ${activeRarity.color}10 0px, ${activeRarity.color}10 1px, transparent 1px, transparent 30px),
                  repeating-linear-gradient(0deg, ${activeRarity.color}10 0px, ${activeRarity.color}10 1px, transparent 1px, transparent 30px)
                `,
                transform: "perspective(400px) rotateX(45deg)",
                transformOrigin: "bottom center",
              }}
            />

            {/* Glow behind sprite */}
            <div
              style={{
                position: "absolute",
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${activeRarity.color}20 0%, transparent 70%)`,
                filter: "blur(40px)",
              }}
            />

            {/* Shadow under sprite */}
            <div
              style={{
                position: "absolute",
                bottom: "18%",
                width: 120,
                height: 16,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.5)",
                filter: "blur(8px)",
              }}
            />

            {/* Level badge — top left */}
            <div
              className="font-pixel"
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                fontSize: 11,
                color: "#fff",
                background: "#9D00FF",
                padding: "4px 12px",
                borderRadius: 6,
                boxShadow: "0 2px 8px rgba(157,0,255,0.4)",
              }}
            >
              Lv {userLevel.level}
            </div>

            {/* Rarity badge — top right */}
            <div
              className="font-pixel"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                fontSize: 10,
                color: activeRarity.color,
                background: `${activeRarity.color}20`,
                padding: "4px 10px",
                borderRadius: 6,
                border: `1px solid ${activeRarity.color}40`,
              }}
            >
              {activeRarity.labelZh} {activeBuddy.element}
            </div>

            {/* Big pixel sprite — clickable for petting */}
            <div
              onClick={handlePet}
              style={{
                position: "relative",
                zIndex: 2,
                marginBottom: 8,
                cursor: "pointer",
                filter: buddyState === "sleeping" ? "brightness(0.6)" : feedFlash ? "brightness(1.4) saturate(1.5)" : "none",
                transition: "filter 0.3s",
              }}
              title="Click to pet!"
            >
              <motion.div
                animate={
                  buddyState === "sleeping"
                    ? { y: [0, -2, 0], scale: [1, 1.02, 1] }
                    : buddyState === "excited"
                      ? { y: [0, -10, 0], rotate: [0, -3, 3, -3, 0] }
                      : { y: [0, -6, 0] }
                }
                transition={{
                  duration: buddyState === "sleeping" ? 3 : buddyState === "excited" ? 0.5 : 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <BuddySprite buddyTypeId={activeBuddyId} size="xxl" />
              </motion.div>

              {/* Floating hearts */}
              <AnimatePresence>
                {hearts.map((heart) => (
                  <motion.div
                    key={heart.id}
                    initial={{ opacity: 1, y: 0, x: `${heart.x}%`, scale: 0.5 }}
                    animate={{ opacity: 0, y: -80, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      top: "20%",
                      left: 0,
                      fontSize: 24,
                      pointerEvents: "none",
                      zIndex: 10,
                    }}
                  >
                    ❤️
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Feed sparkle flash */}
              <AnimatePresence>
                {feedFlash && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                      position: "absolute",
                      inset: -20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 40,
                      pointerEvents: "none",
                      zIndex: 10,
                    }}
                  >
                    ✨
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sleep Zzz */}
              {buddyState === "sleeping" && (
                <motion.div
                  animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    position: "absolute",
                    top: "10%",
                    right: "15%",
                    fontSize: 20,
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                >
                  💤
                </motion.div>
              )}
            </div>

            {/* Mood indicator */}
            <div
              style={{
                position: "absolute",
                bottom: "22%",
                right: "18%",
                zIndex: 5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: 20 }}
              >
                {moodEmoji[displayMood]}
              </motion.span>
              <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0" }}>
                {moodLabel[displayMood]}
              </span>
            </div>

            {/* Pet counter */}
            {petCount > 0 && (
              <div
                className="font-pixel"
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 16,
                  fontSize: 8,
                  color: "#FF69B4",
                  opacity: 0.7,
                }}
              >
                ❤️ {petCount}
              </div>
            )}

            {/* Name plate */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                textAlign: "center",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                padding: "8px 24px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="font-pixel" style={{ fontSize: 16, color: "#E8E8EC", letterSpacing: 2 }}>
                {activeEvo.name}
              </div>
              {activeEvo.stage > 0 && (
                <div className="font-pixel" style={{ fontSize: 9, color: "#FACC15", marginTop: 2 }}>
                  Stage {activeEvo.stage}
                </div>
              )}
            </div>

            {/* Particle dots */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20 - i * 8, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
                style={{
                  position: "absolute",
                  width: 3,
                  height: 3,
                  background: activeRarity.color,
                  left: `${20 + i * 12}%`,
                  bottom: `${25 + (i % 3) * 10}%`,
                  boxShadow: `0 0 6px ${activeRarity.color}80`,
                }}
              />
            ))}
          </div>

          {/* ── Stats Panel (below dojo) ── */}
          <div
            style={{
              padding: "20px 24px",
              background: "rgba(10,10,16,0.9)",
              borderTop: `1px solid ${activeRarity.color}15`,
            }}
          >
            {/* Stat bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              <StatBar label="EXP" value={userLevel.currentExp} max={userLevel.expToNextLevel} color="#9D00FF" />
              {activeMeta && (
                <StatBar label={t("buddy.energy")} value={activeMeta.energy} max={100} color="#39FF14" />
              )}
            </div>

            {/* Info row */}
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
              {activeMeta && (
                <span className="font-retro" style={{ fontSize: 14, color: "#8888A0" }}>
                  {t("buddy.age")}: {daysSince(activeMeta.obtainedAt)}d
                </span>
              )}
              <span className="font-retro" style={{ fontSize: 14, color: "#FACC15" }}>
                {t("buddy.passive")}: {activeBuddy.passiveZh}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                className="nes-btn is-success"
                style={{ fontSize: 11, padding: "6px 16px" }}
                onClick={handleFeed}
                disabled={buddyState === "sleeping"}
              >
                🍖 Feed
              </button>
              <button
                className={`nes-btn ${buddyState === "sleeping" ? "is-primary" : ""}`}
                style={{ fontSize: 11, padding: "6px 16px" }}
                onClick={handleSleep}
              >
                {buddyState === "sleeping" ? "☀️ Wake" : "💤 Sleep"}
              </button>
              <Link href="/arena">
                <button className="nes-btn is-warning" style={{ fontSize: 11, padding: "6px 16px" }}>
                  ⚔️ Battle
                </button>
              </Link>
              {canEvolve(activeBuddyId, BUDDY_LEVELS[activeBuddyId] ?? 1) && (
                <button
                  className="nes-btn is-error"
                  style={{ fontSize: 11, padding: "6px 16px" }}
                  onClick={() => handleEvolve(activeBuddyId)}
                >
                  ✨ Evolve
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ B) My Buddies Collection ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <h2 className="font-pixel" style={{ fontSize: 14, color: "#E8E8EC", marginBottom: 16 }}>
          {t("buddy.myBuddies")}
        </h2>

        {ownedBuddies.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <span className="font-retro" style={{ fontSize: 16, color: "#8888A0" }}>
              {t("buddy.noBuddies")}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ownedBuddies.map((buddy) => {
              const level = BUDDY_LEVELS[buddy.id] ?? 1;
              const evo = getEvolutionStage(buddy.id, level);
              const isEvolving = evolvingId === buddy.id;

              return (
                <div key={buddy.id} style={{ position: "relative" }}>
                  {/* Evolution flash */}
                  <AnimatePresence>
                    {isEvolving && (
                      <motion.div
                        style={{ position: "absolute", inset: -4, zIndex: 10, background: "#FFD700", borderRadius: 16 }}
                        animate={{ opacity: [0, 1, 0, 1, 0.6, 0] }}
                        transition={{ duration: 1.2, times: [0, 0.15, 0.3, 0.45, 0.7, 1] }}
                      />
                    )}
                  </AnimatePresence>

                  <div onClick={() => setActiveBuddyId(buddy.id)}>
                    <BuddyCard
                      buddy={{ ...buddy, name: evo.name, nameZh: evo.nameZh }}
                      owned
                      active={buddy.id === activeBuddyId}
                      size="md"
                    />
                  </div>

                  {/* Stage info */}
                  {evo.stage > 0 && !isEvolving && (
                    <div className="font-pixel text-center mt-1" style={{ fontSize: 8, color: "#FACC15" }}>
                      {evo.nameZh} (Stage {evo.stage})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* ═══ C) Summon Area ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10"
      >
        <h2 className="font-pixel" style={{ fontSize: 14, color: "#FFD700", marginBottom: 16 }}>
          ★ {t("buddy.summon")}
        </h2>

        <div
          className="glass-card rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,215,0,0.2)" }}
        >
          <div style={{ height: 3, background: "linear-gradient(90deg, #FFD700, #FFD70060)" }} />

          <div style={{ padding: 28, textAlign: "center" }}>
            {/* Summon button */}
            <button
              className="nes-btn is-warning"
              disabled={!userLevel.canSummon || summonPhase === "flash"}
              onClick={handleSummon}
              style={{
                fontSize: 14,
                padding: "14px 40px",
                opacity: userLevel.canSummon ? 1 : 0.4,
              }}
            >
              {summonPhase === "flash" ? t("buddy.summoning") : t("buddy.summonNew")}
            </button>

            {userLevel.canSummon && (
              <div className="font-pixel mt-3" style={{ fontSize: 10, color: "#39FF14" }}>
                {t("buddy.summonReady")}
              </div>
            )}

            {!userLevel.canSummon && (
              <div className="font-retro mt-3" style={{ fontSize: 14, color: "#F97316" }}>
                {t("buddy.needLevel")}: {SUMMON_LEVELS.join(", ")}
              </div>
            )}

            {/* Summon result */}
            <AnimatePresence>
              {summonPhase === "reveal" && summonResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-card rounded-2xl mt-8 mx-auto overflow-hidden"
                  style={{
                    maxWidth: 400,
                    border: `2px solid ${RARITY_CONFIG[summonResult.buddy.rarity].color}50`,
                    boxShadow: `0 0 40px ${RARITY_CONFIG[summonResult.buddy.rarity].color}20`,
                    position: "relative",
                  }}
                >
                  {/* Rarity accent */}
                  <div style={{ height: 4, background: RARITY_CONFIG[summonResult.buddy.rarity].color }} />

                  <div style={{ padding: 28, textAlign: "center" }}>
                    {/* NEW badge */}
                    {summonResult.isNew && (
                      <motion.div
                        initial={{ rotate: -15, scale: 0 }}
                        animate={{ rotate: -15, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="font-pixel"
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          fontSize: 12,
                          color: "#fff",
                          background: "#F97316",
                          padding: "4px 12px",
                          borderRadius: 6,
                          zIndex: 3,
                        }}
                      >
                        NEW!
                      </motion.div>
                    )}

                    {/* Sprite */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                      <BuddySprite buddyTypeId={summonResult.buddy.id} size="xl" animated />
                    </div>

                    {/* Name */}
                    <div className="font-pixel" style={{ fontSize: 16, color: "#E8E8EC" }}>
                      {summonResult.buddy.nameZh}
                    </div>
                    <div className="font-pixel" style={{ fontSize: 10, color: "#8888A0", marginTop: 4 }}>
                      {summonResult.buddy.name}
                    </div>

                    {/* Rarity + Element */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
                      <span
                        className="font-pixel"
                        style={{
                          fontSize: 10,
                          color: RARITY_CONFIG[summonResult.buddy.rarity].color,
                          background: `${RARITY_CONFIG[summonResult.buddy.rarity].color}15`,
                          padding: "3px 12px",
                          borderRadius: 6,
                          border: `1px solid ${RARITY_CONFIG[summonResult.buddy.rarity].color}40`,
                        }}
                      >
                        {RARITY_CONFIG[summonResult.buddy.rarity].labelZh}
                      </span>
                      <span style={{ fontSize: 14 }}>{summonResult.buddy.element}</span>
                    </div>

                    {/* Passive */}
                    <div className="font-retro" style={{ fontSize: 14, color: "#FACC15", marginTop: 12 }}>
                      {t("buddy.passive")}: {summonResult.buddy.passiveZh}
                    </div>

                    {/* Bonus */}
                    <div className="font-retro" style={{ fontSize: 12, color: "#8888A0", marginTop: 6 }}>
                      {t("buddy.bonus")}: {summonResult.bonusApplied}
                    </div>

                    {/* Confirm */}
                    <button
                      className="nes-btn is-primary mt-4"
                      style={{ fontSize: 12, padding: "8px 24px" }}
                      onClick={() => setSummonPhase("idle")}
                    >
                      {t("buddy.confirm")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* ═══ D) EXP Guide (collapsible) ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-10"
      >
        <details className="group glass-card rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <summary
            className="font-pixel cursor-pointer flex items-center gap-3 px-6 py-4"
            style={{ fontSize: 14, color: "#06B6D4", listStyle: "none" }}
          >
            <span>?</span>
            <span>{t("buddy.expGuide")}</span>
            <span className="ml-auto transition-transform group-open:rotate-180" style={{ fontSize: 10 }}>▼</span>
          </summary>

          <div style={{ padding: "0 24px 24px" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {[t("buddy.icon"), t("buddy.action"), t("buddy.exp")].map((h) => (
                      <th
                        key={h}
                        className="font-pixel"
                        style={{
                          fontSize: 10,
                          color: "#06B6D4",
                          textAlign: "left",
                          padding: "8px 12px",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EXP_TABLE_ROWS.map((row, i) => (
                    <tr
                      key={row.key}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <td style={{ padding: "6px 12px", fontSize: 18 }}>{row.icon}</td>
                      <td className="font-retro" style={{ padding: "6px 12px", fontSize: 14, color: "#E8E8EC" }}>
                        {t(row.actionKey as Parameters<typeof t>[0])}
                      </td>
                      <td className="font-pixel" style={{ padding: "6px 12px", fontSize: 11, color: "#39FF14" }}>
                        +{EXP_REWARDS[row.key]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </motion.section>

      {/* ═══ E) Buddy Pokedex (collapsible) ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-10"
      >
        <details className="group glass-card rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <summary
            className="font-pixel cursor-pointer flex items-center gap-3 px-6 py-4"
            style={{ fontSize: 14, color: "#F97316", listStyle: "none" }}
          >
            <span>📖</span>
            <span>{t("buddy.pokedex")}</span>
            <span className="ml-auto transition-transform group-open:rotate-180" style={{ fontSize: 10 }}>▼</span>
          </summary>

          <div style={{ padding: "0 24px 24px" }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {BUDDY_TYPES.map((buddy) => {
                const isOwned = ownedBuddyIds.includes(buddy.id);
                return (
                  <BuddyCard
                    key={buddy.id}
                    buddy={buddy}
                    owned={isOwned}
                    active={isOwned && buddy.id === activeBuddyId}
                    size="sm"
                  />
                );
              })}
            </div>
          </div>
        </details>
      </motion.section>

      {/* Keyframes */}
      <style>{`
        @keyframes pulse-evo {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
