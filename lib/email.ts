/**
 * Resend send helper — shared by /api/cron/weekly-digest, the
 * first-submit welcome path, and /api/cron/daily-owner-summary.
 *
 * Behavior matrix:
 *   - RESEND_API_KEY unset    → dryRun: log subject+text, never POST
 *   - RESEND_API_KEY set      → POST to api.resend.com, return ok bool
 *   - RESEND_FROM unset       → defaults to onboarding@resend.dev
 *
 * Why dry-run-by-default: we ship the cron and the welcome path
 * before the API key is configured. We do not want a partial config
 * to start firing emails when the operator has only meant to push
 * code. Setting the key is a deliberate "go live" action.
 *
 * CAN-SPAM: every send goes through composeFooterWithUnsubscribe
 * which appends a one-click unsubscribe URL to body and sets the
 * List-Unsubscribe header (RFC 8058) so mail clients render a
 * native unsubscribe button. Tokens are generated lazily by
 * ensureUnsubscribeToken (see migration 053).
 *
 * Errors are returned, never thrown — callers in fire-and-forget
 * paths (welcome email after submit) cannot let an email failure
 * cascade into a user-facing 500.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const RESEND_FROM = process.env.RESEND_FROM || "VibeXForge <onboarding@resend.dev>";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export type SendResult =
  | { ok: true; dryRun: boolean; resendId?: string }
  | { ok: false; error: string };

export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Optional unsubscribe URL — when present, sets List-Unsubscribe RFC 8058 header. */
  unsubscribeUrl?: string;
  /** Force dry-run even if API key is set (operator preview path). */
  forceDryRun?: boolean;
}): Promise<SendResult> {
  const dryRun = args.forceDryRun || !RESEND_API_KEY;
  if (dryRun) {
    console.log(
      `[email:dry-run] → ${args.to}\n  subject: ${args.subject}\n  body:\n${args.text}\n`,
    );
    return { ok: true, dryRun: true };
  }
  try {
    // List-Unsubscribe header lets Gmail/Apple Mail/Outlook render a
    // native one-click unsubscribe button next to the sender. RFC 8058
    // adds the List-Unsubscribe-Post version which makes it true
    // one-click (no GET-with-confirm form). Both safe to send together.
    const headers: Record<string, string> = {};
    if (args.unsubscribeUrl) {
      headers["List-Unsubscribe"] = `<${args.unsubscribeUrl}>`;
      headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
    }
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
        headers,
      }),
    });
    if (!r.ok) {
      const body = await r.text();
      return { ok: false, error: `resend ${r.status}: ${body.slice(0, 200)}` };
    }
    const json = (await r.json()) as { id?: string };
    return { ok: true, dryRun: false, resendId: json.id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Lazily generate creators.unsubscribe_token if NULL, return the
 * unsubscribe URL. Idempotent — if a token already exists, returns
 * the URL for that token without writing.
 *
 * Caller must pass a service-role-authenticated supabase client OR
 * an authenticated session that owns the creator row (the column
 * GRANT in migration 053 covers both).
 */
export async function ensureUnsubscribeUrl(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: SupabaseClient<any, "public", any>,
  creatorId: string,
): Promise<string | null> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vibexforge.com";
  try {
    const { data: row } = await client
      .from("creators")
      .select("unsubscribe_token")
      .eq("id", creatorId)
      .maybeSingle();
    if (!row) return null;
    let token = (row.unsubscribe_token as string | null) || null;
    if (!token) {
      // 32 bytes hex = 64-char token. Trivially non-guessable.
      token = randomBytes(32).toString("hex");
      const { error } = await client
        .from("creators")
        .update({ unsubscribe_token: token })
        .eq("id", creatorId)
        .is("unsubscribe_token", null); // race-safe: don't clobber concurrent insert
      if (error) {
        // If race lost, re-read.
        const { data: re } = await client
          .from("creators")
          .select("unsubscribe_token")
          .eq("id", creatorId)
          .maybeSingle();
        token = (re?.unsubscribe_token as string | null) || token;
      }
    }
    return `${siteUrl}/api/email/unsubscribe?token=${token}`;
  } catch (err) {
    console.error("[email] ensureUnsubscribeUrl failed", err);
    return null;
  }
}

/**
 * Append a CAN-SPAM-compliant footer to text + html. Replaces the
 * earlier "Reply STOP" line which is not legally sufficient.
 */
export function withUnsubscribeFooter(
  text: string,
  unsubscribeUrl: string | null,
): { text: string; html: string } {
  const footer = unsubscribeUrl
    ? `\n\n—\nDon't want these emails? One-click unsubscribe: ${unsubscribeUrl}\nVibeXForge · Built solo by Alex Ji · alex@vibexforge.com`
    : `\n\n—\nReply STOP and I'll remove you manually.\nVibeXForge · alex@vibexforge.com`;
  // Strip any existing "(Don't want these? Reply STOP...)" line from
  // text so we don't double-footer when callers used the old format.
  const cleaned = text.replace(/\(Don't want these\?[^)]*\)/g, "").trimEnd();
  const fullText = cleaned + footer;
  return { text: fullText, html: textToHtmlParas(fullText) };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function textToHtmlParas(text: string): string {
  return text
    .split("\n")
    .map((l) => (l.trim() ? `<p style="margin:0 0 6px">${escapeHtml(l)}</p>` : "<br>"))
    .join("\n");
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vibexforge.com";

/**
 * Compose the first-submit welcome email. Fired the first time a
 * creator's project lands in the DB. We have the user's name +
 * project title + project id + their compound score.
 *
 * Why this exists: 2026-05-06 funnel diagnostic showed 100% of
 * real outside users (1 person: andrew@lessthanseventy.com)
 * signed up, posted a project, never returned. The platform had
 * zero retention triggers. This catches them at peak engagement —
 * the moment they just shipped — and gives them a reason to come
 * back: their own project's stats, evolution next-step, and the
 * weekly digest signup.
 */
export function composeWelcomeEmail(args: {
  creatorName: string;
  projectId: string;
  projectTitle: string;
  compoundScore: number;
}): { subject: string; html: string; text: string } {
  const name = args.creatorName.trim() || "creator";
  const subject = `${name} — your project "${args.projectTitle}" just shipped on VibeXForge`;
  const projectUrl = `${SITE_URL}/project/${args.projectId}`;

  const text = [
    `Hey ${name},`,
    "",
    `"${args.projectTitle}" just landed on VibeXForge.`,
    `It scored ${args.compoundScore}/100 from Claude's review across`,
    `originality / clarity / UX / virality / investor curiosity.`,
    "",
    `View it now: ${projectUrl}`,
    "",
    "What happens next:",
    "  • Plays + upvotes evolve your project — Seed → Active → Growing → Breakout → Legend → Myth",
    "  • Every Sunday I'll email you a quick digest of how it's doing",
    "  • Drop the link wherever your audience hangs out — Twitter, Discord, your group chat",
    "",
    `Browse the rest of the gallery: ${SITE_URL}/home`,
    "",
    "Built by one person (alex@vibexforge.com). Reply to this with",
    "anything broken, confusing, or missing — I read every reply.",
    "",
    "— VibeXForge",
  ].join("\n");

  return { subject, html: textToHtmlParas(text), text };
}
