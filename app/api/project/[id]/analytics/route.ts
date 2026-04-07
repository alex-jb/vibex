import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";

// Mock analytics data
function generateMockDailyStats(days: number) {
  const stats = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    stats.push({
      day: d.toISOString().split("T")[0],
      views: Math.floor(Math.random() * 50) + 5,
      clicks: Math.floor(Math.random() * 20) + 2,
      shares: Math.floor(Math.random() * 8),
      upvotes: Math.floor(Math.random() * 10),
      demo_plays: Math.floor(Math.random() * 15),
    });
  }
  return stats;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  if (!USE_SUPABASE) {
    const dailyStats = generateMockDailyStats(14);
    const totals = dailyStats.reduce(
      (acc, d) => ({
        views: acc.views + d.views,
        clicks: acc.clicks + d.clicks,
        shares: acc.shares + d.shares,
        upvotes: acc.upvotes + d.upvotes,
        demo_plays: acc.demo_plays + d.demo_plays,
      }),
      { views: 0, clicks: 0, shares: 0, upvotes: 0, demo_plays: 0 },
    );

    return NextResponse.json({
      projectId,
      period: "14d",
      totals,
      daily: dailyStats,
      conversionRate: totals.views > 0 ? Math.round((totals.clicks / totals.views) * 1000) / 10 : 0,
    });
  }

  const { data, error } = await supabase
    .from("project_daily_stats")
    .select("*")
    .eq("project_id", projectId)
    .order("day", { ascending: true })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dailyStats = data ?? [];
  const totals = dailyStats.reduce(
    (acc, d) => ({
      views: acc.views + (d.views ?? 0),
      clicks: acc.clicks + (d.clicks ?? 0),
      shares: acc.shares + (d.shares ?? 0),
      upvotes: acc.upvotes + (d.upvotes ?? 0),
      demo_plays: acc.demo_plays + (d.demo_plays ?? 0),
    }),
    { views: 0, clicks: 0, shares: 0, upvotes: 0, demo_plays: 0 },
  );

  return NextResponse.json({
    projectId,
    period: "30d",
    totals,
    daily: dailyStats,
    conversionRate: totals.views > 0 ? Math.round((totals.clicks / totals.views) * 1000) / 10 : 0,
  });
}
