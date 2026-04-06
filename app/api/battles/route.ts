import { NextResponse } from "next/server";
import { saveBattleResult } from "@/lib/db";
import type { BattleResult } from "@/lib/types";

export async function POST(request: Request) {
  const body: BattleResult = await request.json();

  if (!body.id || !body.challengerId || !body.defenderId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  await saveBattleResult(body);
  return NextResponse.json({ success: true });
}
