"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

// TODO: replace with real Stripe Payment Link after Alex creates it.
// For now this href points back to the page so accidental clicks no-op.
const STRIPE_EARLY_BIRD = process.env.NEXT_PUBLIC_STRIPE_AICG_EARLY_BIRD_URL || "#waitlist";

const SCHEDULE = [
  { time: "10:00 – 10:30", en: "Why we are here. 5-voice career council reads the room.", zh: "我们为什么在这里。5-voice 生涯 council 现场读你这桌人。" },
  { time: "10:30 – 12:00", en: "Build #1: Summon your own image generator — Pollinations + prompt formula", zh: "实战 #1: 召唤你自己的图像生成器 — Pollinations + 提示词公式" },
  { time: "12:00 – 12:45", en: "Lunch. Cohort introductions. Optional 1:1 with Alex.", zh: "午餐。同学互认。Alex 一对一 (可选)。" },
  { time: "12:45 – 14:30", en: "Build #2: Prompt engineering at work — role + context + task + constraint", zh: "实战 #2: 真实工作里的 prompt engineering — 角色+上下文+任务+约束" },
  { time: "14:30 – 16:00", en: "Build #3: Assemble your first AI agent — goal + tools + memory + reflection", zh: "实战 #3: 组装你的第一个 AI Agent — 目标+工具+记忆+反思" },
  { time: "16:00 – 16:40", en: "Submit to VibeXForge + council-diff 4-voice review on your artifact", zh: "作品提交 VibeXForge + council-diff 4-voice 当场点评" },
  { time: "16:40 – 17:00", en: "Demo Day — present your card. Take-home: postmortem template.", zh: "Demo Day — 展示你的卡。带走: 复盘模板。" },
];

const FOR_WHO = [
  { en: "Marketing, HR, ops, or product professionals quietly anxious about AI", zh: "市场 / HR / 运营 / PM,被 AI 焦虑悄悄追着的人" },
  { en: "Chinese-speaking NYC residents who want bilingual, in-room, with real artifacts", zh: "纽约中文社群,想 in-person、双语、走得出作品而不是听讲座" },
  { en: "Anyone who finished Anthropic Academy / OpenAI Academy and wants the next step", zh: "Anthropic Academy / OpenAI Academy 免费课跟完想接下一步的人" },
];

const NOT_FOR = [
  { en: "Engineers wanting a $10K full-stack ML bootcamp (Fullstack / GA exist)", zh: "想要 $10K full-stack ML bootcamp 的工程师 (Fullstack / GA 已经有)" },
  { en: "Teens looking for a summer day camp (Phase 2, Fall 2026)", zh: "找暑期 day camp 的青少年 (Phase 2,2026 秋)" },
];

export default function AICGCampLanding() {
  const { lang } = useLang();
  const isZh = lang === "zh";

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <Link href="/learn" className="text-xs text-zinc-500 hover:text-zinc-300">
            ← {isZh ? "回到 AICG Academy" : "Back to AICG Academy"}
          </Link>
          <div className="text-xs uppercase tracking-[0.4em] text-zinc-500">
            AICG NYC · Phase 0
          </div>
        </div>

        <header className="mt-10">
          <div className="inline-block rounded-full border border-amber-500/40 px-3 py-1 font-mono text-[11px] text-amber-400">
            {isZh ? "首期 · 2026 年 7 月 · NYC" : "First cohort · July 2026 · NYC"}
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            {isZh ? (
              <>
                你完不成的 AI 项目,
                <br />
                <span className="text-[var(--accent-indigo)]">这个周六我们一起做完。</span>
              </>
            ) : (
              <>
                The AI project you keep not finishing.
                <br />
                <span className="text-[var(--accent-indigo)]">Let&apos;s finish it together this Saturday.</span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-400">
            {isZh
              ? "一天 6 小时,纽约 in-person,双语。带笔记本来,走的时候你已经有一张发布在 VibeXForge 上的真实作品 + 5-voice AI council 给你的诚实点评。"
              : "One Saturday, six hours, in-person NYC, bilingual. Bring your laptop. Leave with a real artifact published on VibeXForge plus an honest 5-voice AI council critique you can quote in a job application."}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={STRIPE_EARLY_BIRD}
              className="rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 text-center font-semibold text-white hover:opacity-90"
            >
              {isZh ? "$249 早鸟 · 8 席位 →" : "$249 early-bird · 8 seats →"}
            </a>
            <Link
              href="/council?domain=career&decision=Should+I+take+the+AICG+NYC+workshop+%24299+6h+to+ship+my+first+AI+artifact%3F"
              className="rounded-[var(--r-card)] border border-[var(--border-soft)] px-6 py-3 text-center text-sm text-zinc-100 hover:border-[var(--accent-indigo)]"
            >
              {isZh ? "让 5-voice council 帮你决定 →" : "Ask the 5-voice council first →"}
            </Link>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            {isZh
              ? "首批后涨到 $299。Brier-audited council 公开历史命中率,不是销售话术。"
              : "Goes to $299 after the first cohort. The council&apos;s historical Brier score is public — this isn&apos;t sales pitch."}
          </p>
        </header>

        <section className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-400">
              {isZh ? "适合你,如果你是" : "For you if"}
            </div>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              {FOR_WHO.map((row, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-400">✓</span>
                  <span>{isZh ? row.zh : row.en}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-rose-400">
              {isZh ? "不适合你,如果" : "Skip if"}
            </div>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              {NOT_FOR.map((row, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-rose-400">✕</span>
                  <span>{isZh ? row.zh : row.en}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-20">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            {isZh ? "当天课表" : "The day"}
          </div>
          <h2 className="mt-3 text-2xl font-bold">
            {isZh ? "6 小时,3 个真实作品,1 张 VibeX 卡" : "Six hours, three real builds, one VibeX card"}
          </h2>
          <div className="mt-6 overflow-hidden rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)]">
            {SCHEDULE.map((row, i) => (
              <div
                key={row.time}
                className={`flex flex-col gap-1 px-5 py-4 md:flex-row md:items-baseline md:gap-6 ${
                  i < SCHEDULE.length - 1 ? "border-b border-[var(--border-soft)]" : ""
                }`}
              >
                <div className="font-mono text-xs text-zinc-500 md:w-32 md:shrink-0">
                  {row.time}
                </div>
                <div className="text-sm text-zinc-200">{isZh ? row.zh : row.en}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-8">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            {isZh ? "差异化" : "What you can&apos;t get anywhere else in NYC"}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <div className="text-2xl">🎴</div>
              <h3 className="mt-3 font-semibold">
                {isZh ? "可进化的 VibeX 作品卡" : "Evolving VibeX card"}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                {isZh
                  ? "你的作品 ship 到 vibexforge.com,会随热度真升级。链接发到简历或 LinkedIn,跟着你长。"
                  : "Your build ships to vibexforge.com and levels up with traffic. Drop the link on LinkedIn, watch it grow."}
              </p>
            </div>
            <div>
              <div className="text-2xl">⚖️</div>
              <h3 className="mt-3 font-semibold">
                {isZh ? "5-voice council 诚实点评" : "5-voice council critique"}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                {isZh
                  ? "Brier-audited 的 council 给 founder/engineer/product/career 4 个角度评语,印在卡背面。不是讲师 1 个人主观判断。"
                  : "A Brier-audited council writes 4 angles (founder/engineer/product/career) on the back of your card. Not one instructor's gut."}
              </p>
            </div>
            <div>
              <div className="text-2xl">📊</div>
              <h3 className="mt-3 font-semibold">
                {isZh ? "首期数据公开" : "Public first-cohort data"}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                {isZh ? (
                  <>
                    我们首期开完 48h 内把真实满座率、完课率、净利发在{" "}
                    <Link href="/postmortems" className="text-[var(--accent-indigo)] hover:underline">
                      /postmortems
                    </Link>
                    。NYC 唯一这么做的 instructor。
                  </>
                ) : (
                  <>
                    48 hours after the first cohort we publish honest enrollment, completion, and P&L at{" "}
                    <Link href="/postmortems" className="text-[var(--accent-indigo)] hover:underline">
                      /postmortems
                    </Link>
                    . The only NYC instructor doing this.
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        <section id="waitlist" className="mt-20 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-8 text-center">
          <h2 className="text-2xl font-bold">
            {isZh ? "8 席位,$249 早鸟" : "8 seats, $249 early-bird"}
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            {isZh
              ? "首期定 2026 年 7 月某个周六(下单后我跟你确认具体日期 + 中城 Peerspace 教室地址)。退款政策: 开课前 7 天 100% 退。开课后没产出 → 下期免费换一席。"
              : "First cohort runs a Saturday in July 2026 (we confirm exact date + Midtown Peerspace classroom after checkout). Refund: 100% if cancelled 7+ days before. No artifact shipped? Free seat in the next cohort."}
          </p>
          <a
            href={STRIPE_EARLY_BIRD}
            className="mt-6 inline-block rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-8 py-3 font-semibold text-white hover:opacity-90"
          >
            {isZh ? "占一席 →" : "Reserve a seat →"}
          </a>
          <div className="mt-4 text-xs text-zinc-500">
            {isZh
              ? "未确认席位前不收款。Stripe 链接生效后第一封确认信由 Alex 本人 (xji1@mail.yu.edu) 发出。"
              : "No charge until the link is live. First confirmation email comes from Alex personally (xji1@mail.yu.edu)."}
          </div>
        </section>

        <section className="mt-16 text-center text-sm text-zinc-500">
          <div>
            {isZh ? "课程内容预演 → " : "Try a free preview → "}
            <Link href="/learn" className="text-[var(--accent-indigo)] hover:underline">
              /learn
            </Link>
            <span className="mx-2">·</span>
            <Link href="/council" className="text-[var(--accent-indigo)] hover:underline">
              /council
            </Link>
            <span className="mx-2">·</span>
            <Link href="/postmortems" className="text-[var(--accent-indigo)] hover:underline">
              /postmortems
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
