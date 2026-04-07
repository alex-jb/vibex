import { NextResponse } from "next/server";
import { createServerSupabase, getAuthUser } from "@/lib/supabase-server";
import { USE_SUPABASE } from "@/lib/mock-adapter";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params;

  if (!USE_SUPABASE) {
    return NextResponse.json({ deleted: true });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const serverSupabase = await createServerSupabase();

  // Check ownership
  const { data: post } = await serverSupabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await serverSupabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
