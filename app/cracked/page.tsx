"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";

/**
 * /cracked — Cracked Score (viral track #2 scaffold).
 *
 * Real flow (Phase 2): GitHub OAuth → score 0-100 across 12 axes
 * (shipping velocity, language depth, OSS contribution, PR review quality,
 * etc.) → branded share card. Reuses creator_scores infra + Satori OG
 * template.
 *
 * Phase 1 (this scaffold): coming-soon landing + email waitlist that drops
 * into the existing Resend send list. Validates demand before building the
 * scoring engine.
 */
export default function CrackedScoreLanding() {
  const router = useRouter();
  const { lang } = useLang();
  const isZh = lang === "zh";
  const [github, setGithub] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  async function scoreNow(e: React.FormEvent) {
    e.preventDefault();
    const h = github.replace(/^@/, "").trim();
    if (!h) return;
    setStatus("submitting");
    const qs = creatorHandle.trim()
      ? `?as=${encodeURIComponent(creatorHandle.trim())}`
      : "";
    router.push(`/cracked/${encodeURIComponent(h)}${qs}`);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-3 text-6xl">🧠</div>
        <p className="text-xs uppercase tracking-widest text-orange-400">
          {isZh ? "Cracked 分数 · 实时" : "Cracked Score · live"}
        </p>
        <h1 className="mt-3 text-5xl font-bold leading-tight">
          {isZh ? (
            <>你到底有多 <span className="text-orange-400">cracked</span>?</>
          ) : (
            <>How <span className="text-orange-400">cracked</span> are you, really?</>
          )}
        </h1>
        <p className="mt-5 text-base text-zinc-400">
          {isZh
            ? "粘 GitHub handle。12 轴 0-100 评分:出货速度、深度、OSS 贡献、信噪比、最近活跃、语言广度、README 自律、注册年龄、社交、迭代、写作存在感。"
            : "Paste your GitHub handle. We score 0-100 across 12 axes — shipping velocity, depth, OSS contribution, signal-to-noise, recent activity, language breadth, README discipline, tenure, social, iteration, and writing presence."}
          <br />
          <br />
          {isZh
            ? "拿到一个分数 + 一张分享卡。比简历狠。"
            : "You get a single number + a share card. The card hits harder than a resume."}
        </p>

        <form
          onSubmit={scoreNow}
          className="mt-10 rounded-2xl bg-zinc-900/60 p-6 ring-1 ring-zinc-800 text-left"
        >
          <label className="mb-2 block text-xs uppercase tracking-widest text-zinc-400">
            {isZh ? "你的 GitHub handle" : "Your GitHub handle"}
          </label>
          <input
            type="text"
            required
            placeholder="@alex-jb"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            className="mb-4 w-full rounded-xl bg-black/40 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
          />

          <label className="mb-2 block text-xs uppercase tracking-widest text-zinc-400">
            {isZh
              ? "你的 VibeXForge Creator Score handle(可选 — +40 分到你的等级)"
              : "Your VibeXForge Creator Score handle (optional — +40 pts to your tier)"}
          </label>
          <input
            type="text"
            placeholder="alex"
            value={creatorHandle}
            onChange={(e) => setCreatorHandle(e.target.value)}
            className="mb-6 w-full rounded-xl bg-black/40 px-4 py-3 text-base outline-none ring-1 ring-zinc-700 focus:ring-orange-500"
          />

          <button
            type="submit"
            disabled={status === "submitting" || !github}
            className="w-full rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-black hover:bg-orange-400 disabled:opacity-50"
          >
            {status === "submitting"
              ? (isZh ? "计算中…" : "Scoring…")
              : (isZh ? "拿我的 Cracked 分数" : "Get my Cracked Score")}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/cracked/leaderboard"
            className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
          >
            {isZh ? "🏆 看排行榜" : "🏆 See leaderboard"}
          </Link>
          <Link
            href="/cracked/vs/karpathy/antirez"
            className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
          >
            {isZh ? "⚔️ 单挑示例" : "⚔️ Head-to-head example"}
          </Link>
        </div>

        <p className="mt-10 text-xs text-zinc-500">
          {isZh ? "构建在同一套 " : "Built on the same "}
          <Link href="/score/alex" className="text-orange-400 hover:underline">
            {isZh ? "Creator Score" : "Creator Score"}
          </Link>
          {isZh
            ? " 基础设施。校准于 karpathy(71)/ antirez(69)/ gaearon(53)。"
            : " infra. Calibrated on karpathy (71) / antirez (69) / gaearon (53)."}
        </p>

        <footer className="mt-16 text-xs text-zinc-600">
          {isZh ? "VibeXForge 的副产品 — " : "A side project of "}
          <Link href="/" className="text-orange-400 hover:underline">
            VibeXForge
          </Link>
        </footer>
      </div>
    </main>
  );
}
