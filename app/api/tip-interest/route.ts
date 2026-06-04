/**
 * POST /api/tip-interest — Backer Mode v0 PMF capture.
 *
 * The button on /project/[id] sends here when someone says "I'd tip $X".
 * No Stripe, no money moves. We just write a row to `tip_interest` so
 * Alex can answer "are people willing to pay?" at launch.
 *
 * Schema: see migration 075. Idempotent on (email, project_id) via
 * ON CONFLICT — same person tapping twice updates amount but doesn't
 * inflate the count.
 *
 * Auth: anon-allowed (the whole point of this surface is to capture
 * intent from drive-by visitors). RLS enforces the column-shape gate;
 * route enforces the same checks before insert so we 400 fast.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 10;

type Body = {
  project_id?: unknown;
  email?: unknown;
  amount_usd?: unknown;
  note?: unknown;
  referrer?: unknown;
  visitor_token?: unknown;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const project_id = typeof body.project_id === "string" ? body.project_id.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const amount_usd = typeof body.amount_usd === "number" ? Math.floor(body.amount_usd) : 0;
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 200) : null;
  const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;
  const visitor_token = typeof body.visitor_token === "string" ? body.visitor_token.slice(0, 128) : null;

  if (!project_id) {
    return NextResponse.json({ error: "project_id required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "valid email required" }, { status: 400 });
  }
  if (!Number.isFinite(amount_usd) || amount_usd <= 0 || amount_usd > 1000) {
    return NextResponse.json({ error: "amount_usd 1-1000" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supa = createClient(supabaseUrl, anonKey);

  const { error } = await supa
    .from("tip_interest")
    .upsert(
      {
        project_id,
        email,
        amount_usd,
        note: note || null,
        referrer,
        visitor_token,
      },
      { onConflict: "email,project_id" },
    );

  if (error) {
    console.error("[tip-interest] upsert failed:", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
