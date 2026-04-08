"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { STARTER_QUESTS, getOnboardingState } from "@/lib/onboarding";

export function QuestChecklist() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    setCompletedIds(getOnboardingState().questsCompleted);
  }, []);

  const completedCount = completedIds.length;
  const totalXp = STARTER_QUESTS.filter((q) => completedIds.includes(q.id))
    .reduce((s, q) => s + q.xpReward, 0);

  if (completedCount >= STARTER_QUESTS.length) return null;

  return (
    <div className="rpgui-container framed" style={{ padding: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div className="font-pixel" style={{ fontSize: 9, color: "#FACC15" }}>
          {"\uD83D\uDCDC \u65B0\u624B\u4EFB\u52A1"} ({completedCount}/{STARTER_QUESTS.length})
        </div>
        <div className="font-pixel" style={{ fontSize: 7, color: "#39FF14" }}>
          +{totalXp} XP
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: "#1A1A1E", marginBottom: 10 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / STARTER_QUESTS.length) * 100}%` }}
          style={{ height: "100%", background: "#FACC15" }}
        />
      </div>

      {/* Quest list */}
      {STARTER_QUESTS.map((quest) => {
        const done = completedIds.includes(quest.id);
        return (
          <div
            key={quest.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 6px",
              marginBottom: 2,
              background: done ? "#39FF1408" : "transparent",
              opacity: done ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>
              {done ? "\u2705" : quest.icon}
            </span>
            <div style={{ flex: 1 }}>
              <div className="font-pixel" style={{ fontSize: 7, color: done ? "#39FF14" : "#E8E8EC", textDecoration: done ? "line-through" : "none" }}>
                {quest.titleZh}
              </div>
              <div className="font-retro" style={{ fontSize: 10, color: "#666" }}>
                {quest.description}
              </div>
            </div>
            <span className="font-pixel" style={{ fontSize: 7, color: done ? "#555" : "#FACC15" }}>
              +{quest.xpReward}
            </span>
          </div>
        );
      })}
    </div>
  );
}
