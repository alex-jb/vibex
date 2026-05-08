/**
 * lib/demo-drafts.ts — hardcoded sample drafts shown on /try.
 *
 * These are real outputs from the dogfood eval (run via
 * scripts/dogfood-vibex-launch.ts) on VibeXForge itself. We use
 * them as the "see what you'd get without signing up" experience —
 * a visitor can read 6 actual platform-native drafts before
 * deciding to sign in and submit their own project.
 *
 * Refresh procedure:
 *   1. Run `npx tsx scripts/dogfood-vibex-launch.ts`
 *   2. Pick 6-8 drafts that are representative of variety
 *      (different platforms × languages × hook styles)
 *   3. Replace this file
 *   4. Update the `generated_at` field
 *
 * Don't hand-edit the body text — keep it as-generated so the
 * preview is honest about what creators actually get.
 */

export type DemoDraft = {
  platform: string;
  language: "en" | "zh";
  variant_key: string | null;
  title: string | null;
  body: string;
  length: number;
};

export const DEMO_PROJECT = {
  title: "VibeXForge",
  tagline:
    "Distribution amplifier for solo AI creators — submit once, get 17 platform-native posts in 10 seconds.",
  url: "https://vibexforge.com",
  generated_at: "2026-05-08",
};

export const DEMO_DRAFTS: DemoDraft[] = [
  {
    platform: "x",
    language: "en",
    variant_key: "stat-led",
    title: null,
    body: "🔥 990 tests written for a tool that replaces half a day of distribution work — not because anyone asked, but because shipping without it felt incomplete.\n\nSolo founders stall after launch. Not on building.",
    length: 206,
  },
  {
    platform: "x",
    language: "zh",
    variant_key: "stat-led",
    title: null,
    body: "990 个测试、0 个未解决 issue——代码质量不是问题，卡住独立开发者的从来都是分发。\n\n提交一次项目 URL，17 条平台定制草稿同时生成，小红书有小红书的腔调，HN 有 HN 的语气，不是同一段话复制粘贴。\n\n写这 17 条自己来，半天没了。",
    length: 126,
  },
  {
    platform: "hacker_news",
    language: "en",
    variant_key: null,
    title: "Show HN: VibeXForge – Submit your AI project once, get 17 platform-native drafts in ~10 seconds",
    body: "Writing platform-specific posts for X, Reddit, LinkedIn, HN, Dev.to, Xiaohongshu, and six more is the distribution tax every solo founder pays after shipping. It's not hard work — it's just slow, repetitive work that keeps not getting done.\n\nVibeXForge runs Claude Sonnet against your project URL or GitHub repo and generates parallel drafts tuned to each platform's format, tone, and audience. Reddit post ≠ LinkedIn post ≠ 小红书 post. The drafts reflect that. You review inline, edit if needed, publish.\n\nThe bilingual angle is deliberate: Western indie hackers and Chinese AI creators on Jike/Zhihu/Bilibili are building in the same space but rarely reaching across. One submit covers both.\n\n990 tests, 4 CI workflows, source-available, 0 open issues as of today.\n\nFree during beta. Built solo. Demo: https://vibexforge.com\n\nGenuinely curious from this crowd: (1) Does the platform-specific framing actually hold up for HN and Reddit, where voice mismatches get punished fast? (2) Where should the human review step sit — before generation, after, or optional?",
    length: 1099,
  },
  {
    platform: "reddit",
    language: "en",
    variant_key: null,
    title: "[Project] VibeXForge — submit an AI project URL, get 17 platform-native posts in 10s",
    body: "Half a day of writing platform posts — that was the real shipping cost no one talks about.\n\nYou finish the AI app. It works. CI is green. You're ready to get it in front of people. Then you open a blank doc and realize you have to write a tweet, a Reddit post, an HN Show HN, a LinkedIn blurb, a Dev.to article intro, and — if you want to reach Chinese AI creators — separate versions for Xiaohongshu, Jike, Zhihu, and Bilibili, each with its own tone and format. That's easily four hours of context-switching before a single real user sees your thing.\n\nThat friction is what VibeXForge tries to kill. You paste your project URL or GitHub repo, and Claude Sonnet writes platform-native drafts in parallel — 17 drafts across 10 platforms in roughly 10 seconds. Not the same post copy-pasted everywhere. X gets a punchy hook with a concrete number. Reddit gets a longer narrative with context. HN gets a Show HN one-liner. Xiaohongshu gets casual, image-first language. Each draft is calibrated to what actually performs on that platform.\n\nIt's free during beta. First 100 creators get unlimited generation and priority placement on the discovery feed.\n\nHonest caveats: the drafts are good starting points, not always publish-ready. You still need to review and sometimes rewrite the lede.\n\nDemo at vibexforge.com. Genuine feedback on what's broken or missing is more useful to me right now than encouragement.",
    length: 1409,
  },
  {
    platform: "xiaohongshu",
    language: "zh",
    variant_key: null,
    title: null,
    body: "🤯 写了3天的AI应用，推广文案写了半天还没发出去过\n\n---\n\n做独立开发真的有一个隐形天坑——\n\n产品上线了，但你要分别给小红书、X、Reddit、LinkedIn、知乎、HN各写一版文案……每个平台的语气、格式、受众全不一样。\n\n写完X的英文帖，再切换到小红书的种草腔，再到Reddit的\"genuine question\"风格……\n\n光这一套下来，半天没了。产品还没人看到。\n\n---\n\n💡 我现在用的方法：\n\n把项目链接丢进 **VibeXForge**，10秒钟，17份草稿自动生成好了——覆盖10个平台，中英文都有。\n\n不是那种套模板的废话文案，是真的按各平台调性写的。小红书就是小红书的感觉，Reddit就是Reddit的口吻。\n\n✍️ 拿到草稿之后你还可以直接在线改，改完一键发布。\n\n🌏 最关键的是中英文双语——同一个项目，西方的indie hacker社区和国内的AI创作者社区，一次提交全覆盖。\n\n📊 目前还在测试阶段，前100位创作者可以无限生成，完全免费。\n\n#独立开发 #AI工具 #出海创业 #程序员副业 #效率工具 #indie黑客 #AI创作者",
    length: 588,
  },
  {
    platform: "linkedin",
    language: "en",
    variant_key: null,
    title: null,
    body: "I wasted 4 hours last week writing platform posts for a side project.\n\nReddit needs context and humility. HN wants technical depth, no fluff. Xiaohongshu wants a story with aesthetic hooks. LinkedIn wants proof. X wants a hook in 8 words. Same product, 10 completely different languages — not translation, *tone*.\n\nThat's the actual problem. Not \"distribution is hard.\" It's that each platform has its own grammar, and writing 10 versions manually is a half-day you don't have when you're also debugging CI pipelines at midnight.\n\nVibeXForge does this in parallel: paste your GitHub repo or project URL, 10 seconds later 17 platform-native drafts are sitting in your dashboard waiting for review.\n\nReddit draft sounds like a Reddit post. HN draft leads with the technical decision. 小红书 draft has the kind of personal narrative that performs there. Each one is independently generated with platform-specific prompts, not translated from one master copy.\n\nFree during beta. Source-available, MIT-leaning. Built solo by someone who got tired of writing 10 versions of the same launch post.\n\nvibexforge.com",
    length: 1158,
  },
];
