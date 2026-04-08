import { NextResponse } from "next/server";
import { USE_SUPABASE } from "@/lib/mock-adapter";

const MOCK_BENCHMARKS = {
  categories: [
    { category: "AI Agent", avgDay1Views: 120, avgDay7Views: 450, avgUpvotes: 34, avgConversion: 8.2, projectCount: 45 },
    { category: "AI Tool", avgDay1Views: 85, avgDay7Views: 320, avgUpvotes: 28, avgConversion: 7.1, projectCount: 78 },
    { category: "AI Game", avgDay1Views: 200, avgDay7Views: 680, avgUpvotes: 52, avgConversion: 12.5, projectCount: 23 },
    { category: "AI Workflow", avgDay1Views: 65, avgDay7Views: 240, avgUpvotes: 18, avgConversion: 5.8, projectCount: 34 },
    { category: "Experimental", avgDay1Views: 150, avgDay7Views: 520, avgUpvotes: 41, avgConversion: 9.7, projectCount: 19 },
  ],
  overall: {
    medianDay1Views: 95,
    medianDay7Views: 380,
    medianUpvotes: 25,
    medianConversion: 7.5,
    topDecileDay7Views: 1200,
    topDecileUpvotes: 120,
  },
};

export async function GET() {
  // Benchmarks are computed from aggregate data
  // For now return mock data; with real data, this would query launch_outcomes
  if (!USE_SUPABASE) {
    return NextResponse.json(MOCK_BENCHMARKS);
  }

  // Real data: query launch_outcomes table and compute category/overall aggregates.
  // Until launch_outcomes is populated, return the same mock benchmarks above.
  return NextResponse.json(MOCK_BENCHMARKS);
}
