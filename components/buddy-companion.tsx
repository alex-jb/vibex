"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Heart, Sparkles, ChevronUp, Star } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { BUDDY_TYPES, RARITY_CONFIG, computeUserLevel } from "@/lib/buddy-system";
import type { BuddyType } from "@/lib/buddy-system";

// Mock data (replace with real data when DB connected)
const MOCK_ACTIVE_BUDDY = {
  typeId: "pixel-fox",
  nickname: null,
  level: 5,
  happiness: 85,
  exp: 230,
};
const MOCK_TOTAL_EXP = 2850;

type CompanionState = "idle" | "expanded" | "minimized" | "hidden";

/** Floating buddy messages based on context */
const IDLE_MESSAGES = [
  "嘿！今天想做什么？",
  "要不要去竞技场战斗？",
  "发布新项目可以获得经验哦！",
  "点我查看状态~",
  "...(打盹中)...",
  "有新通知吗？让我看看！",
  "距离下一级还差一点点！",
];

export function BuddyCompanion() {
  const { user, loading } = useAuth();
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

  // Pet the buddy
  const handlePet = () => {
    setPetCount((c) => c + 1);
    const id = Date.now();
    setHearts((h) => [...h, id]);
    setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 1000);

    if (petCount % 3 === 0) {
      setMessage("开心！♥");
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
        title="显示伙伴"
      >
        <span className="text-lg">{buddyType.emoji}</span>
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

        <button
          onClick={() => setState("expanded")}
          onDoubleClick={handlePet}
          className="relative group"
          title="点击展开 · 双击互动"
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

          {/* Buddy sprite */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="size-14 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              border: `2px solid ${rarity.color}40`,
              background: `${rarity.color}10`,
              boxShadow: `0 4px 20px ${rarity.color}20`,
            }}
          >
            <span className="text-3xl" style={{ imageRendering: "pixelated" as const }}>
              {buddyType.emoji}
            </span>
          </motion.div>

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
        </button>
      </motion.div>
    );
  }

  // EXPANDED STATE
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-[100] w-64"
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
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="text-sm">{buddyType.emoji}</span>
            <span className="font-pixel" style={{ fontSize: 8, color: rarity.color }}>
              {buddyType.nameZh}
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
              title="最小化"
            >
              <Minimize2 className="size-3 text-muted-foreground" />
            </button>
            <button
              onClick={() => setState("hidden")}
              className="size-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
              title="隐藏"
            >
              <X className="size-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Buddy display */}
        <div className="relative px-4 py-3 flex items-center gap-3">
          {/* Hearts */}
          {hearts.map((id) => (
            <motion.span
              key={id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-8 text-red-400 text-xs pointer-events-none"
            >
              ♥
            </motion.span>
          ))}

          <motion.button
            onClick={handlePet}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            whileTap={{ scale: 1.2 }}
            className="text-4xl cursor-pointer"
            style={{ imageRendering: "pixelated" as const }}
            title="摸摸头"
          >
            {buddyType.emoji}
          </motion.button>

          <div className="flex-1 min-w-0">
            <div className="font-pixel flex items-center gap-2" style={{ fontSize: 9 }}>
              <span>{MOCK_ACTIVE_BUDDY.nickname || buddyType.nameZh}</span>
              <span style={{ color: rarity.color }}>Lv{MOCK_ACTIVE_BUDDY.level}</span>
            </div>

            {/* Happiness bar */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <Heart className="size-3 text-pink-400" />
              <div className="flex-1 h-2 bg-black/40 border border-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-pink-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${MOCK_ACTIVE_BUDDY.happiness}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="font-pixel text-pink-400" style={{ fontSize: 6 }}>
                {MOCK_ACTIVE_BUDDY.happiness}
              </span>
            </div>

            {/* EXP bar */}
            <div className="mt-1 flex items-center gap-1.5">
              <Star className="size-3 text-violet-400" />
              <div className="flex-1 h-2 bg-black/40 border border-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(userLevel.currentExp / userLevel.expToNextLevel) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="font-pixel text-violet-400" style={{ fontSize: 6 }}>
                {userLevel.level}
              </span>
            </div>
          </div>
        </div>

        {/* Passive ability */}
        <div className="px-3 py-1.5 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3" style={{ color: rarity.color }} />
            <span className="font-pixel text-muted-foreground" style={{ fontSize: 7 }}>
              {buddyType.passiveZh}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-3 py-2 border-t border-white/5 flex items-center gap-2">
          <Link href="/buddy" className="flex-1">
            <button
              className="nes-btn is-primary w-full"
              style={{ fontSize: 8, padding: "4px 8px" }}
            >
              伙伴实验室
            </button>
          </Link>
          <Link href="/arena" className="flex-1">
            <button
              className="nes-btn is-warning w-full"
              style={{ fontSize: 8, padding: "4px 8px" }}
            >
              去战斗
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
