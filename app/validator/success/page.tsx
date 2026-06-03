import Link from "next/link";
import { getCheckoutSession } from "@/lib/stripe-min";

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export const runtime = "nodejs";

export default async function ValidatorSuccessPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;
  let amount = 0;
  let mode = "single";
  let customerEmail = "";

  if (session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await getCheckoutSession(session_id);
      amount = (session.amount_total ?? 0) / 100;
      mode = session.mode === "subscription" ? "subscription" : "single";
      customerEmail = session.customer_details?.email || session.customer_email || "";
    } catch (err) {
      console.error("[validator/success] session fetch failed:", err);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] px-6 py-20 text-white">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-6 text-6xl">✅</div>
        <h1 className="text-3xl font-bold leading-tight">
          {mode === "subscription"
            ? "Pro unlocked. Run as many ideas as you want."
            : "Validator Pro paid. Your full PMF report awaits."}
        </h1>
        <p className="mt-4 text-base text-zinc-400">
          {amount > 0 && (
            <>
              Paid: <b className="text-white">${amount.toFixed(2)} USD</b>
              {customerEmail && (
                <>
                  {" "}
                  · Receipt sent to <b className="text-white">{customerEmail}</b>
                </>
              )}
              <br />
            </>
          )}
          {mode === "subscription"
            ? "Unlimited Validator runs are live on your account. The next idea you submit will skip the free-tier rate limit."
            : "Submit your next idea — the full 5-section PMF report including white-space angles will not be paywalled."}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/validator"
            className="flex-1 rounded-xl bg-orange-500 px-6 py-3 text-center font-semibold text-black hover:bg-orange-400"
          >
            Validate the next idea →
          </Link>
          <Link
            href="/launchkit"
            className="flex-1 rounded-xl bg-zinc-900 px-6 py-3 text-center text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
          >
            Or generate launch material → /launchkit
          </Link>
        </div>

        <footer className="mt-16 text-xs text-zinc-600">
          Refund within 7 days, no questions asked. Email alex@vibexforge.com.
        </footer>
      </div>
    </main>
  );
}
