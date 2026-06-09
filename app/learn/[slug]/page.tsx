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
    // quota exceeded — ignore, soft-fail
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

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!chapter) {
    return (
      <main className="min-h-screen bg-[var(--bg-deep)] p-12 text-zinc-100">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold">Chapter not found</h1>
          <Link
            href="/learn"
            className="mt-6 inline-block text-[var(--accent-indigo)] hover:underline"
          >
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
          <Link
            href="/learn"
            className="mt-6 inline-block text-[var(--accent-indigo)] hover:underline"
          >
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

  async function generate() {
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

  // Chapter-specific UI. Only Chapter 1 ships interactive image gen in this
  // release; chapters 2 and 3 stub a "coming this week" message + Complete
  // button so the funnel works end-to-end while the deeper lessons land.
  const isImageChapter = chapter.slug === "ai-drawing";

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/learn" className="text-xs text-zinc-500 hover:text-zinc-300">
          ← {isZh ? "回到 AICG Academy" : "Back to AICG Academy"}
        </Link>

        <div className="mt-5 flex items-center gap-3">
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

        <p className="mt-4 text-zinc-400">{isZh ? chapter.blurbZh : chapter.blurbEn}</p>

        {isImageChapter ? (
          <section className="mt-10 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              {isZh ? "练习" : "Exercise"}
            </div>
            <p className="mt-3 text-sm text-zinc-300">
              {isZh ? (
                <>
                  公式: <span className="font-mono text-[var(--accent-indigo)]">主体</span> +{" "}
                  <span className="font-mono text-amber-400">风格</span> +{" "}
                  <span className="font-mono text-emerald-400">光线</span> +{" "}
                  <span className="font-mono text-rose-400">构图</span>
                </>
              ) : (
                <>
                  Formula: <span className="font-mono text-[var(--accent-indigo)]">subject</span> +{" "}
                  <span className="font-mono text-amber-400">style</span> +{" "}
                  <span className="font-mono text-emerald-400">lighting</span> +{" "}
                  <span className="font-mono text-rose-400">composition</span>
                </>
              )}
            </p>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isZh
                  ? "a calico cat coding at a Brooklyn cafe, retro anime style, golden hour light, dynamic side angle"
                  : "a calico cat coding at a Brooklyn cafe, retro anime style, golden hour light, dynamic side angle"
              }
              className="mt-5 min-h-24 w-full rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] p-3 font-mono text-sm text-zinc-100 outline-none focus:border-[var(--accent-indigo)]"
            />

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={generate}
                disabled={imgLoading}
                className="rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {imgLoading
                  ? isZh
                    ? "召唤中..."
                    : "Summoning..."
                  : isZh
                    ? "🎨 召唤图像"
                    : "🎨 Summon image"}
              </button>
              {!done && imageUrl && (
                <button
                  onClick={complete}
                  className="rounded-[var(--r-card)] border border-emerald-500/40 px-4 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10"
                >
                  {isZh ? `✓ 完成本关 (+${chapter.xpReward} XP)` : `✓ Complete (+${chapter.xpReward} XP)`}
                </button>
              )}
            </div>

            {imageUrl && (
              <div className="mt-6 overflow-hidden rounded-[var(--r-card)] border border-[var(--border-soft)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={prompt}
                  className="block w-full"
                  width={640}
                  height={640}
                />
              </div>
            )}

            {feedback && <div className="mt-4 text-sm text-zinc-300">{feedback}</div>}
          </section>
        ) : (
          <section className="mt-10 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-amber-400">
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
                className="mt-5 rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                {isZh ? `✓ 完成本关 (+${chapter.xpReward} XP)` : `✓ Complete (+${chapter.xpReward} XP)`}
              </button>
            )}
            {feedback && <div className="mt-4 text-sm text-zinc-300">{feedback}</div>}
          </section>
        )}

        {done && (
          <section className="mt-8 rounded-[var(--r-card)] border border-emerald-500/40 bg-[var(--bg-elev)] p-5 text-sm">
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-400">
              {isZh ? "已完成" : "Done"}
            </div>
            <p className="mt-2 text-zinc-300">
              {isZh
                ? `本关已计入。当前 ${progress.xp}/${TOTAL_XP} XP。`
                : `Logged. Current ${progress.xp}/${TOTAL_XP} XP.`}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {CHAPTERS.filter((c) => c.num === chapter.num + 1).map((next) => (
                <button
                  key={next.slug}
                  onClick={() => router.push(`/learn/${next.slug}`)}
                  className="rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  {isZh ? `下一关: ${next.titleZh} →` : `Next: ${next.titleEn} →`}
                </button>
              ))}
              <Link
                href="/learn"
                className="rounded-[var(--r-card)] border border-[var(--border-soft)] px-4 py-2 text-sm text-zinc-100 hover:border-[var(--accent-indigo)]"
              >
                {isZh ? "回到地图" : "Back to map"}
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
