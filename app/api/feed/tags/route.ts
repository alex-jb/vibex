import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";

const MOCK_TAGS = [
  { tag: "vibecoding", post_count: 42, trending_score: 95 },
  { tag: "pixelart", post_count: 28, trending_score: 72 },
  { tag: "gamedev", post_count: 25, trending_score: 68 },
  { tag: "ai", post_count: 22, trending_score: 60 },
  { tag: "retro", post_count: 18, trending_score: 48 },
  { tag: "rpg", post_count: 15, trending_score: 40 },
  { tag: "indie", post_count: 12, trending_score: 30 },
  { tag: "procedural", post_count: 9, trending_score: 20 },
  { tag: "\u6700\u5F3A\u7FFB\u8BD1\u673A", post_count: 8, trending_score: 55 },
  { tag: "\u81EA\u52A8\u5316\u6253\u5DE5\u4EBA", post_count: 6, trending_score: 45 },
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

  // Compute trending_score based on post_count and recency
  const enriched = (data ?? []).map((tag: { tag: string; post_count: number; updated_at?: string }) => {
    const recencyWeight = tag.updated_at
      ? Math.max(0, 1 - (Date.now() - new Date(tag.updated_at).getTime()) / (7 * 24 * 60 * 60 * 1000))
      : 0.5;
    return {
      ...tag,
      trending_score: Math.round(tag.post_count * recencyWeight * 10),
    };
  });

  // Sort by trending score descending
  enriched.sort((a: { trending_score: number }, b: { trending_score: number }) => b.trending_score - a.trending_score);

  return NextResponse.json(enriched);
}
