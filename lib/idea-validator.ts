/**
 * lib/idea-validator.ts — Idea Validator / PMF Detector engine.
 *
 * Spec: alex-brain research/projects-2026-06/06-idea-validator-spec.md
 *
 * Pipeline:
 *   Phase A — Extract (Haiku $0.0002): category + 3 keywords + persona
 *   Phase B — Gather signals in parallel (all free APIs):
 *       - GitHub search (top 5 by stars)
 *       - HN Algolia (top 5 last 12 months by points)
 *       - Reddit JSON (r/SideProject + r/Entrepreneur, top relevant)
 *   Phase C — Synthesize (Sonnet $0.025): 5-section report
 *   Phase D — Verdict (Sonnet $0.005): 0-100 PMF score + recommendation
 *
 * Total cost per validation: ~$0.030. $5 single sale = 166x margin.
 */
import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";

// ─── Types ───────────────────────────────────────────────────────────
export interface IdeaExtraction {
  category: string;
  keywords: string[];
  persona: string;
}

export interface GithubHit {
  full_name: string;
  description: string | null;
  stars: number;
  url: string;
  language: string | null;
}

export interface HNHit {
  title: string;
  url: string | null;
  points: number;
  num_comments: number;
  created_at: string;
}

export interface RedditHit {
  title: string;
  permalink: string;
  subreddit: string;
  num_comments: number;
  score: number;
  created_utc: number;
}

export interface SignalBundle {
  github: GithubHit[];
  hn: HNHit[];
  reddit: RedditHit[];
}

export interface ValidatorReport {
  // 5 sections (matching spec)
  competitors: {
    summary: string;
    items: { name: string; url: string; differentiator: string }[];
  };
  demand_signals: {
    summary: string; // narrative verdict
    reddit_post_count: number;
    hn_post_count: number;
    avg_hn_points: number;
    quantified_verdict: "high" | "mid" | "low";
  };
  whats_built: {
    summary: string;
    missing_features: string[];
    pain_points: string[];
    pricing_distribution: string;
  };
  white_space: {
    summary: string;
    angles: { tagline: string; estimated_mrr_ceiling: string; reasoning: string }[];
  };
  verdict: {
    pmf_score: number; // 0-100
    recommendation: "BUILD" | "ITERATE" | "SKIP";
    one_liner: string;
    axes: {
      demand: number;
      competition: number;
      differentiation: number;
      feasibility: number;
    };
    analogy: string; // "This is more like X..."
  };
}

// ─── Phase A: extract ────────────────────────────────────────────────
const EXTRACT_SYSTEM = `Extract structured fields from a user's startup idea. Output JSON only, no markdown.

Schema:
{
  "category": "1-3 word category like 'task tracker' or 'AI for X' or 'note-taking'",
  "keywords": ["3 search terms", "for", "GitHub/Reddit/HN"],
  "persona": "the target user as a one-liner, e.g. 'solo founders shipping side projects weekly'"
}`;

export async function extractIdea(
  ideaText: string,
  client: Anthropic,
): Promise<IdeaExtraction> {
  const resp = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    system: EXTRACT_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Idea:\n${ideaText.slice(0, 500)}\n\nReturn JSON.`,
      },
    ],
  });
  const text = resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("")
    .trim();
  // Strip markdown if Claude added it
  const json = text.replace(/^```json\s*|\s*```$/g, "").replace(/^```\s*|\s*```$/g, "");
  try {
    const parsed = JSON.parse(json) as IdeaExtraction;
    return {
      category: parsed.category?.slice(0, 60) || "unknown",
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.slice(0, 3).map((k) => String(k).slice(0, 40))
        : [ideaText.slice(0, 40)],
      persona: parsed.persona?.slice(0, 200) || "general",
    };
  } catch {
    // Fallback: naive split
    return {
      category: "unknown",
      keywords: ideaText
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= 4)
        .slice(0, 3),
      persona: "general",
    };
  }
}

// ─── Phase B: gather signals ─────────────────────────────────────────
export async function searchGithub(
  keyword: string,
  limit = 5,
): Promise<GithubHit[]> {
  try {
    const q = encodeURIComponent(keyword);
    const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=${limit}`;
    const resp = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "vibexforge-validator/1.0",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    });
    if (!resp.ok) return [];
    const data = (await resp.json()) as {
      items?: {
        full_name: string;
        description: string | null;
        stargazers_count: number;
        html_url: string;
        language: string | null;
      }[];
    };
    return (data.items || []).slice(0, limit).map((r) => ({
      full_name: r.full_name,
      description: r.description,
      stars: r.stargazers_count,
      url: r.html_url,
      language: r.language,
    }));
  } catch {
    return [];
  }
}

export async function searchHN(keyword: string, limit = 5): Promise<HNHit[]> {
  try {
    const q = encodeURIComponent(keyword);
    // 12 months back filter via numericFilters
    const cutoff = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000);
    const url = `https://hn.algolia.com/api/v1/search?query=${q}&tags=story&numericFilters=created_at_i>${cutoff}&hitsPerPage=${limit}`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "vibexforge-validator/1.0" },
    });
    if (!resp.ok) return [];
    const data = (await resp.json()) as {
      hits?: {
        title: string;
        url: string | null;
        points: number;
        num_comments: number;
        created_at: string;
      }[];
    };
    return (data.hits || []).slice(0, limit).map((h) => ({
      title: h.title,
      url: h.url,
      points: h.points,
      num_comments: h.num_comments,
      created_at: h.created_at,
    }));
  } catch {
    return [];
  }
}

const RELEVANT_SUBREDDITS = [
  "SideProject",
  "Entrepreneur",
  "indiebiz",
  "startups",
  "EntrepreneurRideAlong",
];

export async function searchReddit(
  keyword: string,
  limit = 5,
): Promise<RedditHit[]> {
  const out: RedditHit[] = [];
  for (const sub of RELEVANT_SUBREDDITS) {
    if (out.length >= limit) break;
    try {
      const q = encodeURIComponent(keyword);
      const url = `https://www.reddit.com/r/${sub}/search.json?q=${q}&sort=relevance&restrict_sr=1&t=year&limit=3`;
      const resp = await fetch(url, {
        headers: { "User-Agent": "vibexforge-validator/1.0" },
      });
      if (!resp.ok) continue;
      const data = (await resp.json()) as {
        data?: {
          children?: {
            data: {
              title: string;
              permalink: string;
              subreddit: string;
              num_comments: number;
              score: number;
              created_utc: number;
            };
          }[];
        };
      };
      for (const c of data.data?.children || []) {
        out.push({
          title: c.data.title,
          permalink: `https://reddit.com${c.data.permalink}`,
          subreddit: c.data.subreddit,
          num_comments: c.data.num_comments,
          score: c.data.score,
          created_utc: c.data.created_utc,
        });
        if (out.length >= limit) break;
      }
    } catch {
      continue;
    }
  }
  return out;
}

export async function gatherSignals(
  extraction: IdeaExtraction,
): Promise<SignalBundle> {
  const primary = extraction.keywords[0] || extraction.category;
  const [github, hn, reddit] = await Promise.all([
    searchGithub(primary, 5),
    searchHN(primary, 5),
    searchReddit(primary, 5),
  ]);
  return { github, hn, reddit };
}

// ─── Phase C+D: synthesize + verdict ─────────────────────────────────
const SYNTHESIZE_SYSTEM = `You are a brutally honest startup advisor evaluating an idea's PMF prospects. Use the live signal data provided to write a 5-section validation report. Output strict JSON matching the schema. No markdown, no commentary outside JSON.

Schema:
{
  "competitors": {
    "summary": "1-2 sentences on how crowded the space is",
    "items": [{"name": "...", "url": "...", "differentiator": "what makes this entry distinct"}]
  },
  "demand_signals": {
    "summary": "1-2 sentences narrative",
    "reddit_post_count": <int from signals>,
    "hn_post_count": <int from signals>,
    "avg_hn_points": <number>,
    "quantified_verdict": "high" | "mid" | "low"
  },
  "whats_built": {
    "summary": "1-2 sentences",
    "missing_features": ["thing competitors don't do"],
    "pain_points": ["what users complain about in Reddit threads"],
    "pricing_distribution": "free / freemium / paid summary"
  },
  "white_space": {
    "summary": "1-2 sentence pitch for the differentiation angle",
    "angles": [
      {"tagline": "...", "estimated_mrr_ceiling": "$X-$Y", "reasoning": "..."}
    ]
  },
  "verdict": {
    "pmf_score": <int 0-100>,
    "recommendation": "BUILD" | "ITERATE" | "SKIP",
    "one_liner": "the punchline",
    "axes": {"demand": <0-100>, "competition": <0-100 inverted: high=crowded bad>, "differentiation": <0-100>, "feasibility": <0-100>},
    "analogy": "This is more like X"
  }
}

Tone: Garry Tan / PG honesty. Cite the signals (numbers, repo names) in your reasoning.`;

export async function synthesizeReport(
  ideaText: string,
  extraction: IdeaExtraction,
  signals: SignalBundle,
  client: Anthropic,
): Promise<ValidatorReport | null> {
  const userPrompt = `IDEA:\n${ideaText}\n\nCATEGORY: ${extraction.category}\nKEYWORDS: ${extraction.keywords.join(", ")}\nPERSONA: ${extraction.persona}\n\n──── GITHUB TOP 5 (by stars, matching '${extraction.keywords[0]}') ────\n${JSON.stringify(signals.github, null, 2)}\n\n──── HN LAST 12 MONTHS ────\n${JSON.stringify(signals.hn, null, 2)}\n\n──── REDDIT r/SideProject + r/Entrepreneur + others ────\n${JSON.stringify(signals.reddit, null, 2)}\n\nReturn the validation report JSON.`;

  const resp = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2500,
    system: SYNTHESIZE_SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
  });
  const text = resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("")
    .trim();
  const json = text.replace(/^```json\s*|\s*```$/g, "").replace(/^```\s*|\s*```$/g, "");
  try {
    return JSON.parse(json) as ValidatorReport;
  } catch (err) {
    console.error("[validator] synthesize parse failed:", err);
    return null;
  }
}

// ─── Top-level orchestrator ──────────────────────────────────────────
export interface ValidationResult {
  ok: true;
  report: ValidatorReport;
  extraction: IdeaExtraction;
  signal_counts: { github: number; hn: number; reddit: number };
  idea_hash: string;
}

export interface ValidationError {
  ok: false;
  reason: "no_api_key" | "synthesis_failed";
  message: string;
}

export function hashIdea(ideaText: string): string {
  return createHash("sha256").update(ideaText.trim().toLowerCase()).digest("hex").slice(0, 32);
}

export async function validateIdea(
  ideaText: string,
): Promise<ValidationResult | ValidationError> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      reason: "no_api_key",
      message: "Server not configured (ANTHROPIC_API_KEY missing)",
    };
  }
  const client = new Anthropic({ apiKey });

  const extraction = await extractIdea(ideaText, client);
  const signals = await gatherSignals(extraction);
  const report = await synthesizeReport(ideaText, extraction, signals, client);
  if (!report) {
    return {
      ok: false,
      reason: "synthesis_failed",
      message: "Claude returned malformed JSON; try again.",
    };
  }

  return {
    ok: true,
    report,
    extraction,
    signal_counts: {
      github: signals.github.length,
      hn: signals.hn.length,
      reddit: signals.reddit.length,
    },
    idea_hash: hashIdea(ideaText),
  };
}
