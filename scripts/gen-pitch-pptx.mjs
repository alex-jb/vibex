#!/usr/bin/env node
/**
 * gen-pitch-pptx.mjs — programmatically generates the VibeXForge hackathon
 * pitch deck (14 slides, 16:9) from `pitch-script-v2.md` content tokens.
 *
 * Mirrors the arcade aesthetic of the original 2026-04-13 deck:
 *   - top-left `VIBEXFORGE://PITCH_V2` tag
 *   - top-right `NN / 14` page counter
 *   - chapter header on each content slide
 *   - dark bg + forge-orange accents
 *   - Press Start 2P for titles (falls back to Impact/Arial Black on machines without it)
 *
 * Outputs:
 *   ~/Desktop/vibexmarketing/02-hackathon-deck/VibeXForge-Pitch-v2.pptx (EN)
 *   ~/Desktop/vibexmarketing/02-hackathon-deck/VibeXForge-Pitch-v2-zh.pptx (ZH)
 *
 * Run: `node scripts/gen-pitch-pptx.mjs [en|zh|both]` (default: both)
 */

import pptxgen from "pptxgenjs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../../vibexmarketing/02-hackathon-deck");

// Palette — mirrors remotion/src/tokens.ts
const COLOR = {
  BG: "0D0D0D",
  BG_PANEL: "1A1A1F",
  BORDER: "3A3A42",
  TEXT: "E8E8EC",
  TEXT_CREAM: "FFFCEB",
  TEXT_MUTED: "8B7AA0",
  TEXT_DIM: "4A4050",
  FORGE: "FF4500",
  FORGE_DIM: "A84511",
  FORGE_CREAM: "FFE27D",
  GREEN: "39FF14",
  CYAN: "06B6D4",
  YELLOW: "FACC15",
  PINK: "EC4899",
  PURPLE: "D946EF",
  RED: "FF3B3B",
};

// Stage colors for slide 8
const STAGE = {
  Seed: "D4D4D8",
  Active: "22C55E",
  Rare: "06B6D4",
  Epic: "D946EF",
  Legend: "EF4444",
  Myth: "FF69B4",
};

// Font stack — Press Start 2P is Google Fonts, Keynote/PPT users may
// not have it. Fall back to Impact (macOS + Win) for similar blocky feel.
const FONT_PIXEL = "Press Start 2P";
const FONT_RETRO = "VT323";
const FONT_MONO = "Menlo";

// Slide dimensions — LAYOUT_WIDE: 13.333" × 7.5" (16:9)
const W = 13.333;
const H = 7.5;

// ---------------------------------------------------------------------------
// Content tokens — bilingual. Structure mirrors pitch-script-v2.md slides.
// ---------------------------------------------------------------------------

const CONTENT = {
  en: {
    title: {
      brand: "VIBEXFORGE",
      headline: "FORGE YOUR AI PROJECT.",
      headlineLine2: "CRITIQUE IT. EVOLVE IT.",
      subtitle: "The growth layer for AI-native creators.",
      cta: "▶ WWW.VIBEXFORGE.COM",
      footer: "— by alex-jb · built with vibe coding energy",
      start: "PRESS [ START ] TO BEGIN",
    },
    chapters: [
      { num: "01", name: "THE PROBLEM" },
      { num: "02", name: "THE INSIGHT" },
      { num: "03", name: "THE PRODUCT" },
      { num: "04", name: "HOW IT WORKS" },
      { num: "05", name: "THE GROWTH LOOP" },
      { num: "06", name: "SEE IT LIVE" },
      { num: "07", name: "THE GAME LAYER" },
      { num: "08", name: "WHY VIBEXFORGE" },
      { num: "09", name: "UNDER THE HOOD" },
      { num: "10", name: "REVENUE" },
      { num: "11", name: "WHERE WE ARE" },
      { num: "12", name: "VISION" },
    ],
    problem: {
      title: "ATTENTION IS THE NEW BOTTLENECK.",
      sub: "Building AI products has never been easier. Getting attention has never been harder.",
      boxes: [
        { tag: "NO DISTRIBUTION", body: "Build, ship, silence. No channel after launch day." },
        { tag: "48-HOUR HALF-LIFE", body: "Projects vanish from feeds in under two days." },
        { tag: "NO GROWTH LOOP", body: "One-time spike, then zero. No reason to come back." },
        { tag: "ONE-SHOT LAUNCH", body: "Product Hunt happens once. Growth needs a flywheel." },
      ],
    },
    insight: {
      title: "GAMES SOLVED RETENTION.",
      title2: "LAUNCHES DIDN'T.",
      body: "XP bars, rarity tiers, evolution, leaderboards — decades of retention design. Launches ignored all of it.",
      verbs: [
        { tag: "◆ FORGED", sub: "on submission" },
        { tag: "◆ CRITIQUED", sub: "by AI on arrival" },
        { tag: "◆ EVOLVING", sub: "on real traction" },
      ],
    },
    product: {
      title: "INTRODUCING VIBEXFORGE.",
      sub: "A gamified growth platform for AI creators.",
      tagline: "We forge AI projects into shareable, evolving Hero Cards.",
      bullets: [
        "Pixel Hero Cards for every AI project",
        "30-second Claude critique on submission",
        "Stats evolve from real engagement",
        "QR-coded, built for social export",
        "Creator + VC dashboards on top",
      ],
    },
    steps: {
      title: "FOUR STEPS. ZERO FRICTION.",
      items: [
        { num: "01", tag: "PASTE", body: "Drop in your AI project — url, readme, or idea." },
        { num: "02", tag: "FORGE", body: "Anvil strikes, plates glow, card live in 10s." },
        { num: "03", tag: "EVOLVE", body: "Level up on real plays, upvotes, shares." },
        { num: "04", tag: "SHARE", body: "QR-coded export to any social feed." },
      ],
    },
    loop: {
      title: "THE FLYWHEEL.",
      nodes: ["PASTE", "FORGE", "SHARE", "TRAFFIC", "LEVEL UP"],
      sub: "Every card is its own ad. Every level-up is a new reason to post.",
      punch: "Product Hunt: 48 hours. VibeXForge: a flywheel.",
    },
    live: {
      title: "THE APP, RIGHT NOW.",
      surfaces: [
        { name: "/launch", caption: "Paste a URL — 3 forge plates light up, anvil strikes" },
        { name: "/project/:id?forged=1", caption: "Forge-unveil + Claude critique streaming live" },
        { name: "/hunt", caption: "Realtime leaderboard · makers voting" },
      ],
      stat: "43 tables · 57 API routes · 119 components · shipping weekly",
    },
    evolution: {
      title: "THE GAME LAYER.",
      sub: "Six evolution stages. Every metric feeds the bar.",
      stages: [
        { label: "SEED", threshold: "submitted", color: STAGE.Seed },
        { label: "ACTIVE", threshold: "50 plays", color: STAGE.Active },
        { label: "RARE", threshold: "500 plays · 50 upvotes", color: STAGE.Rare },
        { label: "EPIC", threshold: "1K plays · breakout", color: STAGE.Epic },
        { label: "LEGEND", threshold: "5K plays · 500 upvotes", color: STAGE.Legend },
        { label: "MYTH", threshold: "10K plays · 1K upvotes · VC interest", color: STAGE.Myth },
      ],
      punch: "Your product levels up in public. That's a story every creator wants to tell.",
    },
    why: {
      title: "WHY VIBEXFORGE.",
      rows: [
        { comp: "PRODUCT HUNT", weak: "one-time launch, one day of attention" },
        { comp: "GITHUB", weak: "no discovery, stars ≠ users" },
        { comp: "TWITTER", weak: "pure noise, algorithm roulette" },
        { comp: "VIBEXFORGE", weak: "forge + AI critique + continuous loop" },
      ],
      punch: "Others give you a moment. We give you a mechanic.",
    },
    tech: {
      title: "UNDER THE HOOD.",
      lines: [
        "Next.js 16 · Turbopack · TypeScript strict",
        "React 19 · Tailwind 4 · Framer Motion · NES.css",
        "Supabase · Postgres · RLS · realtime",
        "Claude API · OpenPanel funnel · HyperDX session replay",
        "Remotion video pipeline · mock mode for zero-config try-out",
      ],
      punch: "`npm run dev` — boots in 30 seconds. No API keys. No database.",
    },
    revenue: {
      title: "FOUR REVENUE LINES.",
      sub: "All ride the loop. None gate it.",
      items: [
        { num: "01", tag: "HERO CARD SKINS", body: "Rare / Epic / Legendary visual themes" },
        { num: "02", tag: "HUNT FEATURED", body: "Paid slots on the leaderboard" },
        { num: "03", tag: "GROWTH INSIGHTS", body: "Premium AI-powered analytics" },
        { num: "04", tag: "AGENT MARKETPLACE", body: "Revenue share for builders" },
      ],
      punch: "Free users drive the flywheel. Paying users ride it.",
    },
    traction: {
      title: "NOT SLIDES. SHIPPED CODE.",
      stats: [
        { value: "43", label: "DB TABLES", color: COLOR.GREEN },
        { value: "57", label: "API ROUTES", color: COLOR.CYAN },
        { value: "119", label: "COMPONENTS", color: COLOR.YELLOW },
        { value: "925+", label: "i18n KEYS · EN+ZH", color: COLOR.PINK },
      ],
      repo: "github.com/alex-jb/vibex",
      pill: "OPEN BETA · SHIPPING WEEKLY · 2026-04",
    },
    vision: {
      line1: "AI made building easy.",
      line2: "VibeXForge makes growing inevitable.",
      sub: "The growth layer for AI creators. Not another list. Not another directory. The layer.",
    },
    cta: {
      headline: "THANK YOU.",
      sub: "NOW GO FORGE SOMETHING.",
      actions: [
        { icon: "▶", label: "FORGE YOUR PROJECT", url: "WWW.VIBEXFORGE.COM" },
        { icon: "★", label: "STAR ON GITHUB", url: "ALEX-JB/VIBEX" },
      ],
      foot: "Built with vibe coding energy — by alex-jb",
      controller: "[ SELECT ]     [ START ]",
    },
    // Speaker notes — auto-attached to each slide via slide.addNotes().
    // Lifted verbatim from pitch-script-v2.md so the deck is self-contained
    // (no need to switch windows for narration). Class submission 2026-04-26
    // requires this since live laptop demos are blocked by the 11F projector.
    notes: {
      1: "Hey everyone. Building an AI product today takes a weekend. Getting anyone to actually CARE about it? That takes a miracle. I'm Alex, and I built VibeXForge — a forge for AI makers. Your project goes in. It comes out forged — with a Claude-powered critique, evolving stats, and a launch feedback loop that actually pulls people back. Let me show you why this changes the game. [PAUSE after 'a miracle']",
      2: "Here's the pain every AI creator knows. You ship on Monday. By Wednesday, nobody remembers. Four things are broken: NO DISTRIBUTION after launch day, a 48-HOUR HALF-LIFE on any feed, NO GROWTH LOOP to pull people back, and Product Hunt is ONE-SHOT — you get one day, then silence. Shipping is easy. Staying alive is the hard part. [PAUSE after 'then silence']",
      3: "So here's the insight. Games solved retention decades ago — XP bars, rarity tiers, evolution, leaderboards. Launches never did. What if your project wasn't a link — what if it was a living asset? Something that gets FORGED on submission, CRITIQUED by AI on arrival, and EVOLVES based on real traction. That's the bet VibeXForge is built on. Pokemon plus Product Hunt plus a blacksmith's forge — for AI creators.",
      4: "This is VibeXForge. A gamified growth platform for AI creators. You drop in your project URL. We forge it — generating a pixel Hero Card with HP, MP, EXP, rarity, and skill tags. Every card has a QR code built in, so it's designed from day one to be SHARED, SCANNED, and BROUGHT BACK to your project. On top of that: a 30-second Claude review the moment you submit, a creator dashboard for growth, and a VC dashboard that surfaces what's actually popping.",
      5: "Four steps, zero friction. One: PASTE — drop in a URL, a readme, or just an idea. Two: FORGE — anvil strikes, forge plates glow, and in under ten seconds your Hero Card is live with real stats and a Claude critique streaming on the right. Three: EVOLVE — and this is the magic — your card levels up based on REAL traction. Plays, upvotes, shares — every metric feeds the stat bars. Four: SHARE — export with a QR code, post it anywhere, watch traffic come home.",
      6: "And this is why it works. Paste → Forge → Share → Traffic → Level Up → Share again. It's a closed loop. Every card is an ad for itself. Every level-up gives you a new excuse to post. Product Hunt gives you 48 hours. VibeXForge gives you a FLYWHEEL. This is the built-in distribution engine that every creator has been begging for and nobody has shipped. [PAUSE after 'flywheel']",
      7: "[OPENER — say BEFORE clicking play]\nThis is shipping right now — not a mockup.\n\n[VIDEO PLAYS — 60 seconds. Don't narrate over it. Just point at the screen at the right moments: /launch (forge plates light up, anvil strikes) → /project/:id?forged=1 (forge-unveil animation, Claude critique streaming, Hero Card reveals) → /hunt (realtime leaderboard, makers voting).]\n\n[CLOSER — say AFTER video ends, before clicking next slide]\nThat was the loop, end-to-end. 43 database tables, 57 API routes, 119 React components. Shipping weekly. Source-available on GitHub.",
      8: "Here's the game layer. Six evolution stages, from Seed to Myth. You start as a Common Seed. Hit fifty plays, you become Active. Five hundred plays and fifty upvotes — Rare, Growing. One thousand plays — Epic, Breakout. Five thousand plays, five hundred upvotes — Legendary. And at the top: Myth. Ten thousand plays, a thousand upvotes, and real VC interest. Your product literally levels up in public. That's a story every creator wants to tell.",
      9: "Let's be honest about the competition. Product Hunt — one-time launch, one day of attention. GitHub — no discovery, stars don't equal users. Twitter — pure noise, algorithm roulette. VibeXForge is the only one giving you a FORGE, a CRITIQUE, and a CONTINUOUS GROWTH LOOP — all in thirty seconds. Others give you a moment. We give you a mechanic. That's the difference between a campaign and a product.",
      10: "Quickly under the hood. Next.js 16 on Turbopack. TypeScript strict. React 19 with Tailwind 4 and Framer Motion. NES.css and custom pixel assets for the arcade aesthetic. Supabase for Postgres, RLS, and realtime. Claude API — directly for the AI Review Panel, launch critiques, and growth intelligence. OpenPanel for cookieless funnel analytics, HyperDX for browser session replay, Sentry for server errors. Remotion drives a per-project trailer pipeline. The whole thing boots in thirty seconds — npm run dev — with zero config, no API keys, no database. Mock mode is baked in so anyone can try it.",
      11: "Four revenue lines — all of them ride the loop, none of them gate it. One: HERO CARD SKINS — Rare, Epic, Legendary visual themes you can buy for your project. Two: FEATURED slots on the Hunt leaderboard. Three: GROWTH INSIGHTS — premium AI-powered analytics for serious creators. Four: an AGENT MARKETPLACE with revenue share for the builders. Rule one is we never put the growth loop behind a paywall. Free users DRIVE the flywheel. Paying users RIDE it.",
      12: "Where we actually are. Not slides — shipped code. Forty-three database tables, fifty-seven API routes, one hundred nineteen components, ~925 bilingual i18n keys covering English and Chinese end-to-end. Open beta, running on real Supabase, real Claude API. Source-available on GitHub at alex-jb/vibex. We're not pitching vaporware. We're pitching a product you can install right now. [PAUSE after 'vaporware']",
      13: "Zoom out. The mission is simple. VibeXForge wants to become the GROWTH LAYER for AI creators. Not another list. Not another directory. The LAYER — the thing every AI project plugs into to get distribution, retention, and social proof automatically. AI made building easy. VibeXForge makes growing inevitable. Every project isn't just launched — it EVOLVES.",
      14: "That's VibeXForge. Thank you. Three things you can do right now: Go to vibexforge.com and forge your own project — it takes thirty seconds. Star us on GitHub at alex-jb/vibex. And if you're a VC or collaborator, come find me after — I'd love to talk. Now go forge something. Thank you.\n\n[Q&A: if next presenter has no audience question, ask them: \"What's the single hardest user-research insight that shaped your product?\" or \"What part of your demo would you redo if you had another week?\"]",
    },
  },
  zh: {
    title: {
      brand: "VIBEXFORGE",
      headline: "锻造你的 AI 项目。",
      headlineLine2: "评审。进化。",
      subtitle: "AI 创作者的增长层",
      cta: "▶ WWW.VIBEXFORGE.COM",
      footer: "— by alex-jb · 做 AI 做得上头",
      start: "按 [ START ] 开始",
    },
    chapters: [
      { num: "01", name: "问题" },
      { num: "02", name: "洞察" },
      { num: "03", name: "产品" },
      { num: "04", name: "如何运作" },
      { num: "05", name: "增长飞轮" },
      { num: "06", name: "真实产品" },
      { num: "07", name: "游戏层" },
      { num: "08", name: "为何" },
      { num: "09", name: "技术栈" },
      { num: "10", name: "商业化" },
      { num: "11", name: "当前进度" },
      { num: "12", name: "愿景" },
    ],
    problem: {
      title: "注意力是新瓶颈。",
      sub: "做 AI 产品从未这么容易，拿到关注从未这么难。",
      boxes: [
        { tag: "没有分发", body: "做出来，发出去，然后就没声了。" },
        { tag: "48 小时半衰", body: "任何信息流都撑不过两天。" },
        { tag: "没有增长循环", body: "一次性曝光，然后归零，用户没理由回来。" },
        { tag: "一次性发布", body: "PH 只有一天，增长需要飞轮。" },
      ],
    },
    insight: {
      title: "游戏早解决了留存。",
      title2: "发布从来没解决。",
      body: "经验条、稀有度、进化、排行榜 —— 几十年的留存设计。发布全都忽略了。",
      verbs: [
        { tag: "◆ 锻造", sub: "提交即开始" },
        { tag: "◆ 评审", sub: "AI 到场即时批评" },
        { tag: "◆ 进化", sub: "真实数据驱动" },
      ],
    },
    product: {
      title: "这就是 VIBEXFORGE。",
      sub: "为 AI 创作者打造的游戏化增长平台。",
      tagline: "把 AI 项目锻造成可分享、会进化的英雄卡。",
      bullets: [
        "每个 AI 项目都是一张像素英雄卡",
        "提交即得 Claude 30 秒评审",
        "数据来自真实用户行为",
        "带二维码，为分享而设计",
        "创作者 + VC 双重 Dashboard",
      ],
    },
    steps: {
      title: "四步。零摩擦。",
      items: [
        { num: "01", tag: "PASTE", body: "扔进一个项目 —— 链接、README 或想法" },
        { num: "02", tag: "FORGE", body: "铁砧落锤，锻造板点亮，10 秒出卡" },
        { num: "03", tag: "EVOLVE", body: "靠真实播放、赞、分享升级" },
        { num: "04", tag: "SHARE", body: "带二维码导出到任何社交信息流" },
      ],
    },
    loop: {
      title: "飞轮。",
      nodes: ["PASTE", "FORGE", "SHARE", "TRAFFIC", "LEVEL UP"],
      sub: "每张卡都是自己的广告。每次升级都是一个重新发帖的理由。",
      punch: "Product Hunt：48 小时。VibeXForge：一个飞轮。",
    },
    live: {
      title: "正在线上跑。",
      surfaces: [
        { name: "/launch", caption: "贴链接 → 3 个锻造板点亮 → 落锤" },
        { name: "/project/:id?forged=1", caption: "Forge-unveil 动画 + Claude 评审实时流" },
        { name: "/hunt", caption: "实时榜单 · 创作者投票" },
      ],
      stat: "43 张表 · 57 个 API · 119 个组件 · 每周发版",
    },
    evolution: {
      title: "游戏层。",
      sub: "6 段进化。每个指标都在喂数值条。",
      stages: [
        { label: "SEED", threshold: "刚提交", color: STAGE.Seed },
        { label: "ACTIVE", threshold: "50 播放", color: STAGE.Active },
        { label: "RARE", threshold: "500 播放 · 50 赞", color: STAGE.Rare },
        { label: "EPIC", threshold: "1K 播放 · 爆发", color: STAGE.Epic },
        { label: "LEGEND", threshold: "5K 播放 · 500 赞", color: STAGE.Legend },
        { label: "MYTH", threshold: "10K 播放 · 1K 赞 · VC 关注", color: STAGE.Myth },
      ],
      punch: "你的产品会公开地升级。每个创作者都想讲这个故事。",
    },
    why: {
      title: "为什么是 VIBEXFORGE。",
      rows: [
        { comp: "PRODUCT HUNT", weak: "一次性发布，一天的关注" },
        { comp: "GITHUB", weak: "没有发现机制，Star 不等于用户" },
        { comp: "TWITTER", weak: "纯噪音，算法看脸" },
        { comp: "VIBEXFORGE", weak: "锻造 + AI 评审 + 持续循环" },
      ],
      punch: "别人给你一个瞬间。我们给你一个机制。",
    },
    tech: {
      title: "技术栈。",
      lines: [
        "Next.js 16 · Turbopack · TypeScript 严格模式",
        "React 19 · Tailwind 4 · Framer Motion · NES.css",
        "Supabase · Postgres · RLS · realtime",
        "Claude API · OpenPanel 漏斗 · HyperDX session replay",
        "Remotion 视频流水线 · Mock 模式零配置跑",
      ],
      punch: "`npm run dev` —— 30 秒启动。零 API key。零数据库。",
    },
    revenue: {
      title: "四条收入线。",
      sub: "全部坐在飞轮上，没有一个拦在飞轮前。",
      items: [
        { num: "01", tag: "英雄卡皮肤", body: "Rare / Epic / Legendary 视觉主题" },
        { num: "02", tag: "HUNT FEATURED", body: "榜单付费推荐位" },
        { num: "03", tag: "GROWTH INSIGHTS", body: "AI 增长分析高级版" },
        { num: "04", tag: "AGENT 市场", body: "分成机制给开发者" },
      ],
      punch: "免费用户驱动飞轮。付费用户坐在上面。",
    },
    traction: {
      title: "不是 PPT。是发出去的代码。",
      stats: [
        { value: "43", label: "数据库表", color: COLOR.GREEN },
        { value: "57", label: "API 路由", color: COLOR.CYAN },
        { value: "119", label: "React 组件", color: COLOR.YELLOW },
        { value: "925+", label: "双语 i18n", color: COLOR.PINK },
      ],
      repo: "github.com/alex-jb/vibex",
      pill: "公开 BETA · 每周发版 · 2026-04",
    },
    vision: {
      line1: "AI 让\"做出来\"变简单。",
      line2: "VibeXForge 让\"长起来\"变必然。",
      sub: "AI 创作者的增长层。不是又一个榜单，不是又一个目录。而是那一层。",
    },
    cta: {
      headline: "谢谢。",
      sub: "去锻造点什么吧。",
      actions: [
        { icon: "▶", label: "锻造你的项目", url: "WWW.VIBEXFORGE.COM" },
        { icon: "★", label: "GITHUB STAR", url: "ALEX-JB/VIBEX" },
      ],
      foot: "做 AI 做得上头 — by alex-jb",
      controller: "[ SELECT ]     [ START ]",
    },
    notes: {
      1: "大家好。今天做一个 AI 产品，一个周末就够了。但是让别人真的在意你做的东西？那得靠奇迹。我是 Alex，我做了 VibeXForge —— AI 创作者的锻造炉。你的项目扔进去，出来就是被锻造过的——有 Claude 的真实评审、会进化的数据、以及一个真的能把用户拉回来的 launch 反馈循环。接下来告诉你为什么这会改变游戏规则。【\"奇迹\"后停顿】",
      2: "每个 AI 创作者都懂这种痛。周一发布，周三就没人记得了。四个问题：发布之后没有分发渠道；任何信息流都是 48 小时半衰期；没有增长循环把用户拉回来；Product Hunt 是一次性的——就一天，然后就是沉默。\"做出来\"很容易，\"活下去\"才是难的。【\"沉默\"后停顿】",
      3: "所以洞察是这样：游戏早在几十年前就解决了\"留存\"这件事——经验条、稀有度、进化、排行榜。但是产品发布从来没做到。如果你的项目不是一条链接，而是一个活的资产呢？提交的时候被锻造，到达的时候被 AI 评审，然后根据真实数据进化。这就是 VibeXForge 的核心赌注——宝可梦 × Product Hunt × 铁匠铺，为 AI 创作者而做。",
      4: "这就是 VibeXForge——一个为 AI 创作者打造的游戏化增长平台。你扔进一个项目链接，我们就锻造它——生成一张像素英雄卡，HP、MP、EXP、稀有度、技能标签，全套都有。每张卡都自带二维码，所以从一开始它就是为被分享、被扫码、把流量带回项目而设计的。再往上：提交那一刻就能拿到 30 秒的 Claude 评审，一个给创作者看增长的 Dashboard，一个给 VC 看\"什么正在火\"的 Dashboard。",
      5: "四步，零摩擦。第一步 PASTE——扔一个链接、一份 README，或者就一个想法都行。第二步 FORGE——铁砧落锤、锻造板点燃，十秒内你的英雄卡就上线了，真实数值，右边 Claude 的评审同步在流。第三步 EVOLVE——这是最魔法的部分——你的卡片会根据真实的数据成长。播放、点赞、分享，每个指标都在喂养数值条。第四步 SHARE——带二维码导出，发到任何地方，看着流量回到你的项目。",
      6: "这就是它为什么能跑通。Paste → Forge → Share → Traffic → Level Up → 再 Share。这是个闭环。每一张卡都是它自己的广告。每一次升级都给你一个重新发帖的理由。Product Hunt 给你 48 小时，VibeXForge 给你一个飞轮。这是每个创作者都在求、但没人真做出来过的\"内置分发引擎\"。【\"飞轮\"后停顿】",
      7: "【OPENER —— 点播放键之前说】\n这不是 mockup，是正在线上跑的东西。\n\n【视频播放 —— 60 秒。不要叠声。在合适的时机指向画面：/launch（锻造板点燃，铁砧落锤）→ /project/:id?forged=1（锻造揭幕动画、Claude 评审实时流、英雄卡揭晓）→ /hunt（实时榜单，创作者投票）。】\n\n【CLOSER —— 视频结束后说，再切下一张】\n这就是完整的闭环。43 张数据库表、57 个 API 路由、119 个 React 组件，每周发版，GitHub 上 source-available。",
      8: "这是游戏层。六段进化，从 Seed 到 Myth。起点是 Common 的种子。50 次播放——升到 Active。500 次播放加 50 个赞——Rare，Growing。1000 次播放——Epic，Breakout。5000 次播放加 500 个赞——Legendary。最顶端是 Myth——一万次播放、一千个赞，加上真实的 VC 关注。你的产品会公开地升级。这是每个创作者都想讲的故事。",
      9: "说实话，对比一下竞品。Product Hunt——一次性发布，一天的注意力。GitHub——没有发现机制，Star 不等于用户。Twitter——纯噪音，算法看脸。VibeXForge 是唯一一个给你锻造炉、AI 评审、持续增长循环的——三件事 30 秒全给你。别人给你一个瞬间，我们给你一个机制。这是\"一次活动\"和\"一个产品\"的区别。",
      10: "快速讲下技术栈。Next.js 16 跑在 Turbopack 上。TypeScript 严格模式。React 19 加 Tailwind 4 加 Framer Motion。像素感用 NES.css 和自研像素素材。Supabase 做 Postgres、RLS 和实时。Claude API——直接接 AI Review Panel、发布评审、增长分析。OpenPanel 做无 cookie 漏斗分析，HyperDX 做浏览器 session replay，Sentry 做服务端错误。Remotion 驱动 per-project trailer 流水线。整个项目 30 秒就能跑起来——npm run dev——零配置，不需要 API key，不需要数据库。Mock 模式内置，任何人下一份就能玩。",
      11: "四条收入线——每一条都坐在飞轮上，而不是拦在飞轮前。第一：英雄卡皮肤——Rare、Epic、Legendary 的视觉主题。第二：Hunt 榜单上的付费 Featured 位。第三：Growth Insights——面向认真创作者的 AI 增长分析。第四：Agent 市场——给开发者的分成机制。铁律是：增长循环永远不付费墙。免费用户驱动飞轮，付费用户坐飞轮。",
      12: "我们到底到哪儿了。不是 PPT——是已经发出去的代码。43 张数据库表、57 个 API 路由、119 个组件、约 925 条 EN/ZH 双语 i18n，中英文端到端覆盖。公开 Beta 在线，跑的是真的 Supabase、真的 Claude API。代码在 GitHub 上 source-available——alex-jb/vibex。可以 clone、可以跑、可以看每一行。我们不是在卖空气，我们在卖一个你现在就能安装的产品。【\"空气\"后停顿】",
      13: "拉远一点。我们的使命很简单。VibeXForge 要成为 AI 创作者的增长层。不是又一个榜单，也不是又一个目录。而是那个层——每一个 AI 项目都插上去，就自动拥有分发、留存、社交证明。AI 让\"做出来\"变简单。VibeXForge 让\"长起来\"变必然。每一个项目，不只是被发布，而是会进化。",
      14: "这就是 VibeXForge。谢谢大家。三件事你现在就可以做：第一，去 vibexforge.com 把你自己的项目锻造一下——只要 30 秒。第二，去 GitHub star 我们——alex-jb/vibex——这样更多创作者能找到我们。第三，如果你是 VC 或者潜在合作者，会后来找我——我非常想聊。Now go forge something. 谢谢大家。\n\n【Q&A 备选问题：如果听众没人提问，问下一位 presenter：\"你做用户调研里收获最大、最改变方向的一个 insight 是什么？\" 或 \"如果再给你一周，demo 里最想重做的是哪一段？\"】",
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Apply the standard arcade frame to a slide: dark bg + top tag bar +
 * bottom footer bar + scanline-ish horizontal hair lines.
 */
function frame(slide, pageNum, chapterLabel) {
  slide.background = { color: COLOR.BG };

  // top-left tag
  slide.addText("▸ VIBEXFORGE://PITCH_V2", {
    x: 0.4,
    y: 0.24,
    w: 4,
    h: 0.3,
    fontFace: FONT_PIXEL,
    fontSize: 11,
    color: COLOR.FORGE,
    bold: false,
  });

  // top-right page counter
  slide.addText(`${String(pageNum).padStart(2, "0")} / 14`, {
    x: W - 1.8,
    y: 0.24,
    w: 1.6,
    h: 0.3,
    fontFace: FONT_PIXEL,
    fontSize: 11,
    color: COLOR.TEXT_MUTED,
    align: "right",
  });

  // top hair-line
  slide.addShape("rect", {
    x: 0.4,
    y: 0.6,
    w: W - 0.8,
    h: 0.012,
    fill: { color: COLOR.BORDER },
    line: { color: COLOR.BORDER, width: 0 },
  });

  // bottom hair-line
  slide.addShape("rect", {
    x: 0.4,
    y: H - 0.45,
    w: W - 0.8,
    h: 0.012,
    fill: { color: COLOR.BORDER },
    line: { color: COLOR.BORDER, width: 0 },
  });

  // bottom footer — domain + chapter
  slide.addText("VIBEXFORGE.COM", {
    x: 0.4,
    y: H - 0.36,
    w: 3,
    h: 0.26,
    fontFace: FONT_PIXEL,
    fontSize: 9,
    color: COLOR.TEXT_MUTED,
  });
  if (chapterLabel) {
    slide.addText(chapterLabel, {
      x: W - 5,
      y: H - 0.36,
      w: 4.6,
      h: 0.26,
      fontFace: FONT_PIXEL,
      fontSize: 9,
      color: COLOR.TEXT_MUTED,
      align: "right",
    });
  }
}

function chapterHeader(slide, chapter) {
  slide.addText(`▸ CHAPTER ${chapter.num} — ${chapter.name}`, {
    x: 0.5,
    y: 0.95,
    w: W - 1,
    h: 0.5,
    fontFace: FONT_PIXEL,
    fontSize: 14,
    color: COLOR.FORGE,
    letterSpacing: 3,
  });
}

function h1(slide, text, y = 1.6, color = COLOR.TEXT_CREAM) {
  slide.addText(text, {
    x: 0.5,
    y,
    w: W - 1,
    h: 0.9,
    fontFace: FONT_PIXEL,
    fontSize: 36,
    color,
    bold: true,
  });
}

function h2(slide, text, y = 2.6, color = COLOR.TEXT) {
  slide.addText(text, {
    x: 0.5,
    y,
    w: W - 1,
    h: 0.5,
    fontFace: FONT_RETRO,
    fontSize: 22,
    color,
  });
}

// Resolve the demo video path for a given locale. Used by buildLive to
// embed the 60s product demo so we don't need to switch laptops mid-talk
// (CSE class 11F projector constraint, 2026-04-26 submission).
const DEMO_VIDEO = (locale) =>
  resolve(__dirname, "..", "out", `vibex-demo-v1${locale === "zh" ? "-zh" : ""}.mp4`);

// ---------------------------------------------------------------------------
// Slide builders
// ---------------------------------------------------------------------------

function buildTitle(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 1, null);

  // big brand lockup
  s.addText(c.title.brand, {
    x: 0.5,
    y: 1.8,
    w: W - 1,
    h: 1.8,
    fontFace: FONT_PIXEL,
    fontSize: 96,
    color: COLOR.FORGE,
    bold: true,
    align: "center",
    glow: { size: 10, opacity: 0.6, color: COLOR.FORGE },
  });

  s.addText(
    [
      { text: c.title.headline, options: { fontFace: FONT_PIXEL, fontSize: 26, color: COLOR.TEXT_CREAM, breakLine: true } },
      { text: c.title.headlineLine2, options: { fontFace: FONT_PIXEL, fontSize: 26, color: COLOR.TEXT_CREAM } },
    ],
    { x: 0.5, y: 3.9, w: W - 1, h: 1.2, align: "center" },
  );

  s.addText(c.title.subtitle, {
    x: 0.5,
    y: 5.1,
    w: W - 1,
    h: 0.5,
    fontFace: FONT_RETRO,
    fontSize: 26,
    color: COLOR.TEXT_MUTED,
    align: "center",
  });

  s.addText(c.title.cta, {
    x: 0.5,
    y: 5.9,
    w: W - 1,
    h: 0.4,
    fontFace: FONT_PIXEL,
    fontSize: 16,
    color: COLOR.FORGE,
    align: "center",
  });

  s.addText(c.title.footer, {
    x: 0.5,
    y: 6.4,
    w: W - 1,
    h: 0.3,
    fontFace: FONT_RETRO,
    fontSize: 18,
    color: COLOR.TEXT_DIM,
    align: "center",
  });

  s.addText(c.title.start, {
    x: 0.5,
    y: 6.8,
    w: W - 1,
    h: 0.3,
    fontFace: FONT_PIXEL,
    fontSize: 12,
    color: COLOR.FORGE_CREAM,
    align: "center",
  });

  s.addNotes(c.notes[1]);
}

function buildProblem(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 2, "CHAPTER 01");
  chapterHeader(s, c.chapters[0]);
  h1(s, c.problem.title);
  h2(s, c.problem.sub);

  // 2x2 grid
  const boxX = [0.5, 6.9];
  const boxY = [3.4, 5.4];
  const boxW = 5.9;
  const boxH = 1.8;
  c.problem.boxes.forEach((box, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    s.addShape("rect", {
      x: boxX[col],
      y: boxY[row],
      w: boxW,
      h: boxH,
      fill: { color: COLOR.BG_PANEL },
      line: { color: COLOR.FORGE_DIM, width: 1.5 },
    });
    s.addText(box.tag, {
      x: boxX[col] + 0.3,
      y: boxY[row] + 0.2,
      w: boxW - 0.4,
      h: 0.5,
      fontFace: FONT_PIXEL,
      fontSize: 18,
      color: COLOR.FORGE,
      bold: true,
    });
    s.addText(box.body, {
      x: boxX[col] + 0.3,
      y: boxY[row] + 0.85,
      w: boxW - 0.4,
      h: 0.9,
      fontFace: FONT_RETRO,
      fontSize: 20,
      color: COLOR.TEXT,
    });
  });

  s.addNotes(c.notes[2]);
}

function buildInsight(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 3, "CHAPTER 02");
  chapterHeader(s, c.chapters[1]);

  s.addText(c.insight.title, {
    x: 0.5,
    y: 1.7,
    w: W - 1,
    h: 0.8,
    fontFace: FONT_PIXEL,
    fontSize: 36,
    color: COLOR.TEXT_CREAM,
  });
  s.addText(c.insight.title2, {
    x: 0.5,
    y: 2.5,
    w: W - 1,
    h: 0.8,
    fontFace: FONT_PIXEL,
    fontSize: 36,
    color: COLOR.FORGE,
    glow: { size: 6, opacity: 0.5, color: COLOR.FORGE },
  });

  s.addText(c.insight.body, {
    x: 0.5,
    y: 3.5,
    w: W - 1,
    h: 1,
    fontFace: FONT_RETRO,
    fontSize: 24,
    color: COLOR.TEXT_MUTED,
  });

  // 3 forge verbs
  const vbX = [1.0, 5.17, 9.33];
  const vbW = 3.0;
  c.insight.verbs.forEach((v, i) => {
    s.addShape("rect", {
      x: vbX[i],
      y: 5.2,
      w: vbW,
      h: 1.3,
      fill: { color: COLOR.BG_PANEL },
      line: { color: COLOR.FORGE, width: 2 },
    });
    s.addText(v.tag, {
      x: vbX[i] + 0.2,
      y: 5.4,
      w: vbW - 0.4,
      h: 0.5,
      fontFace: FONT_PIXEL,
      fontSize: 20,
      color: COLOR.FORGE,
      bold: true,
    });
    s.addText(v.sub, {
      x: vbX[i] + 0.2,
      y: 6,
      w: vbW - 0.4,
      h: 0.4,
      fontFace: FONT_RETRO,
      fontSize: 18,
      color: COLOR.TEXT_MUTED,
    });
  });

  s.addNotes(c.notes[3]);
}

function buildProduct(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 4, "CHAPTER 03");
  chapterHeader(s, c.chapters[2]);
  h1(s, c.product.title);
  h2(s, c.product.sub);
  s.addText(c.product.tagline, {
    x: 0.5,
    y: 3.2,
    w: W - 1,
    h: 0.5,
    fontFace: FONT_RETRO,
    fontSize: 20,
    color: COLOR.TEXT_MUTED,
    italic: true,
  });

  // "WHAT IT IS" column
  s.addText("▸ WHAT IT IS", {
    x: 0.5,
    y: 4,
    w: 5,
    h: 0.4,
    fontFace: FONT_PIXEL,
    fontSize: 14,
    color: COLOR.FORGE,
  });
  c.product.bullets.forEach((b, i) => {
    s.addText(`◆  ${b}`, {
      x: 0.5,
      y: 4.5 + i * 0.45,
      w: W - 1,
      h: 0.4,
      fontFace: FONT_RETRO,
      fontSize: 22,
      color: COLOR.TEXT_CREAM,
    });
  });

  s.addNotes(c.notes[4]);
}

function buildSteps(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 5, "CHAPTER 04");
  chapterHeader(s, c.chapters[3]);
  h1(s, c.steps.title);

  const colW = 2.95;
  const colY = 3.5;
  const colH = 2.8;
  const startX = 0.5;
  const gap = 0.13;
  c.steps.items.forEach((step, i) => {
    const x = startX + i * (colW + gap);
    s.addShape("rect", {
      x,
      y: colY,
      w: colW,
      h: colH,
      fill: { color: COLOR.BG_PANEL },
      line: { color: COLOR.FORGE, width: 2 },
    });
    s.addText(step.num, {
      x: x + 0.3,
      y: colY + 0.3,
      w: colW - 0.6,
      h: 0.6,
      fontFace: FONT_PIXEL,
      fontSize: 28,
      color: COLOR.FORGE,
      bold: true,
    });
    s.addText(step.tag, {
      x: x + 0.3,
      y: colY + 1.05,
      w: colW - 0.6,
      h: 0.5,
      fontFace: FONT_PIXEL,
      fontSize: 22,
      color: COLOR.TEXT_CREAM,
    });
    s.addText(step.body, {
      x: x + 0.3,
      y: colY + 1.75,
      w: colW - 0.6,
      h: 0.9,
      fontFace: FONT_RETRO,
      fontSize: 17,
      color: COLOR.TEXT,
    });

    if (i < 3) {
      // arrow between columns
      s.addText("▶", {
        x: x + colW - 0.1,
        y: colY + colH / 2 - 0.25,
        w: 0.3,
        h: 0.5,
        fontFace: FONT_PIXEL,
        fontSize: 24,
        color: COLOR.FORGE,
        align: "center",
      });
    }
  });

  s.addNotes(c.notes[5]);
}

function buildLoop(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 6, "CHAPTER 05");
  chapterHeader(s, c.chapters[4]);
  h1(s, c.loop.title);

  // draw 5 nodes horizontally
  const nY = 3.5;
  const nW = 2.2;
  const nH = 1.1;
  const total = c.loop.nodes.length * nW + (c.loop.nodes.length - 1) * 0.3;
  const startX = (W - total) / 2;
  c.loop.nodes.forEach((node, i) => {
    const x = startX + i * (nW + 0.3);
    s.addShape("rect", {
      x,
      y: nY,
      w: nW,
      h: nH,
      fill: { color: COLOR.BG_PANEL },
      line: { color: COLOR.FORGE, width: 2 },
    });
    s.addText(node, {
      x,
      y: nY + 0.3,
      w: nW,
      h: 0.5,
      fontFace: FONT_PIXEL,
      fontSize: 18,
      color: COLOR.FORGE,
      align: "center",
      bold: true,
    });
    if (i < c.loop.nodes.length - 1) {
      s.addText("→", {
        x: x + nW - 0.05,
        y: nY + 0.3,
        w: 0.4,
        h: 0.5,
        fontFace: "Arial",
        fontSize: 28,
        color: COLOR.FORGE,
        align: "center",
      });
    }
  });

  s.addText(c.loop.sub, {
    x: 0.5,
    y: 5.2,
    w: W - 1,
    h: 0.6,
    fontFace: FONT_RETRO,
    fontSize: 22,
    color: COLOR.TEXT_MUTED,
    align: "center",
  });

  s.addText(c.loop.punch, {
    x: 0.5,
    y: 6,
    w: W - 1,
    h: 0.6,
    fontFace: FONT_PIXEL,
    fontSize: 20,
    color: COLOR.FORGE_CREAM,
    align: "center",
    bold: true,
  });

  s.addNotes(c.notes[6]);
}

function buildLive(pptx, c, locale) {
  const s = pptx.addSlide();
  frame(s, 7, "CHAPTER 06");
  chapterHeader(s, c.chapters[5]);

  // Smaller h1 to leave room for the video player.
  s.addText(c.live.title, {
    x: 0.5,
    y: 1.6,
    w: W - 1,
    h: 0.6,
    fontFace: FONT_PIXEL,
    fontSize: 22,
    color: COLOR.TEXT_CREAM,
    bold: true,
  });

  // Tight surface caption row above the video.
  s.addText(c.live.surfaces.map((sf) => `${sf.name}`).join("    ▸    "), {
    x: 0.5,
    y: 2.25,
    w: W - 1,
    h: 0.4,
    fontFace: FONT_PIXEL,
    fontSize: 13,
    color: COLOR.FORGE,
    align: "center",
  });

  // Embedded 60s product demo. 16:9 ratio, w=8.89 × h=5.0, centered.
  // Path resolves to out/vibex-demo-v1.mp4 (EN) or vibex-demo-v1-zh.mp4 (ZH).
  // Embedding bloats the .pptx by ~8 MB but means no internet / no laptop
  // switch needed at presentation time — reliable on any classroom machine.
  s.addMedia({
    type: "video",
    path: DEMO_VIDEO(locale),
    x: 2.22,
    y: 2.85,
    w: 8.89,
    h: 4.0,
  });

  // Stat line below video.
  s.addText(c.live.stat, {
    x: 0.5,
    y: 6.95,
    w: W - 1,
    h: 0.4,
    fontFace: FONT_PIXEL,
    fontSize: 12,
    color: COLOR.FORGE_CREAM,
    align: "center",
  });

  s.addNotes(c.notes[7]);
}

function buildEvolution(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 8, "CHAPTER 07");
  chapterHeader(s, c.chapters[6]);
  h1(s, c.evolution.title);
  h2(s, c.evolution.sub);

  // 6 stages horizontal
  const colW = 1.95;
  const colY = 3.9;
  const colH = 2;
  const gap = 0.12;
  c.evolution.stages.forEach((stage, i) => {
    const x = 0.5 + i * (colW + gap);
    s.addShape("rect", {
      x,
      y: colY,
      w: colW,
      h: colH,
      fill: { color: COLOR.BG_PANEL },
      line: { color: stage.color, width: 2 },
    });
    // color dot at top
    s.addShape("rect", {
      x: x + 0.2,
      y: colY + 0.2,
      w: 0.3,
      h: 0.3,
      fill: { color: stage.color },
      line: { color: stage.color, width: 0 },
    });
    s.addText(stage.label, {
      x: x + 0.15,
      y: colY + 0.6,
      w: colW - 0.3,
      h: 0.5,
      fontFace: FONT_PIXEL,
      fontSize: 16,
      color: stage.color,
      bold: true,
    });
    s.addText(stage.threshold, {
      x: x + 0.15,
      y: colY + 1.15,
      w: colW - 0.3,
      h: 0.85,
      fontFace: FONT_RETRO,
      fontSize: 14,
      color: COLOR.TEXT_MUTED,
    });
  });

  s.addText(c.evolution.punch, {
    x: 0.5,
    y: 6.2,
    w: W - 1,
    h: 0.6,
    fontFace: FONT_RETRO,
    fontSize: 22,
    color: COLOR.FORGE_CREAM,
    align: "center",
    italic: true,
  });

  s.addNotes(c.notes[8]);
}

function buildWhy(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 9, "CHAPTER 08");
  chapterHeader(s, c.chapters[7]);
  h1(s, c.why.title);

  const rowH = 0.6;
  const rowY = 3.3;
  c.why.rows.forEach((row, i) => {
    const isUs = row.comp.includes("VIBEXFORGE");
    const y = rowY + i * (rowH + 0.15);
    s.addShape("rect", {
      x: 0.5,
      y,
      w: W - 1,
      h: rowH,
      fill: { color: isUs ? "2A1A0A" : COLOR.BG_PANEL },
      line: { color: isUs ? COLOR.FORGE : COLOR.BORDER, width: isUs ? 2 : 1 },
    });
    s.addText(row.comp, {
      x: 0.7,
      y: y + 0.12,
      w: 4,
      h: 0.4,
      fontFace: FONT_PIXEL,
      fontSize: 16,
      color: isUs ? COLOR.FORGE : COLOR.TEXT_MUTED,
      bold: isUs,
    });
    s.addText(row.weak, {
      x: 4.8,
      y: y + 0.12,
      w: W - 5.4,
      h: 0.4,
      fontFace: FONT_RETRO,
      fontSize: 20,
      color: isUs ? COLOR.FORGE_CREAM : COLOR.TEXT,
    });
  });

  s.addText(c.why.punch, {
    x: 0.5,
    y: 6.2,
    w: W - 1,
    h: 0.5,
    fontFace: FONT_PIXEL,
    fontSize: 18,
    color: COLOR.FORGE,
    align: "center",
    bold: true,
  });

  s.addNotes(c.notes[9]);
}

function buildTech(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 10, "CHAPTER 09");
  chapterHeader(s, c.chapters[8]);
  h1(s, c.tech.title);

  c.tech.lines.forEach((line, i) => {
    s.addText(`▸ ${line}`, {
      x: 1,
      y: 2.8 + i * 0.55,
      w: W - 2,
      h: 0.5,
      fontFace: FONT_MONO,
      fontSize: 20,
      color: COLOR.TEXT,
    });
  });

  s.addText(c.tech.punch, {
    x: 0.5,
    y: 6.2,
    w: W - 1,
    h: 0.5,
    fontFace: FONT_MONO,
    fontSize: 18,
    color: COLOR.FORGE_CREAM,
    align: "center",
  });

  s.addNotes(c.notes[10]);
}

function buildRevenue(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 11, "CHAPTER 10");
  chapterHeader(s, c.chapters[9]);
  h1(s, c.revenue.title);
  h2(s, c.revenue.sub);

  const colW = 2.95;
  const colY = 3.6;
  const colH = 2.5;
  const gap = 0.13;
  c.revenue.items.forEach((item, i) => {
    const x = 0.5 + i * (colW + gap);
    s.addShape("rect", {
      x,
      y: colY,
      w: colW,
      h: colH,
      fill: { color: COLOR.BG_PANEL },
      line: { color: COLOR.FORGE_DIM, width: 1.5 },
    });
    s.addText(item.num, {
      x: x + 0.3,
      y: colY + 0.3,
      w: colW - 0.6,
      h: 0.5,
      fontFace: FONT_PIXEL,
      fontSize: 22,
      color: COLOR.FORGE,
    });
    s.addText(item.tag, {
      x: x + 0.3,
      y: colY + 1.0,
      w: colW - 0.6,
      h: 0.5,
      fontFace: FONT_PIXEL,
      fontSize: 15,
      color: COLOR.TEXT_CREAM,
      bold: true,
    });
    s.addText(item.body, {
      x: x + 0.3,
      y: colY + 1.65,
      w: colW - 0.6,
      h: 0.7,
      fontFace: FONT_RETRO,
      fontSize: 16,
      color: COLOR.TEXT_MUTED,
    });
  });

  s.addText(c.revenue.punch, {
    x: 0.5,
    y: 6.3,
    w: W - 1,
    h: 0.5,
    fontFace: FONT_PIXEL,
    fontSize: 16,
    color: COLOR.FORGE,
    align: "center",
    bold: true,
  });

  s.addNotes(c.notes[11]);
}

function buildTraction(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 12, "CHAPTER 11");
  chapterHeader(s, c.chapters[10]);
  h1(s, c.traction.title);

  // 2x2 stat grid
  const colW = 5.9;
  const colH = 1.5;
  const gap = 0.2;
  const startY = 3.4;
  const startX = 0.5;
  c.traction.stats.forEach((stat, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = startX + col * (colW + gap);
    const y = startY + row * (colH + gap);
    s.addShape("rect", {
      x,
      y,
      w: colW,
      h: colH,
      fill: { color: COLOR.BG_PANEL },
      line: { color: stat.color, width: 2 },
    });
    s.addText(stat.value, {
      x: x + 0.3,
      y: y + 0.2,
      w: 2.8,
      h: 1.1,
      fontFace: FONT_PIXEL,
      fontSize: 56,
      color: COLOR.TEXT_CREAM,
      bold: true,
    });
    s.addText(`▸ ${stat.label}`, {
      x: x + colW - 3,
      y: y + 0.4,
      w: 2.8,
      h: 0.7,
      fontFace: FONT_PIXEL,
      fontSize: 14,
      color: stat.color,
      align: "right",
    });
  });

  s.addText(`▶ ${c.traction.repo}`, {
    x: 0.5,
    y: 6.5,
    w: W - 1,
    h: 0.4,
    fontFace: FONT_MONO,
    fontSize: 18,
    color: COLOR.FORGE_CREAM,
    align: "center",
  });

  s.addNotes(c.notes[12]);
}

function buildVision(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 13, "CHAPTER 12");
  chapterHeader(s, c.chapters[11]);

  s.addText(c.vision.line1, {
    x: 0.5,
    y: 2.5,
    w: W - 1,
    h: 1,
    fontFace: FONT_PIXEL,
    fontSize: 42,
    color: COLOR.TEXT_MUTED,
    align: "center",
  });
  s.addText(c.vision.line2, {
    x: 0.5,
    y: 3.7,
    w: W - 1,
    h: 1,
    fontFace: FONT_PIXEL,
    fontSize: 42,
    color: COLOR.FORGE,
    align: "center",
    glow: { size: 6, opacity: 0.6, color: COLOR.FORGE },
  });
  s.addText(c.vision.sub, {
    x: 1.5,
    y: 5.5,
    w: W - 3,
    h: 1,
    fontFace: FONT_RETRO,
    fontSize: 22,
    color: COLOR.TEXT_MUTED,
    align: "center",
    italic: true,
  });

  s.addNotes(c.notes[13]);
}

function buildCTA(pptx, c) {
  const s = pptx.addSlide();
  frame(s, 14, null);

  s.addText("▸ VIBEXFORGE://END_OF_PITCH", {
    x: 0.5,
    y: 1.2,
    w: W - 1,
    h: 0.5,
    fontFace: FONT_PIXEL,
    fontSize: 18,
    color: COLOR.FORGE,
    align: "center",
  });

  s.addText(c.cta.headline, {
    x: 0.5,
    y: 2.1,
    w: W - 1,
    h: 1.2,
    fontFace: FONT_PIXEL,
    fontSize: 72,
    color: COLOR.TEXT_CREAM,
    align: "center",
    bold: true,
  });

  s.addText(c.cta.sub, {
    x: 0.5,
    y: 3.5,
    w: W - 1,
    h: 0.8,
    fontFace: FONT_PIXEL,
    fontSize: 36,
    color: COLOR.FORGE,
    align: "center",
    glow: { size: 8, opacity: 0.6, color: COLOR.FORGE },
  });

  // 2 action cards
  c.cta.actions.forEach((a, i) => {
    const x = 1.5 + i * 5.3;
    s.addShape("rect", {
      x,
      y: 4.9,
      w: 4.8,
      h: 0.9,
      fill: { color: COLOR.BG_PANEL },
      line: { color: COLOR.FORGE, width: 2 },
    });
    s.addText(`${a.icon}  ${a.label}`, {
      x: x + 0.3,
      y: 4.95,
      w: 4.2,
      h: 0.4,
      fontFace: FONT_PIXEL,
      fontSize: 15,
      color: COLOR.FORGE,
      bold: true,
    });
    s.addText(a.url, {
      x: x + 0.3,
      y: 5.35,
      w: 4.2,
      h: 0.4,
      fontFace: FONT_MONO,
      fontSize: 16,
      color: COLOR.FORGE_CREAM,
    });
  });

  s.addText(c.cta.foot, {
    x: 0.5,
    y: 6.2,
    w: W - 1,
    h: 0.4,
    fontFace: FONT_RETRO,
    fontSize: 18,
    color: COLOR.TEXT_DIM,
    align: "center",
  });

  s.addText(c.cta.controller, {
    x: 0.5,
    y: 6.75,
    w: W - 1,
    h: 0.4,
    fontFace: FONT_PIXEL,
    fontSize: 14,
    color: COLOR.TEXT_MUTED,
    align: "center",
  });

  s.addNotes(c.notes[14]);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function generate(locale) {
  const c = CONTENT[locale];
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.theme = { headFontFace: FONT_PIXEL, bodyFontFace: FONT_RETRO };

  buildTitle(pptx, c);
  buildProblem(pptx, c);
  buildInsight(pptx, c);
  buildProduct(pptx, c);
  buildSteps(pptx, c);
  buildLoop(pptx, c);
  buildLive(pptx, c, locale);
  buildEvolution(pptx, c);
  buildWhy(pptx, c);
  buildTech(pptx, c);
  buildRevenue(pptx, c);
  buildTraction(pptx, c);
  buildVision(pptx, c);
  buildCTA(pptx, c);

  const suffix = locale === "zh" ? "-zh" : "";
  const out = `${OUT_DIR}/VibeXForge-Pitch-v2${suffix}.pptx`;
  await mkdir(OUT_DIR, { recursive: true });
  await pptx.writeFile({ fileName: out });
  console.log(`✓ ${out}`);
}

const arg = process.argv[2] || "both";
if (arg === "en" || arg === "both") await generate("en");
if (arg === "zh" || arg === "both") await generate("zh");
