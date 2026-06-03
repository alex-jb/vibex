/**
 * lib/cracked-score.ts — Cracked Score scoring engine (Phase 2).
 *
 * Spec + calibration: capstone-orallexa-calibration/scripts/cracked_score_poc.py
 *
 * Given a GitHub handle, fetches public profile + recent repos and computes a
 * 0-100 score across 12 axes. Same axis weights as the POC (which was
 * calibrated against karpathy 71 / antirez 69 / gaearon 53 / alex-jb 38).
 *
 * Cost: 2 GitHub API calls per scoring run (no LLM). Free tier 60 req/hour
 * unauthenticated, 5000/hour with GITHUB_TOKEN.
 */

export interface CrackedAxis {
  key: string;
  label: string;
  score: number; // 0-100
  raw: string;   // human-readable evidence
}

export interface CrackedScoreResult {
  handle: string;
  overall: number;        // 0-100
  tier: CrackedTier;
  axes: CrackedAxis[];
  totalStars: number;
  totalRepos: number;
  followers: number;
  computedAt: string;
}

export type CrackedTier =
  | { name: "mythic"; emoji: "👑"; threshold: 80 }
  | { name: "cracked"; emoji: "⚡"; threshold: 65 }
  | { name: "solid"; emoji: "💪"; threshold: 45 }
  | { name: "rising"; emoji: "🌱"; threshold: 25 }
  | { name: "starting"; emoji: "🥚"; threshold: 0 };

const TIERS: CrackedTier[] = [
  { name: "mythic", emoji: "👑", threshold: 80 },
  { name: "cracked", emoji: "⚡", threshold: 65 },
  { name: "solid", emoji: "💪", threshold: 45 },
  { name: "rising", emoji: "🌱", threshold: 25 },
  { name: "starting", emoji: "🥚", threshold: 0 },
];

export function tierFor(overall: number): CrackedTier {
  for (const t of TIERS) {
    if (overall >= t.threshold) return t;
  }
  return TIERS[TIERS.length - 1];
}

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

interface GhUser {
  login: string;
  followers: number;
  public_repos: number;
  bio?: string | null;
  created_at: string;
  blog?: string | null;
}

interface GhRepo {
  name: string;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  description: string | null;
}

async function gh<T>(path: string): Promise<T | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "vibex-cracked-score/1.0",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  try {
    const r = await fetch(`https://api.github.com${path}`, { headers });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Score a handle. Honors a 24h DB cache via cracked_scores table — if a
 * recent row exists and forceFresh is false, returns the cached result
 * instead of hitting GitHub. Writes back to DB after fresh fetch.
 */
import { createClient } from "@supabase/supabase-js";

async function loadCached(handle: string): Promise<CrackedScoreResult | null> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return null;
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const day = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supa
    .from("cracked_scores")
    .select("github_handle, overall, tier, axes, total_stars, total_repos, followers, scored_at")
    .eq("github_handle", handle.toLowerCase())
    .gte("scored_at", day)
    .maybeSingle();
  if (!data) return null;
  const tier = tierFor(data.overall as number);
  return {
    handle: data.github_handle as string,
    overall: data.overall as number,
    tier,
    axes: data.axes as CrackedAxis[],
    totalStars: data.total_stars as number,
    totalRepos: data.total_repos as number,
    followers: data.followers as number,
    computedAt: data.scored_at as string,
  };
}

async function persist(result: CrackedScoreResult, viewerHandle?: string): Promise<void> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return;
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  try {
    await supa.from("cracked_scores").upsert(
      {
        github_handle: result.handle.toLowerCase(),
        overall: result.overall,
        tier: result.tier.name,
        axes: result.axes,
        total_stars: result.totalStars,
        total_repos: result.totalRepos,
        followers: result.followers,
        viewer_handle: viewerHandle ?? null,
        scored_at: result.computedAt,
      },
      { onConflict: "github_handle" },
    );
  } catch {
    // best-effort
  }
}

export async function scoreHandle(rawHandle: string, opts: { viewerHandle?: string; forceFresh?: boolean } = {}): Promise<CrackedScoreResult | null> {
  const handle = rawHandle.replace(/^@/, "").trim();
  if (!handle || handle.length > 39 || !/^[\w-]+$/.test(handle)) return null;

  // Check 24h DB cache first (skip GitHub if recent score exists)
  if (!opts.forceFresh) {
    const cached = await loadCached(handle);
    if (cached) return cached;
  }

  const [user, allRepos] = await Promise.all([
    gh<GhUser>(`/users/${handle}`),
    gh<GhRepo[]>(`/users/${handle}/repos?sort=updated&per_page=100&type=owner`),
  ]);
  if (!user || !allRepos) return null;

  const repos = allRepos.filter((r) => !r.fork);
  const recentRepos = repos.filter((r) => daysAgo(r.pushed_at) <= 90);
  const starsTotal = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const forksTotal = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  const publicRepos = user.public_repos;
  const followers = user.followers;

  const velocityPct = publicRepos > 0 ? (recentRepos.length / publicRepos) * 100 : 0;
  const topRepoStars = repos.length
    ? Math.max(...repos.map((r) => r.stargazers_count || 0))
    : 0;

  const langs = new Set<string>();
  for (const r of repos) {
    if (r.language) langs.add(r.language);
  }
  let langBreadth = 0;
  for (const l of langs) {
    const count = repos.filter((r) => r.language === l).length;
    if (count >= 3) langBreadth += 1;
  }

  const described = repos.filter((r) => (r.description || "").trim()).length;
  const descPct = publicRepos > 0 ? (described / publicRepos) * 100 : 0;

  const accountDays = daysAgo(user.created_at || "2020-01-01T00:00:00Z");
  const ageScore = Math.min(accountDays / 30, 100);
  const ossSignal = (Math.min(starsTotal, 5000) / 5000) * 100;
  // log10 scale: 1k=33, 10k=66, 100k=100
  const followerSignal = followers > 0 ? (Math.log10(Math.max(followers, 1)) / 5) * 100 : 0;
  const forkRatio = starsTotal > 0 ? (forksTotal / starsTotal) * 100 : 0;
  const avgStars = publicRepos > 0 ? starsTotal / publicRepos : 0;
  const sigNoise = Math.min(avgStars / 20, 1) * 100;

  const axes: CrackedAxis[] = [
    { key: "velocity",        label: "Shipping velocity", raw: `${velocityPct.toFixed(0)}% repos pushed 90d`,   score: clamp(velocityPct) },
    { key: "depth",           label: "Depth",             raw: `top repo ${topRepoStars} stars`,                score: clamp(topRepoStars / 20) },
    { key: "breadth",         label: "Language breadth",  raw: `${langBreadth} langs ≥3 repos`,                 score: clamp(langBreadth * 15) },
    { key: "oss",             label: "OSS contribution",  raw: `${starsTotal} total stars received`,            score: clamp(ossSignal) },
    { key: "discipline",      label: "README discipline", raw: `${descPct.toFixed(0)}% repos with desc`,        score: clamp(descPct) },
    { key: "tenure",          label: "GitHub tenure",     raw: `${Math.floor(accountDays / 365)}y on GitHub`,   score: clamp(ageScore) },
    { key: "social",          label: "Social signal",     raw: `${followers} followers`,                        score: clamp(followerSignal) },
    { key: "iteration",       label: "Code iteration",    raw: `fork:star ratio ${forkRatio.toFixed(1)}%`,      score: clamp(forkRatio * 2) },
    { key: "signal_to_noise", label: "Signal to noise",   raw: `avg ${avgStars.toFixed(1)} stars/repo`,         score: clamp(sigNoise) },
    { key: "recent_activity", label: "Recent activity",   raw: `${recentRepos.length} repos active 90d`,        score: clamp(recentRepos.length * 5) },
    { key: "language_focus",  label: "Language focus",    raw: `${langs.size} distinct langs`,                  score: clamp(langs.size * 10) },
    { key: "writing",         label: "Writing presence",  raw: user.bio ? "bio present" : "no bio",             score: user.bio ? 50 : 20 },
  ];

  const overall = clamp(axes.reduce((acc, a) => acc + a.score, 0) / axes.length);

  const result: CrackedScoreResult = {
    handle,
    overall,
    tier: tierFor(overall),
    axes,
    totalStars: starsTotal,
    totalRepos: publicRepos,
    followers,
    computedAt: new Date().toISOString(),
  };

  // Best-effort persist (drives /cracked/leaderboard + 24h cache)
  void persist(result, opts.viewerHandle);

  return result;
}
