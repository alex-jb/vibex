/**
 * Minimal Stripe REST wrapper — no SDK, no bundle bloat.
 *
 * Stripe's REST API is straightforward enough that the official SDK
 * (~500KB) is overkill for a 3-endpoint integration (create checkout
 * session, verify webhook, retrieve session).
 *
 * Used by LaunchKit (#1 SaaS spin-off). Spec:
 * alex-brain research/projects-2026-06/01-launchkit-spec.md
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const STRIPE_API = "https://api.stripe.com/v1";

function authHeaders() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

export interface CreateCheckoutOptions {
  mode: "payment" | "subscription";
  /** Stripe Price ID (preferred for subscriptions; "price_xxx") OR a
   * one-shot inline price (set unitAmountCents + currency + productName). */
  priceId?: string;
  unitAmountCents?: number;
  currency?: string;
  productName?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  id: string;
  url: string;
  mode?: "payment" | "subscription" | "setup";
  payment_status?: string;
  status?: string;
  customer_email?: string;
  customer_details?: { email?: string; name?: string };
  amount_total?: number;
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe Checkout Session. Returns { id, url } — redirect the
 * browser to `url` for the hosted payment page.
 */
export async function createCheckoutSession(
  opts: CreateCheckoutOptions,
): Promise<CheckoutSession> {
  const params = new URLSearchParams();
  params.set("mode", opts.mode);
  params.set("success_url", opts.successUrl);
  params.set("cancel_url", opts.cancelUrl);

  if (opts.priceId) {
    params.set("line_items[0][price]", opts.priceId);
    params.set("line_items[0][quantity]", "1");
  } else {
    if (!opts.unitAmountCents || !opts.currency || !opts.productName) {
      throw new Error(
        "createCheckoutSession needs priceId OR (unitAmountCents+currency+productName)",
      );
    }
    params.set("line_items[0][quantity]", "1");
    params.set(
      "line_items[0][price_data][currency]",
      opts.currency.toLowerCase(),
    );
    params.set(
      "line_items[0][price_data][unit_amount]",
      String(opts.unitAmountCents),
    );
    params.set(
      "line_items[0][price_data][product_data][name]",
      opts.productName,
    );
    if (opts.mode === "subscription") {
      params.set(
        "line_items[0][price_data][recurring][interval]",
        "month",
      );
    }
  }

  if (opts.customerEmail) {
    params.set("customer_email", opts.customerEmail);
  }
  if (opts.metadata) {
    for (const [k, v] of Object.entries(opts.metadata)) {
      params.set(`metadata[${k}]`, v);
    }
  }

  const resp = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: authHeaders(),
    body: params,
  });
  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`Stripe createCheckout ${resp.status}: ${errBody}`);
  }
  const data = (await resp.json()) as CheckoutSession;
  return data;
}

/** Retrieve a checkout session by id (use to verify payment from success page). */
export async function getCheckoutSession(
  sessionId: string,
): Promise<CheckoutSession> {
  const resp = await fetch(`${STRIPE_API}/checkout/sessions/${sessionId}`, {
    headers: authHeaders(),
  });
  if (!resp.ok) {
    throw new Error(`Stripe getCheckoutSession ${resp.status}`);
  }
  return (await resp.json()) as CheckoutSession;
}

/**
 * Verify a Stripe webhook signature. Throws on invalid.
 *
 * Stripe sends `Stripe-Signature` header: `t=<timestamp>,v1=<signature>,...`
 * Signature is HMAC-SHA256 of `<timestamp>.<raw_body>` keyed by webhook secret.
 *
 * https://stripe.com/docs/webhooks/signatures
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string,
  toleranceSeconds = 300,
): void {
  const parts = signatureHeader.split(",").map((p) => p.trim());
  const ts = parts
    .find((p) => p.startsWith("t="))
    ?.slice(2);
  const v1 = parts
    .find((p) => p.startsWith("v1="))
    ?.slice(3);
  if (!ts || !v1) {
    throw new Error("Webhook signature missing t= or v1=");
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - Number(ts)) > toleranceSeconds) {
    throw new Error("Webhook timestamp outside tolerance");
  }
  const expected = createHmac("sha256", webhookSecret)
    .update(`${ts}.${rawBody}`, "utf8")
    .digest("hex");
  const actualBuf = Buffer.from(v1, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (
    actualBuf.length !== expectedBuf.length ||
    !timingSafeEqual(actualBuf, expectedBuf)
  ) {
    throw new Error("Webhook signature mismatch");
  }
}
