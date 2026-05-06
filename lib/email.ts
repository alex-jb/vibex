/**
 * Resend send helper — shared by /api/cron/weekly-digest and the
 * first-submit welcome email path.
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
 * Errors are returned, never thrown — callers in fire-and-forget
 * paths (welcome email after submit) cannot let an email failure
 * cascade into a user-facing 500.
 */

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
