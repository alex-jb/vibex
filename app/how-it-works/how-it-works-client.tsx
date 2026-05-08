"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

const PLATFORMS = [
  { name_en: "X", name_zh: "X", logo: "𝕏", color: "#000" },
  { name_en: "Xiaohongshu", name_zh: "小红书", logo: "📕", color: "#FE2C55" },
  { name_en: "Jike", name_zh: "即刻", logo: "💛", color: "#FFD200" },
  { name_en: "Reddit", name_zh: "Reddit", logo: "🔶", color: "#FF4500" },
  { name_en: "Hacker News", name_zh: "Hacker News", logo: "Y", color: "#FF6600" },
  { name_en: "Dev.to", name_zh: "Dev.to", logo: "</>", color: "#0A0A0A" },
  { name_en: "LinkedIn", name_zh: "LinkedIn", logo: "in", color: "#0A66C2" },
  { name_en: "Bluesky", name_zh: "Bluesky", logo: "🦋", color: "#0085FF" },
  { name_en: "Threads", name_zh: "Threads", logo: "@", color: "#fff" },
  { name_en: "Product Hunt", name_zh: "Product Hunt", logo: "🐱", color: "#DA552F" },
  { name_en: "Zhihu", name_zh: "知乎", logo: "知", color: "#0066FF" },
  { name_en: "Bilibili", name_zh: "B站", logo: "📺", color: "#FB7299" },
];

const COPY = {
  en: {
    eyebrow: "▸ DISTRIBUTION AMPLIFIER FOR SOLO AI CREATORS",
    h1Line1: "BUILD ONCE.",
    h1Line2: "SHIP TO 10+ CHANNELS.",
    sub:
      "You vibe-coded an AI app. Our agents write 10+ platform-specific posts in 5 seconds. Edit, approve, publish — to X, Xiaohongshu, Jike, Reddit, Dev.to, HN, LinkedIn and 6 more.",
    ctaPrimary: "▶ Start free beta",
    ctaSecondary: "See real projects",
    betaNote: "Beta is free for the first 100 creators. No credit card.",
    stepsTitle: "▸ HOW IT WORKS · 3 STEPS",
    step1Title: "Submit your project",
    step1Body:
      "Paste your AI app URL or GitHub repo. Add a tagline + description. 30 seconds.",
    step2Title: "Agents write 10+ posts",
    step2Body:
      "Claude Sonnet 4.6 writes platform-specific drafts in parallel. ~10 seconds. 24 drafts per project (8 platforms × 3 variants).",
    step3Title: "Edit + publish",
    step3Body:
      "Review each draft. Edit inline. One click opens the target platform with text pre-filled. 5 minutes per project, all platforms covered.",
    platformsTitle: "▸ 10+ PLATFORMS, ONE SUBMIT",
    platformsBody:
      "Each draft is platform-specific — long-form for Dev.to, short threads for X, aesthetic notes for Xiaohongshu, technical detail for Hacker News. Bilingual EN ↔ ZH.",
    whyTitle: "▸ WHY VIBEXFORGE",
    pitch1Title: "Bilingual by default",
    pitch1Body:
      "Most AI marketing tools speak English only. Most Chinese tools are domestic-only. We bridge — your work reaches both Western indie hackers AND Chinese AI creators who only know Xiaohongshu.",
    pitch2Title: "Vertical to AI creators",
    pitch2Body:
      "Mailchimp / Buffer / Hootsuite are generic. We're built specifically for vibe-coded AI projects — every prompt knows what an AI agent or app is.",
    pitch3Title: "Solo-friendly pricing",
    pitch3Body:
      "Free during beta. $14/mo Starter. 15% take rate when buyers find you via VibeX-amplified channels (Stripe Connect, you keep 85%).",
    pitch4Title: "Built by a solo creator",
    pitch4Body:
      "990+ tests. 0 open issues. 4 production CI workflows. Built by Alex who hit 5 users on his own AI gallery — and built this to fix his own distribution pain.",
    ctaH2: "READY TO BE SEEN?",
    ctaBody:
      "Free during beta. First 100 creators get unlimited generation + priority on the public discovery feed.",
    ctaButton: "▶ Submit your AI project",
    alreadyCreator: "Already a creator?",
    goDashboard: "Go to your dashboard →",
    builtBy: "Built solo by",
    sourceOn: "Source on GitHub",
    backSplash: "← Back to splash",
    about: "About",
    tagline: "AI doesn't only belong to VC-backed teams. Solo creators ship too.",
  },
  zh: {
    eyebrow: "▸ 给独立 AI 创作者的发行放大器",
    h1Line1: "做一次。",
    h1Line2: "10+ 渠道齐发。",
    sub:
      "你 vibe-coded 了一个 AI 作品。我们的 agent 5 秒内为你写好 10+ 平台专属推广帖。审核、修改、一键发布 — 让 solo 创作者也有大公司花 ¥10K/月才能买到的曝光。",
    ctaPrimary: "▶ 免费开始 Beta",
    ctaSecondary: "看看真实项目",
    betaNote: "Beta 期前 100 名 creator 免费,不需要信用卡。",
    stepsTitle: "▸ 工作流 · 3 步搞定",
    step1Title: "提交你的作品",
    step1Body:
      "贴上你的 AI 作品链接或 GitHub repo。加一句 tagline + 简介。30 秒搞定。",
    step2Title: "Agent 帮你写 10+ 平台帖",
    step2Body:
      "Claude Sonnet 4.6 并行生成 10+ 平台专属帖子。约 10 秒。每个项目 24 张草稿(8 平台 × 3 风格变体)。",
    step3Title: "审核 + 发布",
    step3Body:
      "逐张审核。直接编辑。一键打开目标平台,文案已自动填好。每个项目 5 分钟,10+ 平台全部覆盖。",
    platformsTitle: "▸ 10+ 平台,一次提交",
    platformsBody:
      "每张草稿都是平台专属 — Dev.to 长文、X 短 thread、小红书的氛围笔记、Hacker News 的技术细节。原生 EN ↔ 中文。",
    whyTitle: "▸ 为什么是 VIBEXFORGE",
    pitch1Title: "原生中英双语",
    pitch1Body:
      "西方 AI 工具只懂英文,国内工具只服务国内。我们是桥 — 你的作品能同时触达 X / Reddit 的英文圈 + 小红书 / 即刻的中文圈。",
    pitch2Title: "只服务 AI 创作者",
    pitch2Body:
      "Mailchimp / Buffer / 抖加这些是通用工具。我们专门为 vibe-coded AI 作品打造 — 每条 prompt 都懂 AI agent / AI app 是什么。",
    pitch3Title: "Solo 友好定价",
    pitch3Body:
      "Beta 期免费。¥99/月起步。如果用户通过 VibeX 推广来到你的产品付费,我们抽 15%(Stripe Connect 直打,你拿 85%)。",
    pitch4Title: "独立开发者亲手打造",
    pitch4Body:
      "990+ 测试、0 个 open issue、4 个生产 CI workflow。我自己 build 了 6 个月只有 5 个用户 — 这个工具就是来解决我自己 distribution 痛的。",
    ctaH2: "准备好被看见了吗?",
    ctaBody:
      "Beta 期免费。前 100 名 creator 拿无限次生成 + 公共发现 feed 优先曝光。",
    ctaButton: "▶ 提交你的 AI 作品",
    alreadyCreator: "已经是 creator?",
    goDashboard: "进入你的 dashboard →",
    builtBy: "独立开发者:",
    sourceOn: "GitHub 源码",
    backSplash: "← 返回首页",
    about: "关于",
    tagline: "AI 不是只有大公司 VC 才能有好作品。我证明 solo 也能。",
  },
} as const;

export default function HowItWorksClient() {
  const { lang } = useLang();
  const t = COPY[lang];

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)]">
      {/* Hero */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <p className="font-pixel text-[10px] uppercase tracking-[0.28em] text-[var(--ember,#FF4500)] mb-4">
          {t.eyebrow}
        </p>
        <h1
          className="text-3xl sm:text-5xl font-bold mb-6 leading-tight"
          style={{ fontFamily: "var(--font-press-start), monospace" }}
        >
          {t.h1Line1}
          <br />
          <span style={{ color: "#FF4500" }}>{t.h1Line2}</span>
        </h1>
        <p className="text-lg sm:text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
          {t.sub}
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/launch"
            className="px-8 py-4 rounded-md text-sm font-semibold bg-[#FF4500] text-black hover:bg-[#FF6633] transition-colors"
            style={{ boxShadow: "5px 5px 0 #000" }}
          >
            {t.ctaPrimary}
          </Link>
          <Link
            href="/home"
            className="px-8 py-4 rounded-md text-sm font-semibold border border-white/30 text-white hover:bg-white/5"
            style={{ boxShadow: "5px 5px 0 #000" }}
          >
            {t.ctaSecondary}
          </Link>
        </div>
        <p className="text-xs text-foreground/40 mt-4">{t.betaNote}</p>
      </section>

      {/* 3-step explainer */}
      <section className="px-6 py-16 bg-white/[0.02] border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-pixel text-[11px] uppercase tracking-[1.5px] text-emerald-300 mb-12">
            {t.stepsTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step num="01" title={t.step1Title} body={t.step1Body} />
            <Step num="02" title={t.step2Title} body={t.step2Body} />
            <Step num="03" title={t.step3Title} body={t.step3Body} />
          </div>
        </div>
      </section>

      {/* Platforms grid */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-center font-pixel text-[11px] uppercase tracking-[1.5px] text-violet-300 mb-3">
          {t.platformsTitle}
        </h2>
        <p className="text-center text-foreground/60 mb-10 max-w-2xl mx-auto">
          {t.platformsBody}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {PLATFORMS.map((p) => {
            const name = lang === "en" ? p.name_en : p.name_zh;
            return (
              <div
                key={p.name_en}
                className="aspect-square rounded-lg border border-white/[0.08] bg-white/[0.02] flex flex-col items-center justify-center hover:bg-white/[0.05] transition-colors"
              >
                <div className="text-2xl mb-1" style={{ color: p.color }}>
                  {p.logo}
                </div>
                <div className="text-[10px] text-foreground/70 font-medium">
                  {name}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why us */}
      <section className="px-6 py-16 bg-white/[0.02] border-y border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center font-pixel text-[11px] uppercase tracking-[1.5px] text-emerald-300 mb-10">
            {t.whyTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Pitch title={t.pitch1Title} body={t.pitch1Body} />
            <Pitch title={t.pitch2Title} body={t.pitch2Body} />
            <Pitch title={t.pitch3Title} body={t.pitch3Body} />
            <Pitch title={t.pitch4Title} body={t.pitch4Body} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2
          className="text-2xl sm:text-3xl font-bold mb-4"
          style={{ fontFamily: "var(--font-press-start), monospace" }}
        >
          {t.ctaH2}
        </h2>
        <p className="text-foreground/60 mb-10">{t.ctaBody}</p>
        <Link
          href="/launch"
          className="inline-block px-10 py-4 rounded-md text-base font-semibold bg-[#FF4500] text-black hover:bg-[#FF6633] transition-colors"
          style={{ boxShadow: "6px 6px 0 #000" }}
        >
          {t.ctaButton}
        </Link>
        <p className="text-xs text-foreground/40 mt-6">
          {t.alreadyCreator}{" "}
          <Link href="/dashboard" className="text-violet-300 hover:underline">
            {t.goDashboard}
          </Link>
        </p>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-white/[0.06] text-center text-foreground/40 text-xs">
        <p className="mb-2">
          {t.builtBy}{" "}
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
            {t.sourceOn}
          </a>
        </p>
        <p className="mb-2">
          <Link href="/" className="hover:text-violet-300">
            {t.backSplash}
          </Link>
          {" · "}
          <Link href="/about" className="hover:text-violet-300">
            {t.about}
          </Link>
        </p>
        <p className="text-foreground/30">{t.tagline}</p>
      </footer>
    </main>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
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
      <h3 className="font-pixel text-[11px] uppercase tracking-wider text-emerald-300 mb-3">
        {title}
      </h3>
      <p className="text-sm text-foreground/80">{body}</p>
    </div>
  );
}

function Pitch({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-foreground/80">{body}</p>
    </div>
  );
}
