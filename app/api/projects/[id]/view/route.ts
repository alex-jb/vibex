import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/projects/:id/view
 *
 * Bumps projects.views by 1 via the SECURITY DEFINER increment_view
 * RPC (migration 041). Anonymous — any visit to /project/:id counts.
 *
 * Found 2026-04-17: views was displayed on the detail page + used as
 * an evolution-stage threshold, but nothing was incrementing it. All
 * seeded rows had whatever the mock data set; all user-submitted rows
 * stayed at 0 forever. Pairs with the PlayableDemo play pingback.
 *
 * Rate-limited 60/min/IP — more permissive than plays (views fire on
 * every page load, plays fire on demo interaction).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // See /api/projects/[id]/play for rationale — seed ids are 1-2 chars.
  if (!id || id.length > 64) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit(`${ip}:view:${id}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
    );
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("increment_view", { p_id: id });

  if (error) {
    console.error("[view] increment_view rpc failed", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
