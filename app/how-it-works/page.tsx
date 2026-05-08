/**
 * /how-it-works — Marketing landing for VibeXForge new positioning.
 *
 * The splash at / is the brand moment (RPG-themed, all-aesthetic).
 * This page is for visitors who clicked [ HOW IT WORKS ] from the
 * splash — they want to actually understand the product before
 * signing up.
 *
 * Bilingual EN/ZH (defaults to EN with ZH below). Optimized for X /
 * Reddit / Hacker News inbound traffic in launch week.
 */
import Link from "next/link";

export const metadata = {
  title: "How VibeXForge works — Distribution amplifier for solo AI creators",
  description:
    "Submit your AI app once. Our agents auto-promote to 10+ channels (X / 小红书 / 即刻 / Reddit / Dev.to / HN / LinkedIn / Bluesky / Threads / Producthunt). Solo creators get the multi-channel reach big companies pay $10K/month for.",
};

const PLATFORMS = [
  { name: "X", logo: "𝕏", color: "#000" },
  { name: "小红书", logo: "📕", color: "#FE2C55" },
  { name: "即刻", logo: "💛", color: "#FFD200" },
  { name: "Reddit", logo: "🔶", color: "#FF4500" },
  { name: "Hacker News", logo: "Y", color: "#FF6600" },
  { name: "Dev.to", logo: "</>", color: "#0A0A0A" },
  { name: "LinkedIn", logo: "in", color: "#0A66C2" },
  { name: "Bluesky", logo: "🦋", color: "#0085FF" },
  { name: "Threads", logo: "@", color: "#fff" },
  { name: "Product Hunt", logo: "🐱", color: "#DA552F" },
  { name: "知乎", logo: "知", color: "#0066FF" },
  { name: "B站", logo: "📺", color: "#FB7299" },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)]">
      {/* Hero */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <p className="font-pixel text-[10px] uppercase tracking-[0.28em] text-[var(--ember,#FF4500)] mb-4">
          ▸ DISTRIBUTION AMPLIFIER FOR SOLO AI CREATORS
        </p>
        <h1
          className="text-3xl sm:text-5xl font-bold mb-6 leading-tight"
          style={{ fontFamily: "var(--font-press-start), monospace" }}
        >
          BUILD ONCE.
          <br />
          <span style={{ color: "#FF4500" }}>SHIP TO 10+ CHANNELS.</span>
        </h1>
        <p className="text-lg sm:text-xl text-foreground/70 mb-3 max-w-2xl mx-auto">
          You vibe-coded an AI app. Our agents write 10+ platform-specific
          posts in 5 seconds. Edit, approve, publish — to X, 小红书,
          即刻, Reddit, Dev.to, HN, LinkedIn and 6 more.
        </p>
        <p className="text-base text-foreground/50 mb-10 max-w-xl mx-auto">
          你 vibe-coded 了一个 AI 作品。我们的 agent 5 秒内为你写好 10+
          平台专属推广帖。审核、修改、一键发布 — 让 solo
          创作者也有大公司花 ¥10K/月才能买到的曝光。
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/launch"
            className="px-8 py-4 rounded font-pixel text-[12px] uppercase tracking-widest bg-[#FF4500] text-black hover:bg-[#FF6633] transition-colors"
            style={{ boxShadow: "5px 5px 0 #000" }}
          >
            ▶ Start free beta
          </Link>
          <Link
            href="/home"
            className="px-8 py-4 rounded font-pixel text-[12px] uppercase tracking-widest border-2 border-white/40 text-white hover:bg-white/5"
            style={{ boxShadow: "5px 5px 0 #000" }}
          >
            See real projects
          </Link>
        </div>
        <p className="text-xs text-foreground/40 mt-4">
          Beta is free for the first 100 creators. No credit card.
        </p>
      </section>

      {/* 3-step explainer */}
      <section className="px-6 py-16 bg-white/[0.02] border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-pixel text-[11px] uppercase tracking-widest text-emerald-300 mb-12">
            ▸ HOW IT WORKS · 3 STEPS
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step
              num="01"
              title="Submit your project"
              titleZh="提交你的作品"
              body="Paste your AI app URL or GitHub repo. Add a tagline + description. 30 seconds."
              bodyZh="贴上你的 AI 作品链接或 GitHub repo。加一句 tagline + 简介。30 秒搞定。"
            />
            <Step
              num="02"
              title="Agents write 10+ posts"
              titleZh="Agent 帮你写 10+ 平台帖"
              body="Claude Sonnet 4.6 writes platform-specific drafts in parallel. ~10 seconds. 24 drafts per project (8 platforms × 3 variants)."
              bodyZh="Claude Sonnet 4.6 并行生成 10+ 平台专属帖子。约 10 秒。每个项目 24 张草稿(8 平台 × 3 风格变体)。"
            />
            <Step
              num="03"
              title="Edit + publish"
              titleZh="审核 + 发布"
              body="Review each draft. Edit inline. One click opens the target platform with text pre-filled. 5 minutes per project, all platforms covered."
              bodyZh="逐张审核。直接编辑。一键打开目标平台,文案已自动填好。每个项目 5 分钟,10+ 平台全部覆盖。"
            />
          </div>
        </div>
      </section>

      {/* Platforms grid */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-center font-pixel text-[11px] uppercase tracking-widest text-violet-300 mb-3">
          ▸ 10+ PLATFORMS, ONE SUBMIT
        </h2>
        <p className="text-center text-foreground/60 mb-10 max-w-2xl mx-auto">
          Each draft is platform-specific — long-form for Dev.to, short
          threads for X, aesthetic notes for 小红书, technical detail
          for Hacker News. Bilingual EN ↔ ZH.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="aspect-square rounded-lg border border-white/[0.08] bg-white/[0.02] flex flex-col items-center justify-center hover:bg-white/[0.05] transition-colors"
            >
              <div className="text-2xl mb-1" style={{ color: p.color }}>
                {p.logo}
              </div>
              <div className="text-[10px] text-foreground/70 font-medium">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="px-6 py-16 bg-white/[0.02] border-y border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center font-pixel text-[11px] uppercase tracking-widest text-emerald-300 mb-10">
            ▸ WHY VIBEXFORGE / 为什么是我们
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Pitch
              title="Bilingual by default"
              titleZh="原生中英双语"
              body="Most AI marketing tools speak English only. Most Chinese tools are domestic-only. We bridge — your work reaches both Western indie hackers AND Chinese AI creators who only know 小红书."
              bodyZh="西方 AI 工具只懂英文,国内工具只服务国内。我们是桥 — 你的作品能同时触达 X / Reddit 的英文圈 + 小红书 / 即刻的中文圈。"
            />
            <Pitch
              title="Vertical to AI creators"
              titleZh="只服务 AI 创作者"
              body="Mailchimp / Buffer / Hootsuite are generic. We're built specifically for vibe-coded AI projects — every prompt knows what an AI agent or app is."
              bodyZh="Mailchimp / Buffer / 抖加这些是通用工具。我们专门为 vibe-coded AI 作品打造 — 每条 prompt 都懂 AI agent / AI app 是什么。"
            />
            <Pitch
              title="Solo-friendly pricing"
              titleZh="solo 友好定价"
              body="Free during beta. ¥99/mo Starter. 15% take rate when buyers find you via VibeX-amplified channels (Stripe Connect, you keep 85%)."
              bodyZh="Beta 期免费。¥99/月起步。如果用户通过 VibeX 推广来到你的产品付费,我们抽 15%(Stripe Connect 直打,你拿 85%)。"
            />
            <Pitch
              title="Built by a solo creator"
              titleZh="独立开发者亲手打造"
              body="990+ tests. 0 open issues. 4 production CI workflows. Built by Alex who hit 5 users on his own AI gallery — and built this to fix his own distribution pain."
              bodyZh="990+ 测试、0 个 open issue、4 个生产 CI workflow。我自己 build 了 6 个月只有 5 个用户 — 这个工具就是来解决我自己 distribution 痛的。"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2
          className="text-2xl sm:text-3xl font-bold mb-4"
          style={{ fontFamily: "var(--font-press-start), monospace" }}
        >
          READY TO BE SEEN?
        </h2>
        <p className="text-foreground/60 mb-2">
          Free during beta. First 100 creators get unlimited generation
          + priority on the public discovery feed.
        </p>
        <p className="text-foreground/40 text-sm mb-10">
          Beta 期免费。前 100 名 creator 拿无限次生成 + 公共发现 feed 优先曝光。
        </p>
        <Link
          href="/launch"
          className="inline-block px-10 py-5 rounded font-pixel text-[14px] uppercase tracking-widest bg-[#FF4500] text-black hover:bg-[#FF6633] transition-colors"
          style={{ boxShadow: "6px 6px 0 #000" }}
        >
          ▶ Submit your AI project
        </Link>
        <p className="text-xs text-foreground/40 mt-6">
          Already a creator?{" "}
          <Link
            href="/dashboard"
            className="text-violet-300 hover:underline"
          >
            Go to your dashboard →
          </Link>
        </p>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-white/[0.06] text-center text-foreground/40 text-xs">
        <p className="mb-2">
          Built solo by{" "}
          <a
            href="https://github.com/alex-jb"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/70 hover:text-violet-300"
          >
            @alex-jb
          </a>
          {" · "}
          <a
            href="https://github.com/alex-jb/vibex"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/70 hover:text-violet-300"
          >
            Source on GitHub
          </a>
        </p>
        <p className="mb-2">
          <Link href="/" className="hover:text-violet-300">
            ← Back to splash
          </Link>
          {" · "}
          <Link href="/about" className="hover:text-violet-300">
            About
          </Link>
        </p>
        <p className="text-foreground/30">
          AI 不是只有大公司 VC 才能有好作品。我证明 solo 也能。
        </p>
      </footer>
    </main>
  );
}

function Step({
  num,
  title,
  titleZh,
  body,
  bodyZh,
}: {
  num: string;
  title: string;
  titleZh: string;
  body: string;
  bodyZh: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
      <p
        className="text-3xl mb-3"
        style={{
          fontFamily: "var(--font-press-start), monospace",
          color: "#FF4500",
        }}
      >
        {num}
      </p>
      <h3 className="font-pixel text-[11px] uppercase tracking-wider text-emerald-300 mb-1">
        {title}
      </h3>
      <p className="text-foreground/50 text-xs mb-3">{titleZh}</p>
      <p className="text-sm text-foreground/80 mb-2">{body}</p>
      <p className="text-xs text-foreground/50">{bodyZh}</p>
    </div>
  );
}

function Pitch({
  title,
  titleZh,
  body,
  bodyZh,
}: {
  title: string;
  titleZh: string;
  body: string;
  bodyZh: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="font-bold text-foreground mb-1">{title}</h3>
      <p className="text-foreground/50 text-xs mb-3">{titleZh}</p>
      <p className="text-sm text-foreground/80 mb-2">{body}</p>
      <p className="text-xs text-foreground/50">{bodyZh}</p>
    </div>
  );
}
