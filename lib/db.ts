import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import * as mock from "./mock-data";
import type {
  Project,
  Creator,
  Idea,
  Event,
  TrendInsight,
  WeeklyWinner,
  BattleResult,
  AIReview,
  BehaviorScore,
  ProjectCategory,
} from "./types";
import type { AgentDefinition } from "./agent-types";
import { agents as mockAgents } from "./mock-data/agents";
import { validateEnv } from "./env";
import { computeHeroStats } from "./rpg-utils";

/**
 * Data access layer.
 * Uses Supabase when NEXT_PUBLIC_SUPABASE_URL is set, otherwise falls back to mock data.
 */

const { hasSupabase: USE_SUPABASE } = validateEnv();

// ═══════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════

function mapProject(row: Record<string, unknown>): Project {
  const base: Project = {
    id: row.id as string,
    title: row.title as string,
    tagline: row.tagline as string,
    description: row.description as string,
    category: row.category as Project["category"],
    creatorId: row.creator_id as string,
    creatorName: (row.creator_name as string) || (row.creators as Record<string, unknown>)?.name as string || "",
    tags: (row.tags as string[]) || [],
    thumbnail: (row.thumbnail as string) || "",
    views: (row.views as number) || 0,
    upvotes: (row.upvotes as number) || 0,
    plays: (row.plays as number) || 0,
    shares: (row.shares as number) || 0,
    remixCount: (row.remix_count as number) || 0,
    score: (row.score as number) || 0,
    featured: (row.featured as boolean) || false,
    demoType: (row.demo_type as Project["demoType"]) || "preview",
    demoUrl: row.demo_url as string | undefined,
    demoContent: row.demo_content as string | undefined,
    parentId: row.parent_id as string | undefined,
    viralBoosted: (row.viral_boosted as boolean) || false,
    createdAt: row.created_at as string,
    behaviorScore: row.behavior_scores
      ? mapBehaviorScore(row.behavior_scores as Record<string, unknown>)
      : { plays: 0, avgStaySeconds: 0, shareRate: 0, remixCount: 0, aiScore: 0, compound: 0 },
    aiReview: row.ai_reviews
      ? mapAIReview(row.ai_reviews as Record<string, unknown>)
      : { originality: 0, clarity: 0, uxPotential: 0, viralityPotential: 0, investorCuriosity: 0, strengths: [], weaknesses: [], suggestions: [] },
  };

  // Derive the RPG hero stats (level, class, attributes, evolutionStage,
  // etc.) from the mapped Project data. Before 2026-04-17 this field
  // was only populated on mock projects, so user-submitted rows had
  // `project.hero === undefined` — the UI then fell through to
  // "Seed" as the displayed stage even when the compound score was
  // already past the Active threshold. computeHeroStats is pure and
  // cheap so we run it on every map; the DB-stored evolution_stage
  // column (from migration 033 trigger) is preserved in case it has
  // been hand-tuned.
  return { ...base, hero: computeHeroStats(base) };
}

function mapBehaviorScore(row: Record<string, unknown>): BehaviorScore {
  return {
    plays: (row.plays as number) || 0,
    avgStaySeconds: Number(row.avg_stay_seconds) || 0,
    shareRate: Number(row.share_rate) || 0,
    remixCount: (row.remix_count as number) || 0,
    aiScore: (row.ai_score as number) || 0,
    compound: Number(row.compound) || 0,
  };
}

function mapAIReview(row: Record<string, unknown>): AIReview {
  return {
    originality: (row.originality as number) || 0,
    clarity: (row.clarity as number) || 0,
    uxPotential: (row.ux_potential as number) || 0,
    viralityPotential: (row.virality_potential as number) || 0,
    investorCuriosity: (row.investor_curiosity as number) || 0,
    strengths: (row.strengths as string[]) || [],
    weaknesses: (row.weaknesses as string[]) || [],
    suggestions: (row.suggestions as string[]) || [],
  };
}

export async function getProjects(): Promise<Project[]> {
  if (!USE_SUPABASE) return mock.projects;

  const { data, error } = await supabase
    .from("projects")
    .select("*, behavior_scores(*), ai_reviews(*), creators(name)")
    .order("score", { ascending: false });

  if (error || !data) return mock.projects;
  return data.map(mapProject);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  if (!USE_SUPABASE) return mock.projects.find((p) => p.id === id);

  const { data, error } = await supabase
    .from("projects")
    .select("*, behavior_scores(*), ai_reviews(*), creators(name)")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  return mapProject(data);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  if (!USE_SUPABASE) return mock.projects.filter((p) => p.featured);

  const { data, error } = await supabase
    .from("projects")
    .select("*, behavior_scores(*), ai_reviews(*), creators(name)")
    .eq("featured", true)
    .order("score", { ascending: false });

  if (error || !data) return [];
  return data.map(mapProject);
}

export async function incrementUpvote(projectId: string): Promise<void> {
  if (!USE_SUPABASE) return;
  await supabase.rpc("increment_upvote", { p_id: projectId });
}

export async function incrementView(projectId: string): Promise<void> {
  if (!USE_SUPABASE) return;
  const { data } = await supabase
    .from("projects")
    .select("views")
    .eq("id", projectId)
    .single();
  if (data) {
    await supabase
      .from("projects")
      .update({ views: data.views + 1 })
      .eq("id", projectId);
  }
}

export async function incrementPlay(projectId: string): Promise<void> {
  if (!USE_SUPABASE) return;
  // Uses the increment_play RPC added in migration 040. Atomic +1 with
  // SECURITY DEFINER so anonymous visitors bumping plays on a project
  // page don't need an RLS UPDATE policy on projects.
  await supabase.rpc("increment_play", { p_id: projectId });
}

/**
 * Insert or update the ai_reviews row for a project + refresh
 * projects.score to the compound. Called from /api/projects/submit
 * after a fresh Claude review, and from the rescue script for legacy
 * score=0 projects.
 *
 * Pass an authenticated client — RLS on ai_reviews is gated by
 * creators.auth_user_id = auth.uid() (see migration 040).
 */
export async function upsertAIReview(
  client: SupabaseClient,
  projectId: string,
  review: {
    originality: number;
    clarity: number;
    uxPotential: number;
    viralityPotential: number;
    investorCuriosity: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  },
): Promise<boolean> {
  const compound = Math.round(
    (review.originality +
      review.clarity +
      review.uxPotential +
      review.viralityPotential +
      review.investorCuriosity) /
      5,
  );

  const { error: upsertErr } = await client
    .from("ai_reviews")
    .upsert(
      {
        project_id: projectId,
        originality: review.originality,
        clarity: review.clarity,
        ux_potential: review.uxPotential,
        virality_potential: review.viralityPotential,
        investor_curiosity: review.investorCuriosity,
        strengths: review.strengths,
        weaknesses: review.weaknesses,
        suggestions: review.suggestions,
      },
      { onConflict: "project_id" },
    );

  if (upsertErr) {
    console.error("[upsertAIReview] upsert ai_reviews failed", upsertErr);
    return false;
  }

  const { error: scoreErr } = await client
    .from("projects")
    .update({ score: compound })
    .eq("id", projectId);

  if (scoreErr) {
    console.error("[upsertAIReview] projects.score update failed", scoreErr);
    return false;
  }

  return true;
}

// ═══════════════════════════════════════════════════════════════
// WRITE PATH — Launch Feedback Loop
// ═══════════════════════════════════════════════════════════════

export interface NewProjectInput {
  title: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  demoType?: "chat" | "sandbox" | "preview" | "embedded";
  demoUrl?: string;
  thumbnail?: string;
}

type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

/**
 * Ensure a `creators` row exists for the given auth user and return its id.
 * Uses the per-request authed Supabase client so RLS (policy
 * "Auth insert own creator" from migration 038) can match auth.uid().
 *
 * Returns null on any failure so callers can choose to fall back. We do not
 * throw because this runs inside API routes that want to return structured
 * errors instead of 500s.
 */
export async function getOrCreateCreator(
  client: SupabaseClient,
  user: AuthUser,
): Promise<string | null> {
  if (!USE_SUPABASE) return `creator-${user.id.slice(0, 8)}`;

  // Look up existing by auth_user_id first.
  const { data: existing } = await client
    .from("creators")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  // Derive a display name and stable id from the auth user.
  const meta = user.user_metadata ?? {};
  const displayName =
    (meta.user_name as string | undefined) ??
    (meta.preferred_username as string | undefined) ??
    (meta.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "trainer";

  // Creator ids are TEXT in the schema. Use the auth uid directly so there
  // is a 1:1 mapping and we never create duplicates.
  const creatorId = user.id;

  const { data: inserted, error } = await client
    .from("creators")
    .insert({
      id: creatorId,
      name: displayName,
      auth_user_id: user.id,
      bio: "",
      rank: 0,
      weekly_growth: 0,
    })
    .select("id")
    .single();

  if (error || !inserted?.id) {
    console.error("[getOrCreateCreator] insert failed", error);
    return null;
  }
  return inserted.id as string;
}

/**
 * Insert a real project row. Caller must pass the authed supabase client and
 * a creator_id that belongs to the current user (use getOrCreateCreator).
 * Returns the inserted row (mapped to Project) or null on failure.
 */
export async function createProject(
  client: SupabaseClient,
  creatorId: string,
  input: NewProjectInput,
): Promise<Project | null> {
  const projectId = `proj-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  if (!USE_SUPABASE) {
    // Dev / demo mode: return a plausible Project shape so the submit route
    // can still return 201 without a real database. The row isn't persisted.
    return {
      id: projectId,
      title: input.title,
      tagline: input.tagline,
      description: input.description,
      category: input.category,
      creatorId,
      creatorName: "",
      tags: input.tags,
      thumbnail: input.thumbnail ?? "",
      views: 0,
      upvotes: 0,
      plays: 0,
      shares: 0,
      remixCount: 0,
      score: 0,
      featured: false,
      demoType: input.demoType ?? "preview",
      demoUrl: input.demoUrl,
      createdAt: new Date().toISOString(),
      behaviorScore: { plays: 0, avgStaySeconds: 0, shareRate: 0, remixCount: 0, aiScore: 0, compound: 0 },
      aiReview: { originality: 0, clarity: 0, uxPotential: 0, viralityPotential: 0, investorCuriosity: 0, strengths: [], weaknesses: [], suggestions: [] },
    };
  }

  const { data, error } = await client
    .from("projects")
    .insert({
      id: projectId,
      title: input.title,
      tagline: input.tagline,
      description: input.description,
      category: input.category,
      creator_id: creatorId,
      tags: input.tags,
      thumbnail: input.thumbnail ?? "",
      demo_type: input.demoType ?? "preview",
      demo_url: input.demoUrl ?? null,
    })
    .select("*, creators(name)")
    .single();

  if (error || !data) {
    console.error("[createProject] insert failed", error);
    return null;
  }
  return mapProject(data as Record<string, unknown>);
}

// ═══════════════════════════════════════════════════════════════
// CREATORS
// ═══════════════════════════════════════════════════════════════

function mapCreator(row: Record<string, unknown>): Creator {
  return {
    id: row.id as string,
    name: row.name as string,
    avatar: row.avatar as string | undefined,
    bio: (row.bio as string) || "",
    projectCount: (row.project_count as number) || 0,
    totalUpvotes: (row.total_upvotes as number) || 0,
    totalPlays: (row.total_plays as number) || 0,
    totalRemixes: (row.total_remixes as number) || 0,
    rank: (row.rank as number) || 0,
    weeklyGrowth: Number(row.weekly_growth) || 0,
    topProjectIds: (row.top_project_ids as string[]) || [],
    joinedAt: row.joined_at as string,
    badges: (row.badges as Creator["badges"]) || [],
  };
}

export async function getCreators(): Promise<Creator[]> {
  if (!USE_SUPABASE) return mock.creators;

  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .order("rank", { ascending: true });

  if (error || !data) return mock.creators;
  return data.map(mapCreator);
}

// ═══════════════════════════════════════════════════════════════
// IDEAS
// ═══════════════════════════════════════════════════════════════

function mapIdea(row: Record<string, unknown>): Idea {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    creatorName: row.creator_name as string,
    createdAt: row.created_at as string,
    category: row.category as Idea["category"],
    upvotes: (row.upvotes as number) || 0,
    status: (row.status as Idea["status"]) || "idea",
    launchedProjectId: row.launched_project_id as string | undefined,
    aiEvaluation: {
      viability: (row.eval_viability as number) || 0,
      marketFit: (row.eval_market_fit as number) || 0,
      competition: (row.eval_competition as "low" | "moderate" | "high" | "saturated") || "low",
      uniqueness: (row.eval_uniqueness as number) || 0,
      difficulty: (row.eval_difficulty as "easy" | "medium" | "hard" | "expert") || "medium",
      suggestions: (row.eval_suggestions as string[]) || [],
      similarProjects: (row.eval_similar_projects as string[]) || [],
      estimatedCategory: (row.eval_estimated_category as Idea["category"]) || row.category as Idea["category"],
    },
  };
}

export async function getIdeas(): Promise<Idea[]> {
  if (!USE_SUPABASE) return mock.ideas;

  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("upvotes", { ascending: false });

  if (error || !data) return mock.ideas;
  return data.map(mapIdea);
}

export async function createIdea(idea: Omit<Idea, "id" | "createdAt" | "upvotes">): Promise<Idea | null> {
  if (!USE_SUPABASE) return null;

  const id = `idea-${Date.now()}`;
  const { data, error } = await supabase
    .from("ideas")
    .insert({
      id,
      title: idea.title,
      description: idea.description,
      creator_name: idea.creatorName,
      category: idea.category,
      status: idea.status,
      eval_viability: idea.aiEvaluation.viability,
      eval_market_fit: idea.aiEvaluation.marketFit,
      eval_competition: idea.aiEvaluation.competition,
      eval_uniqueness: idea.aiEvaluation.uniqueness,
      eval_difficulty: idea.aiEvaluation.difficulty,
      eval_suggestions: idea.aiEvaluation.suggestions,
      eval_similar_projects: idea.aiEvaluation.similarProjects,
      eval_estimated_category: idea.aiEvaluation.estimatedCategory,
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapIdea(data);
}

// ═══════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════

function mapEvent(row: Record<string, unknown>): Event {
  return {
    id: row.id as string,
    title: row.title as string,
    type: row.type as Event["type"],
    date: row.date as string,
    location: row.location as string,
    organizer: row.organizer as string,
    description: (row.description as string) || "",
    isOnline: (row.is_online as boolean) || false,
    featured: (row.featured as boolean) || false,
    image: row.image as string | undefined,
    topProjectIds: (row.top_project_ids as string[]) || [],
    aiGeneratedTopics: (row.ai_generated_topics as string[]) || [],
    participantCount: (row.participant_count as number) || 0,
    status: row.status as Event["status"],
  };
}

export async function getEvents(): Promise<Event[]> {
  if (!USE_SUPABASE) return mock.events;

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return mock.events;
  return data.map(mapEvent);
}

// ═══════════════════════════════════════════════════════════════
// TREND INSIGHTS
// ═══════════════════════════════════════════════════════════════

function mapTrendInsight(row: Record<string, unknown>): TrendInsight {
  return {
    id: row.id as string,
    title: row.title as string,
    type: row.type as TrendInsight["type"],
    signal: row.signal as TrendInsight["signal"],
    summary: (row.summary as string) || "",
    momentum: (row.momentum as number) || 0,
    confidence: (row.confidence as number) || 0,
    category: row.category as string,
  };
}

export async function getTrendInsights(): Promise<TrendInsight[]> {
  if (!USE_SUPABASE) return mock.trendInsights;

  const { data, error } = await supabase
    .from("trend_insights")
    .select("*")
    .order("momentum", { ascending: false });

  if (error || !data) return mock.trendInsights;
  return data.map(mapTrendInsight);
}

// ═══════════════════════════════════════════════════════════════
// WEEKLY WINNERS
// ═══════════════════════════════════════════════════════════════

function mapWeeklyWinner(row: Record<string, unknown>): WeeklyWinner {
  return {
    week: row.week as string,
    projectId: row.project_id as string,
    projectTitle: row.project_title as string,
    creatorName: row.creator_name as string,
    score: (row.score as number) || 0,
    category: row.category as WeeklyWinner["category"],
  };
}

export async function getWeeklyWinners(): Promise<WeeklyWinner[]> {
  if (!USE_SUPABASE) return mock.weeklyWinners;

  const { data, error } = await supabase
    .from("weekly_winners")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return mock.weeklyWinners;
  return data.map(mapWeeklyWinner);
}

// ═══════════════════════════════════════════════════════════════
// BATTLE HISTORY
// ═══════════════════════════════════════════════════════════════

export async function saveBattleResult(result: BattleResult): Promise<void> {
  if (!USE_SUPABASE) return;

  await supabase.from("battle_history").insert({
    id: result.id,
    challenger_id: result.challengerId,
    defender_id: result.defenderId,
    winner_id: result.winner,
    rounds: result.rounds,
    exp_gained_challenger: result.expGained.challenger,
    exp_gained_defender: result.expGained.defender,
  });
}

export async function getBattleHistory(limit = 20): Promise<BattleResult[]> {
  if (!USE_SUPABASE) return [];

  const { data, error } = await supabase
    .from("battle_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    challengerId: row.challenger_id,
    defenderId: row.defender_id,
    winner: row.winner_id,
    rounds: row.rounds,
    expGained: {
      challenger: row.exp_gained_challenger,
      defender: row.exp_gained_defender,
    },
    timestamp: row.created_at,
  }));
}

// ═══════════════════════════════════════════════════════════════
// AGENTS
// ═══════════════════════════════════════════════════════════════

function mapAgent(row: Record<string, unknown>): AgentDefinition {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || "",
    version: (row.version as string) || "1.0.0",
    creatorId: (row.creator_id as string) || "",
    creatorName: (row.creator_name as string) || "",
    systemPrompt: (row.system_prompt as string) || "",
    model: (row.model as AgentDefinition["model"]) || "claude-haiku-4-5",
    temperature: Number(row.temperature) || 0.7,
    maxTokens: (row.max_tokens as number) || 4000,
    tools: (row.tools as string[]) || [],
    inputSchema: (row.input_schema as AgentDefinition["inputSchema"]) || { type: "text" },
    outputSchema: (row.output_schema as AgentDefinition["outputSchema"]) || { type: "text" },
    category: (row.category as AgentDefinition["category"]) || "other",
    tags: (row.tags as string[]) || [],
    isPublic: (row.is_public as boolean) ?? true,
    featured: (row.featured as boolean) || false,
    runs: (row.runs as number) || 0,
    avgLatencyMs: (row.avg_latency_ms as number) || 0,
    successRate: Number(row.success_rate) || 0,
    upvotes: (row.upvotes as number) || 0,
    forks: (row.forks as number) || 0,
    createdAt: (row.created_at as string) || "",
    updatedAt: (row.updated_at as string) || "",
  };
}

export async function getAgents(): Promise<AgentDefinition[]> {
  if (!USE_SUPABASE) return mockAgents;

  const { data, error } = await supabase
    .from("agent_definitions")
    .select("*")
    .order("runs", { ascending: false });

  if (error || !data) return mockAgents;
  return data.map(mapAgent);
}

export async function getAgentById(id: string): Promise<AgentDefinition | undefined> {
  if (!USE_SUPABASE) return mockAgents.find((a) => a.id === id);

  const { data, error } = await supabase
    .from("agent_definitions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return mockAgents.find((a) => a.id === id);
  return mapAgent(data);
}

// ═══════════════════════════════════════════════════════════════
// CATEGORIES (static)
// ═══════════════════════════════════════════════════════════════

export function getCategories(): readonly string[] {
  return mock.categories;
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export async function createNotification(notification: {
  userId: string;
  type: "upvote" | "comment" | "reply" | "follow" | "battle" | "mention" | "system";
  title: string;
  body?: string;
  link?: string;
  actorName?: string;
  projectId?: string;
}): Promise<void> {
  if (!USE_SUPABASE) return;
  await supabase.from("notifications").insert({
    user_id: notification.userId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    actor_name: notification.actorName,
    project_id: notification.projectId,
  });
}
