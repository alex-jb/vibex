"use client";

/**
 * /tools/video-decode — 用户拖一个抖音 / 小红书下载的 mp4,Gemini 拆解
 * 前 3 秒 hook / 节奏 / CTA / 情感钩 / 3 条改编脚本。
 *
 * Phase 1: 用户自己下载视频 (douyin-downloader / xhs-downloader 开源工具),
 * 我们只做"听 + 拆"层。法律姿态: 不抓取,只分析。
 *
 * Phase 2: URL 粘贴 + Railway Python sidecar 跑 yt-dlp / ReaJason/xhs。
 */
import { useState } from "react";
import { useLang } from "@/lib/i18n";

interface DecodeResponse {
  ok: boolean;
  error?: string;
  result?: {
    analysis: {
      language: string;
      duration_sec_estimate: number;
      hook_first_3s: {
        formula: string;
        transcript: string;
        why_it_works: string;
      };
      rhythm: {
        beat_timestamps_sec: number[];
        avg_shot_length_sec: number;
      };
      cta: { type: string; placement_sec: number | null; line: string };
      emotional_hook: string;
      remix_scripts: string[];
      virality_score: number;
      red_flags: string[];
    };
    model: string;
    cost_usd_estimate: number;
    duration_ms: number;
    file_uri: string;
  };
}

export default function VideoDecodePage() {
  const { lang } = useLang();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "decoding" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DecodeResponse["result"] | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  async function decode() {
    if (!file) return;
    setStatus("uploading");
    setError(null);
    setResult(null);

    const form = new FormData();
    form.append("video", file);

    try {
      setStatus("decoding");
      const res = await fetch("/api/video-decode", { method: "POST", body: form });
      const json: DecodeResponse = await res.json();
      if (!json.ok || !json.result) {
        setStatus("error");
        setError(json.error ?? "decode failed");
        return;
      }
      setResult(json.result);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "network error");
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setStatus("idle");
  }

  const t = lang === "zh"
    ? {
        title: "AI 视频拆解",
        subtitle: "抖音 / 小红书的 mp4 文件,Gemini 2.5 Flash 在 30 秒内告诉你前 3 秒 hook 公式、节奏切点、CTA、情感钩,生成 3 条仿写脚本。",
        dropHint: "拖一个 .mp4 进来",
        orPick: "或点这里选文件",
        decoding: "Gemini 正在看...",
        uploading: "上传中...",
        rerun: "再试一个",
        howGet: "怎么拿到 .mp4?",
        howGetSteps: [
          "抖音: 用 douyin-downloader (GitHub OSS) 或浏览器 F12 抓 mp4 直链",
          "小红书: 用 xhs-downloader / ReaJason/xhs OSS Python 库",
          "图省事: tikmate.online / snaptik 等第三方网站 (有水印)",
        ],
        legalNote: "我们只分析你已经下载到本地的视频,不替你抓。这是合规的唯一姿态。",
      }
    : {
        title: "AI Video Decoder",
        subtitle: "Drop a Douyin / Xiaohongshu mp4. Gemini 2.5 Flash returns the first-3-second hook formula, rhythm beats, CTA, emotional hook, and 3 remix scripts in ~30 seconds.",
        dropHint: "Drop an .mp4 here",
        orPick: "or click to pick a file",
        decoding: "Gemini is watching...",
        uploading: "Uploading...",
        rerun: "Try another",
        howGet: "How to get the .mp4?",
        howGetSteps: [
          "Douyin: douyin-downloader (GitHub OSS) or F12 → Network tab",
          "Xiaohongshu: xhs-downloader / ReaJason/xhs Python lib",
          "Quick: tikmate.online / snaptik (third-party, may add watermark)",
        ],
        legalNote: "We only analyze videos you've already downloaded. Not a scraper. That's the only compliant stance.",
      };

  return (
    <main className="min-h-screen px-6 py-12 text-zinc-100" style={{ background: "var(--bg-deep)" }}>
      <div className="mx-auto max-w-3xl">
        <header className="text-center mb-10">
          <div className="text-5xl mb-3">🎬</div>
          <p className="text-xs uppercase tracking-widest text-[var(--accent-indigo)]">
            VibeXForge · Tools · Alpha
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight">{t.title}</h1>
          <p className="mt-4 text-zinc-400 leading-relaxed">{t.subtitle}</p>
        </header>

        {!result && status !== "done" && (
          <>
            <div
              onDrop={onDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              className={`relative rounded-[var(--r-card)] border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
                dragOver
                  ? "border-[var(--accent-indigo)] bg-[var(--accent-indigo)]/5"
                  : "border-[var(--border-soft)] bg-[var(--bg-elev)] hover:border-[var(--border-strong)]"
              }`}
              onClick={() => document.getElementById("video-input")?.click()}
            >
              <input
                id="video-input"
                type="file"
                accept="video/mp4,video/*"
                onChange={onPick}
                className="hidden"
              />
              {file ? (
                <>
                  <div className="text-4xl mb-3">📹</div>
                  <div className="text-zinc-200 font-medium">{file.name}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "video/mp4"}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">⬆️</div>
                  <div className="text-zinc-200 font-medium">{t.dropHint}</div>
                  <div className="text-xs text-zinc-500 mt-1">{t.orPick}</div>
                </>
              )}
            </div>

            <button
              onClick={decode}
              disabled={!file || status === "uploading" || status === "decoding"}
              className="mt-4 w-full rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {status === "uploading"
                ? t.uploading
                : status === "decoding"
                ? t.decoding
                : lang === "zh"
                ? "开始拆解 →"
                : "Decode →"}
            </button>

            {error && (
              <div className="mt-4 rounded-[var(--r-card)] border border-rose-500/40 bg-rose-500/5 p-4 text-sm text-rose-200">
                ⚠ {error}
              </div>
            )}

            <details className="mt-10 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-200">
                {t.howGet}
              </summary>
              <ul className="mt-3 list-disc list-inside space-y-1.5 text-sm text-zinc-400">
                {t.howGetSteps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-zinc-500 italic">{t.legalNote}</p>
            </details>
          </>
        )}

        {result && status === "done" && (
          <div className="space-y-6">
            <div className="rounded-[var(--r-card)] border border-[var(--accent-indigo)] bg-[var(--bg-elev)] p-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-[var(--accent-indigo)]">
                    {lang === "zh" ? "病毒指数 · Gemini 自评" : "Virality score · Gemini estimate"}
                  </div>
                  <div className="text-5xl font-bold mt-2 tabular-nums">
                    {result.analysis.virality_score}
                    <span className="text-2xl text-zinc-500">/100</span>
                  </div>
                </div>
                <div className="text-right text-xs text-zinc-500">
                  <div>{result.model}</div>
                  <div>${result.cost_usd_estimate.toFixed(4)} · {(result.duration_ms / 1000).toFixed(1)}s</div>
                </div>
              </div>
            </div>

            <section className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6">
              <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
                {lang === "zh" ? "前 3 秒 hook" : "First-3-second hook"}
              </div>
              <div className="text-2xl font-semibold text-[var(--accent-indigo)] mb-2">
                {result.analysis.hook_first_3s.formula}
              </div>
              <blockquote className="border-l-2 border-[var(--accent-indigo)] pl-4 italic text-zinc-300 my-3">
                {result.analysis.hook_first_3s.transcript}
              </blockquote>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {result.analysis.hook_first_3s.why_it_works}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5">
                <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
                  {lang === "zh" ? "情感钩" : "Emotional hook"}
                </div>
                <div className="text-xl font-semibold text-amber-400">
                  {result.analysis.emotional_hook}
                </div>
              </section>
              <section className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5">
                <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">CTA</div>
                <div className="text-sm">
                  <span className="font-semibold text-emerald-400 uppercase">
                    {result.analysis.cta.type}
                  </span>
                  {result.analysis.cta.placement_sec !== null && (
                    <span className="text-zinc-500 ml-2">@ {result.analysis.cta.placement_sec}s</span>
                  )}
                </div>
                {result.analysis.cta.line && (
                  <div className="mt-2 text-sm text-zinc-300">"{result.analysis.cta.line}"</div>
                )}
              </section>
            </div>

            <section className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5">
              <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
                {lang === "zh" ? "节奏切点" : "Rhythm beats"} · avg shot {result.analysis.rhythm.avg_shot_length_sec.toFixed(1)}s
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.analysis.rhythm.beat_timestamps_sec.map((t) => (
                  <span key={t} className="rounded bg-zinc-800 px-2 py-0.5 text-xs tabular-nums">
                    {t.toFixed(1)}s
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[var(--r-card)] border border-amber-500/40 bg-amber-500/5 p-6">
              <div className="text-xs uppercase tracking-widest text-amber-400 mb-3">
                ✨ {lang === "zh" ? "3 条仿写脚本" : "3 remix scripts"}
              </div>
              <ol className="space-y-4 list-decimal list-inside">
                {result.analysis.remix_scripts.map((s, i) => (
                  <li key={i} className="text-sm text-zinc-200 leading-relaxed">
                    {s}
                  </li>
                ))}
              </ol>
            </section>

            {result.analysis.red_flags.length > 0 && (
              <section className="rounded-[var(--r-card)] border border-rose-500/40 bg-rose-500/5 p-4">
                <div className="text-xs uppercase tracking-widest text-rose-400 mb-2">
                  ⚠ {lang === "zh" ? "风险标识" : "Red flags"}
                </div>
                <ul className="list-disc list-inside text-sm text-rose-200 space-y-1">
                  {result.analysis.red_flags.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </section>
            )}

            <button
              onClick={reset}
              className="w-full rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] px-6 py-3 text-zinc-200 hover:border-[var(--border-strong)]"
            >
              ← {t.rerun}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
