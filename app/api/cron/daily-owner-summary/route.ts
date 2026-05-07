/**
 * /api/cron/daily-owner-summary — daily project-owner traction email.
 *
 * Triggered by Vercel Cron daily at 17:00 UTC (= 10am Pacific).
 * For each creator with a populated email, compiles the prior-24h
 * deltas (views, upvotes, demo plays, shares) per project and sends
 * a one-paragraph "your project yesterday" email. Skips any creator
 * whose total deltas == 0 — quiet days don't get an email.
 *
 * Why: 2026-05-06 retention diagnostic. Welcome email fires Day-0;
 * weekly-digest fires Day-7. The middle is silent. Daily owner
 * summary fills it WHEN there's signal — high-noise days
 * automatically self-mute. Plays with the user's psychology: the
 * traction notification is the "your stocks went up today" hit
 * that pulls users back daily.
 *
 * Aggregates from project_daily_stats (migration 023) which is a
 * VIEW over project_events. Reads creators.email which is REVOKEd
 * from anon, so this route requires SUPABASE_SERVICE_ROLE_KEY just
 * like weekly-digest.
 *
 * Safety: same as weekly-digest — CRON_SECRET-gated, dry-run by
 * default when RESEND_API_KEY unset, ?dry=1 forces preview.
 */
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  sendEmail,
  textToHtmlParas,
  ensureUnsubscribeUrl,
  withUnsubscribeFooter,
} from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vibexforge.com";

type DailyDelta = {
  project_id: string;
  views: number;
  clicks: number;
  shares: number;
  upvotes: number;
  demo_plays: number;
};

type ProjectMin = { id: string; title: string; creator_id: string };
type CreatorWithEmail = { id: string; name: string; email: string };

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization") || "";
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (auth !== expected) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
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

  // Yesterday in UTC, single calendar day. Cron runs at 17:00 UTC so
  // "yesterday" = the full UTC day that ended 17h ago. Email is about
  // that day's traction.
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yyyy = yesterday.getUTCFullYear();
  const mm = String(yesterday.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(yesterday.getUTCDate()).padStart(2, "0");
  const dayKey = `${yyyy}-${mm}-${dd}`;

  // Pull yesterday's stats. project_daily_stats is a VIEW; the day
  // column is DATE so we filter by the literal yyyy-mm-dd.
  const { data: stats, error: sErr } = await supa
    .from("project_daily_stats")
    .select("project_id, views, clicks, shares, upvotes, demo_plays")
    .eq("day", dayKey);
  if (sErr) {
    return NextResponse.json(
      { error: `stats query failed: ${sErr.message}` },
      { status: 500 },
    );
  }
  const deltas = (stats || []) as DailyDelta[];
  if (deltas.length === 0) {
    return NextResponse.json({
      day: dayKey,
      n_projects_with_activity: 0,
      n_sent: 0,
      message: "no project activity yesterday — no emails sent",
    });
  }

  const projectIds = deltas.map((d) => d.project_id);
  const { data: projects, error: pErr } = await supa
    .from("projects")
    .select("id, title, creator_id")
    .in("id", projectIds);
  if (pErr) {
    return NextResponse.json(
      { error: `projects query failed: ${pErr.message}` },
      { status: 500 },
    );
  }
  const projectsList = (projects || []) as ProjectMin[];
  const projectsById = new Map(projectsList.map((p) => [p.id, p]));

  const creatorIds = Array.from(new Set(projectsList.map((p) => p.creator_id)));
  const { data: creators, error: cErr } = await supa
    .from("creators")
    .select("id, name, email")
    .in("id", creatorIds)
    .not("email", "is", null)
    .neq("email", "")
    .eq("email_opt_out", false);
  if (cErr) {
    return NextResponse.json(
      { error: `creators query failed: ${cErr.message}` },
      { status: 500 },
    );
  }
  const creatorById = new Map(
    ((creators || []) as CreatorWithEmail[]).map((c) => [c.id, c]),
  );

  // Bucket deltas by creator. Skip creators with zero email or zero
  // total signal across all their projects.
  const buckets = new Map<
    string,
    { creator: CreatorWithEmail; entries: Array<{ title: string; delta: DailyDelta }> }
  >();
  for (const d of deltas) {
    const proj = projectsById.get(d.project_id);
    if (!proj) continue;
    const c = creatorById.get(proj.creator_id);
    if (!c) continue; // creator missing email — skip
    if (!buckets.has(c.id)) buckets.set(c.id, { creator: c, entries: [] });
    buckets.get(c.id)!.entries.push({ title: proj.title, delta: d });
  }

  const results: Array<{ to: string; subject: string; status: string }> = [];

  for (const { creator, entries } of buckets.values()) {
    const totalSignal = entries.reduce(
      (s, e) =>
        s +
        (e.delta.views || 0) +
        (e.delta.upvotes || 0) +
        (e.delta.demo_plays || 0),
      0,
    );
    if (totalSignal === 0) continue; // pure-zero day — skip noise

    const composed = compose(creator.name, entries, dayKey);
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
    if (!sent.ok) {
      results.push({ to: creator.email, subject: composed.subject, status: `error: ${sent.error}` });
      continue;
    }
    results.push({
      to: creator.email,
      subject: composed.subject,
      status: sent.dryRun ? "dry-run" : `sent:${sent.resendId ?? ""}`,
    });
  }

  return NextResponse.json({
    day: dayKey,
    n_projects_with_activity: deltas.length,
    n_attempted: results.length,
    n_sent: results.filter((r) => r.status.startsWith("sent")).length,
    results,
  });
}

function compose(
  name: string,
  entries: Array<{ title: string; delta: DailyDelta }>,
  day: string,
): { subject: string; html: string; text: string } {
  const totalViews = entries.reduce((s, e) => s + (e.delta.views || 0), 0);
  const totalUpvotes = entries.reduce((s, e) => s + (e.delta.upvotes || 0), 0);
  const totalPlays = entries.reduce((s, e) => s + (e.delta.demo_plays || 0), 0);

  const subject =
    entries.length === 1
      ? `${name} — "${entries[0].title}" got ${entries[0].delta.views} views yesterday`
      : `${name} — your projects got ${totalViews} views yesterday`;

  const lines = entries
    .map(
      (e) =>
        `  • ${e.title}: ${e.delta.views || 0} views, ${e.delta.upvotes || 0} upvotes, ${e.delta.demo_plays || 0} plays`,
    )
    .join("\n");

  const text = [
    `Hey ${name},`,
    "",
    `Your VibeXForge traction for ${day}:`,
    "",
    lines,
    "",
    `Totals: ${totalViews} views, ${totalUpvotes} upvotes, ${totalPlays} demo plays.`,
    "",
    `See full analytics: ${SITE_URL}/profile/dashboard`,
    "",
    "Drop the link wherever your audience hangs out — every play",
    "and upvote pushes your project closer to the next evolution stage.",
    "",
    "— VibeXForge",
    "",
    "(Don't want daily summaries? Reply STOP and I'll switch you to weekly-only.)",
  ].join("\n");

  return { subject, html: textToHtmlParas(text), text };
}
