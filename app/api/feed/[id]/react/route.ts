import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";
import { USE_SUPABASE } from "@/lib/mock-adapter";

export type ReactionType = "fire" | "game" | "art" | "mindblown";

const VALID_TYPES: ReactionType[] = ["fire", "game", "art", "mindblown"];

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

  const { type } = body as { type?: string };

  if (!type || !VALID_TYPES.includes(type as ReactionType)) {
    return NextResponse.json(
      { error: `Invalid reaction type. Must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  if (!USE_SUPABASE) {
    // Mock: always return reacted with fake counts
    return NextResponse.json({
      reacted: true,
      type,
      counts: { fire: 3, game: 2, art: 1, mindblown: 1 },
    });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const { data, error } = await supabase.rpc("toggle_reaction", {
    p_post_id: postId,
    p_user_id: user.id,
    p_type: type,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
