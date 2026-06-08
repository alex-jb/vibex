"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";

/**
 * /quant-bench — Quant Resume Bench (viral track #4 scaffold, 2026-06-08).
 *
 * Real flow (Phase 2): Paste GitHub + LinkedIn → 5-voice quant council
 * (Jane Street MD / Citadel quant / Two Sigma ML / Anthropic researcher /
 * HFT eng) debates and outputs 0-100 score across (1) statistical rigor,
 * (2) production engineering, (3) research velocity, (4) Brier audit
 * discipline, (5) communication. Output: branded share card + verdict.
 *
 * Brier-audited at 6-month settlement — every public score scored against
 * ground truth (whether candidate got quant offer). Public leaderboard
 * at /quant-bench/leaderboard.
 *
 * Phase 1 (this scaffold): landing + GitHub handle capture that drops into
 * Orallexa 5-voice LangGraph pipeline (already deployed). Validates demand
 * before building the full eval engine.
 */
export default function QuantBenchLanding() {
  const router = useRouter();
  const { lang } = useLang();
  const isZh = lang === "zh";
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  async function scoreNow(e: React.FormEvent) {
    e.preventDefault();
    const h = github.replace(/^@/, "").trim();
    if (!h) return;
    setStatus("submitting");
    const params = new URLSearchParams();
    if (linkedin.trim()) params.set("li", linkedin.trim());
    const qs = params.toString() ? `?${params.toString()}` : "";
    router.push(`/quant-bench/${encodeURIComponent(h)}${qs}`);
  }

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-3 text-6xl">📊</div>
        <p className="text-xs uppercase tracking-widest text-[var(--accent-indigo)]">
          {isZh ? "Quant Bench · Brier-audited" : "Quant Bench · Brier-audited"}
        </p>
        <h1 className="mt-3 text-5xl font-bold leading-tight">
          {isZh ? (
            <>
              你有多 <span className="text-[var(--accent-indigo)]">Jane Street ready</span>?
            </>
          ) : (
            <>
              How <span className="text-[var(--accent-indigo)]">Jane Street ready</span> are you?
            </>
          )}
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          {isZh
            ? "粘 GitHub + LinkedIn。5 个 quant 角色辩论你的简历。 0-100 分。Brier 审。"
            : "Paste GitHub + LinkedIn. 5 quant personas debate your resume. 0-100 score. Brier-audited."}
        </p>

        <form onSubmit={scoreNow} className="mt-10 mx-auto max-w-md space-y-3">
          <input
            type="text"
            placeholder={isZh ? "GitHub 用户名 (例如 alex-jb)" : "GitHub handle (e.g. alex-jb)"}
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            className="w-full rounded-[var(--r-card)] border border-[var(--border-strong)] bg-[var(--bg-elev)] px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-[var(--accent-indigo)] focus:outline-none"
            required
          />
          <input
            type="url"
            placeholder={isZh ? "LinkedIn URL (可选)" : "LinkedIn URL (optional)"}
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="w-full rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-[var(--accent-indigo)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "submitting" || !github}
            className="w-full rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {status === "submitting"
              ? isZh ? "Council 评估中..." : "Council deliberating..."
              : isZh ? "评估我的简历 →" : "Score my resume →"}
          </button>
        </form>

        <p className="mt-3 text-xs text-zinc-500">
          {isZh
            ? "免费 · 5 voices · ~$0.05 cost · 结果 30 秒"
            : "Free · 5 voices · ~$0.05 cost · 30 second result"}
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-3 text-left">
          {[
            { role: "Jane Street MD", icon: "🎯" },
            { role: "Citadel Quant", icon: "📈" },
            { role: "Two Sigma ML", icon: "🧠" },
            { role: "Anthropic Researcher", icon: "🔬" },
            { role: "HFT Engineer", icon: "⚡" },
          ].map(({ role, icon }) => (
            <div
              key={role}
              className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-3"
            >
              <div className="text-2xl">{icon}</div>
              <div className="mt-2 text-xs font-semibold text-zinc-300">{role}</div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-zinc-500">
          {isZh
            ? "公开榜单 · 6 月后 Brier 审 — "
            : "Public leaderboard · Brier-audited at 6mo — "}
          <a href="/quant-bench/leaderboard" className="text-[var(--accent-indigo)] hover:underline">
            {isZh ? "查看公开排名 →" : "See leaderboard →"}
          </a>
        </p>
      </div>
    </main>
  );
}
