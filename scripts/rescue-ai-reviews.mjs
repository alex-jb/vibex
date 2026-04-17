#!/usr/bin/env node
/**
 * One-shot rescue script for projects that submitted before the
 * 2026-04-17 submit-pipeline fix and never got an ai_reviews row.
 *
 * Usage (from repo root):
 *
 *   ANTHROPIC_API_KEY=sk-ant-... \
 *   SUPABASE_URL=https://<project>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/rescue-ai-reviews.mjs [--dry-run]
 *
 * What it does:
 *   1. Finds every project where ai_reviews row is missing OR score = 0.
 *   2. If the project's description is the GitHub "Contribute to X/Y
 *      development..." boilerplate, fetches the real README first so
 *      Claude has something to review against.
 *   3. Calls Claude haiku-4-5 with the same prompt used by the submit
 *      pipeline (see lib/ai.ts and .private/ai.ts — this script mirrors
 *      them exactly, don't drift).
 *   4. Upserts ai_reviews row + updates projects.score to the compound.
 *
 * Pass --dry-run to print what would change without writing.
 *
 * Idempotent — safe to re-run.
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const MODEL = "claude-haiku-4-5";
const DRY = process.argv.includes("--dry-run");

const {
  ANTHROPIC_API_KEY,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
} = process.env;

const supabaseUrl = SUPABASE_URL || NEXT_PUBLIC_SUPABASE_URL;

if (!ANTHROPIC_API_KEY || !supabaseUrl || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing env. Need: ANTHROPIC_API_KEY, SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const claude = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function isGithubBoilerplate(description) {
  return /^Contribute to [\w.-]+\/[\w.-]+ development by creating an account on GitHub\.?$/i.test(
    (description || "").trim(),
  );
}

async function fetchGithubReadme(demoUrl) {
  const m = (demoUrl || "").match(/github\.com\/([^\/]+)\/([^\/?#]+)/);
  if (!m) return null;
  const [, owner, repoRaw] = m;
  const repo = repoRaw.replace(/\.git$/, "");
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Accept: "application/vnd.github.raw",
          "User-Agent": "VibeX-rescue-script",
        },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) return null;
    return (await res.text()).slice(0, 4000);
  } catch {
    return null;
  }
}

async function reviewOne(project) {
  let description = project.description || "";
  if (project.demo_url && (isGithubBoilerplate(description) || description.length < 80)) {
    const readme = await fetchGithubReadme(project.demo_url);
    if (readme) {
      description = `${description}\n\n--- README (excerpt) ---\n${readme}`;
      console.log(`  ↳ fetched README for ${project.demo_url} (${readme.length} chars)`);
    }
  }

  const response = await claude.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `You are an expert AI project reviewer for VibeX, a platform for AI-native creations.
Evaluate projects on these dimensions (0-100 scale):
- originality: How novel and unique is this idea?
- clarity: How well-defined and understandable is the project?
- uxPotential: How good could the user experience be?
- viralityPotential: How likely is this to spread organically?
- investorCuriosity: How interesting would this be to investors?

Also provide 2-3 strengths, 2-3 weaknesses, and 2-3 actionable suggestions.
Respond ONLY with valid JSON matching the exact schema.`,
    messages: [
      {
        role: "user",
        content: `Review this project:
Title: ${project.title}
Tagline: ${project.tagline || ""}
Description: ${description}
Category: ${project.category || ""}
Tags: ${(project.tags || []).join(", ")}

Respond with JSON: {"originality":N,"clarity":N,"uxPotential":N,"viralityPotential":N,"investorCuriosity":N,"strengths":["..."],"weaknesses":["..."],"suggestions":["..."]}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text")?.text || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch?.[0] || "{}");
}

async function main() {
  // Pull candidates: projects where score = 0 OR no ai_reviews row yet.
  // The LEFT JOIN shape keeps orphans in the result set even without a
  // matching ai_reviews row.
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, tagline, description, category, tags, demo_url, score, ai_reviews(project_id)")
    .or("score.eq.0,score.is.null");

  if (error) {
    console.error("Failed to fetch projects", error);
    process.exit(1);
  }

  const orphans = (projects || []).filter(
    (p) => !p.ai_reviews || (Array.isArray(p.ai_reviews) && p.ai_reviews.length === 0),
  );

  console.log(`Found ${orphans.length} orphan project(s):`);
  for (const p of orphans) {
    console.log(`  - ${p.id}  "${p.title}"`);
  }
  if (!orphans.length) return;

  if (DRY) {
    console.log("\n--dry-run: stopping before Claude + DB writes.");
    return;
  }

  for (const p of orphans) {
    console.log(`\n→ reviewing ${p.id} "${p.title}"`);
    const review = await reviewOne(p);
    const compound = Math.round(
      (review.originality +
        review.clarity +
        review.uxPotential +
        review.viralityPotential +
        review.investorCuriosity) /
        5,
    );
    console.log(
      `  scores: O=${review.originality} C=${review.clarity} UX=${review.uxPotential} V=${review.viralityPotential} I=${review.investorCuriosity} → compound=${compound}`,
    );

    const { error: upsertErr } = await supabase.from("ai_reviews").upsert(
      {
        project_id: p.id,
        originality: review.originality,
        clarity: review.clarity,
        ux_potential: review.uxPotential,
        virality_potential: review.viralityPotential,
        investor_curiosity: review.investorCuriosity,
        strengths: review.strengths || [],
        weaknesses: review.weaknesses || [],
        suggestions: review.suggestions || [],
      },
      { onConflict: "project_id" },
    );
    if (upsertErr) {
      console.error(`  upsert failed:`, upsertErr);
      continue;
    }

    const { error: scoreErr } = await supabase
      .from("projects")
      .update({ score: compound })
      .eq("id", p.id);
    if (scoreErr) {
      console.error(`  score update failed:`, scoreErr);
      continue;
    }
    console.log(`  ✓ persisted`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
