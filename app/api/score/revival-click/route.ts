/**
 * POST /api/score/revival-click
 *
 * Body: { funeral_id, handle }
 *
 * Called when a user clicks "Try Again on Validator" from a funeral memorial.
 * Bumps creator_score with surface=revival, delta=40.
 *
 * Dedupe by ref_id is handled at the RPC level (24h window per funeral_id).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { bumpScore } from "@/lib/score";

export const runtime = "nodejs";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { funeral_id?: string; handle?: string }
    | null;
  const funeralId = body?.funeral_id;
  const handle = body?.handle;
  if (!funeralId || !handle) {
    return NextResponse.json({ error: "funeral_id + handle required" }, { status: 400 });
  }
  if (!SUPA_URL || !SUPA_ANON_KEY) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 500 });
  }
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const result = await bumpScore(supa, {
    handle,
    surface: "revival",
    ref_id: funeralId,
  });
  return NextResponse.json({ score: result });
}
