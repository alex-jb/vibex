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
 * triggers. This is the minimum-viable hook.
 *
 * Architecture (rewritten 2026-05-06):
 *   - Reads creator+email+projects via a SECURITY DEFINER RPC
 *     (`creators_with_email_for_retention`) added in migration 049,
 *     so the cron stays on anon-key. Old version used auth.admin
 *     which required SUPABASE_SERVICE_ROLE_KEY — that breaks the
 *     repo's anon-only architectural invariant.
 *   - Send is via lib/email.ts::sendEmail which dry-runs by default
 *     when RESEND_API_KEY is unset.
 *
 * Safety:
 *   - Authenticated by the CRON_SECRET header (Vercel auto-injects it).
 *     A direct curl without the secret 401s.
 *   - DRY-RUN by default when RESEND_API_KEY is unset — logs the
 *     email body to stdout but never sends.
 *   - `?dry=1` query param forces dry-run even when API key is present.
 *
 * Cost: Resend free tier = 3,000 emails/mo + 100/day. 5 users now,
 * so we have a 600x runway before any tier upgrade.
 */
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail, textToHtmlParas } from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vibexforge.com";

type ProjectRow = { id: string; title: string; views: number; upvotes: number };
type CreatorRow = {
  id: string;
  name: string;
  email: string;
  projects: ProjectRow[];
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
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supa = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supa.rpc("creators_with_email_for_retention");
  if (error) {
    return NextResponse.json(
      { error: `rpc failed: ${error.message}` },
      { status: 500 },
    );
  }

  const creators = (data || []) as CreatorRow[];
  const results: Array<{ to: string; subject: string; status: string }> = [];

  for (const c of creators) {
    const { subject, html, text } = composeEmail(c);
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
    n_creators: creators.length,
    n_attempted: results.length,
    n_sent: results.filter((r) => r.status.startsWith("sent")).length,
    results,
  });
}

function composeEmail(c: CreatorRow): {
  subject: string;
  html: string;
  text: string;
} {
  const totalViews = (c.projects || []).reduce((s, p) => s + (p.views || 0), 0);
  const topProject =
    [...(c.projects || [])].sort((a, b) => (b.views || 0) - (a.views || 0))[0];

  const subject = topProject
    ? `${c.name} — ${totalViews} views on your VibeX projects this week`
    : `${c.name} — what shipped on VibeX this week`;

  const projectLines = (c.projects || [])
    .map((p) => `  • ${p.title}: ${p.views || 0} views, ${p.upvotes || 0} upvotes`)
    .join("\n");

  const text = [
    `Hey ${c.name},`,
    "",
    "Quick weekly digest from VibeXForge.",
    "",
    (c.projects || []).length > 0
      ? `Your ${c.projects.length} project${c.projects.length === 1 ? "" : "s"}:`
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
