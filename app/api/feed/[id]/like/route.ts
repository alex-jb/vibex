import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

  const { userId } = body as { userId?: string };

  if (!userId) {
    return NextResponse.json(
      { error: "Missing required field: userId" },
      { status: 400 },
    );
  }

  if (!USE_SUPABASE) {
    // Mock toggle: always returns liked with a random-ish count
    return NextResponse.json({ liked: true, likes: 1 });
  }

  try {
    // Check if already liked
    const { data: existing, error: checkErr } = await supabase
      .from("post_likes")
      .select("user_id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkErr) throw checkErr;

    if (existing) {
      // Unlike: remove from post_likes and decrement
      const { error: delErr } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (delErr) throw delErr;

      const { data: current } = await supabase
        .from("posts")
        .select("likes")
        .eq("id", postId)
        .single();

      const newLikes = Math.max(0, (current?.likes ?? 1) - 1);
      const { error: updateErr } = await supabase
        .from("posts")
        .update({ likes: newLikes })
        .eq("id", postId);

      if (updateErr) throw updateErr;

      return NextResponse.json({ liked: false, likes: newLikes });
    } else {
      // Like: insert into post_likes and increment
      const { error: insErr } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: userId });

      if (insErr) throw insErr;

      const { data: current } = await supabase
        .from("posts")
        .select("likes")
        .eq("id", postId)
        .single();

      const newLikes = (current?.likes ?? 0) + 1;
      const { error: updateErr } = await supabase
        .from("posts")
        .update({ likes: newLikes })
        .eq("id", postId);

      if (updateErr) throw updateErr;

      return NextResponse.json({ liked: true, likes: newLikes });
    }
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 },
    );
  }
}
