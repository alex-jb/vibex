/**
 * Growth notifications: FOMO triggers, streaks, milestones.
 * These create engagement loops that bring users back.
 */

import { supabase } from "./supabase";

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createNotification(
  userId: string,
  type: string,
  actorName: string,
  postId?: string,
) {
  if (!USE_SUPABASE) return;
  try {
    await supabase.from("notifications").insert({
      user_id: userId,
      type,
      actor_id: userId,
      actor_name: actorName,
      post_id: postId ?? null,
    });
  } catch {}
}

// ─── Battle FOMO ───

export async function onBattleDefeat(
  loserId: string,
  _loserName: string,
  _winnerProjectName: string,
) {
  await createNotification(
    loserId,
    "challenge",
    "Arena",
  );
}

export async function onRankingChange(
  userId: string,
  _userName: string,
  _newRank: number,
  _direction: "up" | "down",
) {
  await createNotification(
    userId,
    "ranking",
    "Leaderboard",
  );
}

// ─── Milestone Notifications ───

export async function onProjectMilestone(
  userId: string,
  projectName: string,
  milestone: string,
) {
  await createNotification(userId, "system", `${projectName}: ${milestone}`);
}

// ─── Streak System ───

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastPostDate: string | null;
}

export function calculateStreak(postDates: string[]): StreakInfo {
  if (postDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastPostDate: null };
  }

  const sorted = [...postDates]
    .map((d) => new Date(d).toISOString().split("T")[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse();

  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Check if streak is still active (posted today or yesterday)
  if (sorted[0] !== today && sorted[0] !== yesterday) {
    currentStreak = 0;
  }

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;

    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
      if (i < currentStreak + 1) currentStreak = tempStreak;
    } else {
      tempStreak = 1;
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastPostDate: sorted[0],
  };
}
