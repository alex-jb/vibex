import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";
import { USE_SUPABASE } from "@/lib/mock-adapter";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params;

  if (!USE_SUPABASE) {
    return NextResponse.json({ liked: true, likes: 1 });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  // Atomic like toggle via RPC function
  const { data, error } = await supabase.rpc("toggle_like", {
    p_post_id: postId,
    p_user_id: user.id,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
