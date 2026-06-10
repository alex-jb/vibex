import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "nodejs";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pair Cohort — calibration-first agent engineering, 8 weeks · VibeXForge",
  description:
    "8-week live cohort: prompt engineering → agent assembly → Brier-audited eval. Bilingual EN/中文. $1499 founding cohort. Run by Alex Ji.",
  openGraph: {
    title: "Pair Cohort · Calibration-first agent engineering",
    description: "8 weeks. Bilingual. Brier-audited. Run by Alex Ji.",
  },
};

const SYLLABUS = [
  { week: "Week 1", titleEn: "Prompt as code", titleZh: "提示词即代码", blurbEn: "R·C·T·C frame, role/context/task/constraint isolation, prompt versioning under git", blurbZh: "R·C·T·C 框架,槽位拆解,提示词版本管理走 git" },
  { week: "Week 2", titleEn: "5-voice debate", titleZh: "5 voice 辩论", blurbEn: "Council pattern, single-call multi-persona, agreement_score, when to disagree with the model", blurbZh: "Council 模式,单次调用多 persona,什么时候该跟模型分歧" },
  { week: "Week 3", titleEn: "Tools + memory", titleZh: "工具 + 记忆", blurbEn: "When to use short / long / brier-audited memory; tool selection heuristics; MCP server basics", blurbZh: "短期 / 长期 / Brier-audited 记忆怎么选;工具选择启发式;MCP server 基础" },
  { week: "Week 4", titleEn: "Reflection + self-critic", titleZh: "反思 + 自我批评", blurbEn: "Reflexion loop, self-critic vs 5-voice-council, how to ship error budgets", blurbZh: "Reflexion 循环,self-critic vs 5-voice-council,错误预算怎么 ship" },
  { week: "Week 5", titleEn: "Brier audit basics", titleZh: "Brier 审计基础", blurbEn: "Brier score math, walk-forward validation, James-Stein shrinkage, why coin-flip is the floor", blurbZh: "Brier 分数数学,walk-forward 验证,James-Stein 收缩,为什么抛硬币是地板" },
  { week: "Week 6", titleEn: "Ship a real agent", titleZh: "Ship 一个真 agent", blurbEn: "Pick a problem from your work. Spec it. Run it on a paper budget for 2 weeks. Audit honestly.", blurbZh: "从你工作里挑一个真问题。写 spec。paper budget 跑 2 周。诚实 audit。" },
  { week: "Week 7", titleEn: "Postmortem culture", titleZh: "复盘文化", blurbEn: "Publish 1 honest negative result. Why Roy Lee's retraction + Wispr Flow's pivot post went more viral than launches", blurbZh: "公开 1 个诚实负面结果。为什么 Roy Lee 撤回 + Wispr Flow 转向贴比 launch 更 viral" },
  { week: "Week 8", titleEn: "Demo day + alumni", titleZh: "Demo day + alumni", blurbEn: "Live demo to invited senior engineers + investors. Alumni alumni network. Co-instructor invitations.", blurbZh: "对邀请的高级工程师 + 投资人 live demo。校友网络。Co-instructor 邀请" },
];

const FOR_WHO = [
  { en: "Mid-level developers who already use Claude / Cursor / Codex daily but want to stop guessing", zh: "已经每天用 Claude / Cursor / Codex 但想从瞎试升级到会审的中级开发者" },
  { en: "Founders shipping agentic features who need a vocabulary for what they're doing", zh: "在 ship agentic 功能但没系统词汇的 founder" },
  { en: "Quants, eval engineers, anyone whose work touches probability calibration", zh: "Quants / eval 工程师 / 任何工作触概率校准的人" },
];

const NOT_FOR = [
  { en: "Beginners — go to /learn (free, 3 chapters) first", zh: "完全初学 — 先去 /learn (免费 3 关)" },
  { en: "Anyone looking for a build-the-next-ChatGPT pitch deck class", zh: "想要做下一个 ChatGPT pitch deck 课的人" },
  { en: "Anyone who needs a $9.99/mo content drip", zh: "需要 $9.99/mo 内容订阅的人" },
];

export default function CohortLanding() {
  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <div className="text-xs uppercase tracking-[0.4em] text-zinc-500">
          Pair Cohort · 8 weeks · live
        </div>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          Stop guessing whether your agent works.
          <br />
          <span className="text-[var(--accent-indigo)]">Learn to audit it.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-zinc-400">
          8 weeks. Bilingual EN / 中文. Live sessions Tuesday + Thursday 8-10 PM ET. 20 seats. Brier-audited curriculum taught by the developer behind the council-diff and Solo Founder OS open-source stack.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#waitlist"
            className="rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 text-center font-semibold text-white hover:opacity-90"
          >
            $999 founding cohort early-bird →
          </a>
          <Link
            href="/learn"
            className="rounded-[var(--r-card)] border border-[var(--border-soft)] px-6 py-3 text-center text-sm text-zinc-100 hover:border-[var(--accent-indigo)]"
          >
            Try the free preview first
          </Link>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Founding cohort runs September 2026. Goes to $1,499 after first cohort.
          Refund 100% if cancelled 14+ days before kickoff.
        </p>

        <section className="mt-20">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            8-week syllabus
          </div>
          <h2 className="mt-3 text-2xl font-bold">
            Every week is one shippable skill plus one honest audit
          </h2>
          <div className="mt-6 overflow-hidden rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)]">
            {SYLLABUS.map((w, i) => (
              <div
                key={w.week}
                className={`px-5 py-4 ${i < SYLLABUS.length - 1 ? "border-b border-[var(--border-soft)]" : ""}`}
              >
                <div className="flex items-baseline gap-3">
                  <div className="font-mono text-xs text-[var(--accent-indigo)] md:w-20">
                    {w.week}
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-100">{w.titleEn} · {w.titleZh}</div>
                    <div className="mt-1 text-sm text-zinc-400">{w.blurbEn}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-400">For you if</div>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              {FOR_WHO.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-400">✓</span>
                  <span>{r.en}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-rose-400">Skip if</div>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              {NOT_FOR.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-rose-400">✕</span>
                  <span>{r.en}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-16 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-8">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">What you walk away with</div>
          <ul className="mt-4 space-y-3 text-sm text-zinc-300">
            <li>• One shipped agent that solves a real problem at your job (not a toy demo)</li>
            <li>• One publicly published Brier-audited postmortem on vibexforge.com/postmortems with your name</li>
            <li>• Alumni network across 20 peers who all run calibration-honest engineering</li>
            <li>• A standing invitation to co-instruct cohort #2 (paid)</li>
            <li>• Lifetime access to the Solo Founder OS 11-agent stack + private alumni Discord</li>
          </ul>
        </section>

        <section id="waitlist" className="mt-16 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-8 text-center">
          <h2 className="text-2xl font-bold">$999 founding cohort waitlist</h2>
          <p className="mt-3 text-sm text-zinc-400">
            First 20 to join the waitlist get the $999 founding price. After cohort #1 wraps the price moves to $1,499 retail.
          </p>
          <form
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
            action="/api/cohort-waitlist"
            method="POST"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@yourcompany.com"
              className="flex-1 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] px-4 py-3 text-zinc-100 outline-none focus:border-[var(--accent-indigo)]"
            />
            <button
              type="submit"
              className="rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-5 py-3 font-semibold text-white hover:opacity-90"
            >
              Hold my seat
            </button>
          </form>
          <div className="mt-4 text-xs text-zinc-500">
            First confirmation comes from Alex personally (xji1@mail.yu.edu) within 24 hours.
          </div>
        </section>

        <section className="mt-16 text-center text-sm text-zinc-500">
          <div>
            Related:{" "}
            <Link href="/learn" className="text-[var(--accent-indigo)] hover:underline">/learn</Link> ·{" "}
            <Link href="/aicg-camp" className="text-[var(--accent-indigo)] hover:underline">/aicg-camp</Link> ·{" "}
            <Link href="/council" className="text-[var(--accent-indigo)] hover:underline">/council</Link> ·{" "}
            <Link href="/postmortems" className="text-[var(--accent-indigo)] hover:underline">/postmortems</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
