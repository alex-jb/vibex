/**
 * /api/cron/weekly-digest — VibeXForge weekly retention email.
 *
 * Triggered by Vercel Cron every Sunday 18:00 UTC (= 11am Pacific,
 * a quiet inbox slot in the US). Walks every creator who has at least
 * one project, builds a brief activity summary email, and sends via
 * Resend.
 *
 * Why: 2026-05-06 user-funnel diagnostic showed 100% of real outside
 * users (1 person: andrew@lessthanseventy.com) signed up, posted a
 * project, and never returned. The platform has zero return-loop
 * triggers — no notifications, no email, no reason to re-open the
 * bookmark. This is the minimum-viable hook.
 *
 * Safety:
 *   - Authenticated by the CRON_SECRET header (Vercel auto-injects it).
 *     A direct curl without the secret 401s.
 *   - DRY-RUN by default when RESEND_API_KEY is unset — logs the
 *     email body to stdout but never sends. Push to prod is safe.
 *   - `?dry=1` query param forces dry-run even when API key is present.
 *     Operator can hit the URL by hand to preview without sending.
 *   - Per-user opt-out check (skip creators with `opt_out_email = true`)
 *     — column doesn't exist yet; flag is a no-op until we add it.
 *
 * Cost: Resend free tier = 3,000 emails/mo + 100/day. We have 5 users
 * total. We could send 600 weeks of digest before tier change.
 */
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const RESEND_FROM = process.env.RESEND_FROM || "VibeXForge <onboarding@resend.dev>";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vibexforge.com";

type CreatorRow = {
  id: string;
  name: string;
  auth_user_id: string | null;
  email: string;
  projects: { id: string; title: string; views: number; upvotes: number }[];
};

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Auth: Vercel Cron passes a Bearer header with CRON_SECRET; manual
  // operator invocation must include it explicitly. Refuse otherwise.
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization") || "";
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (auth !== expected) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(req.url);
  const dryRunForced = url.searchParams.get("dry") === "1";
  const dryRun = dryRunForced || !RESEND_API_KEY;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supa = createClient(supabaseUrl, supabaseKey);

  const creators = await loadCreatorsWithProjects(supa);
  const results: Array<{ to: string; subject: string; status: string }> = [];

  for (const c of creators) {
    if (!c.email) {
      results.push({ to: "(no email)", subject: "-", status: "skipped: no email" });
      continue;
    }
    const { subject, html, text } = composeEmail(c);
    if (dryRun) {
      results.push({ to: c.email, subject, status: "dry-run" });
      console.log(`[dry-run] → ${c.email}\n  subject: ${subject}\n  body:\n${text}\n`);
      continue;
    }
    try {
      const sent = await resendSend({ to: c.email, subject, html, text });
      results.push({ to: c.email, subject, status: sent ? "sent" : "send-failed" });
    } catch (err) {
      results.push({
        to: c.email,
        subject,
        status: `error: ${(err as Error).message}`,
      });
    }
  }

  return NextResponse.json({
    dry_run: dryRun,
    n_creators: creators.length,
    n_attempted: results.length,
    n_sent: results.filter((r) => r.status === "sent").length,
    results,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadCreatorsWithProjects(supa: any) {
  // Each creator with at least one project. We pull their auth.users
  // email via the auth_user_id link (set up when the creator profile
  // was created post-signup).
  const { data: creators } = await supa
    .from("creators")
    .select("id, name, auth_user_id")
    .not("auth_user_id", "is", null);
  if (!creators) return [];

  const out: CreatorRow[] = [];
  for (const c of creators as Array<{ id: string; name: string; auth_user_id: string }>) {
    const { data: user } = await supa.auth.admin.getUserById(c.auth_user_id);
    const email = user?.user?.email || "";

    const { data: projects } = await supa
      .from("projects")
      .select("id, title, views, upvotes")
      .eq("creator_id", c.id)
      .order("created_at", { ascending: false })
      .limit(10);

    out.push({
      id: c.id,
      name: c.name || "creator",
      auth_user_id: c.auth_user_id,
      email,
      projects: (projects || []) as CreatorRow["projects"],
    });
  }
  return out;
}

function composeEmail(c: CreatorRow): {
  subject: string;
  html: string;
  text: string;
} {
  const totalViews = c.projects.reduce((s, p) => s + (p.views || 0), 0);
  const totalUpvotes = c.projects.reduce((s, p) => s + (p.upvotes || 0), 0);
  const topProject = [...c.projects].sort((a, b) => b.views - a.views)[0];

  const subject = topProject
    ? `${c.name} — ${totalViews} views on your VibeX projects this week`
    : `${c.name} — what shipped on VibeX this week`;

  const projectLines = c.projects
    .map((p) => `  • ${p.title}: ${p.views} views, ${p.upvotes} upvotes`)
    .join("\n");

  const text = [
    `Hey ${c.name},`,
    "",
    "Quick weekly digest from VibeXForge.",
    "",
    c.projects.length > 0
      ? `Your ${c.projects.length} project${c.projects.length === 1 ? "" : "s"}:`
      : "You haven't forged anything yet — try one this week:",
    projectLines,
    "",
    topProject
      ? `Top this week: "${topProject.title}" — view it: ${SITE_URL}/project/${topProject.id}`
      : `Forge your first card: ${SITE_URL}/forge`,
    "",
    "See the full feed: " + SITE_URL,
    "",
    "— VibeXForge",
    "",
    "(Don't want these? Reply STOP and I'll remove you.)",
  ].join("\n");

  const html = text
    .split("\n")
    .map((l) => (l.trim() ? `<p style="margin:0 0 6px">${escapeHtml(l)}</p>` : "<br>"))
    .join("\n");

  return { subject, html, text };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function resendSend({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to,
      subject,
      html,
      text,
    }),
  });
  if (!r.ok) {
    const body = await r.text();
    console.error(`resend ${r.status}: ${body}`);
    return false;
  }
  return true;
}
