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
    content: `\u2694\uFE0F \u6218\u6597\u80DC\u5229\uFF01\u300C${projectName}\u300D\u51FB\u8D25\u4E86\u300C${opponentName}\u300D\uFF01 #arena #vibecoding`,
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
    content: `\uD83C\uDFC6 \u5728\u300C${seasonName}\u300D\u8D5B\u5B63\u4E2D\u6392\u540D\u4E0A\u5347\u5230\u7B2C ${rank} \u540D\uFF01 #arena #ranking`,
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
    content: `\u2728 \u6211\u7684 ${buddyName} \u8FDB\u5316\u6210\u4E86 ${evolvedName}\uFF01 #buddy #evolution`,
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
    content: `${rarityEmoji[rarity] ?? "\u2B50"} \u53EC\u5524\u4E86\u4E00\u53EA ${rarity.toUpperCase()} \u7684 ${buddyName}\uFF01 #buddy #gacha`,
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
    content: `\uD83E\uDD16 \u53D1\u5E03\u4E86\u65B0 Agent\u300C${agentName}\u300D\uFF01\u6765\u8BD5\u8BD5\u5427 #agent #marketplace`,
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
    content: `\uD83D\uDE80 \u300C${agentName}\u300D\u5DF2\u88AB\u8FD0\u884C ${runs.toLocaleString()} \u6B21\uFF01 #agent #milestone`,
    hashtags: ["agent", "milestone"],
  });
}
