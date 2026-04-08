import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { serverLog } from "@/lib/logger";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ---------- GET: follow status ----------
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get("creatorId");
  const userId = searchParams.get("userId");

  if (!creatorId) {
    return NextResponse.json(
      { error: "Missing required query param: creatorId" },
      { status: 400 },
    );
  }

  if (!SUPABASE_CONFIGURED) {
    return NextResponse.json({ following: false, followerCount: 0 });
  }

  try {
    // Get follower count
    const { count: followerCount, error: countErr } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", creatorId);

    if (countErr) throw countErr;

    // Check if the given user follows this creator
    let following = false;
    if (userId) {
      const { data, error: followErr } = await supabase
        .from("follows")
        .select("id")
        .eq("creator_id", creatorId)
        .eq("follower_id", userId)
        .maybeSingle();

      if (followErr) throw followErr;
      following = !!data;
    }

    return NextResponse.json({ following, followerCount: followerCount ?? 0 });
  } catch (error) {
    const errorId = crypto.randomUUID().slice(0, 8);
    serverLog.error(errorId, "Follow status error", error);
    return NextResponse.json(
      { error: "Failed to fetch follow status", errorId },
      { status: 500 },
    );
  }
}

// ---------- POST: toggle follow ----------
export async function POST(request: Request) {
  const body = await request.json();
  const { creatorId, userId } = body;

  if (!creatorId || !userId) {
    return NextResponse.json(
      { error: "Missing required fields: creatorId, userId" },
      { status: 400 },
    );
  }

  if (!SUPABASE_CONFIGURED) {
    // Mock toggle: always returns "now following"
    return NextResponse.json({ following: true, followerCount: 1 });
  }

  try {
    // Check existing follow
    const { data: existing, error: checkErr } = await supabase
      .from("follows")
      .select("id")
      .eq("creator_id", creatorId)
      .eq("follower_id", userId)
      .maybeSingle();

    if (checkErr) throw checkErr;

    if (existing) {
      // Unfollow
      const { error: delErr } = await supabase
        .from("follows")
        .delete()
        .eq("id", existing.id);

      if (delErr) throw delErr;
    } else {
      // Follow
      const { error: insErr } = await supabase
        .from("follows")
        .insert({ creator_id: creatorId, follower_id: userId });

      if (insErr) throw insErr;
    }

    // Return updated state
    const { count: followerCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", creatorId);

    return NextResponse.json({
      following: !existing,
      followerCount: followerCount ?? 0,
    });
  } catch (error) {
    const errorId = crypto.randomUUID().slice(0, 8);
    serverLog.error(errorId, "Follow toggle error", error);
    return NextResponse.json(
      { error: "Failed to toggle follow", errorId },
      { status: 500 },
    );
  }
}
