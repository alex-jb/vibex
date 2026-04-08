import { supabase } from "./supabase";
import { projects as mockProjects, creators as mockCreators } from "./mock-data";

const USE_SUPABASE = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "allTime";

export interface LeaderboardEntry {
  rank: number;
  projectId: string;
  title: string;
  creatorName: string;
  score: number;
  upvotes: number;
  views: number;
  category: string;
  change: number; // rank change from previous period (+2 = moved up 2)
}

export async function getProjectLeaderboard(
  period: LeaderboardPeriod,
  limit = 10
): Promise<LeaderboardEntry[]> {
  if (!USE_SUPABASE) {
    // Mock: sort projects by different criteria per period
    const sorted = [...mockProjects];
    switch (period) {
      case "daily": sorted.sort((a, b) => b.score - a.score); break;
      case "weekly": sorted.sort((a, b) => b.upvotes - a.upvotes); break;
      case "monthly": sorted.sort((a, b) => b.views - a.views); break;
      case "allTime": sorted.sort((a, b) => b.score - a.score); break;
    }
    return sorted.slice(0, limit).map((p, i) => ({
      rank: i + 1,
      projectId: p.id,
      title: p.title,
      creatorName: p.creatorName,
      score: p.score,
      upvotes: p.upvotes,
      views: p.views,
      category: p.category,
      change: Math.floor(Math.random() * 5) - 2, // mock rank change
    }));
  }

  // Supabase query - order by relevant metric
  const orderField = period === "weekly" ? "upvotes" : period === "monthly" ? "views" : "score";
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, creator_id, score, upvotes, views, category, creators(name)")
    .order(orderField, { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((p: Record<string, unknown>, i: number) => ({
    rank: i + 1,
    projectId: p.id as string,
    title: p.title as string,
    creatorName: (p.creators as Record<string, unknown> | null)?.name as string || "",
    score: p.score as number,
    upvotes: p.upvotes as number,
    views: p.views as number,
    category: p.category as string,
    change: 0,
  }));
}

export interface CreatorLeaderboardEntry {
  rank: number;
  creatorId: string;
  name: string;
  projectCount: number;
  totalUpvotes: number;
  weeklyGrowth: number;
  badges: string[];
  change: number;
}

export async function getCreatorLeaderboard(limit = 10): Promise<CreatorLeaderboardEntry[]> {
  if (!USE_SUPABASE) {
    return [...mockCreators]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit)
      .map((c, i) => ({
        rank: i + 1,
        creatorId: c.id,
        name: c.name,
        projectCount: c.projectCount,
        totalUpvotes: c.totalUpvotes,
        weeklyGrowth: c.weeklyGrowth,
        badges: c.badges,
        change: Math.floor(Math.random() * 3) - 1,
      }));
  }

  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .order("rank", { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return data.map((c: Record<string, unknown>, i: number) => ({
    rank: i + 1,
    creatorId: c.id as string,
    name: c.name as string,
    projectCount: (c.project_count as number) || 0,
    totalUpvotes: (c.total_upvotes as number) || 0,
    weeklyGrowth: Number(c.weekly_growth) || 0,
    badges: (c.badges as string[]) || [],
    change: 0,
  }));
}
