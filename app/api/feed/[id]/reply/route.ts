import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerSupabase, getAuthUser } from "@/lib/supabase-server";
import { validateString, sanitize } from "@/lib/validate";
import { checkRateLimit } from "@/lib/rate-limit";
import { USE_SUPABASE } from "@/lib/mock-adapter";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: parentId } = await params;

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`${ip}:feed-reply`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { content } = body as { content?: string };

  const contentErr = validateString(content, "content", { min: 1, max: 500 });
  if (contentErr) {
    return NextResponse.json({ error: contentErr }, { status: 400 });
  }

  if (!USE_SUPABASE) {
    return NextResponse.json(
      {
        id: `post-reply-${Date.now()}`,
        user_id: "mock-user",
        user_name: "MockUser",
        user_avatar: null,
        content: sanitize(content!.trim()),
        project_id: null,
        parent_id: parentId,
        likes: 0,
        replies_count: 0,
        reposts: 0,
        created_at: new Date().toISOString(),
      },
      { status: 201 },
    );
  }

  // Verify parent post exists
  const { data: parent } = await supabase
    .from("posts")
    .select("id")
    .eq("id", parentId)
    .single();

  if (!parent) {
    return NextResponse.json(
      { error: "Parent post not found" },
      { status: 404 },
    );
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const displayName =
    (user.user_metadata?.full_name as string) ??
    (user.user_metadata?.name as string) ??
    user.email?.split("@")[0] ??
    "User";

  const serverSupabase = await createServerSupabase();
  const { data, error } = await serverSupabase
    .from("posts")
    .insert({
      user_id: user.id,
      user_name: displayName,
      user_avatar: user.user_metadata?.avatar_url ?? null,
      content: sanitize(content!.trim()),
      parent_id: parentId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Increment parent's replies_count (best effort)
  try {
    await supabase.rpc("increment_replies_count", { p_post_id: parentId });
  } catch {
    // Counter may drift, but the reply itself is saved
  }

  return NextResponse.json(data, { status: 201 });
}
