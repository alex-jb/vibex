/**
 * /api/cron/process-directory-queue — drains the directory_submissions queue.
 *
 * Runs every 15 min. Picks up to 20 rows with status in (queued, failed) and
 * retry_count < 3, dispatches each to its adapter, writes the result back.
 *
 * Auth: CRON_SECRET header (same pattern as the other cron routes).
 *
 * Service-role required so UPDATEs bypass RLS — the adapters can write status
 * regardless of which auth context originally enqueued the row.
 */
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { processQueue } from "@/lib/directory-submitter";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      {
        error: "SUPABASE_SERVICE_ROLE_KEY missing — required for cron UPDATE bypass",
      },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const result = await processQueue(supabase, { batchSize: 20 });
    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[cron/process-directory-queue]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
