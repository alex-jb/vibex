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

export async function scoreHandle(rawHandle: string): Promise<CrackedScoreResult | null> {
  const handle = rawHandle.replace(/^@/, "").trim();
  if (!handle || handle.length > 39 || !/^[\w-]+$/.test(handle)) return null;

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

  return {
    handle,
    overall,
    tier: tierFor(overall),
    axes,
    totalStars: starsTotal,
    totalRepos: publicRepos,
    followers,
    computedAt: new Date().toISOString(),
  };
}
