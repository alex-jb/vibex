import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/projects/:id/play
 *
 * Increments projects.plays by 1 via the SECURITY DEFINER RPC
 * increment_play (see migration 040). Anonymous — anyone viewing a
 * project page should bump the counter when they interact with the
 * embedded demo.
 *
 * Rate-limited at 30 plays/min per IP so one enthusiastic click
 * can't inflate the counter.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id || id.length < 3 || id.length > 64) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit(`${ip}:play:${id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
    );
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("increment_play", { p_id: id });

  if (error) {
    console.error("[play] increment_play rpc failed", error);
    return NextResponse.json(
      { error: "Failed to record play" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
