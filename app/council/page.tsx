"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DOMAINS = [
  { id: "founder", icon: "🚀", title: "Founder", subtitle: "YC Partner · VC · Lawyer · CFO · Spouse",
    example: "Should I raise $1M seed or bootstrap?" },
  { id: "engineer", icon: "🛠", title: "Engineer", subtitle: "Rust core · SRE · Recruiter · Junior · CTO 5y",
    example: "Postgres or DynamoDB for 10K writes/sec?" },
  { id: "investor", icon: "📈", title: "Investor", subtitle: "Macro · Sector · PM · Growth VC · Short Seller",
    example: "Is OpenAI's $500B private valuation justified?" },
  { id: "career", icon: "🎯", title: "Career", subtitle: "Mentor · Recruiter · Peer · CSO · Future You",
    example: "Should I accept this PM intern offer?" },
  { id: "product", icon: "📱", title: "Product", subtitle: "User · Competitor · Dev · Garry · Naval",
    example: "Should VibeXForge add video features?" },
  { id: "quant", icon: "📊", title: "Quant", subtitle: "Jane Street · Citadel · Two Sigma · Anthropic · HFT",
    example: "Buy AVGO at $386 given Druckenmiller Q1 13F?" },
];

export default function CouncilLanding() {
  const router = useRouter();
  const [domain, setDomain] = useState("founder");
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  async function deliberate(e: React.FormEvent) {
    e.preventDefault();
    if (!decision.trim()) return;
    setStatus("submitting");
    const params = new URLSearchParams({
      domain,
      decision: decision.trim(),
      ...(context.trim() ? { context: context.trim() } : {}),
    });
    router.push(`/council/result?${params.toString()}`);
  }

  const current = DOMAINS.find((d) => d.id === domain)!;

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mb-3 text-6xl">⚖️</div>
          <p className="text-xs uppercase tracking-widest text-[var(--accent-indigo)]">
            Council Diff · Brier-audited
          </p>
          <h1 className="mt-3 text-5xl font-bold leading-tight">
            5 voices deliberate <span className="text-[var(--accent-indigo)]">your decision</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Paste a question. Get 5 specialist perspectives in parallel. See where they agree, where they split.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            <a href="https://github.com/alex-jb/council-diff" className="text-[var(--accent-indigo)] hover:underline">
              Open source on GitHub →
            </a>
          </p>
        </div>

        <div className="mt-12">
          <div className="mb-4 text-xs uppercase tracking-widest text-zinc-500">
            Pick a domain
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDomain(d.id)}
                className={`text-left rounded-[var(--r-card)] border p-4 transition-colors ${
                  domain === d.id
                    ? "border-[var(--accent-indigo)] bg-[var(--bg-elev)]"
                    : "border-[var(--border-soft)] bg-[var(--bg-elev)] hover:border-[var(--border-strong)]"
                }`}
              >
                <div className="text-2xl">{d.icon}</div>
                <div className="mt-2 text-sm font-semibold text-zinc-200">{d.title}</div>
                <div className="mt-1 text-[10px] text-zinc-500 leading-snug">{d.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={deliberate} className="mt-8 space-y-3">
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Decision
            </label>
            <input
              type="text"
              placeholder={current.example}
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full rounded-[var(--r-card)] border border-[var(--border-strong)] bg-[var(--bg-elev)] px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-[var(--accent-indigo)] focus:outline-none"
              required
              maxLength={300}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Context <span className="text-zinc-600">(optional)</span>
            </label>
            <textarea
              placeholder="Constraints, numbers, market state, etc — anything that helps voices stay grounded"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-[var(--accent-indigo)] focus:outline-none min-h-[100px]"
              maxLength={2000}
            />
          </div>
          <button
            type="submit"
            disabled={status === "submitting" || !decision.trim()}
            className="w-full rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {status === "submitting" ? "Council deliberating..." : "Convene the council →"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Free · 5 voices in parallel · ~$0.03 per deliberation · 30 second result
        </p>

        <div className="mt-16 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500">How it works</div>
          <ol className="mt-4 space-y-2 text-sm text-zinc-300 list-decimal list-inside">
            <li>5 specialist voices read your decision in parallel</li>
            <li>Each scores 0-100 + writes verdict + strongest signal + biggest gap</li>
            <li>Synthesis computes agreement_score + recommendation (go / wait / kill / split)</li>
            <li>At resolution, decisions Brier-audited against actual outcome</li>
          </ol>
          <p className="mt-4 text-xs text-zinc-500">
            Pattern source: Perplexity Model Council + Orallexa multi-agent debate +{" "}
            <Link href="/quant-bench" className="text-[var(--accent-indigo)] hover:underline">
              VibeXForge Quant Bench
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
