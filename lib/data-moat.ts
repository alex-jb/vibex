/**
 * Data Moat — Defensible data layer for VibeX.
 *
 * Three layers of data that get more valuable over time:
 * 1. Creator Graph: who's building what, who's connected to whom
 * 2. Product Graph: success/failure signals across projects
 * 3. Growth Data: what launch strategies actually work
 *
 * This data is the real moat. UI can be cloned in 2 weeks.
 * This data takes years to accumulate.
 */

import { supabase } from "./supabase";

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Creator Graph ───

export async function recordCreatorConnection(
  fromUserId: string,
  toUserId: string,
  type: "collaborated" | "reacted" | "followed" | "battled" | "mentioned",
) {
  if (!USE_SUPABASE || fromUserId === toUserId) return;
  try {
    await supabase.from("creator_connections").upsert(
      { from_user_id: fromUserId, to_user_id: toUserId, connection_type: type, strength: 1, last_interaction_at: new Date().toISOString() },
      { onConflict: "from_user_id,to_user_id,connection_type" },
    );
    // Increment strength on re-interaction (best effort)
    try {
      await supabase.rpc("increment_connection_strength", {
        p_from: fromUserId, p_to: toUserId, p_type: type,
      });
    } catch {}
  } catch {}
}

export async function updateCreatorProfile(userId: string, updates: {
  skills?: string[];
  totalLaunches?: number;
  successRate?: number;
  growthVelocity?: number;
  topCategory?: string;
}) {
  if (!USE_SUPABASE) return;
  try {
    await supabase.from("creator_profiles").update({
      ...(updates.skills && { skills: updates.skills }),
      ...(updates.totalLaunches != null && { total_launches: updates.totalLaunches }),
      ...(updates.successRate != null && { success_rate: updates.successRate }),
      ...(updates.growthVelocity != null && { growth_velocity: updates.growthVelocity }),
      ...(updates.topCategory && { top_category: updates.topCategory }),
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);
  } catch {}
}

// ─── Product Graph ───

export async function recordProductSignal(
  projectId: string,
  signalType: "launch_quality" | "engagement" | "retention" | "growth" | "virality",
  score: number,
  details?: Record<string, unknown>,
) {
  if (!USE_SUPABASE) return;
  try {
    await supabase.from("product_signals").insert({
      project_id: projectId,
      signal_type: signalType,
      score: Math.min(100, Math.max(0, score)),
      details: details ?? null,
    });
  } catch {}
}

// ─── Growth Data ───

export async function recordLaunchOutcome(outcome: {
  projectId: string;
  channelsUsed: string[];
  copyStyle?: string;
  titleLength?: number;
  hasDemo?: boolean;
  hasVideo?: boolean;
  category?: string;
  tags?: string[];
}) {
  if (!USE_SUPABASE) return;
  try {
    await supabase.from("launch_outcomes").insert({
      project_id: outcome.projectId,
      channels_used: outcome.channelsUsed,
      copy_style: outcome.copyStyle ?? null,
      title_length: outcome.titleLength ?? null,
      has_demo: outcome.hasDemo ?? false,
      has_video: outcome.hasVideo ?? false,
      category: outcome.category ?? null,
      tags: outcome.tags ?? [],
    });
  } catch {}
}

export async function updateLaunchMetrics(
  projectId: string,
  day: 1 | 7 | 30,
  views: number,
  upvotes: number,
) {
  if (!USE_SUPABASE) return;
  const field_views = `day${day}_views`;
  const field_upvotes = day <= 7 ? `day${day}_upvotes` : null;

  try {
    const update: Record<string, number> = { [field_views]: views };
    if (field_upvotes) update[field_upvotes] = upvotes;
    if (views > 0 && upvotes > 0) {
      update.conversion_rate = Math.round((upvotes / views) * 1000) / 10;
    }

    await supabase
      .from("launch_outcomes")
      .update(update)
      .eq("project_id", projectId)
      .order("launch_date", { ascending: false })
      .limit(1);
  } catch {}
}
