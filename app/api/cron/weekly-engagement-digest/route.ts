/**
 * /api/cron/weekly-engagement-digest — Q3 retention loop.
 *
 * Triggered by Vercel Cron weekly. For each creator with a posted
 * draft that gained engagement in the prior 7 days, sends a digest
 * email like "your X post got 47 likes this week". Skips creators
 * with zero week-over-week delta.
 *
 * Why: 2026-05-08. The 6h scrape-engagement cron already populates
 * project_drafts.{views,likes,comments} + draft_engagement_snapshots.
 * Without an outbound email loop, engagement data sits in the dashboard
 * waiting for the creator to remember to check. This is the pull-back
 * trigger that turns the data into a re-visit.
 *
 * Pattern mirrors daily-owner-summary (in-app traction email) but
 * filters to cross-platform engagement (project_drafts) instead of
 * gallery views (project_events).
 *
 * Auth: CRON_SECRET-gated. Service-role required (joins creators.email
 * which is anon-revoked).
 *
 * Schedule: Sundays 17:00 UTC (= 10am Pacific Sunday, 1am Beijing
 * Monday — best universal "reflect on the week" slot).
 */
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  sendEmail,
  ensureUnsubscribeUrl,
  withUnsubscribeFooter,
} from "@/lib/email";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.vibexforge.com";

export const runtime = "nodejs";
export const maxDuration = 60;

type SnapshotRow = {
  draft_id: string;
  scraped_at: string;
  views: number;
  likes: number;
  comments: number;
};

type DraftRow = {
  id: string;
  project_id: string;
  platform: string;
  posted_url: string | null;
};

type ProjectRow = { id: string; title: string; creator_id: string };
type CreatorRow = { id: string; name: string; email: string };

const PLATFORM_LABEL: Record<string, string> = {
  x: "X",
  reddit: "Reddit",
  hacker_news: "Hacker News",
  dev_to: "Dev.to",
  bluesky: "Bluesky",
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

  const url = new URL(req.url);
  const dryRunForced = url.searchParams.get("dry") === "1";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY missing" },
      { status: 500 },
    );
  }
  const supa = createClient(supabaseUrl, serviceRoleKey);

  const now = Date.now();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Pull last 7 days of snapshots — bounded by cron limits because
  // append-only growth is one row per draft per 6h scrape (max ~28
  // rows per posted draft per week).
  const { data: snaps, error: snapErr } = await supa
    .from("draft_engagement_snapshots")
    .select("draft_id, scraped_at, views, likes, comments")
    .gte("scraped_at", weekAgo)
    .order("scraped_at", { ascending: true });

  if (snapErr) {
    return NextResponse.json(
      { error: `snapshots query: ${snapErr.message}` },
      { status: 500 },
    );
  }
  const allSnaps = (snaps || []) as SnapshotRow[];
  if (allSnaps.length === 0) {
    return NextResponse.json({
      message: "no snapshots in the last 7d — no emails sent",
      n_sent: 0,
    });
  }

  // Compute per-draft delta: latest values minus oldest values within
  // the window. Snapshots are cumulative counters so this gives the
  // 7-day net gain.
  const draftDelta = new Map<
    string,
    { views: number; likes: number; comments: number }
  >();
  const draftFirst = new Map<string, SnapshotRow>();
  const draftLast = new Map<string, SnapshotRow>();
  for (const s of allSnaps) {
    if (!draftFirst.has(s.draft_id)) draftFirst.set(s.draft_id, s);
    draftLast.set(s.draft_id, s);
  }
  for (const [draftId, last] of draftLast.entries()) {
    const first = draftFirst.get(draftId)!;
    draftDelta.set(draftId, {
      views: Math.max(0, (last.views || 0) - (first.views || 0)),
      likes: Math.max(0, (last.likes || 0) - (first.likes || 0)),
      comments: Math.max(0, (last.comments || 0) - (first.comments || 0)),
    });
  }

  // Pull draft → project → creator joins. Filter to drafts with non-
  // zero weekly delta to keep payload small.
  const interestingDraftIds = Array.from(draftDelta.entries())
    .filter(([, d]) => d.views + d.likes + d.comments > 0)
    .map(([id]) => id);

  if (interestingDraftIds.length === 0) {
    return NextResponse.json({
      message: "all snapshots had zero net delta — no emails sent",
      n_sent: 0,
    });
  }

  const { data: drafts } = await supa
    .from("project_drafts")
    .select("id, project_id, platform, posted_url")
    .in("id", interestingDraftIds);
  const draftRows = (drafts || []) as DraftRow[];

  const projectIds = Array.from(new Set(draftRows.map((d) => d.project_id)));
  const { data: projects } = await supa
    .from("projects")
    .select("id, title, creator_id")
    .in("id", projectIds);
  const projectsById = new Map(
    ((projects || []) as ProjectRow[]).map((p) => [p.id, p]),
  );

  const creatorIds = Array.from(
    new Set(
      draftRows
        .map((d) => projectsById.get(d.project_id)?.creator_id)
        .filter((x): x is string => Boolean(x)),
    ),
  );
  const { data: creators } = await supa
    .from("creators")
    .select("id, name, email")
    .in("id", creatorIds)
    .not("email", "is", null)
    .neq("email", "")
    .eq("email_opt_out", false);
  const creatorsById = new Map(
    ((creators || []) as CreatorRow[]).map((c) => [c.id, c]),
  );

  // Bucket: creator → list of (project, platform, delta, posted_url)
  type Entry = {
    project_title: string;
    platform: string;
    delta: { views: number; likes: number; comments: number };
    posted_url: string | null;
  };
  const byCreator = new Map<string, { creator: CreatorRow; entries: Entry[] }>();
  for (const d of draftRows) {
    const proj = projectsById.get(d.project_id);
    if (!proj) continue;
    const c = creatorsById.get(proj.creator_id);
    if (!c) continue;
    const delta = draftDelta.get(d.id);
    if (!delta) continue;
    if (!byCreator.has(c.id)) byCreator.set(c.id, { creator: c, entries: [] });
    byCreator.get(c.id)!.entries.push({
      project_title: proj.title,
      platform: d.platform,
      delta,
      posted_url: d.posted_url,
    });
  }

  const results: Array<{ to: string; status: string; total: number }> = [];

  for (const { creator, entries } of byCreator.values()) {
    // Sort entries by total delta DESC so the strongest channel leads.
    entries.sort(
      (a, b) =>
        b.delta.views + b.delta.likes + b.delta.comments -
        (a.delta.views + a.delta.likes + a.delta.comments),
    );
    const total = entries.reduce(
      (s, e) => s + e.delta.views + e.delta.likes + e.delta.comments,
      0,
    );
    if (total === 0) continue;

    const composed = composeEmail(creator.name, entries, total);
    const unsubscribeUrl = await ensureUnsubscribeUrl(supa, creator.id);
    const { text, html } = withUnsubscribeFooter(composed.text, unsubscribeUrl);
    const sent = await sendEmail({
      to: creator.email,
      subject: composed.subject,
      html,
      text,
      unsubscribeUrl: unsubscribeUrl || undefined,
      forceDryRun: dryRunForced,
    });
    results.push({
      to: creator.email,
      status: sent.ok ? (sent.dryRun ? "dry-run" : "sent") : `error:${sent.error}`,
      total,
    });
  }

  return NextResponse.json({
    n_creators_with_engagement: byCreator.size,
    n_sent: results.filter((r) => r.status === "sent" || r.status === "dry-run")
      .length,
    results,
  });
}

function composeEmail(
  creatorName: string,
  entries: Array<{
    project_title: string;
    platform: string;
    delta: { views: number; likes: number; comments: number };
    posted_url: string | null;
  }>,
  total: number,
): { subject: string; text: string } {
  const top = entries[0];
  const topLabel = PLATFORM_LABEL[top.platform] || top.platform;
  const subject = `Your week on VibeXForge: +${total} engagement across ${entries.length} ${entries.length === 1 ? "post" : "posts"}`;

  const lines = [
    `Hey ${creatorName},`,
    "",
    `Quick week-in-review: your posted drafts pulled +${total} new views/likes/comments combined this week.`,
    "",
    `Top channel: ${topLabel}`,
    `  +${top.delta.views} views · +${top.delta.likes} likes · +${top.delta.comments} comments`,
    top.posted_url ? `  ${top.posted_url}` : "",
    "",
    "All posted drafts this week:",
  ];
  for (const e of entries) {
    const label = PLATFORM_LABEL[e.platform] || e.platform;
    lines.push(
      `  · ${e.project_title} on ${label}: +${e.delta.views}v +${e.delta.likes}♥ +${e.delta.comments}💬`,
    );
  }
  lines.push("");
  lines.push(`See full breakdown: ${SITE_URL}/dashboard`);
  lines.push("");
  lines.push(
    "VibeXForge tracks engagement automatically. Reply to this email if a number looks wrong.",
  );

  return { subject, text: lines.filter((l) => l !== undefined).join("\n") };
}
