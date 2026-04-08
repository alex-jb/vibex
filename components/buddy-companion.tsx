"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { BUDDY_TYPES, RARITY_CONFIG, computeUserLevel } from "@/lib/buddy-system";

import { BuddySprite } from "@/components/buddy-sprite";

// Mock data (replace with real data when DB connected)
const MOCK_ACTIVE_BUDDY = {
  typeId: "pixel-fox",
  nickname: null,
  level: 5,
  happiness: 85,
  exp: 230,
  obtainedAt: "2026-03-20",
};
const MOCK_TOTAL_EXP = 2850;

type CompanionState = "idle" | "expanded" | "minimized" | "hidden";

/** Compute days since a date string */
function daysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/** Tiny pixel stat bar */
function MiniPixelBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div
      style={{
        flex: 1,
        height: 6,
        background: "#0A0A0C",
        border: "1px solid #2A2A30",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5 }}
        style={{
          height: "100%",
          background: color,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, transparent 0, transparent 3px, rgba(0,0,0,0.25) 3px, rgba(0,0,0,0.25) 4px)",
          }}
        />
      </motion.div>
    </div>
  );
}

export function BuddyCompanion() {
  const { user, loading } = useAuth();
  const { t } = useLang();

  const IDLE_MESSAGES = [
    t("buddy.messages.hey"),
    t("buddy.messages.arena"),
    t("buddy.messages.publish"),
    t("buddy.messages.status"),
    t("buddy.messages.nap"),
    t("buddy.messages.notif"),
    t("buddy.messages.level"),
  ];
  const [state, setState] = useState<CompanionState>("idle");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [petCount, setPetCount] = useState(0);
  const [hearts, setHearts] = useState<number[]>([]);

  // Show random message periodically (must be before conditional returns)
  useEffect(() => {
    if (!user || state === "minimized" || state === "hidden") return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setMessage(IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)]);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 4000);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [state, user]);

  // Don't render for non-logged-in users
  if (loading || !user) return null;

  const buddyType = BUDDY_TYPES.find((b) => b.id === MOCK_ACTIVE_BUDDY.typeId);
  if (!buddyType) return null;

  const rarity = RARITY_CONFIG[buddyType.rarity];
  const userLevel = computeUserLevel(MOCK_TOTAL_EXP);
  const buddyAge = daysSince(MOCK_ACTIVE_BUDDY.obtainedAt);
  const energy = MOCK_ACTIVE_BUDDY.happiness;

  // Pet the buddy
  const handlePet = () => {
    setPetCount((c) => c + 1);
    const id = Date.now();
    setHearts((h) => [...h, id]);
    setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 1000);

    if (petCount % 3 === 0) {
      setMessage(t("buddy.happy"));
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    }
  };

  if (state === "hidden") {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setState("idle")}
        className="fixed bottom-4 right-4 z-[100] size-10 rounded-full flex items-center justify-center retro-border bg-background/80 backdrop-blur-sm hover:scale-110 transition-transform"
        title="Show buddy"
      >
        <BuddySprite buddyTypeId={MOCK_ACTIVE_BUDDY.typeId} size="sm" />
      </motion.button>
    );
  }

  if (state === "minimized") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 z-[100]"
      >
        {/* Speech bubble */}
        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg retro-border bg-background/95 backdrop-blur-sm text-xs max-w-[180px] font-pixel"
              style={{ fontSize: 8 }}
            >
              {message}
              <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 size-2 bg-background border-r border-b border-white/10" />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          onClick={() => setState("expanded")}
          onDoubleClick={handlePet}
          className="relative group cursor-pointer"
          title="Click to expand"
          role="button"
          tabIndex={0}
        >
          {/* Hearts animation */}
          {hearts.map((id) => (
            <motion.span
              key={id}
              initial={{ opacity: 1, y: 0, x: Math.random() * 20 - 10 }}
              animate={{ opacity: 0, y: -30 }}
              className="absolute -top-2 left-1/2 text-red-400 text-xs pointer-events-none"
            >
              ♥
            </motion.span>
          ))}

          {/* Buddy pixel sprite */}
          <div
            className="size-14 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              border: `2px solid ${rarity.color}40`,
              background: `${rarity.color}10`,
              boxShadow: `0 4px 20px ${rarity.color}20`,
            }}
          >
            <BuddySprite buddyTypeId={MOCK_ACTIVE_BUDDY.typeId} size="sm" animated />
          </div>

          {/* Level badge */}
          <div
            className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded font-pixel"
            style={{ fontSize: 6, background: rarity.color, color: "#0A0A0C" }}
          >
            Lv{MOCK_ACTIVE_BUDDY.level}
          </div>

          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); setState("hidden"); }}
            className="absolute -top-1 -left-1 size-4 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="size-2.5 text-white" />
          </button>
        </div>
      </motion.div>
    );
  }

  // EXPANDED STATE — PixPet-style panel
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-[100] w-72"
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="absolute bottom-full right-0 mb-2 px-3 py-2 rounded-lg retro-border bg-background/95 backdrop-blur-sm text-xs max-w-[200px] font-pixel"
            style={{ fontSize: 8 }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="rpgui-container framed overflow-hidden"
        style={{ padding: 0 }}
      >
        {/* Header — Name + Level badge */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span
              className="font-pixel px-1.5 py-0.5 rounded"
              style={{ fontSize: 8, background: rarity.color, color: "#0A0A0C", fontWeight: "bold" }}
            >
              Lv.{MOCK_ACTIVE_BUDDY.level}
            </span>
            <span className="font-pixel" style={{ fontSize: 9, color: "#E8E8EC" }}>
              {MOCK_ACTIVE_BUDDY.nickname || buddyType.nameZh}
            </span>
            <span
              className="font-pixel px-1 rounded"
              style={{ fontSize: 6, background: `${rarity.color}30`, color: rarity.color }}
            >
              {rarity.labelZh}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setState("minimized")}
              className="size-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
              title="Minimize"
            >
              <Minimize2 className="size-3 text-muted-foreground" />
            </button>
            <button
              onClick={() => setState("hidden")}
              className="size-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
              title="Hide"
            >
              <X className="size-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Buddy sprite + Level EXP bar */}
        <div className="relative px-4 py-3 flex flex-col items-center gap-2">
          {/* Hearts */}
          {hearts.map((id) => (
            <motion.span
              key={id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-1/2 text-red-400 text-xs pointer-events-none"
            >
              ♥
            </motion.span>
          ))}

          {/* Tappable sprite */}
          <motion.button
            onClick={handlePet}
            whileTap={{ scale: 1.15 }}
            className="cursor-pointer"
            title="Pet"
          >
            <BuddySprite buddyTypeId={MOCK_ACTIVE_BUDDY.typeId} size="md" animated />
          </motion.button>

          {/* EXP bar below sprite */}
          <div style={{ width: "100%", maxWidth: 180 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 2 }}>
              <span className="font-pixel" style={{ fontSize: 6, color: "#9D00FF" }}>
                EXP
              </span>
              <span className="font-pixel" style={{ fontSize: 6, color: "#8888A0" }}>
                {userLevel.currentExp}/{userLevel.expToNextLevel}
              </span>
            </div>
            <MiniPixelBar value={userLevel.currentExp} max={userLevel.expToNextLevel} color="#9D00FF" />
          </div>
        </div>

        {/* Stats panel (PixPet style) */}
        <div className="px-4 py-2 border-t border-white/5 bg-white/[0.02] flex flex-col gap-1.5">
          {/* Age */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12 }}>📅</span>
            <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0", width: 36 }}>{t("buddy.age")}</span>
            <span className="font-pixel" style={{ fontSize: 7, color: "#E8E8EC" }}>{buddyAge}d</span>
          </div>
          {/* Energy */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12 }}>⚡</span>
            <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0", width: 36 }}>{t("buddy.energy")}</span>
            <MiniPixelBar value={energy} max={100} color="#FACC15" />
            <span className="font-pixel" style={{ fontSize: 6, color: "#FACC15", width: 28, textAlign: "right" }}>
              {energy}/100
            </span>
          </div>
          {/* Passive */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <Sparkles className="size-3" style={{ color: rarity.color }} />
            <span className="font-pixel text-muted-foreground" style={{ fontSize: 6 }}>
              {buddyType.passiveZh}
            </span>
          </div>
        </div>

        {/* 2x2 Action buttons (PixPet style) */}
        <div className="px-3 py-2 border-t border-white/5 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              setMessage("Yum! Energy+10!");
              setShowMessage(true);
              setTimeout(() => setShowMessage(false), 2500);
            }}
            className="nes-btn is-success"
            style={{ fontSize: 7, padding: "4px 6px" }}
          >
            🍖 Feed
          </button>
          <Link href="/arena">
            <button
              className="nes-btn is-warning w-full"
              style={{ fontSize: 7, padding: "4px 6px" }}
            >
              ⚔️ Battle
            </button>
          </Link>
          <Link href="/feed">
            <button
              className="nes-btn is-primary w-full"
              style={{ fontSize: 7, padding: "4px 6px" }}
            >
              📋 Tasks
            </button>
          </Link>
          <Link href="/buddy">
            <button
              className="nes-btn w-full"
              style={{ fontSize: 7, padding: "4px 6px" }}
            >
              ✨ Style
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
