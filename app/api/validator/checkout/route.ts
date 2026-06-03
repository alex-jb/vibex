/**
 * POST /api/validator/checkout
 *
 * Stripe Checkout for Validator upgrade flow. Mirrors /api/launchkit/checkout
 * but with Validator-specific pricing:
 *   - "single"       — $5 one-time for 1 full PMF report (skips beta free tier)
 *   - "subscription" — $19/mo for unlimited Validator runs
 *
 * Webhook handler at /api/webhooks/stripe handles checkout.session.completed
 * and updates idea_validations.is_paid + subscription tables.
 */
import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe-min";

export const runtime = "nodejs";

const PRICES = {
  single: { cents: 500, name: "Idea Validator — Single PMF report ($5)" },
  subscription: { cents: 1900, name: "Idea Validator — Pro (unlimited)" },
} as const;

interface CheckoutBody {
  mode: "single" | "subscription";
  email: string;
  idea?: string;
  handle?: string;
}

function validate(body: unknown): CheckoutBody | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const mode = b.mode;
  const email = typeof b.email === "string" ? b.email.trim() : "";
  if (mode !== "single" && mode !== "subscription") return null;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
  return {
    mode,
    email,
    idea: typeof b.idea === "string" ? b.idea.slice(0, 1000) : undefined,
    handle: typeof b.handle === "string" ? b.handle.slice(0, 64) : undefined,
  };
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured (STRIPE_SECRET_KEY missing)" },
      { status: 503 },
    );
  }

  const input = validate(await req.json().catch(() => null));
  if (!input) {
    return NextResponse.json(
      { error: "Missing or invalid fields (mode, email)" },
      { status: 400 },
    );
  }

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.vibexforge.com";

  const price = PRICES[input.mode];
  try {
    const session = await createCheckoutSession({
      mode: input.mode === "single" ? "payment" : "subscription",
      unitAmountCents: price.cents,
      currency: "usd",
      productName: price.name,
      successUrl: `${origin}/validator/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/validator`,
      customerEmail: input.email,
      metadata: {
        product: "validator",
        mode: input.mode,
        handle: input.handle || "",
        idea_preview: (input.idea || "").slice(0, 100),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (err) {
    console.error("[validator/checkout] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
