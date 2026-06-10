/**
 * lib/learn-content.ts — actual teaching content per chapter.
 *
 * Each chapter has 4 sections of real learning material (not just an
 * exercise scaffold):
 *
 *   1. learnGoals   — what the learner will be able to do at the end
 *   2. conceptIntro — the "why" before the "what" (1-2 paragraphs)
 *   3. conceptDeep  — the principles + worked example (1-2 paragraphs)
 *   4. afterRun     — debrief that appears after first Run; explains
 *                     what just happened and why it worked
 *   5. applyExamples — 2-3 follow-up exercises with prefill values
 *
 * Bilingual EN / 中文. ~500 words per chapter, scaled to one Saturday
 * cohort's worth of in-room teaching, condensed for self-paced.
 */

import type { ChapterSlug } from "./learn";

export interface ApplyExample {
  labelEn: string;
  labelZh: string;
  /** Chapter-specific prefill — shape depends on chapter type */
  prefill: Record<string, string>;
}

export interface ChapterContent {
  learnGoalsEn: string[];
  learnGoalsZh: string[];
  conceptIntroEn: string;
  conceptIntroZh: string;
  conceptDeepEn: string;
  conceptDeepZh: string;
  afterRunEn: string;
  afterRunZh: string;
  applyExamples: ApplyExample[];
  nextPreviewEn: string;
  nextPreviewZh: string;
}

export const CONTENT: Record<ChapterSlug, ChapterContent> = {
  // ── Chapter 1 — AI Drawing ───────────────────────────────────────────
  "ai-drawing": {
    learnGoalsEn: [
      "Read any AI image as the sum of 4 ingredients: subject, style, lighting, composition",
      "Write a prompt that produces a useful image on the first try, not the fifth",
      "Diagnose why an image \"looks AI\" and fix it with one token swap",
    ],
    learnGoalsZh: [
      "把任何 AI 图拆成 4 个料: 主体、风格、光线、构图",
      "第一次出图就能用,不用反复重试",
      "看出一张图\"哪里像 AI\",一个 token 就能修",
    ],
    conceptIntroEn:
      "Image-generation models are trained on hundreds of millions of caption-image pairs. When you give them a vague prompt like \"a cat\", they collapse toward the statistical average of every cat image on the internet — which is exactly why early AI art always looked the same. The fix is not better prompts in general; it is more specific tokens in four specific places. Once you know the four places, you can steer any model — Pollinations, Midjourney, gpt-image-1, Gemini nanobanana — without retraining anything.",
    conceptIntroZh:
      "图像生成模型在数亿对\"标题-图\"上训练过。给它一个模糊的提示词比如\"一只猫\",它会塌缩到\"整个互联网所有猫图\"的统计平均 —— 这就是为什么早期 AI 艺术都长一样。修法不是\"提示词更好\",而是在 4 个具体位置写得更具体。一旦你掌握这 4 个位置,你就能调度任何模型(Pollinations / Midjourney / gpt-image-1 / Gemini nanobanana),不用再训练任何东西。",
    conceptDeepEn:
      "The 4 ingredients are: **subject** (the noun and its attributes — \"a calico cat\" beats \"a cat\"), **style** (the visual idiom — \"retro anime\" or \"oil painting\" or \"polaroid\" — this is the single most powerful slot), **lighting** (the time and mood — \"golden hour\" produces warm rims; \"overhead fluorescent\" produces flat shadows), and **composition** (the camera — \"dutch angle\", \"top-down\", \"wide shot\"). Drop any one and the model fills it in from its prior — usually wrong. A worked example: \"a cat\" produces generic stock photo. \"a calico cat coding at a Brooklyn cafe, retro anime style, golden hour, dutch angle\" produces a specific scene that didn't exist before you wrote it.",
    conceptDeepZh:
      "4 个料是: **主体**(名词加修饰 —\"a calico cat\" 比 \"a cat\" 好一截), **风格**(视觉风格 —\"retro anime\" / \"oil painting\" / \"polaroid\"—这是杠杆最大的一格), **光线**(时辰 + 气氛 —\"golden hour\" 出暖光边缘, \"overhead fluorescent\" 出平淡阴影), **构图**(相机 —\"dutch angle\" / \"top-down\" / \"wide shot\")。**任何一格不写**,模型就用它的先验自己填,通常填错。例子: \"a cat\" 出的是 stock photo 风。\"a calico cat coding at a Brooklyn cafe, retro anime style, golden hour, dutch angle\" 出的是你写之前世界上不存在的一张特定场景。",
    afterRunEn:
      "Look at what came back. If the image feels generic, count which of the 4 ingredients you actually filled — usually it's only 2. Try the second example below: keep your subject, but swap the style token, and watch the image transform without you touching anything else. That's the steering you now have.",
    afterRunZh:
      "看看出来的图。如果感觉很普通,数一下你 4 个料填了几个 —— 一般只填了 2 个。试一下下面第二个例子: 主体不动,只换风格 token,看图整个变样。这就是你现在拿到的操控杆。",
    applyExamples: [
      {
        labelEn: "Generic vs specific (compare these two)",
        labelZh: "通用 vs 具体(对比这两条)",
        prefill: { prompt: "a cat" },
      },
      {
        labelEn: "Same subject, different style",
        labelZh: "同主体,换风格",
        prefill: {
          prompt:
            "a calico cat coding at a Brooklyn cafe, oil painting style, candle light, top-down composition",
        },
      },
      {
        labelEn: "Editorial polaroid look",
        labelZh: "杂志 polaroid 风",
        prefill: {
          prompt:
            "a calico cat coding at a Brooklyn cafe, polaroid photograph style, overcast afternoon light, wide shot",
        },
      },
    ],
    nextPreviewEn:
      "Next: from images to language. Same 4-ingredient trick, applied to making Claude do exactly what you want.",
    nextPreviewZh:
      "下一关: 从图到语言。同样的 4-料思路,应用到让 Claude 精确做你想要的事。",
  },

  // ── Chapter 2 — Prompt Engineering ───────────────────────────────────
  "prompt-engineering": {
    learnGoalsEn: [
      "Use the R·C·T·C frame (Role, Context, Task, Constraint) to cut model variance",
      "See the live delta between a bare prompt and a structured prompt — same model, different answer",
      "Know which slot to add first when the model is being vague",
    ],
    learnGoalsZh: [
      "用 R·C·T·C 四格(角色 / 背景 / 任务 / 约束)把模型回答的方差砍掉",
      "亲眼看到\"裸提示\" vs \"结构提示\" 的实时差距 —— 同一个模型,不同答案",
      "模型答得很泛时,知道下一格该填哪个",
    ],
    conceptIntroEn:
      "LLMs were trained on the entire internet, so every response is a weighted average of \"everyone who wrote about this topic\". Without structure, you get the median answer — which is usually the boring one. The 4 slots (Role, Context, Task, Constraint) work because each one cuts a different dimension of that average. Role narrows whose voice the model channels. Context narrows what assumptions hold. Task narrows what shape of output you want. Constraint narrows what's off-limits. Stack all four and you collapse a million possible answers into the one you actually need.",
    conceptIntroZh:
      "LLM 用整个互联网训练,所以每个回答都是\"所有写过这个话题的人\"的加权平均。没结构 = 你拿到的是\"中位数答案\",通常很平庸。4 个槽位(角色/背景/任务/约束)起作用因为每个砍的是这个平均的不同维度。**角色**砍的是\"模型在借谁的声音\"。**背景**砍的是\"哪些假设成立\"。**任务**砍的是\"我想要什么形状的输出\"。**约束**砍的是\"哪些不能要\"。4 个堆起来,把一百万个可能的答案塌缩到你真正要的那一个。",
    conceptDeepEn:
      "Task is the only required slot — without a verb the model doesn't know what to do at all. Role and Context go in the system prompt and persist across turns; Constraint goes in the user prompt and applies to this turn. The single biggest mistake new users make: writing the task only, then complaining the model is too generic. A worked example: \"give me feedback on this idea\" returns three paragraphs of polite hedging. Add Role=\"YC partner\", Context=\"pre-seed B2B SaaS\", Constraint=\"each criticism with 1 number, no hedging\" — same model, same task — and you get a specific, dated, falsifiable critique that you can actually act on. The constraint doing the work is \"each criticism with 1 number\". Without it, the model has no reason to commit.",
    conceptDeepZh:
      "**Task 是唯一必填**的格 — 没有动词模型根本不知道你要它做什么。Role 和 Context 进 system prompt 跨轮持续;Constraint 进 user prompt 只管这一轮。新手最大错误: 只写 task,然后抱怨模型太泛。例子: \"给我这个 idea 的反馈\" 返回三段客客气气的废话。加 Role=\"YC partner\" + Context=\"pre-seed B2B SaaS\" + Constraint=\"每条批评 1 个数字,不能 hedge\" —— 同模型同任务,出来的是具体的、有日期的、可证伪的批评,你能立刻据此行动。真正起作用的是\"每条批评 1 个数字\"那条 constraint。没它,模型没理由 commit。",
    afterRunEn:
      "Did Claude give you something concrete, or something polite? If polite, the missing slot is Constraint. If wrong shape, it's Task. If wrong vibe, it's Role. The principle: each follow-up edit fixes exactly one dimension. Try the second example to feel the difference.",
    afterRunZh:
      "Claude 给你的是具体的东西,还是客气的废话?客气 = 缺 Constraint。形状不对 = Task 写歪。气氛不对 = Role 错。原则: 每次改只动一格。试一下下面第二条感受差距。",
    applyExamples: [
      {
        labelEn: "Bare task (feel the baseline)",
        labelZh: "裸 Task(感受基线)",
        prefill: {
          role: "",
          context: "",
          task: "Give me feedback on a new startup idea: a Brier-audited AI agent observability tool for solo founders",
          constraint: "",
        },
      },
      {
        labelEn: "Add Role + Constraint (the real fix)",
        labelZh: "加 Role + Constraint(真修法)",
        prefill: {
          role: "YC partner who has seen 500 dev tool decks this year",
          context: "pre-seed, solo founder, no users yet",
          task: "Critique a new startup idea: a Brier-audited AI agent observability tool for solo founders",
          constraint: "Each criticism with 1 number, no hedging, 3 criticisms max",
        },
      },
      {
        labelEn: "Editorial tone",
        labelZh: "编辑风格",
        prefill: {
          role: "Senior editor at The Information",
          context: "writing a 200-word teaser for a paid subscriber newsletter",
          task: "Summarize why Brier-audited agent observability matters in 2026",
          constraint: "No fluff, 1 named competitor, end with one question",
        },
      },
    ],
    nextPreviewEn:
      "Next: from one good answer to an agent that delivers answers for you while you sleep.",
    nextPreviewZh:
      "下一关: 从\"一次好回答\" 到 \"它在你睡觉的时候替你工作\"。",
  },

  // ── Chapter 3 — AI Agent ─────────────────────────────────────────────
  "ai-agent": {
    learnGoalsEn: [
      "Read any AI agent as a stack of 4 layers: Goal, Tools, Memory, Reflection",
      "Spot which layer is missing when an agent loops, hallucinates, or quits",
      "Write an agent spec a developer (or Claude Code) can implement in one sitting",
    ],
    learnGoalsZh: [
      "把任何 AI agent 拆成 4 层: 目标 / 工具 / 记忆 / 反思",
      "看出 agent 卡死 / 编造 / 中途放弃 时,缺的是哪一层",
      "写一份 spec,工程师(或 Claude Code)看完一次就能落地",
    ],
    conceptIntroEn:
      "An \"agent\" is the industry's most overloaded word in 2026. Strip the marketing and an agent is just a loop: read goal → pick a tool → run it → look at the result → decide what to do next. Everything else is plumbing. The 4 layers are the load-bearing pieces of that plumbing. Goal sets the loop exit condition. Tools are what the agent can actually touch in the world. Memory is what carries between turns of the loop. Reflection is what makes the agent fix its own mistakes instead of repeating them.",
    conceptIntroZh:
      "\"Agent\" 是 2026 年最被滥用的词。剥掉营销,agent 就是一个循环: 读目标 → 选工具 → 跑 → 看结果 → 决定下一步。其它都是管线。4 层是这个管线里承重的部分。**Goal** 决定循环什么时候停。**Tools** 是 agent 真正能动的手。**Memory** 是把上一轮的东西带到下一轮。**Reflection** 是让 agent 改自己的错,而不是重复犯。",
    conceptDeepEn:
      "Most agent failures in production trace to exactly one layer. **Loops forever?** Goal is too vague — \"do good marketing\" can't be reached, but \"draft 3 LinkedIn posts before noon\" can. **Hallucinates?** Tools are missing — the model fills the gap with made-up output instead of calling a real API. **Forgets context?** Memory is set to none — every call is a fresh session. **Repeats the same mistake?** Reflection is off. The 4 layers also have natural defaults: short-term memory is right for 80% of cases; long-term memory is for when you need cross-session continuity; Brier-audited memory is for when correctness matters more than speed (any agent that touches money or health). Self-critic reflection is fine for single-author work; 5-voice council reflection is when you need disagreement (financial, hiring, product kill decisions). Pick the simplest default that fits and move on.",
    conceptDeepZh:
      "生产环境里 agent 挂掉,90% 是某一层有问题。**死循环?** Goal 太模糊 —— \"做好 marketing\" 永远到不了,\"中午前 draft 3 条 LinkedIn 帖\" 能到。**编造内容?** Tools 没给 —— 模型不能调真 API 就自己编。**忘上下文?** Memory 设的 none —— 每次都是新 session。**重复犯错?** Reflection 关了。4 层也有自然默认值: short-term memory 适合 80% 场景;long-term memory 用于需要跨 session 连续的;**brier-audited memory 用于正确性比速度重要的场景**(任何动钱或健康的 agent)。**self-critic** reflection 单人 workflow 够用; **5-voice-council** 用于需要分歧的(财务 / 招聘 / 产品 kill 决策)。选最简单能 fit 的默认值,然后往下走。",
    afterRunEn:
      "Look at the JSON spec you just assembled. The 4 fields aren't aesthetic — they map 1-to-1 onto Cursor agent commands, Claude Code skills, LangGraph nodes, and OpenAI Assistants. Copy this spec into Claude Code as the system prompt for a new skill and you have a working v0.1 in 10 minutes. Try the second example to see the spec change when the goal scope shrinks.",
    afterRunZh:
      "看你刚装好的 JSON spec。4 个字段不是装饰 —— 它一对一映射到 Cursor agent 命令 / Claude Code skill / LangGraph 节点 / OpenAI Assistants。把这份 spec 当作 Claude Code 新 skill 的 system prompt,10 分钟你就有 v0.1。试下面第二条看 goal 收紧之后 spec 怎么变。",
    applyExamples: [
      {
        labelEn: "Marketing scout agent",
        labelZh: "营销侦察 agent",
        prefill: {
          goal: "Scan 5 AI luminaries' X posts daily, surface borrowable threads to my inbox",
          tools: "web_search,send_email,vibex_publish",
          memory: "brier-audited",
          reflection: "self-critic",
        },
      },
      {
        labelEn: "Risk-gated trading reviewer (narrow goal)",
        labelZh: "风控 gated 交易复盘 agent(窄目标)",
        prefill: {
          goal: "Daily 16:30 ET: review yesterday's 5 paper trades + write a 1-paragraph Brier note",
          tools: "calculator,file_read,vibex_publish",
          memory: "brier-audited",
          reflection: "5-voice-council",
        },
      },
      {
        labelEn: "Postmortem writer (deliberate scope)",
        labelZh: "Postmortem 写手(scope 故意收紧)",
        prefill: {
          goal: "After any FAIL verdict, draft a postmortem with date, root cause, capital impact, and what shipped to fix it",
          tools: "file_read,send_email",
          memory: "long-term",
          reflection: "self-critic",
        },
      },
    ],
    nextPreviewEn:
      "After all 3 chapters: your agent spec ships to VibeXForge as an evolving project card, and the in-person AICG cohort turns it into something a recruiter can hire from.",
    nextPreviewZh:
      "3 关都通了之后: 你的 agent spec 自动发到 VibeXForge 变成可进化的作品卡,纽约在场 AICG 把这张卡变成 recruiter 能直接 hire 的东西。",
  },
};

export function getContent(slug: ChapterSlug): ChapterContent {
  return CONTENT[slug];
}
