import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerSupabase, getAuthUser } from "@/lib/supabase-server";
import { USE_SUPABASE } from "@/lib/mock-adapter";

const VALID_REASONS = ["spam", "harassment", "nsfw", "misinformation", "other"] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { reason, details } = body as { reason?: string; details?: string };

  if (!reason || !VALID_REASONS.includes(reason as typeof VALID_REASONS[number])) {
    return NextResponse.json(
      { error: `Invalid reason. Must be one of: ${VALID_REASONS.join(", ")}` },
      { status: 400 },
    );
  }

  if (!USE_SUPABASE) {
    return NextResponse.json({ reported: true, reason });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  // Verify post exists
  const { data: post } = await supabase
    .from("posts")
    .select("id, user_id")
    .eq("id", postId)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Can't report own posts
  if (post.user_id === user.id) {
    return NextResponse.json(
      { error: "Cannot report your own post" },
      { status: 400 },
    );
  }

  const serverSupabase = await createServerSupabase();
  const { error } = await serverSupabase
    .from("post_reports")
    .insert({
      post_id: postId,
      reporter_id: user.id,
      reason,
      details: details?.slice(0, 500) ?? null,
    });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You have already reported this post" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-flag posts with 3+ reports
  const { count } = await supabase
    .from("post_reports")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId)
    .eq("status", "pending");

  if (count && count >= 3) {
    await supabase
      .from("posts")
      .update({ moderation_status: "flagged" })
      .eq("id", postId);
  }

  return NextResponse.json({ reported: true, reason });
}
