// Public stub — full implementation is proprietary. See LICENSE.

/**
 * Data Moat — Defensible data layer for VibeX (stub).
 *
 * Three layers of data that get more valuable over time:
 * 1. Creator Graph: who's building what, who's connected to whom
 * 2. Product Graph: success/failure signals across projects
 * 3. Growth Data: what launch strategies actually work
 *
 * This stub provides no-op implementations that satisfy the type contracts.
 */

import { supabase as _supabase } from "./supabase";

// ─── Creator Graph ───

export async function recordCreatorConnection(
  _fromUserId: string,
  _toUserId: string,
  _type: "collaborated" | "reacted" | "followed" | "battled" | "mentioned",
) {
  // stub: no-op
}

export async function updateCreatorProfile(_userId: string, _updates: {
  skills?: string[];
  totalLaunches?: number;
  successRate?: number;
  growthVelocity?: number;
  topCategory?: string;
}) {
  // stub: no-op
}

// ─── Product Graph ───

export async function recordProductSignal(
  _projectId: string,
  _signalType: "launch_quality" | "engagement" | "retention" | "growth" | "virality",
  _score: number,
  _details?: Record<string, unknown>,
) {
  // stub: no-op
}

// ─── Growth Data ───

export async function recordLaunchOutcome(_outcome: {
  projectId: string;
  channelsUsed: string[];
  copyStyle?: string;
  titleLength?: number;
  hasDemo?: boolean;
  hasVideo?: boolean;
  category?: string;
  tags?: string[];
}) {
  // stub: no-op
}

export async function updateLaunchMetrics(
  _projectId: string,
  _day: 1 | 7 | 30,
  _views: number,
  _upvotes: number,
) {
  // stub: no-op
}
