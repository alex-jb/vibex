"use client";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Trophy } from "lucide-react";
import { useRealtimeLeaderboard } from "@/lib/realtime";
import type { LeaderboardPeriod } from "@/lib/leaderboard";

interface LiveLeaderboardProps {
  period: LeaderboardPeriod;
  limit?: number;
  title?: string;
}

function RankChange({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="text-[9px] font-bold text-emerald-400">
        &#9650;{change}
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="text-[9px] font-bold text-red-400">
        &#9660;{Math.abs(change)}
      </span>
    );
  }
  return <span className="text-[9px] text-muted-foreground/30">&mdash;</span>;
}

export function LiveLeaderboard({
  period,
  limit = 5,
  title = "Top Rankings",
}: LiveLeaderboardProps) {
  const { entries, loading, connected } = useRealtimeLeaderboard(period, limit);

  return (
    <div className="retro-card rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="size-3.5 text-amber-400" />
          <span className="font-pixel text-[8px] uppercase tracking-widest text-violet-400">
            {title}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[8px] font-semibold text-red-400">
          <span
            className={`inline-block size-1.5 rounded-full ${
              connected ? "bg-red-500 animate-pulse" : "bg-red-500/40"
            }`}
          />
          LIVE
        </span>
      </div>

      {/* Rows */}
      {loading ? (
        <div className="py-6 text-center">
          <span className="font-pixel text-[7px] text-muted-foreground animate-pulse">
            Loading...
          </span>
        </div>
      ) : (
        <LayoutGroup>
          <AnimatePresence mode="popLayout">
            {entries.map((entry) => (
              <motion.a
                key={entry.projectId}
                href={`/project/${entry.projectId}`}
                aria-label={`#${entry.rank} ${entry.title} by ${entry.creatorName}, score ${entry.score}`}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
              >
                {/* Rank */}
                <span
                  className={`w-5 text-center font-pixel text-[9px] font-bold ${
                    entry.rank === 1
                      ? "text-amber-400"
                      : entry.rank === 2
                        ? "text-zinc-300"
                        : entry.rank === 3
                          ? "text-orange-400"
                          : "text-muted-foreground/60"
                  }`}
                >
                  {entry.rank}
                </span>

                {/* Name + creator */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {entry.title}
                  </p>
                  <p className="truncate text-[9px] text-muted-foreground/60">
                    {entry.creatorName}
                  </p>
                </div>

                {/* Score */}
                <span className="font-pixel text-[9px] text-violet-400 shrink-0">
                  {entry.score}
                </span>

                {/* Change */}
                <div className="w-6 text-center shrink-0">
                  <RankChange change={entry.change} />
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </LayoutGroup>
      )}
    </div>
  );
}
