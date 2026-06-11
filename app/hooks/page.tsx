import type { Metadata } from "next";
import Link from "next/link";
import { HOOK_ARCHETYPES } from "@/lib/hook-archetypes";

export const metadata: Metadata = {
  title: "12 Hook Archetypes for Chinese Short-Form Video · VibeXForge",
  description:
    "The first open, indie-built taxonomy of viral hook patterns from Douyin (抖音) and Xiaohongshu (小红书). 12 archetypes with descriptions, examples, and common-in tags. AI-classified from every video decoded by vibexforge.com/tools/video-decode. Open data, MIT.",
  openGraph: {
    title: "12 Hook Archetypes · 中文短视频病毒钩公开分类",
    description:
      "Open taxonomy of Chinese short-form viral hooks. 12 patterns classified from every decoded video. Free + open.",
    type: "website",
  },
};

const C = {
  BG: "var(--bg-deep)",
  PANEL: "var(--bg-elev)",
  BORDER: "var(--border-soft)",
  BORDER_STRONG: "var(--border-strong)",
  INDIGO: "var(--accent-indigo)",
  TEXT: "var(--text)",
};

export default function HookArchetypesPage() {
  return (
    <main className="min-h-screen px-6 py-12 text-zinc-100" style={{ background: C.BG }}>
      <div className="mx-auto max-w-5xl">
        <header className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-[var(--accent-indigo)]">
            VibeXForge · Open Taxonomy
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">
            12 Hook Archetypes
          </h1>
          <p className="mt-2 text-2xl text-zinc-400">中文短视频病毒钩公开分类</p>
          <p className="mx-auto mt-6 max-w-2xl text-zinc-400 leading-relaxed">
            Every Douyin / Xiaohongshu hook in our database maps to one of 12 archetypes.
            Each archetype is named, described, and tagged with the content categories that
            commonly use it. AI-classified at decode time. Open data, MIT licensed.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-500 leading-relaxed">
            抖音/小红书的每一条 hook 都映射到 12 种 archetype 之一。每个 archetype 都有名字、描述、和常见内容类目标签。
            拆解时 AI 自动分类。开放数据,MIT。
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/tools/video-decode"
              className="rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              🎬 Decode a video →
            </Link>
            <a
              href="https://github.com/alex-jb/vibex-video-decoder-skill/blob/main/hook-archetypes.csv"
              className="rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] px-6 py-3 text-zinc-200 hover:border-[var(--border-strong)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              View raw CSV ↗
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HOOK_ARCHETYPES.map((a, idx) => (
            <Link
              key={a.slug}
              href={`/hooks/${a.slug}`}
              className="block rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-5 hover:border-[var(--accent-indigo)] transition-colors"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="text-xs font-mono text-zinc-500">#{String(idx + 1).padStart(2, "0")}</span>
                <span className="text-xs text-[var(--accent-indigo)] font-medium">
                  {a.common_in}
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-100 leading-tight">
                {a.display_en}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">{a.display_zh}</p>
              <p className="mt-3 text-sm text-zinc-300 leading-relaxed line-clamp-3">
                {a.description_en}
              </p>
              <div className="mt-4 text-xs text-[var(--accent-indigo)]">
                Read more →
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-16 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-8">
          <h2 className="text-2xl font-bold mb-4">Why this taxonomy exists</h2>
          <div className="space-y-3 text-zinc-300 leading-relaxed">
            <p>
              Chinese short-form video has dozens of hook patterns. Marketers have intuitions
              about which ones work, but no public dataset to validate against. B2B dashboards
              like 飞瓜 and 蝉妈妈 cost ¥3,000-30,000/year and give you aggregate metrics, not
              the underlying anatomy.
            </p>
            <p>
              This page is the start of a different posture: <strong>third-party, receipt-based
              taxonomy that no platform owns.</strong> Every video decoded at{" "}
              <Link href="/tools/video-decode" className="text-[var(--accent-indigo)] hover:underline">
                vibexforge.com/tools/video-decode
              </Link>{" "}
              gets classified against the 12 archetypes by Gemini 2.5 Flash. As the dataset
              grows, we&apos;ll publish which archetypes actually correlate with high virality
              scores — Brier-audited.
            </p>
            <p>
              The CSV is the source of truth. The TypeScript export in vibex stays synced. Skill
              users see the same taxonomy. If you find a hook pattern not on the list, propose a
              row in the{" "}
              <a
                href="https://github.com/alex-jb/vibex-video-decoder-skill"
                className="text-[var(--accent-indigo)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                skill repo
              </a>
              .
            </p>
          </div>
        </section>

        <footer className="mt-12 text-center text-xs text-zinc-500">
          <p>
            12 of N archetypes. Open data, MIT.{" "}
            <a
              href="https://github.com/alex-jb/vibex-video-decoder-skill"
              className="text-[var(--accent-indigo)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contribute →
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
