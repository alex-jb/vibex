import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";

const MOCK_PATTERNS = [
  { pattern_name: "tuesday_launch", pattern_type: "timing", description: "Launching on Tuesday or Wednesday gets 40% more initial views than weekends", evidence_count: 156, avg_impact: 40, confidence: 0.85 },
  { pattern_name: "short_title", pattern_type: "copy", description: "Titles under 6 words get 25% more clicks than longer titles", evidence_count: 234, avg_impact: 25, confidence: 0.78 },
  { pattern_name: "demo_first", pattern_type: "strategy", description: "Projects with a playable demo get 3x more engagement than description-only", evidence_count: 89, avg_impact: 200, confidence: 0.92 },
  { pattern_name: "reddit_before_twitter", pattern_type: "channel", description: "Posting to relevant subreddits before Twitter generates more authentic discussion", evidence_count: 67, avg_impact: 35, confidence: 0.72 },
  { pattern_name: "problem_lead", pattern_type: "copy", description: "Descriptions starting with the problem (not the solution) convert 30% better", evidence_count: 198, avg_impact: 30, confidence: 0.81 },
  { pattern_name: "social_proof_early", pattern_type: "strategy", description: "Showing early user count/testimonials in first week boosts retention 45%", evidence_count: 45, avg_impact: 45, confidence: 0.68 },
  { pattern_name: "ai_category_saturated", pattern_type: "category", description: "Generic 'AI Assistant' category is oversaturated. Niche categories get 60% more attention", evidence_count: 312, avg_impact: 60, confidence: 0.88 },
  { pattern_name: "gif_preview", pattern_type: "copy", description: "Adding a GIF preview increases demo click-through by 55%", evidence_count: 123, avg_impact: 55, confidence: 0.82 },
];

export async function GET() {
  if (!USE_SUPABASE) {
    return NextResponse.json({ patterns: MOCK_PATTERNS });
  }

  const { data, error } = await supabase
    .from("growth_patterns")
    .select("*")
    .order("confidence", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ patterns: data ?? [] });
}
