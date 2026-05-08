import type { Idea } from "../types";

// ─── Ideas ───────────────────────────────────────────────────────────────────

export const ideas: Idea[] = [
  {
    id: "idea-1",
    title: "AI-powered meal planner that adapts to your fridge contents",
    title_zh: "看冰箱内容自动定制餐计划的 AI",
    description:
      "Snap a photo of your fridge, and the AI identifies ingredients, suggests recipes based on what you have, accounts for dietary restrictions and expiration dates, and generates a weekly meal plan with grocery lists for missing items.",
    description_zh:
      "拍一张冰箱照片,AI 识别食材,根据现有食材推荐菜谱,兼顾饮食限制和保质期,并生成一周餐计划 + 缺料的购物清单。",
    creatorName: "Sarah Chen",
    createdAt: "2026-04-03",
    category: "AI Tool",
    upvotes: 234,
    status: "in-progress",
    aiEvaluation: {
      viability: 85,
      marketFit: 90,
      competition: "moderate",
      uniqueness: 72,
      difficulty: "medium",
      suggestions: [
        "Integrate with grocery delivery APIs for one-click ordering",
        "Add nutritional tracking and health goals",
        "Consider partnerships with meal kit companies",
      ],
      similarProjects: ["Whisk", "Mealime", "Supercook"],
      estimatedCategory: "AI Tool",
    },
  },
  {
    id: "idea-2",
    title: "Real-time debate coach that argues both sides",
    title_zh: "实时辩论教练 — 同时论证正反两方",
    description:
      "An AI debate partner that can take any position on a topic and provide structured arguments, counterarguments, and rhetorical feedback. Useful for debate teams, critical thinking practice, and exploring nuanced issues.",
    description_zh:
      "一个能就任何话题选边并给出结构化论证、反驳、修辞反馈的 AI 辩论搭档。适合辩论队、批判性思维训练,以及深入探讨复杂问题。",
    creatorName: "Priya Sharma",
    createdAt: "2026-04-02",
    category: "AI Agent",
    upvotes: 189,
    status: "idea",
    aiEvaluation: {
      viability: 78,
      marketFit: 65,
      competition: "low",
      uniqueness: 88,
      difficulty: "hard",
      suggestions: [
        "Focus on education market first (schools, debate clubs)",
        "Add structured formats (Lincoln-Douglas, Parliamentary)",
        "Include fact-checking layer to prevent misinformation",
      ],
      similarProjects: ["Kialo", "DebateArt"],
      estimatedCategory: "AI Agent",
    },
  },
  {
    id: "idea-3",
    title: "AI code archaeologist that explains legacy codebases",
    title_zh: "解读遗留代码库的 AI 考古学家",
    description:
      "Point it at any legacy codebase and it generates interactive documentation, architecture diagrams, dependency maps, and plain-English explanations of business logic. Helps new team members onboard 10x faster.",
    description_zh:
      "对准任何遗留代码库,自动生成交互式文档、架构图、依赖关系图,以及用人话解释业务逻辑。新人 onboarding 速度提升 10 倍。",
    creatorName: "Alex Rivera",
    createdAt: "2026-04-01",
    category: "AI Workflow",
    upvotes: 312,
    status: "launched",
    launchedProjectId: "4",
    aiEvaluation: {
      viability: 92,
      marketFit: 95,
      competition: "moderate",
      uniqueness: 80,
      difficulty: "hard",
      suggestions: [
        "Start with popular frameworks (Rails, Django, Spring)",
        "Add Git blame integration for ownership tracking",
        "Create Slack bot for on-demand code explanations",
      ],
      similarProjects: ["Sourcegraph", "Swimm", "CodeSee"],
      estimatedCategory: "AI Workflow",
    },
  },
  {
    id: "idea-4",
    title: "Procedural music that adapts to your work focus state",
    title_zh: "根据专注状态自适应的程序化音乐",
    description:
      "AI-generated ambient music that monitors your typing patterns, mouse activity, and calendar to detect focus levels, then dynamically adjusts tempo, complexity, and intensity to maintain flow state.",
    description_zh:
      "AI 生成的环境音乐,监测你的打字节奏、鼠标活动和日程来识别专注度,实时调整节奏、复杂度和强度,帮你保持心流。",
    creatorName: "Yuki Tanaka",
    createdAt: "2026-03-30",
    category: "AI Utility",
    upvotes: 156,
    status: "in-progress",
    aiEvaluation: {
      viability: 70,
      marketFit: 75,
      competition: "low",
      uniqueness: 92,
      difficulty: "expert",
      suggestions: [
        "Partner with neuroscience researchers for validation",
        "Create browser extension for easy access",
        "Add biometric integration (heart rate, EEG) for premium tier",
      ],
      similarProjects: ["Brain.fm", "Endel", "Mubert"],
      estimatedCategory: "AI Utility",
    },
  },
  {
    id: "idea-5",
    title: "AI dungeon master for tabletop RPG campaigns",
    title_zh: "桌游 RPG 战役的 AI 地下城主",
    description:
      "A virtual DM that runs full tabletop RPG sessions with dynamic world-building, NPC generation, combat resolution, and narrative continuity across sessions. Supports D&D 5e, Pathfinder, and custom rulesets.",
    description_zh:
      "完整跑桌游 RPG 局的虚拟 DM,动态构筑世界观、生成 NPC、判定战斗、维持跨场叙事连贯。支持 D&D 5e、Pathfinder 和自定义规则。",
    creatorName: "Marcus Liu",
    createdAt: "2026-03-28",
    category: "AI Game",
    upvotes: 445,
    status: "idea",
    aiEvaluation: {
      viability: 82,
      marketFit: 88,
      competition: "moderate",
      uniqueness: 75,
      difficulty: "expert",
      suggestions: [
        "Focus on solo play and small groups without a human DM",
        "Add voice mode for immersive sessions",
        "Create campaign sharing and community features",
      ],
      similarProjects: ["AI Dungeon", "LitRPG Adventures", "TaleSpire"],
      estimatedCategory: "AI Game",
    },
  },
  {
    id: "idea-6",
    title: "Carbon footprint tracker for AI model training runs",
    title_zh: "AI 模型训练的碳足迹追踪器",
    description:
      "Monitor and optimize the environmental impact of ML training pipelines. Tracks GPU hours, electricity source, cooling overhead, and estimates CO2 per experiment. Suggests greener alternatives like spot instances in low-carbon regions.",
    description_zh:
      "监控并优化 ML 训练管线的环境影响。追踪 GPU 小时数、电力来源、散热开销,估算每次实验的 CO2 排放。推荐更绿色的替代方案,比如低碳区域的 spot 实例。",
    creatorName: "Emma Walsh",
    createdAt: "2026-03-25",
    category: "Experimental",
    upvotes: 98,
    status: "idea",
    aiEvaluation: {
      viability: 65,
      marketFit: 55,
      competition: "low",
      uniqueness: 85,
      difficulty: "medium",
      suggestions: [
        "Integrate with MLflow, W&B, and cloud provider APIs",
        "Add carbon offset marketplace integration",
        "Create compliance reports for EU AI Act requirements",
      ],
      similarProjects: ["CodeCarbon", "ML CO2 Impact"],
      estimatedCategory: "Experimental",
    },
  },
];
