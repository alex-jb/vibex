/**
 * GET /api/email/unsubscribe?token=...
 *
 * One-click email unsubscribe. CAN-SPAM compliance — every email
 * we send (welcome, daily-owner-summary, weekly-digest) appends
 * a link of the form:
 *
 *   {SITE_URL}/api/email/unsubscribe?token={creators.unsubscribe_token}
 *
 * Clicking flips creators.email_opt_out = true. All cron + welcome
 * paths read that flag and skip opted-out creators on subsequent
 * sends.
 *
 * Token is per-creator and generated lazily on first email (see
 * lib/email.ts::ensureUnsubscribeToken). Idempotent: visiting an
 * already-unsubscribed token returns 200 with the same "you're
 * unsubscribed" page.
 *
 * Auth model: this is the one route that legitimately needs
 * SUPABASE_SERVICE_ROLE_KEY to UPDATE a creator row without an auth
 * session (the user clicked from their email, they don't have a
 * web session). The token itself is the auth credential.
 */
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token || token.length < 16) {
    return htmlPage(
      "Invalid unsubscribe link",
      "This link is malformed. If you keep getting unwanted email from VibeXForge, reply to any of our emails with STOP and I'll remove you manually.",
      400,
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return htmlPage(
      "Service unavailable",
      "Unsubscribe service is not configured. Please reply to any VibeXForge email with STOP.",
      500,
    );
  }
  const supa = createClient(supabaseUrl, serviceRoleKey);

  const { data: matched, error: lookupErr } = await supa
    .from("creators")
    .select("id, name, email_opt_out")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (lookupErr) {
    return htmlPage("Server error", "Try again in a minute.", 500);
  }

  if (!matched) {
    // Don't tell the visitor whether the token is unknown vs. valid-
    // but-stale. Same response either way.
    return htmlPage(
      "Already unsubscribed",
      "If you keep getting email after this, reply to any VibeXForge email with STOP.",
      200,
    );
  }

  if (!matched.email_opt_out) {
    const { error: updErr } = await supa
      .from("creators")
      .update({ email_opt_out: true })
      .eq("id", matched.id);
    if (updErr) {
      return htmlPage("Server error", "Try again in a minute.", 500);
    }
  }

  return htmlPage(
    "You're unsubscribed",
    `Got it, ${matched.name || "creator"}. You won't get any more email from VibeXForge. The platform itself still works exactly the same — only the email path is muted.\n\nIf you change your mind, email alex@vibexforge.com and I'll flip you back on.`,
    200,
  );
}

function htmlPage(title: string, body: string, status: number): NextResponse {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)} — VibeXForge</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,-apple-system,sans-serif;background:#0a0a0c;color:#e8e8ec;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:2rem;text-align:center}h1{font-size:1.5rem;margin:0 0 1rem;color:#a78bfa}p{max-width:480px;line-height:1.6;color:#aaa;white-space:pre-wrap}a{color:#a78bfa}</style></head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(body)}</p><p><a href="https://www.vibexforge.com">Back to VibeXForge →</a></p></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
