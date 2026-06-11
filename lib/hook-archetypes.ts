/**
 * Hook archetype taxonomy — 12 Chinese-short-form viral hook patterns.
 *
 * Synced from github.com/alex-jb/vibex-video-decoder-skill/hook-archetypes.csv
 * (the canonical taxonomy). This TS copy is for runtime use in vibex without
 * making the page do a fetch on render.
 *
 * Use case in /tools/video-decode result page:
 *   matchArchetype("shock+question") → { slug: "shock_question", display_en, ... }
 *   Renders as a badge: "🎯 Shock + Question · 惊吓+反问"
 *
 * Phase 2: have Gemini directly output the archetype slug in its structured
 * response (add to PROMPT in lib/gemini-video.ts). Removes the fuzzy-match
 * heuristic below.
 */

export interface HookArchetype {
  slug: string;
  display_en: string;
  display_zh: string;
  description_en: string;
  description_zh: string;
  common_in: string;
}

export const HOOK_ARCHETYPES: HookArchetype[] = [
  { slug: "shock_question", display_en: "Shock + Question", display_zh: "惊吓+反问",
    description_en: "Open with a startling visual or claim, then flip it back on the viewer.",
    description_zh: "用一个让人愣住的画面或断言开头,马上反问把问题扔给观众。",
    common_in: "求职/情感/人生类" },
  { slug: "pain_reveal", display_en: "Pain Reveal", display_zh: "痛点直击",
    description_en: "First 3 seconds describe a pain so specific the viewer thinks 'this is literally me'.",
    description_zh: "前 3 秒精准描述一种痛感,精准到观众觉得「说的就是我」。",
    common_in: "职场/育儿/学习类" },
  { slug: "speed_run", display_en: "Speed Run", display_zh: "极速干货",
    description_en: "'X 秒讲清楚 Y' or '1 分钟搞定 Z' — promises compressed value.",
    description_zh: "开头「X 秒讲清楚 Y」或「1 分钟搞定 Z」承诺压缩价值。",
    common_in: "教学/工具/教程类" },
  { slug: "before_after", display_en: "Before/After", display_zh: "前后对比",
    description_en: "Side-by-side or quick cut from 'before' terrible state to 'after' outcome.",
    description_zh: "左右对比或快切,从「之前」惨状到「之后」成果。",
    common_in: "健身/装修/化妆/技能类" },
  { slug: "contrarian_take", display_en: "Contrarian Take", display_zh: "反常识",
    description_en: "Open with a statement that contradicts popular belief.",
    description_zh: "开头一句违反大众认知。",
    common_in: "知识科普/思维/职场" },
  { slug: "list_with_count", display_en: "List with Count", display_zh: "数字打榜",
    description_en: "'X things' hook — promises a finite enumerable payload.",
    description_zh: "「X 个 Y」钩子 — 承诺有限可枚举内容。",
    common_in: "生活/职场/赚钱类" },
  { slug: "story_arc", display_en: "Story Arc", display_zh: "故事弧",
    description_en: "Teaser of the dramatic moment then rewinds to 'let me tell you how I got here'.",
    description_zh: "开头先抛故事最戏剧的画面,然后倒叙。",
    common_in: "vlog/情感/创业类" },
  { slug: "authority_proof", display_en: "Authority Proof", display_zh: "权威背书",
    description_en: "Lead with a credential or visible authority cue.",
    description_zh: "开头亮资历或可见权威信号。",
    common_in: "职场/教育/育儿/医美类" },
  { slug: "viewer_jealousy", display_en: "FOMO / Viewer Jealousy", display_zh: "优越感/嫉妒钩",
    description_en: "Show a lifestyle/result viewer wishes they had + nail it as actually attainable.",
    description_zh: "展示观众羡慕的生活/结果,并暗示其实可达成。",
    common_in: "旅游/收入/生活方式类" },
  { slug: "ai_dare", display_en: "AI Dare / Tool Reveal", display_zh: "AI 操作显神",
    description_en: "'I let AI do thing for me' / 'X tool used 30 days, results amazing'.",
    description_zh: "AI 给我[做事]/我用 X 工具 30 天/AI 一键搞定 — 工具神化叙事。",
    common_in: "AI 工具/效率/营销类" },
  { slug: "emotional_resonance", display_en: "Emotional Resonance", display_zh: "情感共鸣",
    description_en: "Open with a quiet personal confession that builds intimacy.",
    description_zh: "开头一句私密自白建立亲密。",
    common_in: "情感/亲子/心理类" },
  { slug: "controversy_bait", display_en: "Controversy Bait", display_zh: "争议钩",
    description_en: "Polarizing stance designed to invite comment-section debate.",
    description_zh: "刻意取一个会引战的立场,设计成评论区开战。",
    common_in: "职场/婚恋/教育类" },
];

/**
 * Fuzzy-match a Gemini-returned hook formula string to one of the 12 archetypes.
 *
 * Heuristic: lowercase-strip punctuation from both sides, then check if the
 * archetype display_en or display_zh appears as a substring of the formula,
 * or vice-versa. Returns the first match, or null.
 *
 * This is imperfect — Phase 2 ships archetype-as-direct-output from Gemini.
 */
export function matchArchetype(formula: string): HookArchetype | null {
  if (!formula) return null;
  const norm = (s: string) =>
    s.toLowerCase().replace(/[\s\-+_./·,]+/g, "");
  const target = norm(formula);
  if (!target) return null;
  for (const a of HOOK_ARCHETYPES) {
    const candidates = [a.display_en, a.display_zh, a.slug];
    for (const c of candidates) {
      const n = norm(c);
      if (!n) continue;
      if (target.includes(n) || n.includes(target)) {
        return a;
      }
    }
  }
  return null;
}
