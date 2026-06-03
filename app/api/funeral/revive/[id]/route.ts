/**
 * POST /api/funeral/revive/[id]
 *
 * Generates (or returns cached) Revival Judgment for a funeral memorial.
 * Idempotent — calling twice returns the same judgment without re-burning Sonnet.
 *
 * Migration 067 (funerals.revival_judgment JSONB column).
 *
 * The "clicked revive → go validate" engagement bump happens via a separate
 * /api/score/revival-click endpoint when the user actually clicks the button.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateRevivalJudgment } from "@/lib/funeral";

export const runtime = "nodejs";
export const maxDuration = 30;

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!SUPA_URL || !SUPA_ANON_KEY) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 500 });
  }
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);

  const { data: funeral, error } = await supa
    .from("funerals")
    .select("id, deceased_name, eulogy, stars, age_days_alive, language, revival_judgment")
    .eq("id", id)
    .maybeSingle();
  if (error || !funeral) {
    return NextResponse.json({ error: "funeral not found" }, { status: 404 });
  }
  if (funeral.revival_judgment) {
    return NextResponse.json({
      judgment: funeral.revival_judgment,
      cached: true,
    });
  }

  const judgment = await generateRevivalJudgment(funeral.eulogy, {
    deceased_name: funeral.deceased_name,
    stars: funeral.stars,
    age_days_alive: funeral.age_days_alive ?? undefined,
    language: funeral.language,
  });
  if (!judgment) {
    return NextResponse.json(
      { error: "Claude unavailable" },
      { status: 503 },
    );
  }

  await supa
    .from("funerals")
    .update({
      revival_judgment: judgment,
      cause_of_death: judgment.cause_of_death || "other",
    })
    .eq("id", id);

  return NextResponse.json({ judgment, cached: false });
}
