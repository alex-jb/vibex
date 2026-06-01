/**
 * POST /api/launchkit/checkout
 *
 * Creates a Stripe Checkout Session for LaunchKit upgrade flow.
 *
 * Modes:
 *   - "single"       — one-time $49 for 1 launch (skips beta rate limit)
 *   - "subscription" — $19/mo for 5 launches/month + bandit feedback
 *
 * On checkout completion, the Stripe webhook (/api/webhooks/stripe)
 * updates launchkit_jobs.stripe_paid and creates a subscription record
 * if applicable.
 */
import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe-min";

export const runtime = "nodejs";

const PRICES = {
  single: { cents: 4900, name: "LaunchKit — Single launch ($49)" },
  subscription: { cents: 1900, name: "LaunchKit — Pro (5/month)" },
} as const;

interface CheckoutBody {
  mode: "single" | "subscription";
  email: string;
  url?: string;
  positioning?: string;
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
    url: typeof b.url === "string" ? b.url : undefined,
    positioning: typeof b.positioning === "string" ? b.positioning : undefined,
  };
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured (STRIPE_SECRET_KEY missing)" },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => null);
  const input = validate(body);
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
      successUrl: `${origin}/launchkit/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/launchkit`,
      customerEmail: input.email,
      metadata: {
        product: "launchkit",
        mode: input.mode,
        url: input.url || "",
        positioning: input.positioning || "",
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (err) {
    console.error("[launchkit/checkout] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
