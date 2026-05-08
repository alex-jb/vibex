/**
 * lib/draft-generator.ts — TypeScript port of orallexa-marketing-agent's
 * platform-specific draft generation core.
 *
 * Why ported instead of subprocess-calling the Python agent: keeps
 * everything in Vercel's deployment surface. No Python runtime needed
 * on the production server. Marketing-agent's Python source remains
 * the reference + dev playground; this is the production code path.
 *
 * Generates 8 platform-specific drafts per project, in parallel,
 * using Anthropic Claude Sonnet 4.6. ~5-10s wall-clock for a full
 * batch (24 calls running concurrently with platform-tailored prompts
 * + variant selection).
 *
 * Outputs persisted to the project_drafts table (migration 055).
 *
 * Voice + prompt constraints come from
 * orallexa-marketing-agent/marketing_agent/content/generator.py
 * — kept verbatim where reasonable so prompts stay consistent
 * across the Python dev path and TS production path.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 600;

export type Platform =
  | "x"
  | "reddit"
  | "linkedin"
  | "hacker_news"
  | "dev_to"
  | "bluesky"
  | "threads"
  | "producthunt"
  | "xiaohongshu"
  | "jike"
  | "zhihu"
  | "bilibili";

export type Language = "en" | "zh";

export interface ProjectInput {
  id: string;
  title: string;
  tagline: string;
  description?: string;
  category?: string;
  tags?: string[];
  demoUrl?: string;
  recentChanges?: string[];
}

export interface DraftRow {
  project_id: string;
  platform: Platform;
  language: Language;
  variant_key: string | null;
  title: string | null;
  body: string;
  subreddit: string | null;
  status: "pending";
}

const PLATFORM_HARD_CAP: Partial<Record<Platform, number>> = {
  x: 270,
  bluesky: 290,
  threads: 480,
};

/**
 * Voice baseline used by every platform. Mirrors generator.py:_system_for.
 *
 * Hook + length + repetition rules added 2026-05-08 after dogfood eval
 * caught: (a) too many drafts opening with "I built / 我做了"
 * self-introduction, (b) drafts using <50% of the platform character cap,
 * (c) the same number ("990 tests") repeated 3-4 times across one post.
 */
const SYSTEM_BASE_EN =
  "You are writing on behalf of an indie AI builder who is building " +
  "in public. Voice: technical, honest, no marketing fluff, no hype " +
  "words like 'revolutionary' or 'cutting-edge'. Show, don't tell. " +
  "HOOK RULE: do NOT open with 'I built' / 'I made' / 'I created' / " +
  "'Just shipped'. Open with one of: a specific number that creates " +
  "tension, a contrast/comparison ('X took me 3 days, Y took me half a " +
  "day'), a question your target reader thinks but rarely says, or a " +
  "concrete pain moment. NUMBER RULE: pick at most 2 specific numbers " +
  "per post, and never repeat the same number twice in one post — " +
  "find a different angle. LENGTH RULE: aim for 70-95% of the platform " +
  "cap when one is given. A 47-char tweet wastes the slot.";

const SYSTEM_BASE_ZH =
  "你正在替一个独立 AI 创作者发声。这位创作者在 build in public, " +
  "不要营销腔。不要用 '革命性' / '黑科技' / '下一个独角兽' 这种词。" +
  "用具体数字、具体痛点、具体案例。让作品自己说话,不要替它吹。" +
  "开头规则: 不要用 '我做了' / '我开发了' / '我刚上线' / '分享一个' " +
  "这种自我介绍式开场。开头要么是: 一个制造张力的具体数字、一个 " +
  "对比反差(「写代码 3 天,推广花了半天」)、一个目标读者心里会想 " +
  "但很少说出口的问题,或一个具体的痛点瞬间。数字规则: 一篇里 " +
  "最多 2 个具体数字,同一个数字不要在一篇里出现超过 1 次,换个角度讲。" +
  "长度规则: 给了字符上限的平台,目标用满 70-95%。47 字的 X 帖子是 " +
  "在浪费坑位。";

const PLATFORM_EXTRAS: Partial<Record<Platform, { en: string; zh: string }>> = {
  x: {
    en:
      " Output a single tweet, STRICTLY <= 270 characters total — " +
      "the X publish gate hard-rejects anything over 280. Count " +
      "before you respond and rewrite shorter if needed. 1 emoji " +
      "max at start. No hashtags. No URL in body. End on a concrete " +
      "observation, not a CTA.",
    zh:
      " 输出单条 X 推文,严格 <= 270 字符。最多 1 个 emoji 开头。不要 " +
      "hashtag。不要在正文加 URL(平台单独缩短)。结尾给一个具体的 " +
      "观察,不要 CTA。",
  },
  reddit: {
    en:
      " Output a Reddit post body, 4-8 short paragraphs. Open with what " +
      "you built and why. Include code or numbers if relevant. End with " +
      "an honest ask for feedback.",
    zh:
      " 输出 Reddit 帖子正文,4-8 段短文。开头讲你做了什么以及为什么。" +
      "如果有代码或数字加上。结尾真诚求反馈。",
  },
  linkedin: {
    en:
      " Output a LinkedIn post, 600-1000 chars. More polished than X but " +
      "not corporate. Lead with the problem or the journey. NEVER end " +
      "with 'let's connect' — that line is banned.",
    zh:
      " 输出 LinkedIn 长帖,600-1000 字符。比 X 更精细但不要 corporate。" +
      "开头讲痛点或旅程。绝对不要用'欢迎私信交流'这种结尾。",
  },
  hacker_news: {
    en:
      " Output a Show HN-style submission. Title MUST start with " +
      "'Show HN: '. Body is a 6-12 line post. Lead with what you built " +
      "+ why. Include 1-2 specific numbers. Skip marketing words. End " +
      "with what kind of feedback would help.",
    zh:
      " 输出 Show HN 风格的英文 submission(HN 是英文社区)。标题以 " +
      "'Show HN: ' 开头。正文 6-12 行。开头讲你做了什么 + 为什么。" +
      "包含 1-2 个具体数字。不要营销话。结尾说你想要什么反馈。",
  },
  dev_to: {
    en:
      " Output a DEV.to article, markdown formatted, ~600-1500 words. " +
      "Use H2 sections. Include a code block if relevant. Format: " +
      "## What is X? / ## Recently shipped / ## Try it.",
    zh:
      " 输出 Dev.to 英文长技术文(Dev.to 是英文社区),markdown 格式," +
      "600-1500 字。用 H2 分段。如果合适加代码块。",
  },
  bluesky: {
    en:
      " Output a Bluesky skeet, <= 290 chars. Same vibe as X but " +
      "the audience skews technical/build-in-public. Lean into specifics.",
    zh:
      " 输出 Bluesky 短帖,<= 290 字符。氛围跟 X 类似但 audience " +
      "更偏技术 / build-in-public。讲具体的。",
  },
  threads: {
    en:
      " Output a Threads post, <= 480 chars. Slightly less terse than X. " +
      "Conversational. Skip hashtags.",
    zh:
      " 输出 Threads 短帖,<= 480 字符。比 X 稍长一点,口语化。不要 " +
      "hashtag。",
  },
  producthunt: {
    en:
      " Output a Product Hunt tagline (max 60 chars) + description " +
      "(max 260 chars). Format as 'TAGLINE: ...' followed by " +
      "'DESCRIPTION: ...' on a new line. Avoid hype.",
    zh:
      " 输出 Product Hunt 英文 tagline(最多 60 字符)+ description" +
      "(最多 260 字符)。Format: 'TAGLINE: ...' 换行 'DESCRIPTION: ...'。" +
      "不要炒作。",
  },
  xiaohongshu: {
    en:
      " (Note: 小红书 is a Chinese-only platform. If language=en " +
      "this draft will be filtered out — generate Chinese anyway " +
      "for completeness.)",
    zh:
      " 输出小红书笔记。开头吸引人(emoji + 数字 / 反差 / 痛点)。" +
      "正文 200-500 字,用 emoji 分段。结尾留 5-8 个 hashtag(中文)。" +
      "口语化、亲切、有'种草感'。",
  },
  jike: {
    en:
      " (Note: 即刻 is a Chinese-only platform. Generate Chinese.)",
    zh:
      " 输出即刻动态,200-400 字。语气直接、技术圈友好,build-in-public " +
      "vibe。可以加 1-2 个 emoji。结尾不要 CTA,讲完事就停。",
  },
  zhihu: {
    en:
      " (Note: 知乎 is a Chinese-only platform. Generate Chinese.)",
    zh:
      " 输出知乎回答风格的长文,800-1500 字。结构: 1. 问题重述 2. 我做的尝试 " +
      "3. 具体技术细节 4. 数据 / 教训 5. 给读者的 takeaway。可以加代码块。",
  },
  bilibili: {
    en:
      " (Note: B站 is a Chinese-only platform. Generate Chinese.)",
    zh:
      " 输出 B 站视频简介,300-500 字。开头一句吸引人的 hook。中段 " +
      "讲视频内容(讲了什么 + 你能学到什么)。结尾求三连。",
  },
};

const PLATFORM_VARIANTS: Partial<Record<Platform, string[]>> = {
  x: ["emoji-led", "question-led", "stat-led"],
  bluesky: ["emoji-led", "stat-led"],
};

const VARIANT_STYLE: Record<string, { en: string; zh: string }> = {
  "emoji-led": {
    en:
      " Style: open the post with a single relevant emoji, then a concrete observation.",
    zh: " 风格: 开头一个相关 emoji, 后接一个具体观察。",
  },
  "question-led": {
    en:
      " Style: open with a question your target reader would think but rarely say out loud.",
    zh: " 风格: 开头一个目标读者心里会想但很少说出口的问题。",
  },
  "stat-led": {
    en:
      " Style: open with one specific number (test count, latency, cost, MAU). The rest justifies why that number is interesting.",
    zh:
      " 风格: 开头一个具体数字(测试数 / 延迟 / 成本 / MAU)。后文说明这数字为什么有意思。",
  },
};

/**
 * Vibe-code stack detection — sniff the demo URL for known no-code /
 * AI-builder hosts. When the creator is shipping from a recognizable
 * stack we add a stack-aware nudge to the prompt so the draft leads
 * with the right narrative ("built with Lovable in 2 days" lands
 * harder on every platform than a generic "I built X").
 *
 * Returns null when the URL pattern doesn't match a known stack —
 * caller should fall back to the generic prompt path.
 */
export type DetectedStack =
  | "lovable"
  | "v0"
  | "replit"
  | "bolt"
  | "claude-artifacts"
  | null;

export function detectStack(demoUrl?: string): DetectedStack {
  if (!demoUrl) return null;
  let host: string;
  try {
    host = new URL(demoUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host.endsWith(".lovable.app") || host === "lovable.app") return "lovable";
  if (host.endsWith(".v0.dev") || host === "v0.dev") return "v0";
  if (host.endsWith(".replit.app") || host.endsWith(".repl.co")) return "replit";
  if (host.endsWith(".bolt.new") || host === "bolt.new") return "bolt";
  if (host === "claude.ai" && /\/artifacts/.test(demoUrl))
    return "claude-artifacts";
  return null;
}

const STACK_HINT: Record<
  Exclude<DetectedStack, null>,
  { en: string; zh: string }
> = {
  lovable: {
    en: " STACK CONTEXT: This was built with Lovable (no-code AI app builder). Lead with what's possible in 2-3 days of no-code building, NOT the tech stack. The audience cares about 'a non-engineer just shipped this'.",
    zh: " 技术栈背景: 这个是用 Lovable(无代码 AI 应用构建器)做的。开头讲 2-3 天 no-code 能做出什么,不要讲技术栈。读者关心「一个不写代码的人就上线了这个」。",
  },
  v0: {
    en: " STACK CONTEXT: This was built with Vercel v0 (AI UI generator). Audience reads as developer-leaning — feel free to mention the prompt → component → ship loop.",
    zh: " 技术栈背景: 用 Vercel v0(AI UI 生成器)做的。读者偏开发者,可以提 prompt → 组件 → 上线 这条链路。",
  },
  replit: {
    en: " STACK CONTEXT: Built on Replit. Audience is mostly indie devs and learners. Lean into 'shipped from the browser, no local setup'.",
    zh: " 技术栈背景: Replit 上做的。读者多是独立开发者 + 学习者。可以强调「全程浏览器没本地环境」。",
  },
  bolt: {
    en: " STACK CONTEXT: Built with Bolt.new. Audience overlaps with Lovable + v0 — emphasize speed (hours, not days).",
    zh: " 技术栈背景: Bolt.new 做的。读者跟 Lovable / v0 重叠 —— 强调速度(小时级,不是天)。",
  },
  "claude-artifacts": {
    en: " STACK CONTEXT: Built as a Claude Artifact. Audience is AI-curious — mention the conversation → artifact → live URL flow.",
    zh: " 技术栈背景: Claude Artifact 做的。读者对 AI 感兴趣,可以讲对话 → artifact → 上线 这个流。",
  },
};

const GAME_CATEGORY_HINT: { en: string; zh: string } = {
  en: " GAME CATEGORY: This is an AI game, not a tool. Drafts MUST treat the demo URL as a 'play link' (not 'try link'). Lead with the gameplay hook, not the tech. Reference 'play / playable / try the demo' verbs. If a Reddit / HN platform, prefer indie-game subreddits + 'I made a game where...' opening. Skip business jargon (MAU, conversion).",
  zh: " 游戏类目: 这是 AI 游戏不是工具。草稿要把 demo URL 当作「试玩链接」。开头讲玩法 hook 不讲技术。用「试玩 / 可玩 / 进游戏」这种动词。如果是 Reddit / HN,偏向独立游戏社区 + 「我做了个游戏,你...」式开场。不要讲商业指标(MAU、转化率)。",
};

function systemPromptFor(
  project: ProjectInput,
  platform: Platform,
  language: Language,
  variantHint: string | null,
): string {
  const base = language === "zh" ? SYSTEM_BASE_ZH : SYSTEM_BASE_EN;
  const extras = PLATFORM_EXTRAS[platform];
  const extra = extras ? extras[language] : "";
  const variant =
    variantHint && VARIANT_STYLE[variantHint]
      ? VARIANT_STYLE[variantHint][language]
      : "";
  const stack = detectStack(project.demoUrl);
  const stackHint = stack ? STACK_HINT[stack][language] : "";
  const gameHint =
    project.category === "AI Game" ? GAME_CATEGORY_HINT[language] : "";
  return base + extra + variant + stackHint + gameHint;
}

function userPromptFor(
  project: ProjectInput,
  platform: Platform,
  language: Language,
  subreddit: string | null,
): string {
  // Hard language directive at top of user prompt. Without this the model
  // anchors on the language of the project description (often English)
  // and produces English even when system prompt + closer are in Chinese.
  // 2026-05-08 dogfood caught this on x-zh-stat-led, bluesky-zh-stat-led,
  // and linkedin-zh — all three came out in English because the source
  // description had English numbers/terms ("990 tests").
  const langDirective =
    language === "zh"
      ? "OUTPUT LANGUAGE: 中文 (Simplified Chinese). The project description below may be in English — translate ideas into native, idiomatic Chinese. Do NOT output English sentences unless quoting a brand name or a technical term that has no Chinese equivalent.\n"
      : "OUTPUT LANGUAGE: English. The project description may include Chinese — translate ideas into native English.\n";

  const parts: string[] = [
    langDirective,
    `Project: ${project.title}`,
    `Tagline: ${project.tagline}`,
  ];
  if (project.description) parts.push(`Description:\n${project.description}`);
  if (project.recentChanges && project.recentChanges.length > 0) {
    parts.push(
      "Recent changes:\n" +
        project.recentChanges.slice(0, 10).map((c) => `- ${c}`).join("\n"),
    );
  }
  if (project.category) parts.push(`Category: ${project.category}`);
  if (project.tags && project.tags.length > 0) {
    parts.push(`Tags: ${project.tags.join(", ")}`);
  }
  if (project.demoUrl) parts.push(`Demo: ${project.demoUrl}`);
  if (subreddit && platform === "reddit") parts.push(`Subreddit: r/${subreddit}`);

  const closer =
    language === "zh"
      ? `\n现在直接写 ${platform} 的内容。只输出内容本身,不要解释,不要加前置语。整篇用中文。`
      : `\nWrite the ${platform} post now. Output ONLY the post text in English, no preamble.`;
  parts.push(closer);
  return parts.join("\n\n");
}

const ZH_ONLY_PLATFORMS: Set<Platform> = new Set([
  "xiaohongshu",
  "jike",
  "zhihu",
  "bilibili",
]);
const EN_ONLY_PLATFORMS: Set<Platform> = new Set([
  "hacker_news",
  "dev_to",
  "producthunt",
]);

/**
 * Decide which (platform, language, variant_key) tuples to generate
 * for a project. Skip incompatible language pairings (e.g. don't
 * generate English for 小红书).
 */
export function planDrafts(
  platforms: Platform[],
  languages: Language[],
): Array<{
  platform: Platform;
  language: Language;
  variantKey: string | null;
}> {
  const out: Array<{
    platform: Platform;
    language: Language;
    variantKey: string | null;
  }> = [];
  for (const p of platforms) {
    for (const lang of languages) {
      if (lang === "en" && ZH_ONLY_PLATFORMS.has(p)) continue;
      if (lang === "zh" && EN_ONLY_PLATFORMS.has(p)) continue;
      const variants = PLATFORM_VARIANTS[p];
      if (variants && variants.length > 0) {
        for (const v of variants) {
          out.push({ platform: p, language: lang, variantKey: v });
        }
      } else {
        out.push({ platform: p, language: lang, variantKey: null });
      }
    }
  }
  return out;
}

/**
 * Regenerate a single draft slot — used by /api/drafts/[id]/reroll
 * so the creator can roll just one platform/lang/variant tuple
 * without paying for the full 21-draft batch.
 */
export async function regenerateOneDraft(
  project: ProjectInput,
  platform: Platform,
  language: Language,
  variantKey: string | null,
  subreddit: string | null = null,
): Promise<{ body: string; title: string | null } | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    return await generateOne(client, project, platform, language, variantKey, subreddit);
  } catch (err) {
    console.error("[draft-generator] regenerateOneDraft failed:", err);
    return null;
  }
}

async function generateOne(
  client: Anthropic,
  project: ProjectInput,
  platform: Platform,
  language: Language,
  variantHint: string | null,
  subreddit: string | null,
): Promise<{ body: string; title: string | null }> {
  // Game projects default to indie-game subreddit when caller didn't
  // pass an explicit one. Reddit r/SideProject is fine for tools but
  // r/IndieGaming gets game-aware engagement.
  const effectiveSubreddit =
    subreddit ||
    (project.category === "AI Game" && platform === "reddit"
      ? "IndieGaming"
      : null);

  const system = systemPromptFor(project, platform, language, variantHint);
  const user = userPromptFor(project, platform, language, effectiveSubreddit);
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: "text",
        text: system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: user }],
  });
  let text = "";
  for (const block of resp.content) {
    if (block.type === "text") text += block.text;
  }
  text = text.trim().replace(/^["']|["']$/g, "").trim();

  // Hard cap enforcement (one shot retry not implemented in TS port —
  // rely on prompt + cleanup. If truncation needed, slice to last
  // sentence boundary.)
  const cap = PLATFORM_HARD_CAP[platform];
  if (cap && text.length > cap) {
    const lastPunct = Math.max(
      text.slice(0, cap).lastIndexOf("."),
      text.slice(0, cap).lastIndexOf("!"),
      text.slice(0, cap).lastIndexOf("?"),
      text.slice(0, cap).lastIndexOf("\n"),
    );
    text = lastPunct > 0 ? text.slice(0, lastPunct + 1) : text.slice(0, cap);
  }

  let title: string | null = null;
  const isGame = project.category === "AI Game";
  if (platform === "reddit") {
    title = isGame
      ? `[Game] ${project.title} — ${project.tagline}`
      : `[Project] ${project.title}: ${project.tagline}`;
  } else if (platform === "hacker_news") {
    // HN convention: "Show HN: I made [thing] that [does X]". Game
    // category gets the "I made a game" framing which materially
    // outperforms generic Show HN titles for game submissions.
    title = isGame
      ? `Show HN: I made a game — ${project.title}: ${project.tagline}`
      : `Show HN: ${project.title} – ${project.tagline}`;
  }

  return { body: text, title };
}

/**
 * Generate drafts in memory (no DB write). Used by /api/projects/...
 * via generateDraftsForProject, and by scripts/dogfood-vibex-launch.mjs
 * to evaluate prompt quality without touching prod data.
 */
export async function generateDraftsInMemory(
  project: ProjectInput,
  options: {
    platforms?: Platform[];
    languages?: Language[];
    subreddit?: string;
  } = {},
): Promise<{ rows: DraftRow[]; failed: number }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { rows: [], failed: 0 };
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const platforms: Platform[] = options.platforms || [
    "x",
    "reddit",
    "linkedin",
    "hacker_news",
    "dev_to",
    "bluesky",
    "threads",
    "producthunt",
    "xiaohongshu",
    "jike",
  ];
  const languages: Language[] = options.languages || ["en", "zh"];
  const subreddit = options.subreddit || null;

  const plan = planDrafts(platforms, languages);

  const results = await Promise.allSettled(
    plan.map((task) =>
      generateOne(
        client,
        project,
        task.platform,
        task.language,
        task.variantKey,
        subreddit,
      ).then((r) => ({ ...task, ...r })),
    ),
  );

  const rows: DraftRow[] = [];
  let failed = 0;
  for (const res of results) {
    if (res.status === "fulfilled") {
      rows.push({
        project_id: project.id,
        platform: res.value.platform,
        language: res.value.language,
        variant_key: res.value.variantKey,
        title: res.value.title,
        body: res.value.body,
        subreddit: subreddit,
        status: "pending",
      });
    } else {
      failed++;
      console.error("[draft-generator] generation failed:", res.reason);
    }
  }
  return { rows, failed };
}

/**
 * Generate the full draft set for a project and persist to
 * project_drafts. Runs all draft generations in parallel — total wall
 * time is ~5-10s for ~24 drafts at Sonnet 4.6 latency.
 *
 * Caller (e.g. /api/projects/[id]/generate-drafts) should run this in
 * the background after the submit response returns. Vercel function
 * waitUntil() is the right primitive.
 */
export async function generateDraftsForProject(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, "public", any>,
  project: ProjectInput,
  options: {
    platforms?: Platform[];
    languages?: Language[];
    subreddit?: string;
  } = {},
): Promise<{ ok: boolean; created: number; failed: number }> {
  const { rows, failed } = await generateDraftsInMemory(project, options);

  if (rows.length === 0) return { ok: false, created: 0, failed };

  const { error } = await supabase.from("project_drafts").insert(rows);
  if (error) {
    console.error("[draft-generator] insert failed:", error);
    return { ok: false, created: 0, failed: rows.length };
  }

  // Fire drafts-ready email so creator gets pulled back to /drafts.
  // The drafts-generation step is fire-and-forget after submit, so the
  // user has likely closed the tab by now. Email = retention loop.
  // Failure here is non-fatal — drafts already in DB.
  try {
    await sendDraftsReadyEmail(supabase, project, rows.length);
  } catch (err) {
    console.error("[draft-generator] email path threw:", err);
  }

  return { ok: true, created: rows.length, failed };
}

async function sendDraftsReadyEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, "public", any>,
  project: ProjectInput,
  draftCount: number,
): Promise<void> {
  // Look up creator email + auth_user_id via projects → creators join.
  // We need email to send and creator_id for unsubscribe URL.
  const { data: row } = await supabase
    .from("projects")
    .select("creator_id, creators!inner(email, name, email_opt_out)")
    .eq("id", project.id)
    .maybeSingle();
  if (!row) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const creator = (row as any).creators;
  const email = creator?.email;
  if (!email) return;
  if (creator.email_opt_out) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vibexforge.com";
  const draftsUrl = `${siteUrl}/project/${project.id}/drafts`;
  const name = (creator.name as string | undefined) || "creator";

  const subject = `${draftCount} drafts ready for "${project.title}"`;
  const text = [
    `Hey ${name},`,
    "",
    `Your project "${project.title}" just landed on VibeXForge,`,
    `and our marketing agents finished writing ${draftCount} platform-`,
    `specific drafts for you across X / Reddit / LinkedIn / Hacker News /`,
    `Dev.to / Bluesky / Threads / 小红书 / 即刻 / Producthunt.`,
    "",
    `Each draft is tailored to its platform's tone (long-form for Dev.to,`,
    `threads for X, aesthetic for 小红书, technical for HN). Bilingual EN/ZH`,
    `where applicable.`,
    "",
    `Edit, approve, publish:`,
    `→ ${draftsUrl}`,
    "",
    `Takes 5 minutes. After that, your work is reaching all 10 channels`,
    `at once.`,
    "",
    `— VibeXForge`,
  ].join("\n");

  // Lazy-import to avoid pulling email helpers into every draft-generator
  // import path (this file gets bundled into the API route).
  const {
    sendEmail,
    textToHtmlParas,
    ensureUnsubscribeUrl,
    withUnsubscribeFooter,
  } = await import("@/lib/email");

  const unsubscribeUrl = await ensureUnsubscribeUrl(supabase, row.creator_id);
  const { text: fullText, html } = withUnsubscribeFooter(text, unsubscribeUrl);

  const result = await sendEmail({
    to: email,
    subject,
    text: fullText,
    html: html || textToHtmlParas(fullText),
    unsubscribeUrl: unsubscribeUrl || undefined,
  });

  if (!result.ok) {
    console.error(`[drafts-ready-email] send failed: ${result.error}`);
  } else if (result.dryRun) {
    console.log(`[drafts-ready-email] dry-run for ${email}`);
  } else {
    console.log(`[drafts-ready-email] sent to ${email} (${result.resendId})`);
  }
}
