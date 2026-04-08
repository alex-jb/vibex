/**
 * Cross-module Feed Events
 *
 * Auto-posts to the social feed when significant events happen
 * in other modules (Arena battles, Buddy evolution, Agent installs).
 *
 * Call these from the respective API routes after the action succeeds.
 */

import { supabase } from "./supabase";

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

interface AutoPostParams {
  userId: string;
  userName: string;
  content: string;
  projectId?: string;
  hashtags?: string[];
}

async function createAutoPost(params: AutoPostParams): Promise<void> {
  if (!USE_SUPABASE) return;

  try {
    await supabase.from("posts").insert({
      user_id: params.userId,
      user_name: params.userName,
      content: params.content,
      project_id: params.projectId ?? null,
      hashtags: params.hashtags ?? [],
      parent_id: null,
    });
  } catch {
    // Auto-posts are best-effort, never block the main action
  }
}

// ─── Arena Events ───

export async function onBattleWon(
  userId: string,
  userName: string,
  projectName: string,
  opponentName: string,
  projectId?: string,
) {
  await createAutoPost({
    userId,
    userName,
    content: `\u2694\uFE0F Battle victory! "${projectName}" defeated "${opponentName}"! #arena #vibecoding`,
    projectId,
    hashtags: ["arena", "vibecoding"],
  });
}

export async function onSeasonRankUp(
  userId: string,
  userName: string,
  rank: number,
  seasonName: string,
) {
  await createAutoPost({
    userId,
    userName,
    content: `\uD83C\uDFC6 Ranked up to #${rank} in the "${seasonName}" season! #arena #ranking`,
    hashtags: ["arena", "ranking"],
  });
}

// ─── Buddy Events ───

export async function onBuddyEvolved(
  userId: string,
  userName: string,
  buddyName: string,
  evolvedName: string,
) {
  await createAutoPost({
    userId,
    userName,
    content: `\u2728 My ${buddyName} evolved into ${evolvedName}! #buddy #evolution`,
    hashtags: ["buddy", "evolution"],
  });
}

export async function onBuddySummoned(
  userId: string,
  userName: string,
  buddyName: string,
  rarity: string,
) {
  const rarityEmoji: Record<string, string> = {
    common: "\u26AA",
    uncommon: "\uD83D\uDFE2",
    rare: "\uD83D\uDD35",
    epic: "\uD83D\uDFE3",
    legendary: "\uD83D\uDFE1",
  };
  await createAutoPost({
    userId,
    userName,
    content: `${rarityEmoji[rarity] ?? "\u2B50"} Summoned a ${rarity.toUpperCase()} ${buddyName}! #buddy #gacha`,
    hashtags: ["buddy", "gacha"],
  });
}

// ─── Agent Events ───

export async function onAgentPublished(
  userId: string,
  userName: string,
  agentName: string,
  agentId: string,
) {
  await createAutoPost({
    userId,
    userName,
    content: `\uD83E\uDD16 Published new Agent "${agentName}"! Try it out #agent #marketplace`,
    projectId: agentId,
    hashtags: ["agent", "marketplace"],
  });
}

export async function onAgentMilestone(
  userId: string,
  userName: string,
  agentName: string,
  runs: number,
) {
  const milestones = [100, 500, 1000, 5000, 10000];
  if (!milestones.includes(runs)) return;

  await createAutoPost({
    userId,
    userName,
    content: `\uD83D\uDE80 "${agentName}" has been run ${runs.toLocaleString()} times! #agent #milestone`,
    hashtags: ["agent", "milestone"],
  });
}
