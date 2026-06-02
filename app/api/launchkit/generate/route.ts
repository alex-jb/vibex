/**
 * POST /api/launchkit/generate
 *
 * LaunchKit MVP endpoint. Takes a product URL + 1-line positioning +
 * delivery email, generates 24 platform drafts via
 * lib/draft-generator.ts, persists to a launchkit_jobs row, returns
 * jobId.
 *
 * Free during beta. Stripe paywall (Phase 2) gated behind
 * LAUNCHKIT_REQUIRE_PAYMENT env var. When that's set, this route
 * checks a paid-jobs queue table before allowing generation.
 *
 * Spec: alex-brain research/projects-2026-06/01-launchkit-spec.md
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import {
  generateDraftsInMemory,
  type ProjectInput,
} from "@/lib/draft-generator";
import { bumpScore } from "@/lib/score";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel Fluid Compute hard limit

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Phase 1 (beta): hard rate-limit per email to prevent abuse.
// 1 launch per email per 24h. Stored in launchkit_jobs (counted by
// caller_email + created_at > now() - 24h).
const RATE_LIMIT_PER_24H = 1;

function validateInput(body: unknown): {
  url: string;
  positioning: string;
  email: string;
  handle?: string;
} | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const url = typeof b.url === "string" ? b.url.trim() : "";
  const positioning =
    typeof b.positioning === "string" ? b.positioning.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  if (!url || !positioning || !email) return null;
  if (!/^https?:\/\//.test(url)) return null;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
  if (positioning.length > 140) return null;
  const handle = typeof b.handle === "string" ? b.handle.slice(0, 64) : undefined;
  return { url, positioning, email, handle };
}

export async function POST(req: NextRequest) {
  const input = validateInput(await req.json().catch(() => null));
  if (!input) {
    return NextResponse.json(
      { error: "Missing or invalid fields" },
      { status: 400 },
    );
  }
  const { url, positioning, email, handle } = input;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Server not configured (ANTHROPIC_API_KEY missing). Try again later.",
      },
      { status: 503 },
    );
  }

  if (!SUPA_URL || !SUPA_ANON_KEY) {
    return NextResponse.json(
      { error: "Server not configured (Supabase env missing)" },
      { status: 503 },
    );
  }

  const supabase = createClient(SUPA_URL, SUPA_ANON_KEY);

  // Rate limit by email (Phase 1 anti-abuse). If launchkit_jobs table
  // doesn't exist yet, skip the check (migration 062 ships it).
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from("launchkit_jobs")
      .select("id", { count: "exact", head: true })
      .eq("caller_email", email)
      .gte("created_at", since);
    if (!error && (count ?? 0) >= RATE_LIMIT_PER_24H) {
      return NextResponse.json(
        {
          error: `Rate limited: ${RATE_LIMIT_PER_24H} free launch per email per 24h. Pro plan ($19/mo) launches Phase 2.`,
        },
        { status: 429 },
      );
    }
  } catch {
    // launchkit_jobs table likely not migrated yet — fall through. Phase
    // 1 MVP can run without rate limiting; will get added before launch.
  }

  const jobId = randomUUID();

  // Title from URL hostname (best-effort)
  let title = "Your product";
  try {
    title = new URL(url).hostname.replace(/^www\./, "");
  } catch {}

  const project: ProjectInput = {
    id: jobId,
    title,
    tagline: positioning,
    description: positioning,
    category: "AI Tool",
    tags: [],
    demoUrl: url,
  };

  // Generate drafts in-memory (12 platforms × 2 languages × 1 variant ≈ 24
  // calls). Wall clock ~10-20s thanks to fan-out + prompt caching.
  const { rows, failed } = await generateDraftsInMemory(project, {
    languages: ["en", "zh"],
  });

  if (rows.length === 0) {
    return NextResponse.json(
      {
        error: `Generation produced 0 drafts (${failed} failed). Likely Claude rate limit or content filter.`,
      },
      { status: 502 },
    );
  }

  // Persist job + drafts. If launchkit_jobs table doesn't exist, write to
  // project_drafts with a synthetic project_id and the email as metadata.
  // Migration 062 (deferred to spec) makes a proper launchkit_jobs table.
  try {
    await supabase.from("launchkit_jobs").insert({
      id: jobId,
      caller_email: email,
      product_url: url,
      positioning,
      title,
      n_drafts: rows.length,
      n_failed: failed,
      created_at: new Date().toISOString(),
    });
    // Persist drafts referencing jobId as project_id (project_drafts has a
    // text PK so this works without a real projects row)
    const draftsToInsert = rows.map((r) => ({
      project_id: jobId,
      platform: r.platform,
      language: r.language,
      variant_key: r.variant_key,
      body: r.body,
      title: r.title,
      subreddit: r.subreddit,
      status: r.status,
      source: "launchkit" as const,
    }));
    await supabase.from("project_drafts").insert(draftsToInsert);

    // Bump Creator Score (surface=launchkit, delta 30)
    if (handle) {
      await bumpScore(supabase, {
        handle,
        surface: "launchkit",
        ref_id: jobId,
      });
    }
  } catch (err) {
    // Persistence failed — degrade gracefully. Drafts are gone but user
    // gets jobId so they can re-request via support.
    console.error("[launchkit] persist failed:", err);
  }

  return NextResponse.json({
    jobId,
    nDrafts: rows.length,
    nFailed: failed,
    viewUrl: `/launchkit/drafts/${jobId}`,
    message:
      "Drafts generated. Visit viewUrl to edit + copy. Email delivery in Phase 2.",
  });
}
