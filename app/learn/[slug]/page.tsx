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
import { ChapterBadge } from "@/components/learn/chapter-badge";
import { Confetti } from "@/components/learn/confetti";
import { trackEvent } from "@/lib/analytics";

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
  const [celebrate, setCelebrate] = useState(0); // counter, increments on complete to refire confetti

  // Chapter 2 (prompt-engineering) — 4 slots state
  const [pRole, setPRole] = useState("");
  const [pContext, setPContext] = useState("");
  const [pTask, setPTask] = useState("");
  const [pConstraint, setPConstraint] = useState("");
  const [pResponse, setPResponse] = useState<string | null>(null);
  const [pLoading, setPLoading] = useState(false);

  // Chapter 3 (ai-agent) — Goal + Tools + Memory + Reflection
  const [aGoal, setAGoal] = useState("");
  const [aTools, setATools] = useState<string[]>([]);
  const [aMemory, setAMemory] = useState<"none" | "short-term" | "long-term" | "brier-audited">("short-term");
  const [aReflection, setAReflection] = useState<"none" | "self-critic" | "5-voice-council">("self-critic");
  const [aSpec, setASpec] = useState<string | null>(null);

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
    setCelebrate((n) => n + 1); // refire confetti
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

  async function runPromptEngineering() {
    if (!pTask.trim()) {
      setFeedback(
        isZh ? "至少要写 Task —— 让 AI 做什么。" : "At least fill the Task — what should the AI do?"
      );
      return;
    }
    setPLoading(true);
    setFeedback("");
    setPResponse(null);
    try {
      const r = await fetch("/api/learn/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: pRole,
          context: pContext,
          task: pTask,
          constraint: pConstraint,
        }),
      });
      const json = await r.json();
      if (!r.ok) {
        setFeedback(json?.error || "Claude call failed");
      } else {
        setPResponse(String(json?.response || ""));
      }
    } catch {
      setFeedback(isZh ? "网络断了 — 重试一次" : "Network blip — try again");
    } finally {
      setPLoading(false);
    }
  }

  function toggleTool(t: string) {
    setATools((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  function assembleAgent() {
    if (!aGoal.trim()) {
      setFeedback(
        isZh
          ? "先写 Goal — 这个 agent 要解决什么问题。"
          : "Write the Goal first — what problem should this agent solve?"
      );
      return;
    }
    const spec = {
      name: aGoal
        .trim()
        .split(/\s+/)
        .slice(0, 4)
        .join("-")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, ""),
      goal: aGoal.trim(),
      tools: aTools,
      memory: { type: aMemory, persistence: aMemory === "long-term" ? "disk" : aMemory === "brier-audited" ? "jsonl" : "ram" },
      reflection: {
        mode: aReflection,
        on_failure: aReflection === "none" ? "skip" : "retry-with-critique",
      },
      brier_audit: aMemory === "brier-audited" || aReflection === "5-voice-council",
      created_at: new Date().toISOString().slice(0, 10),
    };
    setASpec(JSON.stringify(spec, null, 2));
    setFeedback("");
  }

  const isImageChapter = chapter.slug === "ai-drawing";
  const isPromptChapter = chapter.slug === "prompt-engineering";
  const isAgentChapter = chapter.slug === "ai-agent";

  const TOOL_OPTIONS = [
    { id: "web_search", label: isZh ? "🌐 网络搜索" : "🌐 Web search" },
    { id: "code_exec", label: isZh ? "💻 代码执行" : "💻 Code execution" },
    { id: "file_read", label: isZh ? "📁 文件读取" : "📁 File read" },
    { id: "calculator", label: isZh ? "🧮 计算器" : "🧮 Calculator" },
    { id: "send_email", label: isZh ? "📧 发邮件" : "📧 Send email" },
    { id: "vibex_publish", label: isZh ? "🎴 发到 VibeX" : "🎴 Publish to VibeX" },
  ];

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

            {isAgentChapter && (
              <div className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                  {isZh ? "公式 · G·T·M·R" : "Formula · G·T·M·R"}
                </div>
                <div className="mt-3 font-mono text-sm leading-relaxed">
                  {isZh ? (
                    <>
                      <div><span className="text-[var(--accent-indigo)]">Goal</span>: 这个 agent 解决什么</div>
                      <div className="mt-1"><span className="text-amber-400">Tools</span>: 它能动什么手</div>
                      <div className="mt-1"><span className="text-emerald-400">Memory</span>: 它记不记得</div>
                      <div className="mt-1"><span className="text-rose-400">Reflection</span>: 错了怎么纠</div>
                    </>
                  ) : (
                    <>
                      <div><span className="text-[var(--accent-indigo)]">Goal</span>: what it solves</div>
                      <div className="mt-1"><span className="text-amber-400">Tools</span>: what it can touch</div>
                      <div className="mt-1"><span className="text-emerald-400">Memory</span>: does it remember</div>
                      <div className="mt-1"><span className="text-rose-400">Reflection</span>: how it self-corrects</div>
                    </>
                  )}
                </div>
                <div className="mt-3 rounded border border-amber-500/30 bg-amber-500/5 p-2 text-[11px] text-amber-300">
                  {isZh
                    ? "出货物 = 一份可复制的 agent JSON spec。带去 Cursor / Claude Code 直接跑。"
                    : "Artifact = a copy-pasteable agent JSON spec. Drop into Cursor / Claude Code and run."}
                </div>
              </div>
            )}

            {isPromptChapter && (
              <div className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                  {isZh ? "公式 · R·C·T·C" : "Formula · R·C·T·C"}
                </div>
                <div className="mt-3 font-mono text-sm leading-relaxed">
                  {isZh ? (
                    <>
                      <div><span className="text-[var(--accent-indigo)]">Role</span>: 你是谁(YC partner / 高级编辑 / 风控 PM)</div>
                      <div className="mt-1"><span className="text-amber-400">Context</span>: 背景假设(我们 PMF 阶段 / 用户 B2B SaaS / 中国市场)</div>
                      <div className="mt-1"><span className="text-emerald-400">Task</span>: 干什么(写 5 条邮件 / 评估这个 idea / 找出 3 个漏洞)</div>
                      <div className="mt-1"><span className="text-rose-400">Constraint</span>: 边界(每条 &lt; 80 词 / 不夸 / 用 1 个数字支持每条)</div>
                    </>
                  ) : (
                    <>
                      <div><span className="text-[var(--accent-indigo)]">Role</span>: who you are (YC partner / senior editor / risk PM)</div>
                      <div className="mt-1"><span className="text-amber-400">Context</span>: the assumptions (PMF stage / B2B SaaS user / China market)</div>
                      <div className="mt-1"><span className="text-emerald-400">Task</span>: what to do (draft 5 emails / evaluate this idea / find 3 holes)</div>
                      <div className="mt-1"><span className="text-rose-400">Constraint</span>: boundaries (each &lt; 80 words / no hype / 1 number per claim)</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Walkthrough video stub — 16:9 player frame, brand-tokened.
                Click instruments to walkthrough_clicked event; expanded
                state shows text tip until we record real video. */}
            <div>
              <button
                onClick={() => {
                  setShowHint((v) => !v);
                  trackEvent("walkthrough_clicked", {
                    chapter: chapter.slug,
                    expanded: !showHint,
                  });
                }}
                className="group relative block w-full overflow-hidden rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] text-left transition hover:border-[var(--accent-indigo)]"
                aria-expanded={showHint}
              >
                <div className="relative aspect-video w-full">
                  {/* faux thumbnail — radial indigo wash + dotted grid */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 40%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(circle at 70% 60%, rgba(245,158,11,0.18), transparent 55%)",
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
                      backgroundSize: "12px 12px",
                    }}
                  />
                  {/* play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/80 bg-[var(--bg-deep)]/60 backdrop-blur-sm transition group-hover:scale-110 group-hover:border-[var(--accent-indigo)]">
                      <div
                        className="ml-1 h-0 w-0"
                        style={{
                          borderTop: "10px solid transparent",
                          borderBottom: "10px solid transparent",
                          borderLeft: "16px solid #E8E8EC",
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-3 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-zinc-200">
                    60s
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border-soft)] px-4 py-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {isZh ? "走查 · 60 秒" : "Walkthrough · 60s"}
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {isZh ? "卡住了?跟我做一遍" : "Stuck? Follow along"}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">{showHint ? "−" : "+"}</div>
                </div>
              </button>

              {showHint && (
                <div className="mt-3 rounded-[var(--r-card)] border border-amber-500/30 bg-[var(--bg-elev)] p-4 text-sm text-zinc-300">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
                    {isZh ? "本周视频上线 · 先看文字版" : "Video lands this week · text walkthrough below"}
                  </div>
                  {isImageChapter &&
                    (isZh
                      ? "试试 4 个槽位都填: \"a [主体] in [风格], [光线], [构图]\"。例如 \"a calico cat coding at a Brooklyn cafe, retro anime style, golden hour, dynamic side angle\"。每个槽位 2-4 个词就够。"
                      : 'Fill all 4 slots: "a [subject] in [style], [lighting], [composition]". Example: "a calico cat coding at a Brooklyn cafe, retro anime style, golden hour, dynamic side angle." 2-4 words per slot is plenty.')}
                  {isPromptChapter &&
                    (isZh
                      ? "Task 是必填的(那个让 Claude 做的动作)。Role/Context/Constraint 是 0-3 个的调味料。试试 Task=\"评估一个 startup idea 找 3 个最大漏洞\",再试加上 Role=\"YC partner\" + Constraint=\"每条 < 80 词\",看 Claude 回答的差距 — 这就是 prompt engineering。"
                      : 'Task is required (the verb you want Claude to do). Role/Context/Constraint are 0-3 seasonings. Try Task="Evaluate a startup idea — name the 3 biggest holes". Then add Role="YC partner" + Constraint="each < 80 words" and compare the responses. The delta IS prompt engineering.')}
                  {isAgentChapter &&
                    (isZh
                      ? "记住: agent = Goal + Tools + Memory + Reflection。Goal 越窄越好(\"每天扫 5 个 X 帖\" 比 \"帮我做 marketing\" 好 10 倍)。Tools 选 2-3 个就够 — 多了 LLM 反而 confused。Memory=brier-audited 给你的 spec 加我们 stack 的校准纹身。"
                      : 'Remember: agent = Goal + Tools + Memory + Reflection. Narrower goals win ("scan 5 X posts daily" beats "help with marketing" 10x). Pick 2-3 tools, not 6 — more confuses the LLM. Memory=brier-audited tattoos our calibration moat onto your spec.')}
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT — interactive surface */}
          <section className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5">
            {isPromptChapter ? (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                  {isZh ? "练习场 · 4 个槽位" : "Workspace · 4 slots"}
                </div>

                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent-indigo)]">
                      Role
                    </label>
                    <input
                      value={pRole}
                      onChange={(e) => setPRole(e.target.value)}
                      placeholder={
                        isZh ? "你是一位 YC partner" : "You are a YC partner"
                      }
                      maxLength={280}
                      className="mt-1 w-full rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] p-2 font-mono text-sm text-zinc-100 outline-none focus:border-[var(--accent-indigo)]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
                      Context
                    </label>
                    <input
                      value={pContext}
                      onChange={(e) => setPContext(e.target.value)}
                      placeholder={
                        isZh
                          ? "B2B SaaS, 中国市场, pre-PMF"
                          : "B2B SaaS, China market, pre-PMF"
                      }
                      maxLength={280}
                      className="mt-1 w-full rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] p-2 font-mono text-sm text-zinc-100 outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                      Task
                    </label>
                    <input
                      value={pTask}
                      onChange={(e) => setPTask(e.target.value)}
                      placeholder={
                        isZh
                          ? "评估这个 startup idea 的 3 个最大漏洞"
                          : "Evaluate this startup idea — name the 3 biggest holes"
                      }
                      maxLength={280}
                      className="mt-1 w-full rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] p-2 font-mono text-sm text-zinc-100 outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-rose-400">
                      Constraint
                    </label>
                    <input
                      value={pConstraint}
                      onChange={(e) => setPConstraint(e.target.value)}
                      placeholder={
                        isZh
                          ? "每条 < 80 词,1 个数字支持,不夸"
                          : "Each < 80 words, 1 number per claim, no hype"
                      }
                      maxLength={280}
                      className="mt-1 w-full rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] p-2 font-mono text-sm text-zinc-100 outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={runPromptEngineering}
                    disabled={pLoading}
                    className="rounded-[var(--r-card)] border border-[var(--accent-indigo)] bg-[var(--accent-indigo)]/15 px-5 py-2.5 text-sm font-semibold text-[var(--accent-indigo)] hover:bg-[var(--accent-indigo)]/25 disabled:opacity-50"
                  >
                    {pLoading
                      ? isZh ? "Claude 正在写..." : "Claude is writing..."
                      : isZh ? "▶ Run (Claude Haiku)" : "▶ Run (Claude Haiku)"}
                  </button>
                  {!done && pResponse && (
                    <button
                      onClick={complete}
                      className="rounded-[var(--r-card)] bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400"
                    >
                      {isZh ? `✓ Submit · +${chapter.xpReward} XP` : `✓ Submit · +${chapter.xpReward} XP`}
                    </button>
                  )}
                </div>

                {pResponse && (
                  <div className="mt-5 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {isZh ? "Claude 回应" : "Claude response"}
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-sm leading-relaxed text-zinc-100">
                      {pResponse}
                    </pre>
                  </div>
                )}

                {feedback && (
                  <div className="mt-4 rounded-[var(--r-card)] border border-amber-500/30 bg-[var(--bg-deep)] p-3 text-sm text-amber-300">
                    {feedback}
                  </div>
                )}
              </>
            ) : isImageChapter ? (
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
            ) : isAgentChapter ? (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                  {isZh ? "练习场 · 装配 agent" : "Workspace · assemble agent"}
                </div>

                <div className="mt-3 space-y-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent-indigo)]">
                      Goal
                    </label>
                    <input
                      value={aGoal}
                      onChange={(e) => setAGoal(e.target.value)}
                      placeholder={
                        isZh
                          ? "每天扫 5 个 AI 大神的 X 帖,挑出可借势的发我邮箱"
                          : "Scan 5 AI luminaries' X posts daily, surface borrowable threads to my inbox"
                      }
                      maxLength={280}
                      className="mt-1 w-full rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] p-2 font-mono text-sm text-zinc-100 outline-none focus:border-[var(--accent-indigo)]"
                    />
                  </div>

                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
                      Tools <span className="text-zinc-500">({aTools.length}/{TOOL_OPTIONS.length})</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {TOOL_OPTIONS.map((t) => {
                        const on = aTools.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleTool(t.id)}
                            className={`rounded-full border px-3 py-1.5 font-mono text-xs transition ${
                              on
                                ? "border-amber-400 bg-amber-400/15 text-amber-300"
                                : "border-[var(--border-soft)] bg-[var(--bg-deep)] text-zinc-400 hover:border-amber-400/60"
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                      Memory
                    </label>
                    <select
                      value={aMemory}
                      onChange={(e) => setAMemory(e.target.value as typeof aMemory)}
                      className="mt-1 w-full rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] p-2 font-mono text-sm text-zinc-100 outline-none focus:border-emerald-400"
                    >
                      <option value="none">none — 一锤子买卖</option>
                      <option value="short-term">short-term — 1 个 session 内记</option>
                      <option value="long-term">long-term — 写盘,跨 session</option>
                      <option value="brier-audited">brier-audited — 记 + Brier 审过去对错</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-rose-400">
                      Reflection
                    </label>
                    <select
                      value={aReflection}
                      onChange={(e) => setAReflection(e.target.value as typeof aReflection)}
                      className="mt-1 w-full rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] p-2 font-mono text-sm text-zinc-100 outline-none focus:border-rose-400"
                    >
                      <option value="none">none — 错了就错了</option>
                      <option value="self-critic">self-critic — 自己挑毛病再写一遍</option>
                      <option value="5-voice-council">5-voice-council — Bull/Bear/Judge/Critic/Auditor 投票</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={assembleAgent}
                    className="rounded-[var(--r-card)] border border-[var(--accent-indigo)] bg-[var(--accent-indigo)]/15 px-5 py-2.5 text-sm font-semibold text-[var(--accent-indigo)] hover:bg-[var(--accent-indigo)]/25"
                  >
                    {isZh ? "🛠 装配 agent" : "🛠 Assemble agent"}
                  </button>
                  {!done && aSpec && (
                    <button
                      onClick={complete}
                      className="rounded-[var(--r-card)] bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400"
                    >
                      {isZh ? `✓ Submit · +${chapter.xpReward} XP` : `✓ Submit · +${chapter.xpReward} XP`}
                    </button>
                  )}
                  {aSpec && (
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(aSpec).catch(() => {});
                      }}
                      className="rounded-[var(--r-card)] border border-[var(--border-soft)] px-4 py-2.5 text-sm text-zinc-100 hover:border-[var(--accent-indigo)]"
                    >
                      {isZh ? "📋 复制 JSON" : "📋 Copy JSON"}
                    </button>
                  )}
                </div>

                {aSpec && (
                  <div className="mt-5 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-deep)] p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {isZh ? "agent.json · 你的出货物" : "agent.json · your artifact"}
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-100">
                      {aSpec}
                    </pre>
                  </div>
                )}

                {feedback && (
                  <div className="mt-4 rounded-[var(--r-card)] border border-amber-500/30 bg-[var(--bg-deep)] p-3 text-sm text-amber-300">
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
          <section className="relative mt-8 overflow-hidden rounded-[var(--r-card)] border border-emerald-500/40 bg-[var(--bg-elev)] p-6">
            {celebrate > 0 && <Confetti key={celebrate} count={50} />}
            <div className="relative z-20 flex items-start gap-4">
              <ChapterBadge slug={chapter.slug} size={56} glow />
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
