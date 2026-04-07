import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";

const MOCK_TAGS = [
  { tag: "vibecoding", post_count: 42 },
  { tag: "pixelart", post_count: 28 },
  { tag: "gamedev", post_count: 25 },
  { tag: "ai", post_count: 22 },
  { tag: "retro", post_count: 18 },
  { tag: "rpg", post_count: 15 },
  { tag: "indie", post_count: 12 },
  { tag: "procedural", post_count: 9 },
];

export async function GET() {
  if (!USE_SUPABASE) {
    return NextResponse.json(MOCK_TAGS);
  }

  const { data, error } = await supabase
    .from("trending_hashtags")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
