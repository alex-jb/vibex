/**
 * lib/quant-bench.ts — Quant Resume Bench scoring engine (Phase 2).
 *
 * Given a GitHub handle, fetches public profile + recent repos + commit
 * activity, then runs a single Claude Sonnet call with 5-voice quant
 * council prompt (Jane Street MD / Citadel quant / Two Sigma ML /
 * Anthropic researcher / HFT engineer). Returns 0-100 score across
 * 5 axes + per-voice verdict + tier.
 *
 * Cost: 1 Sonnet call ~$0.03/scoring + 2 GitHub API calls (free).
 * Reuses GhUser/GhRepo shapes from cracked-score.ts.
 *
 * 2026-06-08: shipped Day 1 wiring per Tier 1 #6 of stack-wide upgrade.
 */

import Anthropic from "@anthropic-ai/sdk";

export interface QuantVoiceVerdict {
  voice: "jane_street" | "citadel" | "two_sigma" | "anthropic" | "hft";
  voice_display: string;
  score: number;          // 0-100 from this persona
  verdict: string;        // 1-2 sentences
  strength: string;       // single strongest signal
  gap: string;            // single biggest gap
}

export interface QuantBenchResult {
  handle: string;
  overall: number;        // 0-100, mean of 5 voices
  tier: QuantTier;
  voices: QuantVoiceVerdict[];
  summary: string;        // 1-paragraph executive consensus
  totalStars: number;
  totalRepos: number;
  followers: number;
  computedAt: string;
}

export type QuantTier =
  | { name: "jane_street_ready"; emoji: "🎯"; threshold: 80 }
  | { name: "tier1_quant_ready"; emoji: "📈"; threshold: 65 }
  | { name: "ml_researcher_ready"; emoji: "🧠"; threshold: 50 }
  | { name: "junior_quant_ready"; emoji: "📊"; threshold: 35 }
  | { name: "needs_more_work"; emoji: "🌱"; threshold: 0 };

const TIERS: QuantTier[] = [
  { name: "jane_street_ready", emoji: "🎯", threshold: 80 },
  { name: "tier1_quant_ready", emoji: "📈", threshold: 65 },
  { name: "ml_researcher_ready", emoji: "🧠", threshold: 50 },
  { name: "junior_quant_ready", emoji: "📊", threshold: 35 },
  { name: "needs_more_work", emoji: "🌱", threshold: 0 },
];

export function tierFor(overall: number): QuantTier {
  for (const t of TIERS) {
    if (overall >= t.threshold) return t;
  }
  return TIERS[TIERS.length - 1];
}

interface GhUser {
  login: string;
  name?: string | null;
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

async function fetchGitHub(handle: string): Promise<{
  user: GhUser;
  repos: GhRepo[];
} | null> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "vibex-quant-bench/1.0",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const userRes = await fetch(`https://api.github.com/users/${handle}`, { headers });
    if (!userRes.ok) return null;
    const user = (await userRes.json()) as GhUser;

    const reposRes = await fetch(
      `https://api.github.com/users/${handle}/repos?sort=pushed&per_page=30&type=owner`,
      { headers }
    );
    if (!reposRes.ok) return null;
    const repos = (await reposRes.json()) as GhRepo[];

    return { user, repos: repos.filter((r) => !r.fork && !r.archived) };
  } catch {
    return null;
  }
}

const COUNCIL_PROMPT = `You are 5 quant industry veterans evaluating a GitHub profile for hireability.
Output STRICT JSON. Be terse, honest, evidence-based. No fluff.

The 5 voices:
1. JANE STREET MD — values: statistical rigor, OCaml/Haskell signals, calibration discipline, no overclaim, willing to admit gaps
2. CITADEL QUANT — values: low-latency C++ profile, real production engineering, real money exposure, performance obsession
3. TWO SIGMA ML — values: published ML papers/repos, Brier/walk-forward/regime methods, transformer/RL/diffusion stack
4. ANTHROPIC RESEARCHER — values: agent systems, multi-agent debate, Claude API integration depth, RL alignment thinking
5. HFT ENGINEER — values: latency budgets, kernel/networking, deterministic systems, no scripting-language allergy

For each voice, output: {voice, voice_display, score 0-100, verdict (1-2 sentences), strength, gap}
Then output: {summary (1-paragraph consensus)}

Schema:
{
  "voices": [
    {"voice": "jane_street", "voice_display": "Jane Street MD", "score": <0-100>, "verdict": "...", "strength": "...", "gap": "..."},
    {"voice": "citadel", ...},
    ...5 total
  ],
  "summary": "<1 paragraph 60-100 words>"
}

CRITICAL:
- Evidence-based — quote actual repo names / numbers from input
- No padding. Brutal calibration. 87 means top 1%, 50 is middle, 25 is needs years of work.
- If profile is thin (< 5 real repos), scores should reflect that, not be sympathetic.
- 2026-06-08: every numeric claim ties to evidence — e.g. "745 tests in orallexa-ai-trading-agent" not "good test coverage".`;

export async function scoreHandle(handle: string): Promise<QuantBenchResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Without LLM access we cannot run the council — return null so the page
    // surfaces a "service unavailable" state rather than fake data.
    return null;
  }

  const gh = await fetchGitHub(handle);
  if (!gh) return null;

  const totalStars = gh.repos.reduce((s, r) => s + r.stargazers_count, 0);
  const ghContext = {
    handle: gh.user.login,
    name: gh.user.name,
    bio: gh.user.bio,
    followers: gh.user.followers,
    public_repos: gh.user.public_repos,
    account_age_years: Math.round(
      (Date.now() - new Date(gh.user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)
    ),
    top_repos: gh.repos.slice(0, 15).map((r) => ({
      name: r.name,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      desc: r.description,
      last_pushed: r.pushed_at.slice(0, 10),
    })),
    total_stars: totalStars,
  };

  const anthropic = new Anthropic({ apiKey });
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: COUNCIL_PROMPT,
    messages: [
      {
        role: "user",
        content: `Evaluate this GitHub profile:\n${JSON.stringify(ghContext, null, 2)}`,
      },
    ],
  });

  const textBlock = msg.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;

  let parsed: { voices: QuantVoiceVerdict[]; summary: string };
  try {
    // Strip code fence if Claude wraps in ```json
    const cleaned = textBlock.text
      .replace(/^```json\n/, "")
      .replace(/^```\n/, "")
      .replace(/\n```$/, "");
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }

  if (!parsed.voices || parsed.voices.length !== 5) return null;

  const overall = Math.round(
    parsed.voices.reduce((s, v) => s + v.score, 0) / parsed.voices.length
  );
  const tier = tierFor(overall);

  // 2026-06-09: persist to supabase for /quant-bench/leaderboard.
  // Migration 076 must be applied first. Service-role key required for write
  // (we use anon for read on leaderboard). If anon key only or insert fails,
  // the score still returns — leaderboard simply won't include this run.
  try {
    const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (SUPA_URL && SERVICE_KEY) {
      const { createClient } = await import("@supabase/supabase-js");
      const supa = createClient(SUPA_URL, SERVICE_KEY);
      await supa.from("quant_bench_scores").upsert(
        {
          handle,
          overall,
          tier: tier.name,
          summary: parsed.summary,
          voices: parsed.voices,
          total_stars: totalStars,
          total_repos: gh.user.public_repos,
          followers: gh.user.followers,
        },
        { onConflict: "handle" }
      );
    }
  } catch {
    // Persistence is opportunistic; never block the response.
  }

  return {
    handle,
    overall,
    tier,
    voices: parsed.voices,
    summary: parsed.summary,
    totalStars,
    totalRepos: gh.user.public_repos,
    followers: gh.user.followers,
    computedAt: new Date().toISOString(),
  };
}
