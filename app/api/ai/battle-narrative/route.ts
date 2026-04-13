import { NextResponse } from "next/server";
import { generateBattleNarrative } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import { serverLog } from "@/lib/logger";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit(`${ip}:ai-battle`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  const body = await request.json();

  if (!body.challengerTitle || !body.defenderTitle || !body.rounds) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const narrative = await generateBattleNarrative({
      challengerTitle: body.challengerTitle,
      defenderTitle: body.defenderTitle,
      rounds: body.rounds,
      winner: body.winner || "challenger",
    });
    return NextResponse.json(narrative);
  } catch (error) {
    const errorId = `err-${Date.now()}`;
    serverLog.error(errorId, "AI battle narrative error", error);
    return NextResponse.json(
      { error: "Battle narrative generation failed", errorId },
      { status: 500 }
    );
  }
}
