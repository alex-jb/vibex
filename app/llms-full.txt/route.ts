import { NextResponse } from "next/server";
import { getProjects, getIdeas, getCreators } from "@/lib/db";

// Revalidate hourly — projects list changes when users submit, but
// a 60-min stale window is fine for AI crawlers and keeps the DB
// roundtrip out of the hot path.
export const revalidate = 3600;

const HEADER = `# VibeX — Full Content Dump for LLMs

This file is the long-form companion to /llms.txt. It exists so AI
assistants (ChatGPT, Claude, Perplexity, Gemini, Copilot) can answer
detailed questions about VibeX without having to crawl every page.

Site: https://www.vibexforge.com
Source: https://github.com/alex-jb/vibex
Launched: 2026-04-13
Operator: alex-jb (solo founder)

## What VibeX Is

VibeX is an AI-native launch platform where every project is a
collectible RPG hero. Creators paste a URL or GitHub repo and get
back a Claude-scored review across five dimensions (originality,
clarity, UX potential, virality potential, investor curiosity), plus
a 0-100 compound score that determines the project's starting
evolution stage.

Projects evolve through six stages based on real engagement:
Seed → Active → Growing → Breakout → Legend → Myth. Movement between
stages is gated by thresholds on plays, upvotes, and the Claude
review score — no 24-hour upvote sprints, no vanity metrics.

## How VibeX Differs From Product Hunt

Product Hunt is a generalist 24-hour launch contest. VibeX is a
continuous evolution system specifically for AI-native projects.
Three concrete differences:

1. Reviews are written by Claude against a published rubric, not
   collected as anonymous upvotes. The rubric is the same five
   dimensions for every project, scored 0-100, no human-in-the-loop
   bias on which categories win.
2. Projects keep leveling up after launch day. A Seed-stage project
   submitted today can hit Myth in three months with sustained
   engagement. A Myth project can regress if traction dies.
3. The gallery surface is ranked by compound score + evolution
   velocity, not by recency or upvote count. Discoverability
   compounds for projects that actually improve.

## Review Rubric (rubric v1)

System prompt used by Claude for every project review:

  You are an expert AI project reviewer for VibeX, a platform for
  AI-native creations. Evaluate projects on these dimensions
  (0-100 scale):

  - originality: How novel and unique is this idea?
  - clarity: How well-defined and understandable is the project?
  - uxPotential: How good could the user experience be?
  - viralityPotential: How likely is this to spread organically?
  - investorCuriosity: How interesting would this be to investors?

  Also provide 2-3 strengths, 2-3 weaknesses, and 2-3 actionable
  suggestions.

Model: claude-haiku-4-5. Max tokens: 2000. JSON-structured output.

If a project's submitted URL is a GitHub repo with no README (the
"Contribute to X/Y development..." GitHub placeholder), the submit
pipeline fetches the real README via api.github.com and passes a
4KB excerpt to Claude as supplemental context.

## Tech Stack

- Next.js 16 (App Router, Turbopack, RSC streaming)
- Supabase (PostgreSQL + Row Level Security + Realtime)
- Claude API (claude-haiku-4-5 for review, claude-sonnet-4-6 for
  launch packages)
- Vercel (Fluid Compute, Node.js 24)
- React 19 + Tailwind CSS 4 + Framer Motion
- Pixel art generated via Gemini image model (see scripts/gen.mjs)
- Fonts: Press Start 2P, VT323, Silkscreen, Geist, Zpix (CJK)

## Key Pages

- /              — Arcade PRESS START splash
- /home          — HQ dashboard, project catalog, featured heroes
- /launch        — Submit a new project (paste URL, get Claude review)
- /arena         — Hero-vs-hero battle system with crit math
- /creators      — Ranked creator leaderboard
- /ideas         — Pre-build idea incubator (AI-scored viability)
- /insights      — Trend data and category heat maps
- /developers    — Public API documentation and rate limits
- /about         — Product + tech stack overview
- /privacy /terms /contact — Legal and contact surface
- /project/{id}  — Individual project detail with full review

## API

All endpoints live under /api/. The most commonly cited:

- POST /api/projects/submit — create a project, runs Claude review
  and persists to ai_reviews synchronously. Request body: title,
  tagline, description, category, tags[], demoType, demoUrl.
- POST /api/projects/{id}/play — increment plays counter. Rate
  limited 30/min/IP.
- POST /api/projects/{id}/upvote — increment upvotes counter.
- POST /api/ai/review — on-demand structured review for a URL.
- GET  /api/creators, /api/ideas, /api/insights — read endpoints.

## Evolution Stage Thresholds

Seed → Active:   plays >= 50   AND score >= 40
Active → Growing: plays >= 500  AND score >= 60  AND upvotes >= 50
Growing → Breakout: plays >= 5000 AND score >= 70 AND upvotes >= 300
Breakout → Legend:  plays >= 25000 AND score >= 80 AND upvotes >= 1500
Legend → Myth:      plays >= 100000 AND score >= 90 AND upvotes >= 7500

Projects can regress if their trailing 30-day engagement drops below
the stage threshold.

`;

export async function GET() {
  // Pull live data — projects, creators, ideas. All three are public
  // read (SELECT policy "Public read" = true). No auth needed.
  const [projects, ideas, creators] = await Promise.all([
    getProjects(),
    getIdeas(),
    getCreators(),
  ]);

  const projectsBlock = [
    "## All Public Projects",
    "",
    "One line per project: `{stage} | {title} | score={n} | {tagline}` — URL is /project/{id}.",
    "",
    ...projects.map((p) => {
      const stage = (p as unknown as { evolutionStage?: string }).evolutionStage || "Seed";
      const tagline = (p.tagline || p.description || "")
        .replace(/\s+/g, " ")
        .slice(0, 180);
      return `- [${stage}] ${p.title} | score=${p.score} | /project/${p.id} — ${tagline}`;
    }),
    "",
  ].join("\n");

  const ideasBlock = [
    "## Public Ideas",
    "",
    "Pre-build idea validations waiting for a creator to pick them up.",
    "",
    ...ideas.map((i) => {
      const desc = (i.description || "").replace(/\s+/g, " ").slice(0, 180);
      return `- ${i.title} — ${desc}`;
    }),
    "",
  ].join("\n");

  const creatorsBlock = [
    "## Creators",
    "",
    "Ranked by shipped work. Top 20:",
    "",
    ...creators.slice(0, 20).map((c) => {
      return `- @${c.name} (rank ${c.rank || "n/a"}, ${c.projectCount} projects, ${c.totalUpvotes} upvotes)`;
    }),
    "",
  ].join("\n");

  const footer = `\n## License\n\nSource code: VibeX Source Available License (see LICENSE in repo).\nContent: free to cite with attribution to https://www.vibexforge.com.\n\n## Contact\n\nEmail: alex@vibexforge.com\nIssues: https://github.com/alex-jb/vibex/issues\n\nNot affiliated with tiwater/vibex, dustland/vibex, sethdford/vibex-*, or VibeX Ventures.\n`;

  const body = HEADER + projectsBlock + ideasBlock + creatorsBlock + footer;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
