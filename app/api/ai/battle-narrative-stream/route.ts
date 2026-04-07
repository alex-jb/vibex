import { NextResponse } from "next/server";
import { streamBattleNarrative } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`${ip}:ai-battle-stream`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
    );
  }

  const body = await request.json();

  if (!body.challengerTitle || !body.defenderTitle || !body.rounds) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamBattleNarrative({
            challengerTitle: body.challengerTitle,
            defenderTitle: body.defenderTitle,
            rounds: body.rounds,
            winner: body.winner || "challenger",
          })) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          const errorId = `err-${Date.now()}`;
          console.error(`[${errorId}] AI battle narrative stream error:`, error instanceof Error ? error.message : error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    const errorId = `err-${Date.now()}`;
    console.error(`[${errorId}] AI battle narrative stream error:`, error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Battle narrative stream failed", errorId },
      { status: 500 },
    );
  }
}
