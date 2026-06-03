/**
 * POST /api/webhooks/stripe
 *
 * Receives Stripe webhook events. Currently handles:
 *   - checkout.session.completed → marks launchkit_jobs.stripe_paid OR creates
 *     launchkit_subscriptions row depending on mode
 *
 * Signature verified via lib/stripe-min.verifyWebhookSignature.
 *
 * Stripe dashboard endpoint config:
 *   URL:    https://www.vibexforge.com/api/webhooks/stripe
 *   Events: checkout.session.completed
 *   Secret: copy into STRIPE_WEBHOOK_SECRET env var
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/stripe-min";

export const runtime = "nodejs";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Service role for webhook (bypass RLS to update launchkit_jobs)
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  const sigHeader = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sigHeader || !secret) {
    return NextResponse.json(
      { error: "Webhook signature config missing" },
      { status: 400 },
    );
  }

  const rawBody = await req.text();
  try {
    verifyWebhookSignature(rawBody, sigHeader, secret);
  } catch (err) {
    console.error("[stripe-webhook] signature verify failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 },
    );
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    // Acknowledge other events (Stripe expects 2xx)
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const session = event.data.object as {
    id: string;
    customer_email?: string;
    metadata?: Record<string, string>;
    amount_total?: number;
    mode?: string;
    subscription?: string;
  };

  const meta = session.metadata || {};
  const product = meta.product;
  if (product !== "launchkit" && product !== "validator") {
    return NextResponse.json({ ok: true, ignored: "unknown_product" });
  }

  if (!SUPA_URL || !SUPA_SERVICE_KEY) {
    console.error("[stripe-webhook] Supabase env missing");
    return NextResponse.json(
      { error: "Server config missing" },
      { status: 500 },
    );
  }

  const supabase = createClient(SUPA_URL, SUPA_SERVICE_KEY);

  // Route by product. LaunchKit + Validator have parallel table pairs.
  const subTable = product === "launchkit" ? "launchkit_subscriptions" : "validator_subscriptions";
  const creditTable = product === "launchkit" ? "launchkit_credits" : "validator_credits";

  try {
    if (meta.mode === "subscription" && session.subscription) {
      await supabase.from(subTable).upsert({
        email: session.customer_email,
        stripe_subscription_id: session.subscription,
        active: true,
        updated_at: new Date().toISOString(),
      });
    } else if (meta.mode === "single") {
      await supabase.from(creditTable).insert({
        email: session.customer_email,
        stripe_session_id: session.id,
        used: false,
        created_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error(`[stripe-webhook] persist failed (${product}):`, err);
  }

  return NextResponse.json({ ok: true, product, mode: meta.mode });
}
