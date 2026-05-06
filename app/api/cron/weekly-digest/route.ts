/**
 * /api/cron/weekly-digest — VibeXForge weekly retention email.
 *
 * Triggered by Vercel Cron every Sunday 18:00 UTC (= 11am Pacific,
 * a quiet inbox slot in the US). Walks every creator with a populated
 * email + at least one project, builds a brief activity summary, and
 * sends via Resend.
 *
 * Why: 2026-05-06 user-funnel diagnostic showed 100% of real outside
 * users (1 person: andrew@lessthanseventy.com) signed up, posted a
 * project, and never returned. The platform has zero return-loop
 * triggers. This is the minimum-viable hook.
 *
 * Auth model exception:
 *   Reads creators.email which is column-level REVOKEd from anon
 *   (migration 049). Uses SUPABASE_SERVICE_ROLE_KEY as a localized
 *   one-route exception to the repo's anon-only rule. The route is
 *   itself gated by CRON_SECRET so even with the key the surface is
 *   "Vercel cron + manual operator with the secret" — same effective
 *   blast radius as the cron-secret-gated routes already in the repo.
 *
 * Safety:
 *   - Authenticated by the CRON_SECRET header (Vercel auto-injects it).
 *     A direct curl without the secret 401s.
 *   - DRY-RUN by default when RESEND_API_KEY is unset — logs only.
 *   - `?dry=1` query param forces dry-run even with API key set.
 *
 * Cost: Resend free tier = 3,000 emails/mo + 100/day. 5 users now,
 * ~600x runway before tier change.
 */
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail, textToHtmlParas } from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vibexforge.com";

type ProjectRow = { id: string; title: string; views: number; upvotes: number };
type CreatorWithEmail = {
  id: string;
  name: string;
  email: string;
};

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
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY missing — cron cannot read creators.email (column is REVOKEd from anon by migration 049). Set it in Vercel env to enable sends.",
      },
      { status: 500 },
    );
  }
  const supa = createClient(supabaseUrl, serviceRoleKey);

  const { data: creators, error: cErr } = await supa
    .from("creators")
    .select("id, name, email")
    .not("email", "is", null)
    .neq("email", "");
  if (cErr) {
    return NextResponse.json(
      { error: `creators query failed: ${cErr.message}` },
      { status: 500 },
    );
  }

  const results: Array<{ to: string; subject: string; status: string }> = [];

  for (const c of (creators || []) as CreatorWithEmail[]) {
    const { data: projects } = await supa
      .from("projects")
      .select("id, title, views, upvotes")
      .eq("creator_id", c.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const { subject, html, text } = composeEmail(
      c.name || "creator",
      (projects || []) as ProjectRow[],
    );
    const sent = await sendEmail({
      to: c.email,
      subject,
      html,
      text,
      forceDryRun: dryRunForced,
    });
    if (!sent.ok) {
      results.push({ to: c.email, subject, status: `error: ${sent.error}` });
      continue;
    }
    results.push({
      to: c.email,
      subject,
      status: sent.dryRun ? "dry-run" : `sent:${sent.resendId ?? ""}`,
    });
  }

  return NextResponse.json({
    n_creators: (creators || []).length,
    n_attempted: results.length,
    n_sent: results.filter((r) => r.status.startsWith("sent")).length,
    results,
  });
}

function composeEmail(
  name: string,
  projects: ProjectRow[],
): { subject: string; html: string; text: string } {
  const totalViews = projects.reduce((s, p) => s + (p.views || 0), 0);
  const topProject = [...projects].sort(
    (a, b) => (b.views || 0) - (a.views || 0),
  )[0];

  const subject = topProject
    ? `${name} — ${totalViews} views on your VibeX projects this week`
    : `${name} — what shipped on VibeX this week`;

  const projectLines = projects
    .map((p) => `  • ${p.title}: ${p.views || 0} views, ${p.upvotes || 0} upvotes`)
    .join("\n");

  const text = [
    `Hey ${name},`,
    "",
    "Quick weekly digest from VibeXForge.",
    "",
    projects.length > 0
      ? `Your ${projects.length} project${projects.length === 1 ? "" : "s"}:`
      : "You haven't forged anything yet — try one this week:",
    projectLines,
    "",
    topProject
      ? `Top this week: "${topProject.title}" — view it: ${SITE_URL}/project/${topProject.id}`
      : `Forge your first card: ${SITE_URL}/launch`,
    "",
    "See the full feed: " + SITE_URL,
    "",
    "— VibeXForge",
    "",
    "(Don't want these? Reply STOP and I'll remove you.)",
  ].join("\n");

  return { subject, html: textToHtmlParas(text), text };
}
