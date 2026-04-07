import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";

const MOCK_LEADERBOARD = [
  { rank: 1, project_name: "AI Dungeon Master", creator_name: "PixelMaster", wins: 42, losses: 5, draws: 3, rating: 1850 },
  { rank: 2, project_name: "RetroQuest", creator_name: "RetroQueen", wins: 38, losses: 8, draws: 4, rating: 1720 },
  { rank: 3, project_name: "NeonBattle", creator_name: "NeonHacker", wins: 35, losses: 10, draws: 5, rating: 1650 },
  { rank: 4, project_name: "VibeRPG", creator_name: "CodeWizard", wins: 30, losses: 12, draws: 8, rating: 1580 },
  { rank: 5, project_name: "PixelWars", creator_name: "SpriteKing", wins: 28, losses: 15, draws: 7, rating: 1500 },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get("seasonId") || "season-1";

  if (!USE_SUPABASE) {
    return NextResponse.json({ season: { id: seasonId, name: "Season 1: Genesis", status: "active" }, leaderboard: MOCK_LEADERBOARD });
  }

  const { data: season } = await supabase
    .from("arena_seasons")
    .select("*")
    .eq("id", seasonId)
    .single();

  const { data: leaderboard, error } = await supabase
    .from("season_leaderboard")
    .select("*")
    .eq("season_id", seasonId)
    .order("rating", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ season, leaderboard: leaderboard ?? [] });
}
