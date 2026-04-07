"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

export type ReactionType = "fire" | "game" | "art" | "mindblown";

export interface ReactionCounts {
  fire: number;
  game: number;
  art: number;
  mindblown: number;
}

const REACTION_CONFIG: Record<ReactionType, { emoji: string; label: string }> = {
  fire: { emoji: "🔥", label: "厉害" },
  game: { emoji: "🎮", label: "好玩" },
  art: { emoji: "🎨", label: "好看" },
  mindblown: { emoji: "🤯", label: "震撼" },
};

interface ReactionBarProps {
  postId: string;
  counts: ReactionCounts;
  userReactions: ReactionType[];
}

export function ReactionBar({ postId, counts, userReactions }: ReactionBarProps) {
  const [localCounts, setLocalCounts] = useState<ReactionCounts>(counts);
  const [localUserReactions, setLocalUserReactions] = useState<Set<ReactionType>>(
    new Set(userReactions),
  );
  const [animating, setAnimating] = useState<ReactionType | null>(null);

  const handleReact = useCallback(
    async (type: ReactionType) => {
      const wasReacted = localUserReactions.has(type);
      const delta = wasReacted ? -1 : 1;

      // Optimistic update
      setLocalCounts((prev) => ({
        ...prev,
        [type]: Math.max(0, prev[type] + delta),
      }));
      setLocalUserReactions((prev) => {
        const next = new Set(prev);
        if (wasReacted) next.delete(type);
        else next.add(type);
        return next;
      });
      setAnimating(type);
      setTimeout(() => setAnimating(null), 400);

      try {
        const res = await fetch(`/api/feed/${postId}/react`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.counts) {
            setLocalCounts(data.counts);
          }
        } else {
          // Revert
          setLocalCounts((prev) => ({
            ...prev,
            [type]: Math.max(0, prev[type] - delta),
          }));
          setLocalUserReactions((prev) => {
            const next = new Set(prev);
            if (wasReacted) next.add(type);
            else next.delete(type);
            return next;
          });
        }
      } catch {
        // Revert on network error
        setLocalCounts((prev) => ({
          ...prev,
          [type]: Math.max(0, prev[type] - delta),
        }));
        setLocalUserReactions((prev) => {
          const next = new Set(prev);
          if (wasReacted) next.add(type);
          else next.delete(type);
          return next;
        });
      }
    },
    [postId, localUserReactions],
  );

  const total = localCounts.fire + localCounts.game + localCounts.art + localCounts.mindblown;

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((type) => {
        const { emoji, label } = REACTION_CONFIG[type];
        const isActive = localUserReactions.has(type);
        const count = localCounts[type];

        return (
          <motion.button
            key={type}
            className="nes-btn"
            animate={animating === type ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={() => handleReact(type)}
            aria-label={`${label} (${count})`}
            style={{
              fontSize: 9,
              padding: "3px 8px",
              display: "flex",
              alignItems: "center",
              gap: 3,
              color: isActive ? "#FACC15" : undefined,
              boxShadow: isActive ? `0 0 8px #FACC1540` : undefined,
              minWidth: 0,
            }}
          >
            <span>{emoji}</span>
            {count > 0 && (
              <span className="font-pixel" style={{ fontSize: 7 }}>
                {count}
              </span>
            )}
            <span className="hidden sm:inline font-pixel" style={{ fontSize: 7 }}>
              {label}
            </span>
          </motion.button>
        );
      })}

      {/* Total reactions count */}
      {total > 0 && (
        <span
          className="font-pixel"
          style={{
            fontSize: 7,
            color: "#555",
            alignSelf: "center",
            marginLeft: 4,
          }}
        >
          {total}
        </span>
      )}
    </div>
  );
}
