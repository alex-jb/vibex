/**
 * Tier-unlock email — fires from lib/score.ts bumpScore when a user crosses
 * a tier threshold. Closes the reward loop so Silver/Gold/Platinum perks
 * feel real instead of theoretical.
 *
 * Best-effort: silent if RESEND_API_KEY missing (sendEmail dry-runs).
 */
import { sendEmail } from "./email";
import { tierFromScore, TIER_LADDER } from "./score";

type Tier = "unranked" | "bronze" | "silver" | "gold" | "platinum" | "diamond";

const TIER_COPY: Record<Tier, { headline: string; perk: string; cta: string; ctaUrl: string }> = {
  unranked: { headline: "", perk: "", cta: "", ctaUrl: "" },
  bronze: {
    headline: "🥉 You're Bronze on VibeXForge",
    perk: "Your reward: 1 free LaunchKit run (24 platform drafts, free for you).",
    cta: "Claim your free LaunchKit",
    ctaUrl: "https://www.vibexforge.com/launchkit",
  },
  silver: {
    headline: "🥈 You're Silver on VibeXForge",
    perk: "Your reward: unlimited Validator + LaunchKit Pro for a month. No rate limits. No checkout.",
    cta: "Use unlimited Validator",
    ctaUrl: "https://www.vibexforge.com/validator",
  },
  gold: {
    headline: "🥇 You're Gold on VibeXForge",
    perk: "Your reward: 1 week featured on /home + free auto-trailer for your next ship.",
    cta: "Submit a project for the feature",
    ctaUrl: "https://www.vibexforge.com/submit",
  },
  platinum: {
    headline: "💎 You're Platinum on VibeXForge",
    perk: "Same perks as Gold (cash payouts ship Phase 2 — we'll email you).",
    cta: "See your score profile",
    ctaUrl: "https://www.vibexforge.com",
  },
  diamond: {
    headline: "👑 You're Diamond on VibeXForge",
    perk: "Top weekly position. We'll be in touch directly about the feature post.",
    cta: "See the leaderboard",
    ctaUrl: "https://www.vibexforge.com",
  },
};

export async function sendTierUnlockEmail(args: {
  email: string;
  handle: string;
  newTier: Tier;
  score: number;
}): Promise<void> {
  const copy = TIER_COPY[args.newTier];
  if (!copy.headline) return; // unranked shouldn't email
  const scoreCardUrl = `https://www.vibexforge.com/score/${args.handle}`;
  const meta = TIER_LADDER.find((t) => t.name === args.newTier);
  const emoji = meta?.emoji || "";

  const subject = `${emoji} ${copy.headline}`;
  const text = [
    copy.headline,
    "",
    `Score: ${args.score} points · handle: @${args.handle}`,
    "",
    copy.perk,
    "",
    `${copy.cta}: ${copy.ctaUrl}`,
    `Your public score card: ${scoreCardUrl}`,
    "",
    "Validator → Launch → Funeral → Revive → Ship.",
    "The creator lifecycle in one number.",
    "",
    "— VibeXForge",
  ].join("\n");

  const html = `<!doctype html>
<html><body style="font-family:system-ui,sans-serif;background:#0a0a0a;color:#e8e8ec;padding:32px 24px;max-width:520px;margin:0 auto;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="font-size:48px;line-height:1.2;">${emoji}</div>
    <h1 style="font-size:24px;font-weight:700;margin:8px 0 0;color:#e8e8ec;">${copy.headline}</h1>
    <p style="font-size:14px;color:#a1a1aa;margin:8px 0 0;">Score: ${args.score} pts · @${args.handle}</p>
  </div>
  <div style="background:#161619;border:1px solid #3a3a42;border-radius:16px;padding:20px;margin-bottom:24px;">
    <p style="margin:0;font-size:15px;line-height:1.5;color:#e8e8ec;">${copy.perk}</p>
  </div>
  <div style="text-align:center;margin-bottom:32px;">
    <a href="${copy.ctaUrl}" style="display:inline-block;background:#F97316;color:#0a0a0a;font-weight:700;padding:14px 24px;border-radius:12px;text-decoration:none;font-size:15px;">${copy.cta} →</a>
  </div>
  <div style="text-align:center;margin-bottom:16px;">
    <a href="${scoreCardUrl}" style="font-size:13px;color:#F97316;text-decoration:none;">Your public score card →</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#6b6b73;margin-top:32px;">
    Validator → Launch → Funeral → Revive → Ship.<br>
    The creator lifecycle in one number.<br><br>
    — VibeXForge
  </p>
</body></html>`;

  const result = await sendEmail({ to: args.email, subject, html, text });
  if (!result.ok) {
    console.error("[tier-email] failed:", result.error);
  } else {
    console.log(`[tier-email] sent ${args.newTier} to ${args.email} (dryRun=${result.dryRun})`);
  }
}
