import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { USE_SUPABASE } from "@/lib/mock-adapter";

const MOCK_CREATORS = [
  { name: "PixelMaster", skills: ["Game Dev", "Pixel Art", "AI"], xp: 2500, launches: 8, successRate: 75, velocity: 12.5, topCategory: "AI Game", connections: 34 },
  { name: "CodeWizard", skills: ["Full-Stack", "NLP", "React"], xp: 1800, launches: 5, successRate: 80, velocity: 8.2, topCategory: "AI Tool", connections: 28 },
  { name: "NeonHacker", skills: ["Security", "AI Agent", "Python"], xp: 1200, launches: 4, successRate: 50, velocity: 15.1, topCategory: "AI Agent", connections: 22 },
  { name: "RetroQueen", skills: ["Design", "Game Dev", "Sprites"], xp: 900, launches: 3, successRate: 67, velocity: 6.8, topCategory: "AI Game", connections: 19 },
  { name: "AITrainer", skills: ["ML", "NLP", "Fine-tuning"], xp: 600, launches: 2, successRate: 100, velocity: 20.3, topCategory: "AI Tool", connections: 15 },
];

export async function GET() {
  if (!USE_SUPABASE) {
    return NextResponse.json({
      creators: MOCK_CREATORS,
      topSkills: [
        { skill: "AI", count: 12 },
        { skill: "Game Dev", count: 8 },
        { skill: "NLP", count: 7 },
        { skill: "Full-Stack", count: 6 },
        { skill: "Design", count: 5 },
      ],
      risingCreators: MOCK_CREATORS.sort((a, b) => b.velocity - a.velocity).slice(0, 3),
    });
  }

  const { data: creators } = await supabase
    .from("creator_profiles")
    .select("*")
    .order("xp", { ascending: false })
    .limit(50);

  return NextResponse.json({ creators: creators ?? [] });
}
