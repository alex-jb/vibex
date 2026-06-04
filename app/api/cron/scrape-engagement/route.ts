/**
 * /api/cron/scrape-engagement — refresh project_drafts engagement counts.
 *
 * Triggered by Vercel Cron every 6 hours. For each project_drafts row
 * that's status=posted with a posted_url, calls the per-platform public
 * scraper (lib/engagement-scrapers) and writes views/likes/comments back
 * to the row.
 *
 * Why: 2026-05-08. The /project/[id]/drafts UI now captures posted_url
 * when a creator marks a draft posted. This cron is the loop that turns
 * that into the "Cross-platform reach" stat on /dashboard, and feeds the
 * future analytics page. Without it the column never moves off zero.
 *
 * Cap: 100 drafts per run. Bounds wall time at ~30s if every scrape
 * takes 300ms. Vercel function maxDuration=60.
 *
 * Re-scrape window: skip drafts whose updated_at is < 4h ago — those
 * are fresh enough. Without this every run re-scrapes everything.
 *
 * Auth: CRON_SECRET-gated, same pattern as daily-owner-summary.
 *
 * Service-role required: project_drafts.update under RLS would need
 * each row's project owner. Cron has no auth context, so bypass via
 * service role.
 */
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { scrapeForPlatform } from "@/lib/engagement-scrapers";

export const runtime = "nodejs";
export const maxDuration = 60;

type DraftRow = {
  id: string;
  platform: string;
  posted_url: string | null;
  views: number;
  likes: number;
  comments: number;
  updated_at: string;
};

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
      { error: "SUPABASE_SERVICE_ROLE_KEY missing" },
      { status: 500 },
    );
  }
  const supa = createClient(supabaseUrl, serviceRoleKey);

  // Skip drafts that were touched in the last 4h — already fresh.
  const fourHoursAgo = new Date(
    Date.now() - 4 * 60 * 60 * 1000,
  ).toISOString();

  const { data: drafts, error } = await supa
    .from("project_drafts")
    .select("id, platform, posted_url, views, likes, comments, updated_at")
    .eq("status", "posted")
    .not("posted_url", "is", null)
    .lt("updated_at", fourHoursAgo)
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type Result = {
    id: string;
    platform: string;
    ok: boolean;
    delta?: { views: number; likes: number; comments: number };
  };

  const results: Result[] = [];

  for (const row of (drafts || []) as DraftRow[]) {
    if (!row.posted_url) {
      results.push({ id: row.id, platform: row.platform, ok: false });
      continue;
    }
    const metrics = await scrapeForPlatform(row.platform, row.posted_url);
    if (!metrics) {
      // Touch updated_at so we don't keep retrying every run.
      await supa
        .from("project_drafts")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", row.id);
      results.push({ id: row.id, platform: row.platform, ok: false });
      continue;
    }
    const { error: uErr } = await supa
      .from("project_drafts")
      .update({
        views: metrics.views,
        likes: metrics.likes,
        comments: metrics.comments,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (uErr) {
      results.push({ id: row.id, platform: row.platform, ok: false });
      continue;
    }

    // Append a snapshot for time-series charts. Best-effort — if the
    // insert fails we still return ok=true since the live numbers are
    // updated; only the history loses one data point.
    await supa.from("draft_engagement_snapshots").insert({
      draft_id: row.id,
      views: metrics.views,
      likes: metrics.likes,
      comments: metrics.comments,
    });
    results.push({
      id: row.id,
      platform: row.platform,
      ok: true,
      delta: {
        views: metrics.views - row.views,
        likes: metrics.likes - row.likes,
        comments: metrics.comments - row.comments,
      },
    });
  }

  return NextResponse.json({
    candidate_count: drafts?.length || 0,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
