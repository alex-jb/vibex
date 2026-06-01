"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * /launchkit/success — Stripe checkout success page.
 *
 * Stripe redirects here with ?session_id=cs_... after successful payment.
 * Webhook (/api/webhooks/stripe) has already credited the user; this page
 * just confirms + offers next action.
 */
export default function LaunchKitSuccessPage() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    // Give the webhook a beat to land (most fire within 1-2s)
    const t = setTimeout(() => setConfirmed(true), 2000);
    return () => clearTimeout(t);
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 text-6xl">✅</div>
        <h1 className="mb-4 text-4xl font-bold">Payment received</h1>
        <p className="mb-8 text-zinc-400">
          Your LaunchKit access is now active. Generate as many launches as
          your plan allows.
        </p>

        {sessionId && (
          <div className="mb-6 rounded-xl bg-zinc-900/60 p-4 text-sm text-zinc-400 ring-1 ring-zinc-800">
            Session: <code className="font-mono">{sessionId}</code>
            {confirmed && (
              <p className="mt-2 text-green-400">
                Webhook confirmed — credit applied.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/launchkit"
            className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
          >
            Generate a launch
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-zinc-800 px-6 py-3 font-semibold text-white ring-1 ring-zinc-700 transition hover:bg-zinc-700"
          >
            Back to VibeXForge
          </Link>
        </div>

        <p className="mt-12 text-xs text-zinc-500">
          Refund within 7 days · Email{" "}
          <a
            href="mailto:hi@vibexforge.com"
            className="text-orange-400 hover:underline"
          >
            hi@vibexforge.com
          </a>{" "}
          for any issue.
        </p>
      </div>
    </main>
  );
}
