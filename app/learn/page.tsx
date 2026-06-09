"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { CHAPTERS, TOTAL_XP, levelFromXp, isUnlocked, type ChapterSlug } from "@/lib/learn";

const STORAGE_KEY = "aicg-academy-progress-v1";

interface Progress {
  xp: number;
  completed: ChapterSlug[];
}

function loadProgress(): Progress {
  if (typeof window === "undefined") return { xp: 0, completed: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { xp: 0, completed: [] };
    const parsed = JSON.parse(raw);
    return {
      xp: Number(parsed.xp) || 0,
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
    };
  } catch {
    return { xp: 0, completed: [] };
  }
}

export default function LearnHome() {
  const { lang } = useLang();
  const isZh = lang === "zh";
  const [progress, setProgress] = useState<Progress>({ xp: 0, completed: [] });

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const completedSet = new Set<ChapterSlug>(progress.completed);
  const lvl = levelFromXp(progress.xp);
  const pct = Math.min(100, (progress.xp / TOTAL_XP) * 100);

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.4em] text-zinc-500">
            AICG Academy · VibeXForge
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-[var(--border-soft)] px-2 py-0.5 font-mono text-[10px] text-[var(--accent-indigo)]">
              Lv.{lvl.level}
            </div>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-[var(--bg-elev)]">
              <div
                className="h-full bg-[var(--accent-indigo)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="font-mono text-xs text-zinc-400">
              {progress.xp} <span className="text-zinc-500">XP</span>
            </div>
          </div>
        </div>

        <header className="mt-10">
          <div className="inline-block rounded-full border border-[var(--border-soft)] px-3 py-1 font-mono text-[11px] text-zinc-400">
            {isZh ? "免费 · 双语 · 浏览器内运行" : "Free · Bilingual · Runs in your browser"}
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            {isZh ? (
              <>
                3 关学会 AI 创作。
                <br />
                <span className="text-[var(--accent-indigo)]">每完成 1 关,得一张可进化的 VibeX 卡。</span>
              </>
            ) : (
              <>
                3 chapters to AI creator level.
                <br />
                <span className="text-[var(--accent-indigo)]">
                  Each finish ships an evolving VibeX project card.
                </span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-zinc-400">
            {isZh
              ? "Anthropic Academy 和 OpenAI Academy 教 AI 101 是免费的。AICG 在你看完那些之后接力 —— 实战项目、双语、能产作品发出去。"
              : "Anthropic Academy and OpenAI Academy teach AI 101 free. AICG picks up where they leave off — real artifacts, bilingual, and the output ships to VibeX so the world can see it."}
          </p>
        </header>

        <section className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {CHAPTERS.map((c) => {
            const done = completedSet.has(c.slug);
            const unlocked = isUnlocked(c, completedSet);
            const Card = (
              <div
                className={`flex h-full flex-col rounded-[var(--r-card)] border p-5 transition ${
                  unlocked
                    ? "border-[var(--border-soft)] bg-[var(--bg-elev)] hover:border-[var(--accent-indigo)]"
                    : "border-[var(--border-soft)] bg-[var(--bg-elev)] opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{c.emoji}</div>
                  {done ? (
                    <div className="rounded-full border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      DONE
                    </div>
                  ) : unlocked ? (
                    <div className="rounded-full border border-amber-500/40 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                      LIVE
                    </div>
                  ) : (
                    <div className="rounded-full border border-[var(--border-soft)] px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                      LOCKED
                    </div>
                  )}
                </div>
                <div className="mt-4 font-mono text-xs text-zinc-500">
                  Chapter {c.num}
                </div>
                <h3 className="mt-1 text-lg font-semibold leading-snug">
                  {isZh ? c.titleZh : c.titleEn}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  {isZh ? c.blurbZh : c.blurbEn}
                </p>
                <div className="mt-auto flex items-center justify-between pt-5 font-mono text-xs text-zinc-500">
                  <span>+{c.xpReward} XP</span>
                  {unlocked && !done && (
                    <span className="text-[var(--accent-indigo)]">
                      {isZh ? "开始 →" : "Start →"}
                    </span>
                  )}
                </div>
              </div>
            );
            return unlocked ? (
              <Link key={c.slug} href={`/learn/${c.slug}`}>
                {Card}
              </Link>
            ) : (
              <div key={c.slug}>{Card}</div>
            );
          })}
        </section>

        <section className="mt-16 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6 text-sm text-zinc-300">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            {isZh ? "完成 3 关之后" : "After all 3 chapters"}
          </div>
          <p className="mt-3">
            {isZh ? (
              <>
                你的第 3 关作品自动发布到 VibeXForge。
                我们 7 月在纽约开 6 小时 AICG 在场 workshop ($299),
                把你这张卡变成真实可投递的项目。
                <Link href="/aicg-camp" className="ml-1 text-[var(--accent-indigo)] hover:underline">
                  报名抢早鸟 →
                </Link>
              </>
            ) : (
              <>
                Your Chapter 3 artifact auto-publishes to VibeXForge.
                July in NYC: a 6-hour in-person AICG workshop ($299) turns that
                card into a shippable, recruiter-ready project.
                <Link href="/aicg-camp" className="ml-1 text-[var(--accent-indigo)] hover:underline">
                  Reserve early-bird →
                </Link>
              </>
            )}
          </p>
        </section>
      </div>
    </main>
  );
}
