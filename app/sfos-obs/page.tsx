import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "nodejs";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "SFOS-obs · Brier honesty for solo founders",
  description:
    "The first agent observability tool that scores your agents' honesty over time. $9/mo. Solo-founder pricing.",
  openGraph: {
    title: "SFOS-obs · Brier honesty scoreboard",
    description: "Your agents lie. Here's the Brier score.",
  },
};

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "1 agent monitored",
      "30-day rolling Brier",
      "5-voice council (read-only)",
      "Public scoreboard URL",
    ],
    cta: "Start free",
    accent: false,
  },
  {
    name: "Solo",
    price: "$9",
    period: "/mo",
    features: [
      "Up to 5 agents",
      "Unlimited Brier history",
      "5-voice council writes",
      "Webhook + Slack alerts",
      "Private scoreboard",
    ],
    cta: "Join waitlist",
    accent: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/mo",
    features: [
      "Up to 25 agents",
      "Multi-user dashboards",
      "Custom voice templates",
      "API access",
      "Priority support",
    ],
    cta: "Join waitlist",
    accent: false,
  },
];

export default function SFOSObsLanding() {
  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-zinc-500">
            SFOS · Observability
          </div>
          <h1 className="mt-4 text-5xl font-bold leading-tight md:text-6xl">
            Your agents lie.
            <br />
            <span className="text-[var(--accent-indigo)]">Here&apos;s the Brier score.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            LangSmith and Arize tell you if your model is up. SFOS-obs tells you if your agent
            was right. The first observability tool with Brier audit baked in. Solo-priced.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row">
            <a
              href="https://github.com/alex-jb/solo-founder-os"
              className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] px-6 py-3 font-semibold text-zinc-100 hover:border-[var(--accent-indigo)]"
            >
              Read the docs
            </a>
            <Link
              href="#waitlist"
              className="rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              Join waitlist →
            </Link>
          </div>
        </div>

        <section className="mt-24 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`rounded-[var(--r-card)] border p-6 ${
                t.accent
                  ? "border-[var(--accent-indigo)] bg-[var(--bg-elev)]"
                  : "border-[var(--border-soft)] bg-[var(--bg-elev)]"
              }`}
            >
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">{t.name}</div>
              <div className="mt-3 flex items-baseline">
                <span className="text-4xl font-bold">{t.price}</span>
                <span className="ml-2 text-sm text-zinc-500">{t.period}</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-zinc-300">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-[var(--accent-indigo)]">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="#waitlist"
                className={`mt-6 block rounded-[var(--r-card)] py-2.5 text-center text-sm font-semibold ${
                  t.accent
                    ? "bg-[var(--accent-indigo)] text-white"
                    : "border border-[var(--border-soft)] text-zinc-100 hover:border-[var(--accent-indigo)]"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </section>

        <section
          id="waitlist"
          className="mt-24 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-10 text-center"
        >
          <h2 className="text-3xl font-bold">Join the waitlist</h2>
          <p className="mt-3 text-zinc-400">
            First 50 indie founders get 6 months free at the Solo tier. We&apos;ll ship MVP in 4-6
            weeks and email you when it&apos;s live.
          </p>
          <form
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
            action="/api/sfos-obs-waitlist"
            method="POST"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@indiehackers.dev"
              className="flex-1 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] px-4 py-3 text-zinc-100 outline-none focus:border-[var(--accent-indigo)]"
            />
            <button
              type="submit"
              className="rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-5 py-3 font-semibold text-white hover:opacity-90"
            >
              Get early access
            </button>
          </form>
          <div className="mt-4 text-xs text-zinc-500">
            Built on the 11-agent Solo Founder OS stack. MIT for libs, paid for hosted dashboard.
          </div>
        </section>

        <section className="mt-24 text-center text-sm text-zinc-500">
          <div>
            Related ·{" "}
            <Link href="/council" className="text-[var(--accent-indigo)] hover:underline">
              Council Diff
            </Link>{" "}
            ·{" "}
            <Link href="/brier" className="text-[var(--accent-indigo)] hover:underline">
              Brier index
            </Link>{" "}
            ·{" "}
            <Link href="/memory-wall" className="text-[var(--accent-indigo)] hover:underline">
              Memory Wall
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
