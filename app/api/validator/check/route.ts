/**
 * POST /api/validator/check
 *
 * Body: { idea, email?, is_public? }
 * Returns: { id, report, extraction, signal_counts, view_url }
 *
 * MVP: free during beta (Phase 1). Stripe paywall (Phase 2) gated by
 * VALIDATOR_REQUIRE_PAYMENT env var. Same pattern as LaunchKit.
 *
 * Spec: alex-brain research/projects-2026-06/06-idea-validator-spec.md
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateIdea, hashIdea } from "@/lib/idea-validator";
import { bumpScore } from "@/lib/score";

export const runtime = "nodejs";
export const maxDuration = 60;

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface Body {
  idea: string;
  email?: string;
  is_public?: boolean;
  handle?: string;
}

// Free beta limit: 1 validation per email per 24h. Paid tiers + Silver+ score bypass.
const RATE_LIMIT_PER_24H = 1;

function validate(body: unknown): Body | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const idea = typeof b.idea === "string" ? b.idea.trim() : "";
  if (!idea || idea.length < 20 || idea.length > 1000) return null;
  return {
    idea,
    email:
      typeof b.email === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email)
        ? b.email.trim()
        : undefined,
    is_public: typeof b.is_public === "boolean" ? b.is_public : false,
    handle: typeof b.handle === "string" ? b.handle.slice(0, 64) : undefined,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const input = validate(body);
  if (!input) {
    return NextResponse.json(
      {
        error:
          "Missing or invalid idea (must be 20-1000 chars). Email optional.",
      },
      { status: 400 },
    );
  }

  // Paywall + rate limit gate (only when email provided — anon stays free for first run)
  if (input.email && SUPA_URL && SUPA_ANON_KEY) {
    const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
    let bypass = false;

    // Active Pro subscription → unlimited
    try {
      const { data: sub } = await supa
        .from("validator_subscriptions")
        .select("active, current_period_end")
        .eq("email", input.email)
        .maybeSingle();
      if (sub?.active) {
        const stillValid = !sub.current_period_end ||
          new Date(sub.current_period_end).getTime() > Date.now();
        if (stillValid) bypass = true;
      }
    } catch { /* table missing → fall through */ }

    // Unused single-credit → consume it on this run
    let creditId: string | null = null;
    if (!bypass) {
      try {
        const { data: credit } = await supa
          .from("validator_credits")
          .select("id")
          .eq("email", input.email)
          .eq("used", false)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (credit) {
          creditId = credit.id;
          bypass = true;
        }
      } catch { /* table missing → fall through */ }
    }

    // Silver+ Creator Score (≥150) → bypass (perk redemption)
    if (!bypass && input.handle) {
      try {
        const { data: scoreRow } = await supa
          .from("creator_scores")
          .select("score")
          .eq("handle", input.handle.toLowerCase())
          .maybeSingle();
        if (scoreRow && (scoreRow.score ?? 0) >= 150) bypass = true;
      } catch { /* fall through */ }
    }

    // Enforce 1/24h free beta rate limit when no bypass
    if (!bypass) {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count } = await supa
          .from("idea_validations")
          .select("id", { count: "exact", head: true })
          .eq("requester_email", input.email)
          .gte("created_at", since);
        if ((count ?? 0) >= RATE_LIMIT_PER_24H) {
          return NextResponse.json(
            {
              error: `Rate limited: ${RATE_LIMIT_PER_24H} free validation per email per 24h. Upgrade to Pro ($19/mo) or reach Silver tier (150+ Creator Score) for unlimited. Single $5 also works.`,
            },
            { status: 429 },
          );
        }
      } catch { /* table missing → fall through */ }
    }

    // Mark credit as used (do this here pre-validation so concurrent calls don't double-consume)
    if (creditId) {
      try {
        await supa
          .from("validator_credits")
          .update({ used: true, used_at: new Date().toISOString() })
          .eq("id", creditId);
      } catch { /* best effort */ }
    }
  }

  // Check cache: same idea_hash within 24h returns cached row
  const ideaHash = hashIdea(input.idea);
  if (SUPA_URL && SUPA_ANON_KEY) {
    const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supa
      .from("idea_validations")
      .select(
        "id, report, idea_category, idea_keywords, target_persona, pmf_score, verdict",
      )
      .eq("idea_hash", ideaHash)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .maybeSingle();
    if (cached) {
      return NextResponse.json({
        id: cached.id,
        report: cached.report,
        extraction: {
          category: cached.idea_category,
          keywords: cached.idea_keywords,
          persona: cached.target_persona,
        },
        view_url: `/validator/${cached.id}`,
        cached: true,
      });
    }
  }

  const result = await validateIdea(input.idea);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, reason: result.reason },
      { status: 503 },
    );
  }

  let id: string | null = null;
  let viewUrl = "";

  if (SUPA_URL && SUPA_ANON_KEY) {
    const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
    const { data: inserted, error } = await supa
      .from("idea_validations")
      .insert({
        idea_text: input.idea,
        idea_category: result.extraction.category,
        idea_keywords: result.extraction.keywords,
        target_persona: result.extraction.persona,
        report: result.report,
        pmf_score: result.report.verdict?.pmf_score ?? null,
        verdict: result.report.verdict?.recommendation ?? null,
        death_probability_6m: result.report.death_axis?.probability_6m ?? null,
        death_reason: result.report.death_axis?.reason ?? null,
        requester_email: input.email,
        is_public: input.is_public === true,
        is_paid: false, // Phase 1 = free beta
        idea_hash: result.idea_hash,
      })
      .select("id")
      .single();
    if (error) {
      console.error("[validator] insert failed:", error);
    } else if (inserted) {
      id = inserted.id;
      viewUrl = `/validator/${id}`;
      if (input.handle && id) {
        await bumpScore(supa, {
          handle: input.handle,
          surface: "validator",
          ref_id: id,
          ctx: { pmf_score: result.report.verdict?.pmf_score ?? 50 },
          email: input.email,
        });
      }
    }
  }

  return NextResponse.json({
    id,
    report: result.report,
    extraction: result.extraction,
    signal_counts: result.signal_counts,
    view_url: viewUrl,
  });
}
