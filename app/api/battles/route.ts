import { NextResponse } from "next/server";
import { saveBattleResult } from "@/lib/db";
import { validateString } from "@/lib/validate";
import type { BattleResult } from "@/lib/types";

export async function POST(request: Request) {
  const body: BattleResult = await request.json();

  const errors: string[] = [];
  const idErr = validateString(body.id, "id");
  if (idErr) errors.push(idErr);
  const challengerErr = validateString(body.challengerId, "challengerId");
  if (challengerErr) errors.push(challengerErr);
  const defenderErr = validateString(body.defenderId, "defenderId");
  if (defenderErr) errors.push(defenderErr);
  const winnerErr = validateString(body.winner, "winner");
  if (winnerErr) errors.push(winnerErr);

  if (!Array.isArray(body.rounds)) {
    errors.push("rounds must be an array");
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  await saveBattleResult(body);
  return NextResponse.json({ success: true });
}
