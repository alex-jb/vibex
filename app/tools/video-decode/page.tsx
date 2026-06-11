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
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { checkQuota, consumeDecode, grantPack, type QuotaStatus } from "@/lib/video-quota";

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
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "fetching" | "uploading" | "decoding" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DecodeResponse["result"] | null>(null);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // Quota check + ?pack=N redirect handler — refreshes on mount only.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pack = params.get("pack");
    if (pack && !Number.isNaN(Number(pack))) {
      grantPack(Number(pack));
      // Scrub the params so a refresh doesn't double-credit.
      window.history.replaceState({}, "", "/tools/video-decode");
    }
    setQuota(checkQuota());
  }, []);

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

  async function decodeUrl() {
    if (!url.trim()) return;
    const q = checkQuota();
    if (!q.can_decode) {
      setShowPaywall(true);
      return;
    }
    setStatus("fetching");
    setError(null);
    setResult(null);

    try {
      setStatus("decoding");
      const res = await fetch("/api/video-decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json: DecodeResponse = await res.json();
      if (!json.ok || !json.result) {
        setStatus("error");
        setError(json.error ?? "decode failed");
        return;
      }
      setQuota(consumeDecode());
      setResult(json.result);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "network error");
    }
  }

  async function decodeUpload() {
    if (!file) return;
    const q = checkQuota();
    if (!q.can_decode) {
      setShowPaywall(true);
      return;
    }
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
      setQuota(consumeDecode());
      setResult(json.result);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "network error");
    }
  }

  const decode = mode === "url" ? decodeUrl : decodeUpload;
  const canDecode = mode === "url" ? !!url.trim() : !!file;

  function reset() {
    setFile(null);
    setUrl("");
    setResult(null);
    setError(null);
    setStatus("idle");
  }

  const t = lang === "zh"
    ? {
        title: "AI 视频拆解",
        subtitle: "粘一个抖音链接,Gemini 2.5 Flash 在 30 秒内告诉你前 3 秒 hook 公式、节奏切点、CTA、情感钩,生成 3 条仿写脚本。",
        modeUrl: "🔗 粘链接",
        modeUpload: "📹 上传 mp4",
        urlPlaceholder: "粘抖音链接,e.g. https://v.douyin.com/...",
        urlHint: "支持抖音 / TikTok。小红书 Phase 2 上(可以先用上传 mp4)。",
        dropHint: "拖一个 .mp4 进来",
        orPick: "或点这里选文件",
        decoding: "Gemini 正在看...",
        fetching: "正在从平台抓视频...",
        uploading: "上传中...",
        rerun: "再试一个",
        cta: "开始拆解 →",
      }
    : {
        title: "AI Video Decoder",
        subtitle: "Paste a Douyin link. Gemini 2.5 Flash returns the first-3-second hook formula, rhythm beats, CTA, emotional hook, and 3 remix scripts in ~30 seconds.",
        modeUrl: "🔗 Paste URL",
        modeUpload: "📹 Upload mp4",
        urlPlaceholder: "Paste Douyin URL, e.g. https://v.douyin.com/...",
        urlHint: "Supports Douyin / TikTok. Xiaohongshu coming in Phase 2 (use mp4 upload for now).",
        dropHint: "Drop an .mp4 here",
        orPick: "or click to pick a file",
        decoding: "Gemini is watching...",
        fetching: "Fetching from platform...",
        uploading: "Uploading...",
        rerun: "Try another",
        cta: "Decode →",
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
            {/* Mode toggle — URL paste vs mp4 upload */}
            <div className="mb-4 flex gap-2 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-1">
              <button
                type="button"
                onClick={() => setMode("url")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "url"
                    ? "bg-[var(--accent-indigo)] text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t.modeUrl}
              </button>
              <button
                type="button"
                onClick={() => setMode("upload")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "upload"
                    ? "bg-[var(--accent-indigo)] text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t.modeUpload}
              </button>
            </div>

            {mode === "url" ? (
              <div>
                <input
                  type="url"
                  placeholder={t.urlPlaceholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-[var(--r-card)] border border-[var(--border-strong)] bg-[var(--bg-elev)] px-4 py-4 text-zinc-100 placeholder:text-zinc-500 focus:border-[var(--accent-indigo)] focus:outline-none font-mono text-sm"
                  spellCheck={false}
                  autoComplete="off"
                />
                <p className="mt-2 text-xs text-zinc-500">{t.urlHint}</p>
              </div>
            ) : (
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
            )}

            <button
              onClick={decode}
              disabled={!canDecode || status === "fetching" || status === "uploading" || status === "decoding"}
              className="mt-4 w-full rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {status === "fetching"
                ? t.fetching
                : status === "uploading"
                ? t.uploading
                : status === "decoding"
                ? t.decoding
                : t.cta}
            </button>

            {error && (
              <div className="mt-4 rounded-[var(--r-card)] border border-rose-500/40 bg-rose-500/5 p-4 text-sm text-rose-200">
                ⚠ {error}
              </div>
            )}

            {quota && (
              <p className="mt-3 text-center text-xs text-zinc-500">
                {quota.paid_credits > 0 ? (
                  <>
                    💳 {quota.paid_credits} {lang === "zh" ? "次预付剩余" : "prepaid left"} ·{" "}
                  </>
                ) : (
                  <>
                    🎁 {quota.free_remaining}/{quota.free_per_day}{" "}
                    {lang === "zh" ? "今日免费" : "free today"} ·{" "}
                  </>
                )}
                {lang === "zh" ? "成本 ~$0.015/视频" : "~$0.015/video cost"}
              </p>
            )}
          </>
        )}

        {/* Paywall modal — shown when quota hits 0 */}
        {showPaywall && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowPaywall(false)}
          >
            <div
              className="max-w-md w-full rounded-[var(--r-card)] border border-[var(--accent-indigo)] bg-[var(--bg-elev)] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">🎯</div>
                <h3 className="text-2xl font-bold text-zinc-100">
                  {lang === "zh" ? "今日免费额度用完" : "Daily free limit reached"}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  {lang === "zh"
                    ? "买个 $5 包,100 次视频拆解,永不过期。"
                    : "Grab a $5 pack — 100 video decodes, never expire."}
                </p>
              </div>

              <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-deep)] p-4 mb-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-zinc-100">$5</span>
                  <span className="text-sm text-zinc-500">/ 100 decodes</span>
                </div>
                <ul className="mt-3 text-xs text-zinc-400 space-y-1">
                  <li>✓ {lang === "zh" ? "$0.05/视频 · 平台 ~$0.015 成本" : "$0.05 each · ~$0.015 platform cost"}</li>
                  <li>✓ {lang === "zh" ? "永不过期" : "Never expires"}</li>
                  <li>✓ {lang === "zh" ? "同样的拆解 + 仿写脚本" : "Same hook analysis + remix scripts"}</li>
                </ul>
              </div>

              {process.env.NEXT_PUBLIC_STRIPE_VIDEO_DECODE_URL ? (
                <a
                  href={process.env.NEXT_PUBLIC_STRIPE_VIDEO_DECODE_URL}
                  className="block w-full text-center rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 font-semibold text-white hover:opacity-90"
                >
                  {lang === "zh" ? "去 Stripe 付款 →" : "Pay via Stripe →"}
                </a>
              ) : (
                <div className="rounded-md bg-amber-500/10 border border-amber-500/40 px-4 py-3 text-sm text-amber-200">
                  ⚠ {lang === "zh"
                    ? "Stripe Payment Link 尚未配置。请管理员设 NEXT_PUBLIC_STRIPE_VIDEO_DECODE_URL"
                    : "Stripe Payment Link not configured. Admin: set NEXT_PUBLIC_STRIPE_VIDEO_DECODE_URL"}
                </div>
              )}

              <button
                onClick={() => setShowPaywall(false)}
                className="mt-3 w-full text-center text-sm text-zinc-500 hover:text-zinc-300"
              >
                {lang === "zh" ? "稍后" : "Maybe later"}
              </button>
            </div>
          </div>
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
                  <div className="mt-2 text-sm text-zinc-300">&ldquo;{result.analysis.cta.line}&rdquo;</div>
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

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const text =
                    lang === "zh"
                      ? `🎬 AI 拆解视频 hook:\n\n前 3 秒 hook: ${result.analysis.hook_first_3s.formula}\n情感钩: ${result.analysis.emotional_hook}\nVirality: ${result.analysis.virality_score}/100\n\n你的视频也想拆解? vibexforge.com/tools/video-decode`
                      : `🎬 AI hook breakdown:\n\nFirst-3s hook: ${result.analysis.hook_first_3s.formula}\nEmotional hook: ${result.analysis.emotional_hook}\nVirality: ${result.analysis.virality_score}/100\n\nDecode yours: vibexforge.com/tools/video-decode`;
                  const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
                className="rounded-[var(--r-card)] border border-[var(--accent-indigo)] bg-[var(--accent-indigo)]/10 px-6 py-3 text-zinc-100 hover:bg-[var(--accent-indigo)]/20 font-medium"
              >
                𝕏 {lang === "zh" ? "分享到 X" : "Share to X"}
              </button>
              <button
                onClick={reset}
                className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] px-6 py-3 text-zinc-200 hover:border-[var(--border-strong)]"
              >
                ← {t.rerun}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
