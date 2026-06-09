"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import {
  CHAPTERS,
  getChapter,
  isUnlocked,
  TOTAL_XP,
  type ChapterSlug,
} from "@/lib/learn";

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

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // quota exceeded — ignore
  }
}

export default function LessonPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const isZh = lang === "zh";

  const chapter = useMemo(() => getChapter(params.slug), [params.slug]);
  const [progress, setProgress] = useState<Progress>({ xp: 0, completed: [] });
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!chapter) {
    return (
      <main className="min-h-screen bg-[var(--bg-deep)] p-12 text-zinc-100">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold">Chapter not found</h1>
          <Link href="/learn" className="mt-6 inline-block text-[var(--accent-indigo)] hover:underline">
            ← Back to AICG Academy
          </Link>
        </div>
      </main>
    );
  }

  const completedSet = new Set<ChapterSlug>(progress.completed);
  if (!isUnlocked(chapter, completedSet)) {
    return (
      <main className="min-h-screen bg-[var(--bg-deep)] p-12 text-zinc-100">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold">
            {isZh ? "先完成上一关 🔒" : "Finish the previous chapter first 🔒"}
          </h1>
          <Link href="/learn" className="mt-6 inline-block text-[var(--accent-indigo)] hover:underline">
            ← {isZh ? "回到地图" : "Back to map"}
          </Link>
        </div>
      </main>
    );
  }

  const done = completedSet.has(chapter.slug);

  function complete() {
    if (done || !chapter) return;
    const next: Progress = {
      xp: progress.xp + chapter.xpReward,
      completed: [...progress.completed, chapter.slug],
    };
    setProgress(next);
    saveProgress(next);
    setFeedback(
      isZh
        ? `🎉 +${chapter.xpReward} XP. 这关作品已记入你的 VibeX 卡草稿。`
        : `🎉 +${chapter.xpReward} XP. Your work is now drafted into your VibeX project card.`
    );
  }

  async function runPrompt() {
    if (!chapter) return;
    const promptTrim = prompt.trim();
    if (promptTrim.length < 8) {
      setFeedback(
        isZh
          ? "再写多一点细节,提示词太短了。"
          : "Add a bit more detail — the prompt is too short to summon something good."
      );
      return;
    }
    setImgLoading(true);
    setFeedback("");
    const url = `/api/img?prompt=${encodeURIComponent(promptTrim)}&w=640&h=640`;
    setImageUrl(url);
    setImgLoading(false);
  }

  const isImageChapter = chapter.slug === "ai-drawing";

  // Codedex-style progress bar position: chapter % within the 3-book journey.
  const chapterIndex = CHAPTERS.findIndex((c) => c.slug === chapter.slug);
  const chapterProgress = done ? 100 : imageUrl || feedback ? 60 : 20;

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] text-zinc-100">
      {/* Top progress bar — chapter completion within journey */}
      <div className="sticky top-0 z-20 border-b border-[var(--border-soft)] bg-[var(--bg-deep)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          <Link href="/learn" className="text-xs text-zinc-500 hover:text-zinc-300">
            ← {isZh ? "地图" : "Map"}
          </Link>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            Book {chapterIndex + 1} / {CHAPTERS.length}
          </div>
          <div className="flex-1">
            <div className="h-1 overflow-hidden rounded-full bg-[var(--bg-elev)]">
              <div
                className="h-full bg-[var(--accent-indigo)] transition-all duration-500"
                style={{ width: `${chapterProgress}%` }}
              />
            </div>
          </div>
          <div className="font-mono text-xs text-zinc-400">
            {progress.xp} <span className="text-zinc-500">/ {TOTAL_XP} XP</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Chapter header */}
        <div className="flex items-center gap-3">
          <div className="text-4xl">{chapter.emoji}</div>
          <div>
            <div className="font-mono text-xs text-zinc-500">
              Chapter {chapter.num} · +{chapter.xpReward} XP
            </div>
            <h1 className="mt-1 text-3xl font-bold leading-tight">
              {isZh ? chapter.titleZh : chapter.titleEn}
            </h1>
          </div>
        </div>

        {/* 2-pane: prose left, interactive right (collapses on mobile) */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.2fr]">
          {/* LEFT — prose + formula + hint */}
          <aside className="space-y-5">
            <div className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                {isZh ? "本关目标" : "Lesson goal"}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                {isZh ? chapter.blurbZh : chapter.blurbEn}
              </p>
            </div>

            {isImageChapter && (
              <div className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                  {isZh ? "公式" : "Formula"}
                </div>
                <div className="mt-3 font-mono text-sm leading-relaxed">
                  {isZh ? (
                    <>
                      <div><span className="text-[var(--accent-indigo)]">主体</span>: 画的是什么</div>
                      <div className="mt-1"><span className="text-amber-400">风格</span>: 像谁画的</div>
                      <div className="mt-1"><span className="text-emerald-400">光线</span>: 时辰 / 氛围</div>
                      <div className="mt-1"><span className="text-rose-400">构图</span>: 角度 / 距离</div>
                    </>
                  ) : (
                    <>
                      <div><span className="text-[var(--accent-indigo)]">subject</span>: what&apos;s in the frame</div>
                      <div className="mt-1"><span className="text-amber-400">style</span>: whose hand drew it</div>
                      <div className="mt-1"><span className="text-emerald-400">lighting</span>: time of day / mood</div>
                      <div className="mt-1"><span className="text-rose-400">composition</span>: angle / distance</div>
                    </>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowHint((v) => !v)}
              className="flex w-full items-center justify-between rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-4 text-left text-sm hover:border-[var(--accent-indigo)]"
            >
              <span>
                <span className="text-base">💡</span>{" "}
                {isZh ? "卡住了?60 秒提示" : "Stuck? 60-second hint"}
              </span>
              <span className="text-zinc-500">{showHint ? "−" : "+"}</span>
            </button>
            {showHint && (
              <div className="rounded-[var(--r-card)] border border-amber-500/30 bg-[var(--bg-elev)] p-4 text-sm text-zinc-300">
                {isZh
                  ? "试试 4 个槽位都填: \"a [主体] in [风格], [光线], [构图]\"。例如 \"a calico cat coding at a Brooklyn cafe, retro anime style, golden hour, dynamic side angle\"。每个槽位 2-4 个词就够。"
                  : 'Fill all 4 slots: "a [subject] in [style], [lighting], [composition]". Example: "a calico cat coding at a Brooklyn cafe, retro anime style, golden hour, dynamic side angle." 2-4 words per slot is plenty.'}
              </div>
            )}
          </aside>

          {/* RIGHT — interactive surface */}
          <section className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5">
            {isImageChapter ? (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                  {isZh ? "练习场" : "Workspace"}
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    isZh
                      ? "a calico cat coding at a Brooklyn cafe, retro anime style, golden hour light, dynamic side angle"
                      : "a calico cat coding at a Brooklyn cafe, retro anime style, golden hour light, dynamic side angle"
                  }
                  className="mt-3 min-h-28 w-full rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] p-3 font-mono text-sm text-zinc-100 outline-none focus:border-[var(--accent-indigo)]"
                />

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={runPrompt}
                    disabled={imgLoading}
                    className="rounded-[var(--r-card)] border border-[var(--accent-indigo)] bg-[var(--accent-indigo)]/15 px-5 py-2.5 text-sm font-semibold text-[var(--accent-indigo)] hover:bg-[var(--accent-indigo)]/25 disabled:opacity-50"
                  >
                    {imgLoading
                      ? isZh ? "运行中..." : "Running..."
                      : isZh ? "▶ Run" : "▶ Run"}
                  </button>
                  {!done && imageUrl && (
                    <button
                      onClick={complete}
                      className="rounded-[var(--r-card)] bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400"
                    >
                      {isZh ? `✓ Submit · +${chapter.xpReward} XP` : `✓ Submit · +${chapter.xpReward} XP`}
                    </button>
                  )}
                </div>

                {imageUrl && (
                  <div className="mt-5 overflow-hidden rounded-[var(--r-card)] border border-[var(--border-soft)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={prompt} className="block w-full" width={640} height={640} />
                  </div>
                )}

                {feedback && (
                  <div className="mt-4 rounded-[var(--r-card)] border border-emerald-500/30 bg-[var(--bg-deep)] p-3 text-sm text-zinc-200">
                    {feedback}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-400">
                  {isZh ? "本周上线" : "Live this week"}
                </div>
                <p className="mt-3 text-sm text-zinc-300">
                  {isZh
                    ? "互动版本编写中。先标记完成可解锁下一关 — 我们会给你的 VibeX 卡占好位置。"
                    : "Interactive version landing this week. Mark complete to unlock the next chapter — we'll save the slot on your VibeX card."}
                </p>
                {!done && (
                  <button
                    onClick={complete}
                    className="mt-5 rounded-[var(--r-card)] bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400"
                  >
                    {isZh ? `✓ Submit · +${chapter.xpReward} XP` : `✓ Submit · +${chapter.xpReward} XP`}
                  </button>
                )}
                {feedback && (
                  <div className="mt-4 rounded-[var(--r-card)] border border-emerald-500/30 bg-[var(--bg-deep)] p-3 text-sm text-zinc-200">
                    {feedback}
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {done && (
          <section className="mt-8 rounded-[var(--r-card)] border border-emerald-500/40 bg-[var(--bg-elev)] p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🏆</div>
              <div className="flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400">
                  {isZh ? "已通关" : "Chapter cleared"}
                </div>
                <h3 className="mt-1 text-xl font-bold">
                  {isZh ? `+${chapter.xpReward} XP 入账` : `+${chapter.xpReward} XP banked`}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {isZh
                    ? `进度 ${progress.xp}/${TOTAL_XP} XP · 通关 ${progress.completed.length}/${CHAPTERS.length} 章`
                    : `Progress ${progress.xp}/${TOTAL_XP} XP · ${progress.completed.length}/${CHAPTERS.length} chapters cleared`}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {CHAPTERS.filter((c) => c.num === chapter.num + 1).map((next) => (
                    <button
                      key={next.slug}
                      onClick={() => router.push(`/learn/${next.slug}`)}
                      className="rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      {isZh ? `Next: ${next.titleZh} →` : `Next: ${next.titleEn} →`}
                    </button>
                  ))}
                  <Link
                    href="/learn"
                    className="rounded-[var(--r-card)] border border-[var(--border-soft)] px-4 py-2 text-sm text-zinc-100 hover:border-[var(--accent-indigo)]"
                  >
                    {isZh ? "回到地图" : "Back to map"}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
