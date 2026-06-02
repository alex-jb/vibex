/**
 * lib/score.ts — Creator Score system (migration 069).
 *
 * Cross-product cumulative score: every action a creator takes across
 * Validator / LaunchKit / Funeral / Revival / VibeX feeds one number.
 *
 * Reward tiers (Option B — internal credits only, no cash yet):
 *   unranked   <50    no perks
 *   bronze    ≥50     LaunchKit 1x free
 *   silver    ≥150    LaunchKit Pro 1 month + unlimited Validator
 *   gold      ≥300    Home feature 1 week + free trailer gen
 *   platinum  ≥600    [Option B: same as gold; cash payout disabled]
 *   diamond   weekly top → "Top Indie Founder of the Week" (manual feature)
 *
 * Score formula (per surface):
 *   validator        →   min(pmf_score / 2, 50)        max 50  per call
 *   launchkit        →   30 (flat — quality scored elsewhere later)
 *   funeral_repo     →   15 + min(stars / 100, 15)     max 30  per repo
 *   funeral_idea     →   20 (flat)
 *   revival          →   40 (clicking "try again on Validator")
 *   vibex_submit     →   25 + min(upvotes 30d, 175)    max 200 per project
 *
 * All bumps go through bump_creator_score RPC (migration 069) for atomic
 * dedupe + cap + history append.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type Tier = "unranked" | "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface TierMeta {
  name: Tier;
  label: string;
  threshold: number;
  emoji: string;
  perk: string;
}

export const TIER_LADDER: TierMeta[] = [
  { name: "unranked", label: "Unranked", threshold: 0,   emoji: "·", perk: "Sign in to start scoring" },
  { name: "bronze",   label: "Bronze",   threshold: 50,  emoji: "🥉", perk: "1 free LaunchKit run" },
  { name: "silver",   label: "Silver",   threshold: 150, emoji: "🥈", perk: "LaunchKit Pro 1mo + unlimited Validator" },
  { name: "gold",     label: "Gold",     threshold: 300, emoji: "🥇", perk: "Home feature 1 week + free auto-trailer" },
  { name: "platinum", label: "Platinum", threshold: 600, emoji: "💎", perk: "All of Gold (cash tier coming Phase 2)" },
  { name: "diamond",  label: "Diamond",  threshold: 9999,emoji: "👑", perk: "Manual weekly award" },
];

export function tierFromScore(score: number): TierMeta {
  let current = TIER_LADDER[0];
  for (const t of TIER_LADDER) {
    if (score >= t.threshold) current = t;
  }
  return current;
}

export type Surface = "validator" | "launchkit" | "funeral_repo" | "funeral_idea" | "revival" | "vibex_submit";

/**
 * Compute the score delta a surface contributes given the relevant inputs.
 * The route handler that just persisted the entity should pass its primary
 * stat (pmf_score, stars, upvotes, etc.) so we don't have to re-query.
 */
export function computeDelta(surface: Surface, ctx: {
  pmf_score?: number;
  stars?: number;
  upvotes_30d?: number;
} = {}): number {
  switch (surface) {
    case "validator":
      return Math.min(Math.round((ctx.pmf_score ?? 50) / 2), 50);
    case "launchkit":
      return 30;
    case "funeral_repo":
      return Math.min(15 + Math.floor((ctx.stars ?? 0) / 100), 30);
    case "funeral_idea":
      return 20;
    case "revival":
      return 40;
    case "vibex_submit":
      return Math.min(25 + (ctx.upvotes_30d ?? 0), 200);
  }
}

/**
 * Anon score handle: if the user is logged in we use creators.handle,
 * else we fall back to a stable hash of session_id or a short slug. Caller
 * provides whatever's available; we just enforce non-empty.
 */
export function normaliseHandle(input: string | null | undefined): string {
  if (!input) return "anon-" + Math.random().toString(36).slice(2, 10);
  return input.trim().toLowerCase().slice(0, 64);
}

/**
 * Bump a creator's score. Returns the new score+tier, or null on failure.
 *
 * Designed to be called from a Route Handler with the anon supabase client.
 * The RPC is SECURITY DEFINER so it can write atomically + dedupe per ref_id.
 */
export async function bumpScore(
  supabase: SupabaseClient,
  args: {
    handle: string;
    surface: Surface;
    ref_id: string;
    ctx?: { pmf_score?: number; stars?: number; upvotes_30d?: number };
  },
): Promise<{ score: number; tier: Tier } | null> {
  const delta = computeDelta(args.surface, args.ctx ?? {});
  const handle = normaliseHandle(args.handle);
  const { data, error } = await supabase.rpc("bump_creator_score", {
    p_handle: handle,
    p_surface: args.surface,
    p_delta: delta,
    p_ref_id: args.ref_id,
  });
  if (error) {
    console.error("[score] bump RPC failed:", error.message);
    return null;
  }
  // RPC returns a table; supabase-js shapes it as an array
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { score: row.new_score as number, tier: row.new_tier as Tier };
}

/**
 * Convenience: server-side helper that creates a fresh anon supabase client.
 * Most callers should pass their own client; this is here for one-shot routes.
 */
export function getAnonClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}
