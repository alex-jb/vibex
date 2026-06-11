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
import { saveDecode, getHistory, deleteEntry, type DecodeHistoryEntry } from "@/lib/video-history";
import { matchArchetype, HOOK_ARCHETYPES } from "@/lib/hook-archetypes";

interface DecodeResponse {
  ok: boolean;
  error?: string;
  result?: {
    analysis: {
      language: string;
      duration_sec_estimate: number;
      hook_first_3s: {
        formula: string;
        archetype_slug?: string;
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
  const [history, setHistory] = useState<DecodeHistoryEntry[]>([]);

  // Snapshot "now" on mount + when history changes so relative-time
  // formatting in render stays a pure function. useState + useEffect is
  // the lint-compliant pattern; useMemo with Date.now() still trips
  // react-hooks/rule-of-purity in eslint-plugin-react v5+.
  const [renderTimeMs, setRenderTimeMs] = useState(0);
  useEffect(() => {
    setRenderTimeMs(Date.now());
  }, [history]);

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
    setHistory(getHistory());
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
        // XHS Phase 2 sentinel — auto-suggest mp4 upload as the actual path
        const err = json.error ?? "decode failed";
        if (/501|xiaohongshu|not yet implemented|phase 2/i.test(err)) {
          setError(
            lang === "zh"
              ? "小红书 URL 抓取还在 Phase 2(yt-dlp 没 extractor)。请下载 mp4 后切到上传模式 ↑"
              : "Xiaohongshu URL extraction is Phase 2 (yt-dlp has no extractor). Download the mp4 and switch to upload mode ↑",
          );
          setMode("upload");
          return;
        }
        setError(err);
        return;
      }
      setQuota(consumeDecode());
      setHistory(
        saveDecode({
          source: { mode: "url", url: url.trim() },
          analysis: {
            virality_score: json.result.analysis.virality_score,
            hook_formula: json.result.analysis.hook_first_3s.formula,
            emotional_hook: json.result.analysis.emotional_hook,
            cta_type: json.result.analysis.cta.type,
            duration_sec: json.result.analysis.duration_sec_estimate,
          },
        }),
      );
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
      setHistory(
        saveDecode({
          source: { mode: "upload", filename: file.name },
          analysis: {
            virality_score: json.result.analysis.virality_score,
            hook_formula: json.result.analysis.hook_first_3s.formula,
            emotional_hook: json.result.analysis.emotional_hook,
            cta_type: json.result.analysis.cta.type,
            duration_sec: json.result.analysis.duration_sec_estimate,
          },
        }),
      );
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

        {/* OSS template banner — this UI is the showcase for a self-host pattern.
            We do not subsidize Gemini / Railway costs centrally. Fork the repos,
            bring your own API key, run the sidecar on $5/mo Railway. */}
        <div className="mb-8 rounded-[var(--r-card)] border border-amber-500/40 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔧</span>
            <div className="flex-1 text-sm">
              <div className="font-semibold text-amber-200 mb-1">
                {lang === "zh" ? "这是一个开源模板 — fork 后 self-host" : "This is an OSS template — fork to self-host"}
              </div>
              <p className="text-zinc-300 leading-relaxed">
                {lang === "zh"
                  ? "VibeXForge 不提供托管 SaaS。下方界面是参考实现,你需要自己跑 Railway sidecar + 自己的 Gemini API key 才能拆解视频。10 分钟 setup。"
                  : "VibeXForge does not host this as paid SaaS. The UI below is a reference implementation. Fork the 2 repos, run the Python sidecar on $5/mo Railway, bring your own Gemini API key. 10-minute setup."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <a
                  href="https://github.com/alex-jb/vibex-video-extractor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-200 hover:bg-amber-500/20"
                >
                  📦 sidecar repo →
                </a>
                <a
                  href="https://github.com/alex-jb/vibex-video-decoder-skill"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-200 hover:bg-amber-500/20"
                >
                  🤖 Claude Skill →
                </a>
                <a
                  href="https://github.com/alex-jb/vibex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-200 hover:bg-amber-500/20"
                >
                  🎬 this UI source →
                </a>
              </div>
            </div>
          </div>
        </div>

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

            {/* Recent decodes — local-only history, last 20 */}
            {history.length > 0 && (
              <section className="mt-10">
                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-zinc-500">
                  <span>📚 {lang === "zh" ? "你的最近拆解" : "Your recent decodes"} · {history.length}</span>
                </div>
                <div className="space-y-2">
                  {history.slice(0, 8).map((e) => {
                    const label = e.source.url
                      ? e.source.url.replace(/^https?:\/\//, "").slice(0, 40)
                      : e.source.filename ?? "video";
                    const when = new Date(e.decoded_at);
                    const ago = Math.max(0, Math.floor((renderTimeMs - when.getTime()) / 60000));
                    const agoStr =
                      ago < 1
                        ? lang === "zh" ? "刚刚" : "just now"
                        : ago < 60
                          ? lang === "zh" ? `${ago} 分钟前` : `${ago}m ago`
                          : ago < 1440
                            ? lang === "zh" ? `${Math.floor(ago / 60)} 小时前` : `${Math.floor(ago / 60)}h ago`
                            : lang === "zh" ? `${Math.floor(ago / 1440)} 天前` : `${Math.floor(ago / 1440)}d ago`;
                    return (
                      <div
                        key={e.id}
                        className="flex items-center justify-between rounded-md border border-[var(--border-soft)] bg-[var(--bg-elev)] px-4 py-2.5 hover:border-[var(--border-strong)] transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium tabular-nums text-[var(--accent-indigo)]">
                              {e.analysis.virality_score}
                            </span>
                            <span className="text-xs text-zinc-500">·</span>
                            <span className="text-xs text-zinc-300 truncate">
                              {e.analysis.hook_formula}
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] text-zinc-500 truncate">
                            {label} · {agoStr}
                          </div>
                        </div>
                        <button
                          onClick={() => setHistory(deleteEntry(e.id))}
                          className="ml-3 text-xs text-zinc-600 hover:text-rose-400"
                          aria-label="delete"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
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

              <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 mb-4">
                <div className="text-sm font-semibold text-amber-200 mb-2">
                  🔧 {lang === "zh" ? "这是开源模板" : "This is OSS template"}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {lang === "zh"
                    ? "VibeXForge 不卖付费额度 — 免费额度由 Gemini API key 持有者(你)决定。Fork 仓库,部署自己的 sidecar,用自己的 key,自己控制成本。"
                    : "VibeXForge does not sell paid credits. The free quota is whatever your own Gemini API key allows. Fork the repos, run your own sidecar, bring your own key, control your own cost."}
                </p>
              </div>

              <a
                href="https://github.com/alex-jb/vibex-video-extractor"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 font-semibold text-white hover:opacity-90"
              >
                {lang === "zh" ? "📦 Fork + Self-host →" : "📦 Fork + Self-host →"}
              </a>

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
              {(() => {
                // Prefer Gemini's direct archetype_slug if it returned one
                // from the explicit enum; fall back to fuzzy match on the
                // formula string for back-compat.
                const slug = result.analysis.hook_first_3s.archetype_slug;
                const fromGemini = slug
                  ? HOOK_ARCHETYPES.find((a) => a.slug === slug)
                  : null;
                const matched =
                  fromGemini ?? matchArchetype(result.analysis.hook_first_3s.formula);
                if (!matched) return null;
                return (
                  <a
                    href={`/hooks/${matched.slug}`}
                    className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--accent-indigo)]/40 bg-[var(--accent-indigo)]/10 px-3 py-1 text-xs hover:bg-[var(--accent-indigo)]/20 transition-colors"
                  >
                    <span className="text-[var(--accent-indigo)]">🎯</span>
                    <span className="font-medium text-zinc-200">
                      {lang === "zh" ? matched.display_zh : matched.display_en}
                    </span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-500">{matched.common_in}</span>
                    <span className="text-[var(--accent-indigo)] ml-1">→</span>
                  </a>
                );
              })()}
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
