"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Check, Star } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   Daily Quest Bar — retention hook on /home.
   - 3 daily quests (rate projects, open a card, share something)
   - Progress persisted in localStorage, reset at UTC midnight
   - Completing a quest pops a toast + XP drip animation
   - Purely mock (no backend). Visitors see it as a game layer on top.
   ═══════════════════════════════════════════════════════════════════════════ */

interface Quest {
  id: string;
  label: string;
  xp: number;
  target: number;
}

const QUESTS: Quest[] = [
  { id: "rate", label: "Rate 3 projects", xp: 50, target: 3 },
  { id: "open", label: "Open 1 hero card", xp: 30, target: 1 },
  { id: "share", label: "Share anything", xp: 40, target: 1 },
];

interface QuestProgress {
  date: string; // YYYY-MM-DD UTC
  counts: Record<string, number>;
  claimed: Record<string, boolean>;
}

const STORAGE_KEY = "vibex.dailyQuest.v1";

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadProgress(): QuestProgress {
  if (typeof window === "undefined") {
    return { date: todayUTC(), counts: {}, claimed: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: todayUTC(), counts: {}, claimed: {} };
    const parsed = JSON.parse(raw) as QuestProgress;
    if (parsed.date !== todayUTC()) {
      return { date: todayUTC(), counts: {}, claimed: {} };
    }
    return parsed;
  } catch {
    return { date: todayUTC(), counts: {}, claimed: {} };
  }
}

function saveProgress(p: QuestProgress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // storage quota or private mode — swallow silently
  }
}

export function DailyQuestBar() {
  const [progress, setProgress] = useState<QuestProgress>({
    date: todayUTC(),
    counts: {},
    claimed: {},
  });
  const [mounted, setMounted] = useState(false);
  const [xpPop, setXpPop] = useState<number | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    setMounted(true);
  }, []);

  const claimQuest = (quest: Quest) => {
    const current = progress.counts[quest.id] ?? 0;
    if (current < quest.target || progress.claimed[quest.id]) return;
    const next: QuestProgress = {
      ...progress,
      claimed: { ...progress.claimed, [quest.id]: true },
    };
    setProgress(next);
    saveProgress(next);
    setXpPop(quest.xp);
    setTimeout(() => setXpPop(null), 1400);
  };

  // Simulate progress on hover for demo purposes — in a real app,
  // these counters would tick from real actions (rate, open, share).
  const bumpQuest = (questId: string) => {
    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) return;
    const current = progress.counts[questId] ?? 0;
    if (current >= quest.target) return;
    const next: QuestProgress = {
      ...progress,
      counts: { ...progress.counts, [questId]: current + 1 },
    };
    setProgress(next);
    saveProgress(next);
  };

  if (!mounted) {
    // Avoid SSR hydration mismatch — render a minimal placeholder
    return <div className="h-14" aria-hidden="true" />;
  }

  const totalClaimed = Object.values(progress.claimed).filter(Boolean).length;
  const allDone = totalClaimed === QUESTS.length;
  // First-visit detection: no counts + no claims = user has never touched a quest
  const totalCounts = Object.values(progress.counts).reduce((sum, n) => sum + n, 0);
  const isFirstVisit = totalCounts === 0 && totalClaimed === 0;

  return (
    <section className="py-4" aria-label="Daily quests">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div
          className="relative flex flex-col gap-3 px-4 py-3"
          style={{
            background:
              "linear-gradient(135deg, rgba(157,0,255,0.12), rgba(57,255,20,0.06))",
            border: "2px solid var(--neon-purple)",
            boxShadow: "4px 4px 0 #000, 0 0 20px rgba(157,0,255,0.15)",
          }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy
                className="h-4 w-4"
                style={{ color: "var(--neon-yellow)", filter: "drop-shadow(0 0 4px #FACC15)" }}
              />
              <span
                className="font-pixel"
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: "#FFD700",
                  textShadow: "1px 1px 0 #000",
                }}
              >
                DAILY QUESTS
              </span>
            </div>
            <span
              className="font-pixel"
              style={{
                fontSize: 10,
                letterSpacing: 1,
                color: allDone ? "var(--neon-green)" : "#C9B8E8",
              }}
            >
              {totalClaimed} / {QUESTS.length} DONE
            </span>
          </div>

          {/* First-visit welcome — shown only until user touches any quest */}
          {isFirstVisit && (
            <div
              className="px-3 py-2"
              style={{
                background: "rgba(57,255,20,0.08)",
                border: "1px dashed rgba(57,255,20,0.4)",
              }}
            >
              <span
                className="font-pixel block"
                style={{
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: "var(--neon-green)",
                  textShadow: "0 0 6px rgba(57,255,20,0.4)",
                }}
              >
                ▸ WELCOME, ADVENTURER
              </span>
              <span
                className="font-retro block mt-1"
                style={{
                  fontSize: 13,
                  color: "#C9B8E8",
                  lineHeight: 1.4,
                }}
              >
                Complete your first quest to earn XP and unlock your creator profile.
              </span>
            </div>
          )}

          {/* Quests grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {QUESTS.map((quest) => {
              const count = progress.counts[quest.id] ?? 0;
              const claimed = progress.claimed[quest.id] ?? false;
              const complete = count >= quest.target;
              const pct = Math.min(100, (count / quest.target) * 100);

              return (
                <button
                  key={quest.id}
                  type="button"
                  onClick={() => (complete && !claimed ? claimQuest(quest) : bumpQuest(quest.id))}
                  disabled={claimed}
                  aria-label={`${quest.label}, ${count} of ${quest.target}${claimed ? ", claimed" : ""}`}
                  className="relative text-left px-2.5 py-2 transition-transform hover:scale-[1.02] disabled:cursor-default disabled:hover:scale-100"
                  style={{
                    background: claimed
                      ? "rgba(57,255,20,0.12)"
                      : "rgba(0,0,0,0.4)",
                    border: `1px solid ${claimed ? "rgba(57,255,20,0.5)" : "rgba(157,0,255,0.3)"}`,
                    cursor: claimed ? "default" : "pointer",
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="font-pixel truncate"
                      style={{
                        fontSize: 10,
                        color: claimed ? "var(--neon-green)" : "#E8E8EC",
                        letterSpacing: 0.5,
                      }}
                    >
                      {quest.label}
                    </span>
                    {claimed ? (
                      <Check className="h-3 w-3 shrink-0" style={{ color: "var(--neon-green)" }} />
                    ) : (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="h-3 w-3" style={{ color: "var(--neon-yellow)" }} />
                        <span
                          className="font-pixel"
                          style={{ fontSize: 10, color: "var(--neon-yellow)" }}
                        >
                          {quest.xp}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div
                    className="h-1"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(157,0,255,0.3)",
                    }}
                  >
                    <motion.div
                      className="h-full"
                      style={{
                        background: claimed
                          ? "linear-gradient(90deg, #39FF14, #22C55E)"
                          : "linear-gradient(90deg, #9D00FF, #C026D3)",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                  <span
                    className="font-pixel block mt-1"
                    style={{ fontSize: 10, color: "#888" }}
                  >
                    {count} / {quest.target}
                    {complete && !claimed && (
                      <span style={{ color: "var(--neon-yellow)", marginLeft: 4 }}>
                        · CLAIM!
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* XP pop toast */}
        <AnimatePresence>
          {xpPop !== null && (
            <motion.div
              key="xp-pop"
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1.2 }}
              exit={{ opacity: 0, y: -80, scale: 0.8 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 pointer-events-none z-50"
              style={{
                fontFamily: "var(--font-pixel), monospace",
                fontSize: 20,
                color: "#FFD700",
                textShadow:
                  "2px 2px 0 #000, 0 0 12px rgba(255,215,0,0.9), 0 0 24px rgba(255,215,0,0.5)",
              }}
              role="status"
              aria-live="polite"
            >
              +{xpPop} XP
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
