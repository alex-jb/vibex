import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";
import { requireRole } from "@/lib/rbac";

// GET: platform analytics
// Access: moderator+ (matches the /api/admin/moderation route policy).
// The mock branch is left open because it returns canned demo data with no
// real user info — same posture as the rest of the mock layer.
export async function GET() {
  if (!USE_SUPABASE) {
    return NextResponse.json({
      overview: {
        totalUsers: 1247,
        totalPosts: 3842,
        totalReactions: 15680,
        totalProjects: 456,
        totalAgents: 89,
        totalBattles: 2341,
      },
      daily: {
        postsToday: 47,
        reactionsToday: 238,
        newUsersToday: 12,
        activeUsersToday: 156,
      },
      topCreators: [
        { name: "PixelMaster", posts: 142, reactions_received: 2840, level: "Master" },
        { name: "CodeWizard", posts: 98, reactions_received: 1950, level: "Builder" },
        { name: "NeonHacker", posts: 87, reactions_received: 1620, level: "Builder" },
        { name: "RetroQueen", posts: 76, reactions_received: 1480, level: "Coder" },
        { name: "AITrainer", posts: 65, reactions_received: 1200, level: "Coder" },
      ],
      topHashtags: [
        { tag: "vibecoding", count: 342 },
        { tag: "pixelart", count: 218 },
        { tag: "gamedev", count: 195 },
        { tag: "ai", count: 167 },
        { tag: "retro", count: 134 },
      ],
      growth: {
        postsWeekOverWeek: 23,  // percent
        usersWeekOverWeek: 15,
        reactionsWeekOverWeek: 31,
      },
    });
  }

  const auth = await requireRole("moderator");
  if (auth instanceof Response) return auth;

  // Real queries
  const [postsResult, reactionsResult, reportsResult] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("post_reactions").select("*", { count: "exact", head: true }),
    supabase.from("post_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  // Posts today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: postsToday } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  // Top hashtags
  const { data: topTags } = await supabase
    .from("trending_hashtags")
    .select("*")
    .limit(10);

  return NextResponse.json({
    overview: {
      totalPosts: postsResult.count ?? 0,
      totalReactions: reactionsResult.count ?? 0,
      pendingReports: reportsResult.count ?? 0,
    },
    daily: {
      postsToday: postsToday ?? 0,
    },
    topHashtags: topTags ?? [],
  });
}
