import Link from "next/link";
import { Suspense } from "react";

import { createMetadata } from "@/lib/metadata";
import { Bilingual } from "@/components/i18n/bilingual";
import { getPredictionsBundle } from "@/lib/predictions/sources";
import { BrierAuditTable } from "@/components/predictions/BrierAuditTable";
import { ContrarianBadge } from "@/components/predictions/ContrarianBadge";
import { PredictionCard } from "@/components/predictions/PredictionCard";
import { SeriesTracker } from "@/components/predictions/SeriesTracker";

export const metadata = createMetadata({
  title: "Predictions — AI-quant picks, Brier-audited",
  description:
    "Daily AI-quant picks across NBA Finals, 2026 FIFA World Cup, 8 SpaceX pure-play tickers, and top Polymarket events. Brier-audited so you can see if I'm beating coin flip. Built by a solo founder, no bullshit.",
  path: "/predictions",
});

// 30-minute ISR matches the underlying script cadence. Lower would just serve
// stale cache more often; higher would lag behind morning sports picks.
export const revalidate = 1800;

const SECTION_HEADING =
  "mt-12 mb-4 flex items-baseline justify-between gap-3 first:mt-6";
const SECTION_EYEBROW = "text-xs uppercase tracking-widest text-orange-400";

export default async function PredictionsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-200">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Hero */}
        <header className="mb-10">
          <p className={SECTION_EYEBROW}>
            <Bilingual
              en="▸ PREDICTIONS · BRIER-AUDITED"
              zh="▸ 预测 · BRIER 校准"
            />
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-zinc-100 sm:text-5xl">
            <Bilingual
              en={
                <>
                  AI-quant picks <span className="text-orange-400">a solo founder ships</span>{" "}
                  every morning at 12:00 ET.
                </>
              }
              zh={
                <>
                  一个独立开发者每天 <span className="text-orange-400">12:00 ET</span> 自动发的预测,
                  Brier 校准。
                </>
              }
            />
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
            <Bilingual
              en={
                <>
                  Sports picks come from a 5-persona Claude ensemble + historical priors.
                  SpaceX picks come from the same daily brief I publish at{" "}
                  <a
                    href="https://github.com/alex-jb/spacex-ipo-tracker"
                    className="text-orange-300 hover:underline"
                    rel="noreferrer"
                    target="_blank"
                  >
                    github.com/alex-jb/spacex-ipo-tracker
                  </a>
                  . Polymarket picks are flagged only when the ensemble disagrees with the
                  market by 5+ percentage points. <strong className="text-zinc-200">Everything is Brier-scored against
                  the closing line.</strong> If I&apos;m worse than coin flip, the table will say so.
                </>
              }
              zh={
                <>
                  体育预测来自 5 角色 Claude ensemble + 历史先验。SpaceX 预测来自同一份每日 brief — 我公开在
                  {" "}
                  <a
                    href="https://github.com/alex-jb/spacex-ipo-tracker"
                    className="text-orange-300 hover:underline"
                    rel="noreferrer"
                    target="_blank"
                  >
                    github.com/alex-jb/spacex-ipo-tracker
                  </a>
                  。Polymarket 预测只在 ensemble 与市场差 5pp+ 时打 flag。
                  <strong className="text-zinc-200">所有预测都用收盘价 Brier 校准。</strong>
                  如果我不如抛硬币准,表格会直接写出来。
                </>
              }
            />
          </p>

          {/* Trust strip */}
          <ul className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-400">
            <li className="rounded-full bg-zinc-900/60 px-3 py-1 ring-1 ring-zinc-800">
              <Bilingual en="Updates every 30 min" zh="每 30 分钟刷新" />
            </li>
            <li className="rounded-full bg-zinc-900/60 px-3 py-1 ring-1 ring-zinc-800">
              <Bilingual en="No paywall · no signup" zh="无付费墙 · 无需注册" />
            </li>
            <li className="rounded-full bg-zinc-900/60 px-3 py-1 ring-1 ring-zinc-800">
              <Bilingual en="Open data · GitHub raw" zh="数据公开 · GitHub raw" />
            </li>
            <li className="rounded-full bg-zinc-900/60 px-3 py-1 ring-1 ring-zinc-800">
              <Bilingual en="Brier baseline 0.250" zh="Brier 基线 0.250" />
            </li>
          </ul>
        </header>

        <Suspense fallback={<SectionSkeleton />}>
          <PredictionsBody />
        </Suspense>

        {/* Footer / methodology */}
        <footer className="mt-20 border-t border-zinc-800 pt-8 text-xs text-zinc-500">
          <p className="mb-3">
            <Bilingual
              en={
                <>
                  Methodology: 5-persona Claude ensemble (status_quo / contrarian /
                  macro_economist / political_scientist / quant_bayesian) with shrinkage
                  λ=0.4 against historical league priors. Sports lines pulled from ESPN
                  consensus at 12:00 ET; Polymarket from on-chain CLOB; SpaceX tickers
                  from Yahoo Finance closing print. Brier scores settle T+1 against
                  closing market line.
                </>
              }
              zh={
                <>
                  方法学: 5 角色 Claude ensemble (status_quo / contrarian / macro_economist /
                  political_scientist / quant_bayesian),针对历史联赛先验做 λ=0.4 收缩。
                  体育赔率取 ESPN 共识 12:00 ET; Polymarket 取链上 CLOB; SpaceX 取 Yahoo Finance 收盘价。
                  Brier 在 T+1 用收盘价结算。
                </>
              }
            />
          </p>
          <p className="mb-3">
            <Bilingual
              en={
                <>
                  This is research, not financial advice. The same code base shipped{" "}
                  -10% in 14 days of paper trading; that&apos;s exactly why every number on
                  this page is settled against real outcomes.
                </>
              }
              zh={
                <>
                  这是研究,不是投资建议。同一套代码在 14 天 paper 测试里亏了 10% —
                  这就是为什么这页每个数字都用真实结果结算。
                </>
              }
            />
          </p>
          <p>
            <Link href="/about" className="text-orange-300 hover:underline">
              <Bilingual en="About VibeXForge" zh="关于 VibeXForge" />
            </Link>
            <span className="px-2 text-zinc-700">·</span>
            <a
              href="https://github.com/alex-jb/spacex-ipo-tracker"
              className="text-orange-300 hover:underline"
              rel="noreferrer"
              target="_blank"
            >
              <Bilingual en="SpaceX daily briefs" zh="SpaceX 每日 brief" />
            </a>
            <span className="px-2 text-zinc-700">·</span>
            <a
              href="https://github.com/alex-jb"
              className="text-orange-300 hover:underline"
              rel="noreferrer"
              target="_blank"
            >
              <Bilingual en="Solo Founder OS" zh="Solo Founder OS 全栈" />
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}

// ───────────────────────── Body ─────────────────────────

async function PredictionsBody() {
  const bundle = await getPredictionsBundle();
  const todayNba = bundle.nba[0] ?? null;
  const todayNhl =
    bundle.otherSports.find((p) => p.league === "nhl") ??
    null;

  return (
    <>
      {bundle.using_fixture && <FixtureBanner />}

      {/* Contrarian + Brier rolled into a single hero row */}
      <section aria-labelledby="signals-heading">
        <div className={SECTION_HEADING}>
          <h2 id="signals-heading" className="text-2xl font-bold text-zinc-100">
            <Bilingual en="The two numbers I check first" zh="我每天最先看的两个数字" />
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <ContrarianBadge regime={bundle.contrarian} />
          <BrierAuditTable buckets={bundle.brier} />
        </div>
      </section>

      {/* NBA Finals series */}
      <section aria-labelledby="nba-heading">
        <div className={SECTION_HEADING}>
          <h2 id="nba-heading" className="text-2xl font-bold text-zinc-100">
            <Bilingual en="NBA Finals — live series" zh="NBA 总决赛 · 系列赛追踪" />
          </h2>
          <p className={SECTION_EYEBROW}>
            <Bilingual en="next game · daily 12:00 ET" zh="下一场 · 每天 12:00 ET" />
          </p>
        </div>
        <SeriesTracker series={bundle.series} todayGame={todayNba} league="nba" />

        {/* Stanley Cup as a sibling, since they're often the same week */}
        <div className="mt-6">
          <SeriesTracker series={bundle.series} todayGame={todayNhl} league="nhl" />
        </div>

        {bundle.nba.length > 1 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bundle.nba.slice(1).map((p) => (
              <PredictionCard key={p.event_id} prediction={p} />
            ))}
          </div>
        )}
      </section>

      {/* World Cup */}
      <section aria-labelledby="wc-heading">
        <div className={SECTION_HEADING}>
          <h2 id="wc-heading" className="text-2xl font-bold text-zinc-100">
            <Bilingual en="2026 FIFA World Cup" zh="2026 FIFA 世界杯" />
          </h2>
          <p className={SECTION_EYEBROW}>
            <Bilingual
              en={`${bundle.worldCup.length} fixture${bundle.worldCup.length === 1 ? "" : "s"} flagged`}
              zh={`${bundle.worldCup.length} 场比赛`}
            />
          </p>
        </div>
        {bundle.worldCup.length === 0 ? (
          <p className="rounded-2xl bg-zinc-900/40 p-6 text-sm italic text-zinc-500 ring-1 ring-zinc-800">
            <Bilingual
              en="No World Cup matches in the next 24h. Picks return when group stage resumes."
              zh="未来 24h 无世界杯比赛。小组赛恢复后预测重新上线。"
            />
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {bundle.worldCup.map((p) => (
              <PredictionCard key={p.event_id} prediction={p} />
            ))}
          </div>
        )}
      </section>

      {/* Other sports */}
      {bundle.otherSports.length > 0 && (
        <section aria-labelledby="other-sports-heading">
          <div className={SECTION_HEADING}>
            <h2 id="other-sports-heading" className="text-2xl font-bold text-zinc-100">
              <Bilingual en="MLB · MLS · other sports" zh="MLB · MLS · 其它体育" />
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bundle.otherSports.slice(0, 6).map((p) => (
              <PredictionCard key={p.event_id} prediction={p} />
            ))}
          </div>
        </section>
      )}

      {/* SpaceX 8 */}
      <section aria-labelledby="spacex-heading">
        <div className={SECTION_HEADING}>
          <h2 id="spacex-heading" className="text-2xl font-bold text-zinc-100">
            <Bilingual en="SpaceX pure-play · 8 tickers" zh="SpaceX 纯关联 8 只股票" />
          </h2>
          <a
            href={bundle.spacex.brief_url}
            target="_blank"
            rel="noreferrer"
            className={SECTION_EYEBROW + " hover:text-orange-300"}
          >
            <Bilingual en="Full brief →" zh="完整 brief →" /> {bundle.spacex.brief_date}
          </a>
        </div>
        {bundle.spacex.picks.length === 0 ? (
          <p className="rounded-2xl bg-zinc-900/40 p-6 text-sm italic text-zinc-500 ring-1 ring-zinc-800">
            <Bilingual
              en="No SpaceX brief published in the last 5 days. Cron may be down — check the GitHub repo."
              zh="过去 5 天没有 SpaceX brief。可能 cron 挂了 — 去 GitHub 仓库看下。"
            />
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {bundle.spacex.picks.map((s) => (
              <PredictionCard key={s.ticker} stock={s} />
            ))}
          </div>
        )}
      </section>

      {/* Polymarket */}
      <section aria-labelledby="poly-heading">
        <div className={SECTION_HEADING}>
          <h2 id="poly-heading" className="text-2xl font-bold text-zinc-100">
            <Bilingual en="Polymarket · top 5 mispricings" zh="Polymarket · 5 大错配" />
          </h2>
          <p className={SECTION_EYEBROW}>
            <Bilingual en="flag = Δ ≥ 5pp" zh="flag = Δ ≥ 5pp" />
          </p>
        </div>
        {bundle.polymarket.length === 0 ? (
          <p className="rounded-2xl bg-zinc-900/40 p-6 text-sm italic text-zinc-500 ring-1 ring-zinc-800">
            <Bilingual
              en="No Polymarket events scored today. Returning when the next ensemble run completes."
              zh="今天没有评分的 Polymarket 事件。下一次 ensemble 跑完后会刷新。"
            />
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {bundle.polymarket.map((p) => (
              <PredictionCard key={p.slug} polymarket={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function FixtureBanner() {
  return (
    <div className="mb-6 rounded-2xl bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200 ring-1 ring-yellow-500/30">
      <Bilingual
        en={
          <>
            <strong>Preview data.</strong> The{" "}
            <code className="rounded bg-yellow-500/10 px-1.5 py-0.5 font-mono text-xs">
              predictions-feed
            </code>{" "}
            GitHub sync isn&apos;t live yet. These cards mirror the real JSONL shape so the
            page renders end-to-end. See{" "}
            <code className="rounded bg-yellow-500/10 px-1.5 py-0.5 font-mono text-xs">
              docs/predictions-launch-2026-06-07.md
            </code>{" "}
            for the sync script.
          </>
        }
        zh={
          <>
            <strong>预览数据。</strong>{" "}
            <code className="rounded bg-yellow-500/10 px-1.5 py-0.5 font-mono text-xs">
              predictions-feed
            </code>{" "}
            的 GitHub 同步还没接好。这些卡片用真实 JSONL 形态的 fixture,页面整链路可见。
            同步脚本见{" "}
            <code className="rounded bg-yellow-500/10 px-1.5 py-0.5 font-mono text-xs">
              docs/predictions-launch-2026-06-07.md
            </code>
            。
          </>
        }
      />
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-3 py-8">
      <div className="h-7 w-48 animate-pulse rounded bg-zinc-800/60" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800" />
        ))}
      </div>
    </div>
  );
}
